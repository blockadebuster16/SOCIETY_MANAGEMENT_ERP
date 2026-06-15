import { supabase, supabaseAdmin } from '../config/supabase.js';

export const createResident = async (userData) => {
  const { email, password, firstName, lastName, phone, role, status } = userData;

  // 1. Sign up user with Supabase Auth
  // Generate random password if not provided
  const tempPassword = password || Math.random().toString(36).substring(2) + 'A1!' + Date.now();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: tempPassword
  });

  if (authError) {
    const error = new Error(authError.message);
    error.statusCode = authError.status || 400;
    throw error;
  }

  const user = authData.user;
  if (!user) {
    throw new Error('Supabase Auth user creation failed');
  }

  // 2. Insert profile into users table
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .insert([
      {
        auth_user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        role: role || 'resident',
        status: status || 'Pending'
      }
    ])
    .select()
    .single();

  if (profileError) {
    // Attempt clean up of auth user to avoid orphan accounts
    try {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    } catch (cleanupErr) {
      console.error('Failed to clean up auth user:', cleanupErr.message);
    }
    const error = new Error(profileError.message);
    error.statusCode = 400;
    throw error;
  }

  return profile;
};

export const updateResident = async (residentId, updateData) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', residentId)
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  if (!data) {
    const err = new Error('Resident not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

export const getResidentById = async (residentId) => {
  // Fetch user profile
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', residentId)
    .single();

  if (userError || !user) {
    const err = new Error('Resident not found');
    err.statusCode = 404;
    throw err;
  }

  // Fetch owned properties
  const { data: ownedProperties } = await supabaseAdmin
    .from('property_owners')
    .select('id, ownership_percentage, is_primary_owner, properties(*, wings(wing_name))')
    .eq('user_id', residentId);

  // Fetch rented properties
  const { data: rentedProperties } = await supabaseAdmin
    .from('tenants')
    .select('id, lease_start, lease_end, is_active, properties(*, wings(wing_name))')
    .eq('user_id', residentId);

  // Fetch family members
  const { data: familyMembers } = await supabaseAdmin
    .from('family_members')
    .select('id, name, relation, phone, properties(*, wings(wing_name))')
    .eq('owner_id', residentId);

  // Fetch vehicles
  const { data: vehicles } = await supabaseAdmin
    .from('vehicles')
    .select('id, vehicle_number, vehicle_type, parking_slot, properties(*, wings(wing_name))')
    .eq('owner_id', residentId);

  return {
    ...user,
    owned_properties: ownedProperties || [],
    rented_properties: rentedProperties || [],
    family_members: familyMembers || [],
    vehicles: vehicles || []
  };
};

export const getResidentProfile = async (authUserId) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();

  if (error || !user) {
    const err = new Error('Resident profile not found in housing portal database');
    err.statusCode = 404;
    throw err;
  }

  return getResidentById(user.id);
};

export const listResidents = async (filters = {}) => {
  const { wingId, floor, propertyType, role, status, isOwner, isTenant } = filters;

  // If filtering by property attributes (wing, floor, propertyType), resolve matching property IDs first
  let propIds = [];
  let hasPropFilters = !!(wingId || floor || propertyType);

  if (hasPropFilters) {
    let propQuery = supabaseAdmin.from('properties').select('id');
    if (wingId) propQuery = propQuery.eq('wing_id', wingId);
    if (floor) propQuery = propQuery.eq('floor_number', parseInt(floor, 10));
    if (propertyType) propQuery = propQuery.eq('unit_type', propertyType);

    const { data: props, error } = await propQuery;
    if (error) throw new Error(error.message);
    propIds = props ? props.map((p) => p.id) : [];

    // If no properties match filters, no residents can match
    if (propIds.length === 0) {
      return [];
    }
  }

  // Retrieve user IDs linked to properties if property filters or owner/tenant filters are set
  let filterUserIds = null;

  if (hasPropFilters || isOwner === 'true' || isTenant === 'true') {
    let userIdsSet = new Set();
    let queryOwners = supabaseAdmin.from('property_owners').select('user_id');
    let queryTenants = supabaseAdmin.from('tenants').select('user_id');

    if (hasPropFilters) {
      queryOwners = queryOwners.in('property_id', propIds);
      queryTenants = queryTenants.in('property_id', propIds);
    }

    const { data: owners } = await queryOwners;
    const { data: tenants } = await queryTenants;

    if (isOwner === 'true') {
      owners?.forEach((o) => userIdsSet.add(o.user_id));
    } else if (isTenant === 'true') {
      tenants?.forEach((t) => userIdsSet.add(t.user_id));
    } else {
      owners?.forEach((o) => userIdsSet.add(o.user_id));
      tenants?.forEach((t) => userIdsSet.add(t.user_id));
    }

    filterUserIds = Array.from(userIdsSet);

    if (filterUserIds.length === 0) {
      return [];
    }
  }

  // Base query on users table
  let query = supabaseAdmin.from('users').select('*').order('first_name', { ascending: true });

  if (role) query = query.eq('role', role);
  if (status) query = query.eq('status', status);
  if (filterUserIds !== null) {
    query = query.in('id', filterUserIds);
  }

  const { data: users, error: usersError } = await query;
  if (usersError) throw new Error(usersError.message);

  return users;
};

export const assignProperty = async (assignmentData) => {
  const { userId, propertyId, type } = assignmentData;

  if (type === 'owner') {
    const { ownershipPercentage, isPrimaryOwner } = assignmentData;
    const { data, error } = await supabaseAdmin
      .from('property_owners')
      .insert([
        {
          property_id: propertyId,
          user_id: userId,
          ownership_percentage: ownershipPercentage !== undefined ? ownershipPercentage : 100.00,
          is_primary_owner: isPrimaryOwner !== undefined ? isPrimaryOwner : true
        }
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  if (type === 'tenant') {
    const { leaseStart, leaseEnd } = assignmentData;
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .insert([
        {
          property_id: propertyId,
          user_id: userId,
          lease_start: leaseStart,
          lease_end: leaseEnd,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  if (type === 'family_member') {
    const { name, relation, phone } = assignmentData;
    const { data, error } = await supabaseAdmin
      .from('family_members')
      .insert([
        {
          property_id: propertyId,
          owner_id: userId, // Links to the owner user
          name,
          relation,
          phone: phone || null
        }
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error('Invalid assignment type');
};

export const removePropertyAssignment = async (assignmentId, type) => {
  let error;

  if (type === 'owner') {
    const res = await supabaseAdmin.from('property_owners').delete().eq('id', assignmentId);
    error = res.error;
  } else if (type === 'tenant') {
    const res = await supabaseAdmin.from('tenants').delete().eq('id', assignmentId);
    error = res.error;
  } else if (type === 'family_member') {
    const res = await supabaseAdmin.from('family_members').delete().eq('id', assignmentId);
    error = res.error;
  } else {
    throw new Error('Invalid assignment type. Must be owner, tenant, or family_member');
  }

  if (error) throw new Error(error.message);
  return { success: true };
};

export const listPropertyResidents = async (propertyId) => {
  const { data: owners, error: ownerError } = await supabaseAdmin
    .from('property_owners')
    .select('id, ownership_percentage, is_primary_owner, users(*)')
    .eq('property_id', propertyId);

  if (ownerError) throw new Error(ownerError.message);

  const { data: tenants, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select('id, lease_start, lease_end, is_active, users(*)')
    .eq('property_id', propertyId);

  if (tenantError) throw new Error(tenantError.message);

  const { data: familyMembers, error: familyError } = await supabaseAdmin
    .from('family_members')
    .select('id, name, relation, phone')
    .eq('property_id', propertyId);

  if (familyError) throw new Error(familyError.message);

  return {
    owners: owners || [],
    tenants: tenants || [],
    family_members: familyMembers || []
  };
};
