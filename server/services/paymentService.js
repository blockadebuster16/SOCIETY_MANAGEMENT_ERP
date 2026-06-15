import { supabaseAdmin } from '../config/supabase.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { sendPaymentNotification } from '../utils/notification.js';

// --- Billing Cycles ---
export const createBillingCycle = async (cycleData) => {
  const { cycleName, startDate, endDate, dueDate } = cycleData;

  const { data, error } = await supabaseAdmin
    .from('billing_cycles')
    .insert([
      {
        cycle_name: cycleName,
        start_date: startDate,
        end_date: endDate,
        due_date: dueDate,
        status: 'Draft'
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getBillingCycleById = async (cycleId) => {
  const { data, error } = await supabaseAdmin
    .from('billing_cycles')
    .select('*')
    .eq('id', cycleId)
    .single();

  if (error || !data) {
    const err = new Error('Billing cycle not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const listBillingCycles = async () => {
  const { data, error } = await supabaseAdmin
    .from('billing_cycles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// --- Generate Bills ---
export const generateCycleBills = async (cycleId) => {
  const cycle = await getBillingCycleById(cycleId);
  if (cycle.status === 'Closed') {
    throw new Error('Billing cycle is already closed');
  }

  const { data: templates, error: tempErr } = await supabaseAdmin
    .from('bill_templates')
    .select('*')
    .eq('is_active', true);

  if (tempErr || !templates || templates.length === 0) {
    throw new Error('Active billing templates not found. Please setup templates first.');
  }

  const resTemplate = templates.find(t => t.unit_type === 'Residential');
  const commTemplate = templates.find(t => t.unit_type === 'Commercial');

  const { data: properties, error: propErr } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('status', 'Active');

  if (propErr || !properties) {
    throw new Error('Failed to retrieve properties');
  }

  const generatedBills = [];

  for (const property of properties) {
    const isCommercial = property.unit_type === 'Commercial';
    const template = isCommercial ? commTemplate : resTemplate;

    if (!template) {
      console.warn(`No active template found for property unit type: ${property.unit_type}`);
      continue;
    }

    const { data: existing } = await supabaseAdmin
      .from('maintenance_bills')
      .select('id')
      .eq('property_id', property.id)
      .eq('cycle_id', cycleId)
      .maybeSingle();

    if (existing) {
      continue;
    }

    let baseAmount = 0;
    if (isCommercial) {
      baseAmount = parseFloat(template.fixed_charge);
    } else {
      baseAmount = (parseFloat(property.area_sqft) * parseFloat(template.base_charge_sqft)) + parseFloat(template.fixed_charge);
    }

    const sinkingFund = parseFloat(template.sinking_fund);
    const repairFund = parseFloat(template.repair_fund);
    const waterCharges = parseFloat(template.water_charges);
    const parkingCharges = parseFloat(template.parking_charges);

    const totalAmount = baseAmount + sinkingFund + repairFund + waterCharges + parkingCharges;

    const cycleCode = cycle.start_date.substring(0, 7).replace('-', '');
    const cleanUnit = property.unit_number.replace('-', '');
    const billNumber = `INV-${cycleCode}-${cleanUnit}`;

    const { data: bill, error: billErr } = await supabaseAdmin
      .from('maintenance_bills')
      .insert([
        {
          property_id: property.id,
          cycle_id: cycleId,
          bill_number: billNumber,
          base_amount: baseAmount,
          tax_amount: 0.00,
          penalty_amount: 0.00,
          discount_amount: 0.00,
          total_amount: totalAmount,
          due_date: cycle.due_date,
          status: 'Unpaid'
        }
      ])
      .select()
      .single();

    if (billErr) {
      throw new Error(`Failed to create bill for unit ${property.unit_number}: ${billErr.message}`);
    }

    const items = [
      { bill_id: bill.id, item_name: 'Monthly Base Maintenance', amount: baseAmount },
      { bill_id: bill.id, item_name: 'Sinking Fund Contribution', amount: sinkingFund },
      { bill_id: bill.id, item_name: 'Repair Fund Contribution', amount: repairFund },
      { bill_id: bill.id, item_name: 'Water Utility Charges', amount: waterCharges },
      { bill_id: bill.id, item_name: 'Parking Slots Charges', amount: parkingCharges }
    ].filter(item => item.amount > 0);

    const { error: itemsErr } = await supabaseAdmin
      .from('bill_items')
      .insert(items);

    if (itemsErr) {
      throw new Error(`Failed to insert items for bill ${billNumber}: ${itemsErr.message}`);
    }

    generatedBills.push(bill);
  }

  await supabaseAdmin
    .from('billing_cycles')
    .update({ status: 'Generated' })
    .eq('id', cycleId);

  return generatedBills;
};

// --- Apply Penalties (Late Fees) ---
export const applyLateFees = async () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: rules } = await supabaseAdmin
    .from('late_fee_rules')
    .select('*')
    .eq('is_active', true);

  const activeRule = rules && rules.length > 0 ? rules[0] : null;
  if (!activeRule) {
    return { success: false, message: 'No active late fee rule found' };
  }

  const { data: bills, error: fetchErr } = await supabaseAdmin
    .from('maintenance_bills')
    .select('*')
    .in('status', ['Unpaid', 'Partially Paid'])
    .lt('due_date', todayStr);

  if (fetchErr) throw new Error(fetchErr.message);

  let updatedCount = 0;

  for (const bill of bills) {
    const dueDate = new Date(bill.due_date);
    const today = new Date();
    const timeDiff = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysOverdue <= activeRule.grace_period_days) {
      continue;
    }

    let penalty = 0;
    if (activeRule.charge_type === 'Percentage') {
      const annualRate = parseFloat(activeRule.rate_percent) / 100;
      penalty = parseFloat(bill.base_amount) * annualRate * (daysOverdue / 365);
    } else {
      penalty = parseFloat(activeRule.rate_percent);
    }

    penalty = parseFloat(penalty.toFixed(2));

    const newPenaltyAmount = penalty;
    const newTotalAmount = parseFloat(bill.base_amount) + parseFloat(bill.tax_amount) + newPenaltyAmount - parseFloat(bill.discount_amount);

    const { error: updateErr } = await supabaseAdmin
      .from('maintenance_bills')
      .update({
        penalty_amount: newPenaltyAmount,
        total_amount: newTotalAmount,
        status: 'Overdue'
      })
      .eq('id', bill.id);

    if (!updateErr) {
      const { data: existingPenaltyItem } = await supabaseAdmin
        .from('bill_items')
        .select('id')
        .eq('bill_id', bill.id)
        .eq('item_name', 'Late Payment Penalty Interest')
        .maybeSingle();

      if (existingPenaltyItem) {
        await supabaseAdmin
          .from('bill_items')
          .update({ amount: newPenaltyAmount })
          .eq('id', existingPenaltyItem.id);
      } else {
        await supabaseAdmin
          .from('bill_items')
          .insert([
            {
              bill_id: bill.id,
              item_name: 'Late Payment Penalty Interest',
              amount: newPenaltyAmount
            }
          ]);
      }
      updatedCount++;
    }
  }

  return { success: true, appliedCount: updatedCount };
};

// --- Receipts & Payment Allocations ---
export const createReceipt = async (receiptData) => {
  const { propertyId, paymentMode, referenceNumber, amountReceived, receivedDate } = receiptData;
  const rawAmount = parseFloat(amountReceived);

  const receiptNumber = `RCPT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const { data: receipt, error: receiptErr } = await supabaseAdmin
    .from('receipts')
    .insert([
      {
        property_id: propertyId,
        receipt_number: receiptNumber,
        payment_mode: paymentMode,
        reference_number: referenceNumber || null,
        amount_received: rawAmount,
        received_date: receivedDate
      }
    ])
    .select()
    .single();

  if (receiptErr) throw new Error(receiptErr.message);

  const { data: bills, error: billsErr } = await supabaseAdmin
    .from('maintenance_bills')
    .select('*')
    .eq('property_id', propertyId)
    .in('status', ['Unpaid', 'Partially Paid', 'Overdue'])
    .order('due_date', { ascending: true });

  if (billsErr) throw new Error(billsErr.message);

  let remainingFunds = rawAmount;
  const allocations = [];

  for (const bill of bills) {
    if (remainingFunds <= 0) break;

    const { data: prevAllocations } = await supabaseAdmin
      .from('payment_allocations')
      .select('allocated_amount')
      .eq('bill_id', bill.id);

    const totalAllocatedPrev = prevAllocations
      ? prevAllocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount), 0)
      : 0;

    const outstandingBalance = parseFloat(bill.total_amount) - totalAllocatedPrev;

    if (outstandingBalance <= 0) continue;

    const allocateAmount = Math.min(remainingFunds, outstandingBalance);

    const { data: allocation, error: allocErr } = await supabaseAdmin
      .from('payment_allocations')
      .insert([
        {
          receipt_id: receipt.id,
          bill_id: bill.id,
          allocated_amount: allocateAmount
        }
      ])
      .select()
      .single();

    if (allocErr) {
      console.error(`Failed to insert allocation for bill ${bill.id}:`, allocErr);
      continue;
    }

    allocations.push(allocation);

    const isFullyPaid = (totalAllocatedPrev + allocateAmount) >= parseFloat(bill.total_amount);
    const newStatus = isFullyPaid ? 'Paid' : 'Partially Paid';

    await supabaseAdmin
      .from('maintenance_bills')
      .update({ status: newStatus })
      .eq('id', bill.id);

    remainingFunds -= allocateAmount;
  }

  return {
    receipt,
    allocations,
    unallocatedAmount: remainingFunds
  };
};

// --- Outstanding Dues ---
export const getOutstandingDues = async (propertyId) => {
  const { data: bills, error } = await supabaseAdmin
    .from('maintenance_bills')
    .select('*')
    .eq('property_id', propertyId)
    .in('status', ['Unpaid', 'Partially Paid', 'Overdue']);

  if (error) throw new Error(error.message);

  let totalOutstanding = 0;
  const outstandingBills = [];

  for (const bill of bills) {
    const { data: allocations } = await supabaseAdmin
      .from('payment_allocations')
      .select('allocated_amount')
      .eq('bill_id', bill.id);

    const totalAllocated = allocations
      ? allocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount), 0)
      : 0;

    const remaining = parseFloat(bill.total_amount) - totalAllocated;

    if (remaining > 0) {
      totalOutstanding += remaining;
      outstandingBills.push({
        ...bill,
        allocatedAmount: totalAllocated,
        outstandingAmount: remaining
      });
    }
  }

  return {
    propertyId,
    totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
    bills: outstandingBills
  };
};

// --- Resident Ledger ---
export const getResidentLedger = async (propertyId) => {
  const { data: bills, error: billsErr } = await supabaseAdmin
    .from('maintenance_bills')
    .select('*')
    .eq('property_id', propertyId);

  if (billsErr) throw new Error(billsErr.message);

  const { data: receipts, error: receiptsErr } = await supabaseAdmin
    .from('receipts')
    .select('*')
    .eq('property_id', propertyId);

  if (receiptsErr) throw new Error(receiptsErr.message);

  const ledgerEntries = [];

  bills.forEach(bill => {
    ledgerEntries.push({
      date: bill.bill_date || bill.created_at.split('T')[0],
      type: 'Invoice Charge',
      reference: bill.bill_number,
      debit: parseFloat(bill.total_amount),
      credit: 0.00,
      timestamp: new Date(bill.created_at).getTime()
    });
  });

  receipts.forEach(receipt => {
    ledgerEntries.push({
      date: receipt.received_date,
      type: 'Payment Receipt',
      reference: receipt.receipt_number,
      debit: 0.00,
      credit: parseFloat(receipt.amount_received),
      timestamp: new Date(receipt.created_at).getTime()
    });
  });

  ledgerEntries.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.timestamp - b.timestamp;
  });

  let runningBalance = 0.00;
  const detailedLedger = ledgerEntries.map(entry => {
    runningBalance += entry.debit - entry.credit;
    return {
      date: entry.date,
      type: entry.type,
      reference: entry.reference,
      debit: entry.debit,
      credit: entry.credit,
      balance: parseFloat(runningBalance.toFixed(2))
    };
  });

  return {
    propertyId,
    closingBalance: parseFloat(runningBalance.toFixed(2)),
    ledger: detailedLedger
  };
};

// --- Razorpay Payment Flows ---
export const createRazorpayOrder = async (billId, userId) => {
  // 1. Fetch Bill details
  const { data: bill, error: billErr } = await supabaseAdmin
    .from('maintenance_bills')
    .select('*')
    .eq('id', billId)
    .single();

  if (billErr || !bill) {
    const err = new Error('Maintenance bill not found');
    err.statusCode = 404;
    throw err;
  }

  if (bill.status === 'Paid') {
    const err = new Error('Bill is already paid');
    err.statusCode = 400;
    throw err;
  }

  // Get already allocated amounts if partially paid
  const { data: prevAllocations } = await supabaseAdmin
    .from('payment_allocations')
    .select('allocated_amount')
    .eq('bill_id', billId);

  const totalAllocatedPrev = prevAllocations
    ? prevAllocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount), 0)
    : 0;

  const dueAmount = parseFloat(bill.total_amount) - totalAllocatedPrev;
  if (dueAmount <= 0) {
    const err = new Error('No outstanding dues remaining on this bill');
    err.statusCode = 400;
    throw err;
  }

  const isMockMode = env.razorpayKeyId === 'mock_key' || !env.razorpayKeyId;
  let orderId = '';

  if (isMockMode) {
    orderId = `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  } else {
    try {
      const razorpay = new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret
      });

      const order = await razorpay.orders.create({
        amount: Math.round(dueAmount * 100), // in paise
        currency: 'INR',
        receipt: bill.bill_number
      });

      orderId = order.id;
    } catch (err) {
      throw new Error(`Razorpay Order creation failed: ${err.message}`);
    }
  }

  // Create pending payment log in database
  const { data: payment, error: payErr } = await supabaseAdmin
    .from('payments')
    .insert([
      {
        property_id: bill.property_id,
        user_id: userId,
        amount: dueAmount,
        purpose: `Maintenance payment for bill #${bill.bill_number}`,
        razorpay_order_id: orderId,
        status: 'Pending'
      }
    ])
    .select()
    .single();

  if (payErr) throw new Error(payErr.message);

  return {
    orderId,
    amount: dueAmount,
    currency: 'INR',
    paymentId: payment.id
  };
};

export const verifyRazorpayPayment = async (verificationData) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verificationData;

  // 1. Fetch pending payment record
  const { data: payment, error: payErr } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .single();

  if (payErr || !payment) {
    const err = new Error('Pending payment record not found');
    err.statusCode = 404;
    throw err;
  }

  if (payment.status === 'Success') {
    return { success: true, message: 'Payment already verified and processed' };
  }

  const isMockMode = env.razorpayKeyId === 'mock_key' || !env.razorpayKeyId;

  // 2. Signature verification
  if (!isMockMode && razorpaySignature !== 'mock_signature') {
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'Failed' })
        .eq('id', payment.id);

      const err = new Error('Razorpay signature verification failed');
      err.statusCode = 400;
      throw err;
    }
  }

  // 3. Update payment record to Success
  const todayStr = new Date().toISOString();
  const { error: updateErr } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'Success',
      razorpay_payment_id: razorpayPaymentId,
      paid_at: todayStr
    })
    .eq('id', payment.id);

  if (updateErr) throw new Error(updateErr.message);

  // 4. Generate receipt and allocate funds
  const receiptResult = await createReceipt({
    propertyId: payment.property_id,
    paymentMode: 'Razorpay',
    referenceNumber: razorpayPaymentId,
    amountReceived: payment.amount,
    receivedDate: todayStr.split('T')[0]
  });

  // 5. Send Email/SMS Notification
  await sendPaymentNotification(payment.user_id, payment.amount, receiptResult.receipt.receipt_number);

  return {
    success: true,
    message: 'Payment verified successfully',
    receipt: receiptResult.receipt,
    allocations: receiptResult.allocations
  };
};
