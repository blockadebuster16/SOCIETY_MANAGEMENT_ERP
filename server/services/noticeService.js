import { supabaseAdmin } from '../config/supabase.js';

export const createNotice = async (noticeData) => {
  const { title, content, category, attachmentUrl, publishedBy, status, publishedAt } = noticeData;

  // Map input status to database status and set published_at
  let dbStatus = 'Draft';
  let dbPublishedAt = publishedAt || new Date().toISOString();

  if (status === 'Published' || status === 'Active') {
    dbStatus = 'Active';
    dbPublishedAt = new Date().toISOString();
  } else if (status === 'Archived') {
    dbStatus = 'Archived';
  } else if (status === 'Scheduled') {
    dbStatus = 'Draft';
    dbPublishedAt = publishedAt; // Future date
  } else {
    // Default is Draft
    dbStatus = 'Draft';
    dbPublishedAt = null;
  }

  const { data, error } = await supabaseAdmin
    .from('notices')
    .insert([
      {
        title,
        content,
        category,
        attachment_url: attachmentUrl || null,
        published_by: publishedBy || null,
        published_at: dbPublishedAt,
        status: dbStatus
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const updateNotice = async (noticeId, updateData) => {
  const { title, content, category, attachmentUrl, status, publishedAt } = updateData;

  let updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (category !== undefined) updates.category = category;
  if (attachmentUrl !== undefined) updates.attachment_url = attachmentUrl;

  if (status !== undefined) {
    let dbStatus = 'Draft';
    let dbPublishedAt = publishedAt || new Date().toISOString();

    if (status === 'Published' || status === 'Active') {
      dbStatus = 'Active';
      dbPublishedAt = new Date().toISOString();
    } else if (status === 'Archived') {
      dbStatus = 'Archived';
    } else if (status === 'Scheduled') {
      dbStatus = 'Draft';
      dbPublishedAt = publishedAt;
    } else {
      dbStatus = 'Draft';
      dbPublishedAt = null;
    }
    updates.status = dbStatus;
    updates.published_at = dbPublishedAt;
  } else if (publishedAt !== undefined) {
    updates.published_at = publishedAt;
  }

  const { data, error } = await supabaseAdmin
    .from('notices')
    .update(updates)
    .eq('id', noticeId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    const err = new Error('Notice not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const publishNotice = async (noticeId) => {
  const { data, error } = await supabaseAdmin
    .from('notices')
    .update({
      status: 'Active',
      published_at: new Date().toISOString()
    })
    .eq('id', noticeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Notice not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const archiveNotice = async (noticeId) => {
  const { data, error } = await supabaseAdmin
    .from('notices')
    .update({
      status: 'Archived'
    })
    .eq('id', noticeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Notice not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const deleteNotice = async (noticeId) => {
  const { error } = await supabaseAdmin
    .from('notices')
    .delete()
    .eq('id', noticeId);

  if (error) throw new Error(error.message);
  return { success: true };
};

export const getNoticeById = async (noticeId) => {
  const { data, error } = await supabaseAdmin
    .from('notices')
    .select('*, published_by(id, first_name, last_name, email, role)')
    .eq('id', noticeId)
    .single();

  if (error || !data) {
    const err = new Error('Notice not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const listNotices = async (filters = {}, showAll = false) => {
  const { category, status, search } = filters;

  let query = supabaseAdmin
    .from('notices')
    .select('*, published_by(id, first_name, last_name, email, role)');

  // If a standard resident is querying, only show published, non-future notices
  if (!showAll) {
    query = query.eq('status', 'Active').lte('published_at', new Date().toISOString());
  } else {
    // Admins can filter by draft/scheduled/archived status
    if (status) {
      let dbStatus = status;
      if (status === 'Published') dbStatus = 'Active';
      query = query.eq('status', dbStatus);
    }
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  query = query.order('published_at', { ascending: false, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getLatestNotices = async (limit = 5) => {
  const { data, error } = await supabaseAdmin
    .from('notices')
    .select('*, published_by(id, first_name, last_name, email, role)')
    .eq('status', 'Active')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
};
