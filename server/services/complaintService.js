import { supabaseAdmin } from '../config/supabase.js';

export const createComplaint = async (complaintData) => {
  const { propertyId, residentId, category, priority, subject, description } = complaintData;

  const { data, error } = await supabaseAdmin
    .from('complaints')
    .insert([
      {
        property_id: propertyId,
        user_id: residentId, // Maps local resident profile ID
        category,
        priority: priority || 'Medium',
        subject,
        description,
        status: 'Open'
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateComplaint = async (complaintId, updateData) => {
  const { category, priority, subject, description } = updateData;

  let updates = {};
  if (category !== undefined) updates.category = category;
  if (priority !== undefined) updates.priority = priority;
  if (subject !== undefined) updates.subject = subject;
  if (description !== undefined) updates.description = description;

  const { data, error } = await supabaseAdmin
    .from('complaints')
    .update(updates)
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const assignComplaint = async (complaintId, assignedTo) => {
  const { data, error } = await supabaseAdmin
    .from('complaints')
    .update({
      assigned_to: assignedTo,
      status: 'Assigned'
    })
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const changeComplaintStatus = async (complaintId, status, details = {}) => {
  let updates = { status };
  
  if (status === 'Resolved' || status === 'Rejected') {
    if (details.resolutionNotes) {
      updates.resolution_notes = details.resolutionNotes;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('complaints')
    .update(updates)
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const closeComplaint = async (complaintId, resolutionNotes) => {
  const { data, error } = await supabaseAdmin
    .from('complaints')
    .update({
      status: 'Closed',
      resolution_notes: resolutionNotes,
      closed_at: new Date().toISOString()
    })
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const reopenComplaint = async (complaintId) => {
  const { data, error } = await supabaseAdmin
    .from('complaints')
    .update({
      status: 'Reopened',
      closed_at: null
    })
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const addComment = async (complaintId, userId, commentText) => {
  const { data, error } = await supabaseAdmin
    .from('complaint_comments')
    .insert([
      {
        complaint_id: complaintId,
        user_id: userId,
        comment: commentText
      }
    ])
    .select('*, users(*)')
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const uploadAttachment = async (complaintId, fileUrl, uploadedBy) => {
  const { data, error } = await supabaseAdmin
    .from('complaint_attachments')
    .insert([
      {
        complaint_id: complaintId,
        file_url: fileUrl,
        uploaded_by: uploadedBy
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getComplaintById = async (complaintId) => {
  const { data: complaint, error } = await supabaseAdmin
    .from('complaints')
    .select(`
      *,
      properties(*, wings(wing_name)),
      reporter:user_id(*),
      assignee:assigned_to(*)
    `)
    .eq('id', complaintId)
    .single();

  if (error || !complaint) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }

  // Fetch comment threads
  const { data: comments } = await supabaseAdmin
    .from('complaint_comments')
    .select('*, users(*)')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });

  // Fetch photo attachments
  const { data: attachments } = await supabaseAdmin
    .from('complaint_attachments')
    .select('*')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });

  return {
    ...complaint,
    comments: comments || [],
    attachments: attachments || []
  };
};

export const listComplaints = async (filters = {}, showAll = false, currentUserId = null) => {
  const { category, status, priority, search, page = 1, limit = 10 } = filters;

  let query = supabaseAdmin
    .from('complaints')
    .select('*, properties(*, wings(wing_name)), reporter:user_id(*), assignee:assigned_to(*)', { count: 'exact' });

  // Filter based on role permissions
  if (!showAll && currentUserId) {
    query = query.eq('user_id', currentUserId);
  }

  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  
  if (search) {
    query = query.or(`subject.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    complaints: data,
    total: count,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
};

export const getResidentComplaints = async (residentId, filters = {}) => {
  return listComplaints(filters, false, residentId);
};
