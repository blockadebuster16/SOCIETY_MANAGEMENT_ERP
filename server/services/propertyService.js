import { supabaseAdmin } from '../config/supabase.js';

export const listProperties = async (filters = {}) => {
  let query = supabaseAdmin
    .from('properties')
    .select('*, wings(wing_name)')
    .order('unit_number', { ascending: true });

  if (filters.wingId) {
    query = query.eq('wing_id', filters.wingId);
  }
  if (filters.unitType) {
    query = query.eq('unit_type', filters.unitType);
  }
  if (filters.ownershipStatus) {
    query = query.eq('ownership_status', filters.ownershipStatus);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  // Flatten the wing_name for frontend consumption
  return data.map((p) => ({
    ...p,
    wing_name: p.wings ? p.wings.wing_name : null,
    wings: undefined
  }));
};

export const updatePropertyStatus = async (propertyId, status) => {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .update({ status })
    .eq('id', propertyId)
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  if (!data) {
    const err = new Error('Property not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};
