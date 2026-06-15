import { supabaseAdmin } from '../config/supabase.js';
import { triggerNotification } from './notificationService.js';

const generatePassCode = () => {
  return 'GP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const getPropertyResidentsUserIds = async (propertyId) => {
  const { data: owners } = await supabaseAdmin
    .from('property_owners')
    .select('user_id')
    .eq('property_id', propertyId);
    
  const { data: tenants } = await supabaseAdmin
    .from('tenants')
    .select('user_id')
    .eq('property_id', propertyId)
    .eq('is_active', true);
    
  const userIds = new Set();
  owners?.forEach(o => userIds.add(o.user_id));
  tenants?.forEach(t => userIds.add(t.user_id));
  return Array.from(userIds);
};

// --- Pre-Approvals & Gate Passes ---

export const createPreApproval = async (residentId, data) => {
  const { propertyId, visitorName, visitorPhone, visitorType, purpose, validFrom, validTo } = data;

  const passCode = generatePassCode();

  const { data: pass, error } = await supabaseAdmin
    .from('gate_passes')
    .insert([
      {
        property_id: propertyId,
        resident_id: residentId,
        pass_code: passCode,
        visitor_name: visitorName,
        visitor_phone: visitorPhone,
        visitor_type: visitorType || 'Guest',
        purpose: purpose || null,
        valid_from: validFrom,
        valid_to: validTo,
        status: 'Active'
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return pass;
};

export const listPreApprovals = async (residentId = null) => {
  let query = supabaseAdmin
    .from('gate_passes')
    .select('*, properties(*, wings(wing_name))')
    .order('created_at', { ascending: false });

  if (residentId) {
    query = query.eq('resident_id', residentId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const cancelPreApproval = async (id, residentId = null) => {
  let query = supabaseAdmin
    .from('gate_passes')
    .update({ status: 'Cancelled' })
    .eq('id', id);

  if (residentId) {
    query = query.eq('resident_id', residentId);
  }

  const { data, error } = await query.select().single();
  if (error) throw new Error(error.message);
  return data;
};

// --- Visitor Entries (Check-In / Check-Out) ---

export const checkInVisitor = async (data, guardUserId) => {
  const { passCode, propertyId, visitorName, visitorPhone, vehicleNumber, visitorType, purpose, remarks } = data;

  let finalPropertyId = propertyId;
  let finalVisitorName = visitorName;
  let finalPhone = visitorPhone;
  let finalVisitorType = visitorType || 'Guest';
  let finalPurpose = purpose;
  let gatePassId = null;

  // 1. If passcode is provided, validate gate pass
  if (passCode) {
    const { data: pass, error: passErr } = await supabaseAdmin
      .from('gate_passes')
      .select('*')
      .eq('pass_code', passCode)
      .single();

    if (passErr || !pass) {
      throw new Error('Invalid gate pass code');
    }

    if (pass.status !== 'Active') {
      throw new Error(`Gate pass is not active (status: ${pass.status})`);
    }

    const now = new Date();
    const validFrom = new Date(pass.valid_from);
    const validTo = new Date(pass.valid_to);

    if (now < validFrom || now > validTo) {
      if (now > validTo) {
        await supabaseAdmin
          .from('gate_passes')
          .update({ status: 'Expired' })
          .eq('id', pass.id);
      }
      throw new Error('Gate pass has expired or is not yet valid');
    }

    finalPropertyId = pass.property_id;
    finalVisitorName = pass.visitor_name;
    finalPhone = pass.visitor_phone;
    finalVisitorType = pass.visitor_type;
    finalPurpose = pass.purpose;
    gatePassId = pass.id;

    // Update gate pass to Used
    await supabaseAdmin
      .from('gate_passes')
      .update({ status: 'Used' })
      .eq('id', pass.id);
  } else {
    // Ad-hoc entry requires basic details
    if (!finalPropertyId || !finalVisitorName || !finalPhone) {
      throw new Error('Missing required ad-hoc visitor details (propertyId, visitorName, visitorPhone)');
    }
  }

  // 2. Resolve core visitor profile record
  const expectedTime = new Date().toISOString();
  const { data: existingVisitor } = await supabaseAdmin
    .from('visitors')
    .select('id')
    .eq('property_id', finalPropertyId)
    .eq('phone', finalPhone)
    .maybeSingle();

  let visitorId = existingVisitor?.id;
  if (!visitorId) {
    const { data: newVis, error: newVisErr } = await supabaseAdmin
      .from('visitors')
      .insert([
        {
          property_id: finalPropertyId,
          visitor_name: finalVisitorName,
          phone: finalPhone,
          vehicle_number: vehicleNumber || null,
          expected_time: expectedTime,
          status: 'Checked In'
        }
      ])
      .select()
      .single();
    
    if (newVisErr) throw new Error(newVisErr.message);
    visitorId = newVis.id;
  } else {
    await supabaseAdmin
      .from('visitors')
      .update({ status: 'Checked In', vehicle_number: vehicleNumber || null })
      .eq('id', visitorId);
  }

  // 3. Create visitor entry log
  const { data: entry, error: entryErr } = await supabaseAdmin
    .from('visitor_entries')
    .insert([
      {
        visitor_id: visitorId,
        property_id: finalPropertyId,
        gate_pass_id: gatePassId,
        visitor_name: finalVisitorName,
        phone: finalPhone,
        vehicle_number: vehicleNumber || null,
        visitor_type: finalVisitorType,
        purpose: finalPurpose || null,
        status: 'Checked-In',
        checked_in_at: new Date().toISOString(),
        checked_in_by: guardUserId,
        remarks: remarks || null
      }
    ])
    .select('*, properties(*, wings(wing_name))')
    .single();

  if (entryErr) throw new Error(entryErr.message);

  // 4. Dispatch notification to all residents of this property
  const residents = await getPropertyResidentsUserIds(finalPropertyId);
  for (const residentId of residents) {
    await triggerNotification(
      residentId,
      'visitor_check_in',
      {
        visitor_name: finalVisitorName,
        visitor_type: finalVisitorType,
        vehicle_number: vehicleNumber || 'None',
        time: new Date(entry.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        remarks: remarks || 'None'
      },
      entry.id,
      'Security'
    );
  }

  return entry;
};

export const checkOutVisitor = async (entryId, guardUserId, remarks = null) => {
  // 1. Fetch current entry
  const { data: entry, error: fetchErr } = await supabaseAdmin
    .from('visitor_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (fetchErr || !entry) {
    throw new Error('Visitor entry record not found');
  }

  if (entry.status === 'Checked-Out') {
    throw new Error('Visitor has already checked out');
  }

  const checkOutTime = new Date().toISOString();

  // 2. Update visitor entry
  const { data: updatedEntry, error: updateErr } = await supabaseAdmin
    .from('visitor_entries')
    .update({
      status: 'Checked-Out',
      checked_out_at: checkOutTime,
      checked_out_by: guardUserId,
      remarks: remarks || entry.remarks
    })
    .eq('id', entryId)
    .select('*, properties(*, wings(wing_name))')
    .single();

  if (updateErr) throw new Error(updateErr.message);

  // 3. Update visitors profile table status
  if (entry.visitor_id) {
    await supabaseAdmin
      .from('visitors')
      .update({ status: 'Checked Out' })
      .eq('id', entry.visitor_id);
  }

  // 4. Notify residents
  const residents = await getPropertyResidentsUserIds(entry.property_id);
  for (const residentId of residents) {
    await triggerNotification(
      residentId,
      'visitor_check_out',
      {
        visitor_name: entry.visitor_name,
        time: new Date(checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        remarks: remarks || 'None'
      },
      entry.id,
      'Security'
    );
  }

  return updatedEntry;
};

export const listActiveVisitors = async () => {
  const { data, error } = await supabaseAdmin
    .from('visitor_entries')
    .select('*, properties(*, wings(wing_name)), checked_in_by_user:users!visitor_entries_checked_in_by_fkey(first_name, last_name)')
    .eq('status', 'Checked-In')
    .order('checked_in_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const listVisitorHistory = async (filters = {}) => {
  const { propertyId, wingId, visitorType, status, startDate, endDate, search } = filters;

  let query = supabaseAdmin
    .from('visitor_entries')
    .select('*, properties(*, wings(wing_name)), checked_in_by_user:users!visitor_entries_checked_in_by_fkey(first_name, last_name), checked_out_by_user:users!visitor_entries_checked_out_by_fkey(first_name, last_name)')
    .order('checked_in_at', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  if (visitorType) {
    query = query.eq('visitor_type', visitorType);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (startDate) {
    query = query.gte('checked_in_at', startDate);
  }

  if (endDate) {
    query = query.lte('checked_in_at', endDate);
  }

  if (search) {
    query = query.or(`visitor_name.ilike.%${search}%,phone.ilike.%${search}%,vehicle_number.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  if (wingId && data) {
    return data.filter(entry => entry.properties && entry.properties.wing_id === wingId);
  }

  return data || [];
};

// --- Security Logs ---

export const createSecurityLog = async (data, guardUserId) => {
  const { logText, category, severity } = data;

  const { data: log, error } = await supabaseAdmin
    .from('security_logs')
    .insert([
      {
        logged_by: guardUserId,
        log_text: logText,
        category: category || 'General',
        severity: severity || 'Info'
      }
    ])
    .select('*, logged_by_user:users!security_logs_logged_by_fkey(first_name, last_name)')
    .single();

  if (error) throw new Error(error.message);
  return log;
};

export const listSecurityLogs = async (filters = {}) => {
  const { category, severity, startDate, endDate } = filters;

  let query = supabaseAdmin
    .from('security_logs')
    .select('*, logged_by_user:users!security_logs_logged_by_fkey(first_name, last_name)')
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (severity) {
    query = query.eq('severity', severity);
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};
