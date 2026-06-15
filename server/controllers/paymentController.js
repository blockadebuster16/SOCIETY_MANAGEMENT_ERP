import {
  createBillingCycle as createBillingCycleService,
  getBillingCycleById,
  listBillingCycles,
  generateCycleBills,
  applyLateFees,
  createReceipt,
  getOutstandingDues,
  getResidentLedger,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../services/paymentService.js';
import { getResidentProfile } from '../services/residentService.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logAudit } from '../services/auditService.js';

// Helper to check authorized property IDs for a resident
const getAuthorizedPropertyIds = async (userPayload) => {
  const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
  if (userPayload && adminRoles.includes(userPayload.role)) {
    return null; // Admins have access to all properties
  }
  const profile = await getResidentProfile(userPayload.authUserId);
  const owned = profile.owned_properties ? profile.owned_properties.map(p => p.property_id) : [];
  const rented = profile.rented_properties ? profile.rented_properties.map(p => p.property_id) : [];
  return [...new Set([...owned, ...rented])];
};

export const getBillingCycles = async (req, res, next) => {
  try {
    const cycles = await listBillingCycles();
    res.status(200).json({
      success: true,
      billingCycles: cycles
    });
  } catch (error) {
    next(error);
  }
};

export const createBillingCycle = async (req, res, next) => {
  try {
    const cycle = await createBillingCycleService(req.body);
    res.status(201).json({
      success: true,
      message: 'Billing cycle created successfully',
      billingCycle: cycle
    });
  } catch (error) {
    next(error);
  }
};

export const generateBills = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bills = await generateCycleBills(id);
    await logAudit(req.user.id, 'GENERATE_BILLS', 'BillingCycle', id, { cycleId: id, count: bills.length });
    res.status(201).json({
      success: true,
      message: `Successfully generated ${bills.length} bills for the billing cycle`,
      bills
    });
  } catch (error) {
    next(error);
  }
};

export const triggerPenalties = async (req, res, next) => {
  try {
    const result = await applyLateFees();
    await logAudit(req.user.id, 'APPLY_PENALTIES', 'BillingCycle', '00000000-0000-0000-0000-000000000000', result);
    res.status(200).json({
      success: true,
      message: 'Late payment interest fees evaluated and applied successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getBills = async (req, res, next) => {
  try {
    const { propertyId, status, cycleId, page = 1, limit = 10 } = req.query;

    let query = supabaseAdmin
      .from('maintenance_bills')
      .select('*, properties(*, wings(wing_name)), billing_cycles(*)', { count: 'exact' });

    if (cycleId) query = query.eq('cycle_id', cycleId);
    if (status) query = query.eq('status', status);

    const authIds = await getAuthorizedPropertyIds(req.user);
    if (authIds !== null) {
      if (propertyId) {
        if (!authIds.includes(propertyId)) {
          return res.status(403).json({ success: false, message: 'Access Denied: Property does not belong to you' });
        }
        query = query.eq('property_id', propertyId);
      } else {
        if (authIds.length === 0) {
          return res.status(200).json({ success: true, bills: [], total: 0, page: parseInt(page, 10), limit: parseInt(limit, 10) });
        }
        query = query.in('property_id', authIds);
      }
    } else if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: bills, error, count } = await query;
    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      bills,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (error) {
    next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: bill, error } = await supabaseAdmin
      .from('maintenance_bills')
      .select('*, properties(*, wings(wing_name)), billing_cycles(*)')
      .eq('id', id)
      .single();

    if (error || !bill) {
      return res.status(404).json({ success: false, message: 'Maintenance bill not found' });
    }

    // Verify authorized properties for residents
    const authIds = await getAuthorizedPropertyIds(req.user);
    if (authIds !== null && !authIds.includes(bill.property_id)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Property does not belong to you' });
    }

    // Fetch bill items
    const { data: items } = await supabaseAdmin
      .from('bill_items')
      .select('*')
      .eq('bill_id', id);

    res.status(200).json({
      success: true,
      bill: {
        ...bill,
        items: items || []
      }
    });
  } catch (error) {
    next(error);
  }
};

export const postReceipt = async (req, res, next) => {
  try {
    const result = await createReceipt(req.body);
    await logAudit(req.user.id, 'POST_RECEIPT', 'Receipt', result.receipt.id, { propertyId: req.body.propertyId, amount: req.body.amountReceived });
    res.status(201).json({
      success: true,
      message: 'Receipt posted and payment allocated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getReceipts = async (req, res, next) => {
  try {
    const { propertyId, page = 1, limit = 10 } = req.query;

    let query = supabaseAdmin
      .from('receipts')
      .select('*, properties(*, wings(wing_name))', { count: 'exact' });

    const authIds = await getAuthorizedPropertyIds(req.user);
    if (authIds !== null) {
      if (propertyId) {
        if (!authIds.includes(propertyId)) {
          return res.status(403).json({ success: false, message: 'Access Denied: Property does not belong to you' });
        }
        query = query.eq('property_id', propertyId);
      } else {
        if (authIds.length === 0) {
          return res.status(200).json({ success: true, receipts: [], total: 0, page: parseInt(page, 10), limit: parseInt(limit, 10) });
        }
        query = query.in('property_id', authIds);
      }
    } else if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: receipts, error, count } = await query;
    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      receipts,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (error) {
    next(error);
  }
};

export const getOutstanding = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // Verify authorized properties for residents
    const authIds = await getAuthorizedPropertyIds(req.user);
    if (authIds !== null && !authIds.includes(propertyId)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Property does not belong to you' });
    }

    const result = await getOutstandingDues(propertyId);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getLedger = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // Verify authorized properties for residents
    const authIds = await getAuthorizedPropertyIds(req.user);
    if (authIds !== null && !authIds.includes(propertyId)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Property does not belong to you' });
    }

    const result = await getResidentLedger(propertyId);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { billId } = req.body;
    const profile = await getResidentProfile(req.user.authUserId);
    const localUserId = profile.id;

    // Verify resident is authorized for the bill property
    const { data: bill } = await supabaseAdmin
      .from('maintenance_bills')
      .select('property_id')
      .eq('id', billId)
      .single();

    if (bill) {
      const authIds = await getAuthorizedPropertyIds(req.user);
      if (authIds !== null && !authIds.includes(bill.property_id)) {
        return res.status(403).json({ success: false, message: 'Access Denied: You cannot create orders for properties you do not reside in' });
      }
    }

    const order = await createRazorpayOrder(billId, localUserId);

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      ...order
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const result = await verifyRazorpayPayment(req.body);
    if (result.receipt) {
      await logAudit(req.user.id, 'VERIFY_PAYMENT', 'Receipt', result.receipt.id, { orderId: req.body.razorpayOrderId });
    }
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

