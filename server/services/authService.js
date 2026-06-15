import { supabase, supabaseAdmin } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, phone, role } = userData;

  // Sign up user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
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

  // Insert profile into users table
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
        status: 'Active'
      }
    ])
    .select()
    .single();

  if (profileError) {
    // Attempt clean up of auth user to avoid orphans
    try {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    } catch (cleanupErr) {
      console.error('Failed to clean up auth user:', cleanupErr.message);
    }
    const error = new Error(profileError.message);
    error.statusCode = 400;
    throw error;
  }

  // Generate a local JWT
  const token = jwt.sign(
    {
      id: profile.id,
      authUserId: profile.auth_user_id,
      email: profile.email,
      role: profile.role
    },
    env.jwtSecret,
    { expiresIn: '24h' }
  );

  return { user: profile, token };
};

export const authenticateUser = async (email, password) => {
  // Sign in user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    const error = new Error(authError.message);
    error.statusCode = authError.status || 401;
    throw error;
  }

  const user = authData.user;
  if (!user) {
    throw new Error('Supabase Auth user lookup failed');
  }

  // Retrieve user profile from the users table
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (profileError || !profile) {
    const error = new Error('User profile not found in housing portal database');
    error.statusCode = 404;
    throw error;
  }

  if (profile.status !== 'Active') {
    const error = new Error(`User account is ${profile.status.toLowerCase()}`);
    error.statusCode = 403;
    throw error;
  }

  // Generate a local JWT
  const token = jwt.sign(
    {
      id: profile.id,
      authUserId: profile.auth_user_id,
      email: profile.email,
      role: profile.role
    },
    env.jwtSecret,
    { expiresIn: '24h' }
  );

  return { user: profile, token };
};

