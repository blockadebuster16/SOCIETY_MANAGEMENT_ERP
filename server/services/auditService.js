import { supabaseAdmin } from '../config/supabase.js';

/**
 * Creates a new audit log record.
 */
export const logAudit = async (userId, action, entityType, entityId, metadata = {}) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert([
        {
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[AUDIT ENGINE ERROR] Failed to create audit log:', error.message);
    }
    return data;
  } catch (err) {
    console.error('[AUDIT ENGINE ERROR] Unexpected error writing audit log:', err.message);
    return null;
  }
};

/**
 * Lists historical audit logs based on search filters.
 */
export const listAuditLogs = async (filters = {}) => {
  const { userId, action, entityType, startDate, endDate, limit = 50, page = 1 } = filters;

  let query = supabaseAdmin
    .from('audit_logs')
    .select('*, users(id, first_name, last_name, role, email)')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (action) {
    query = query.eq('action', action);
  }
  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
};
