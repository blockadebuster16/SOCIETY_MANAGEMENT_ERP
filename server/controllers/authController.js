import { registerUser, authenticateUser } from '../services/authService.js';
import { supabaseAdmin } from '../config/supabase.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const { user, token } = await registerUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authenticateUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // req.user has verified JWT payload (contains id, authUserId, email, role)
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      user: profile
    });
  } catch (error) {
    next(error);
  }
};

