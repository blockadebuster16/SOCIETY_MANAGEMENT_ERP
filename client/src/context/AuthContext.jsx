import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from API
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // If it's the mock token, bypass backend profile check and set mock user
      if (token === 'mock_token_for_parth_patel') {
        setUser({
          id: 'mock-resident-uuid',
          first_name: 'Parth',
          last_name: 'Patel',
          email: 'parth@example.com',
          phone: '9820012345',
          role: 'resident',
          status: 'Active',
          unit_assignment: 'Flat A-102'
        });
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/profile');
      if (response.data && response.data.success) {
        setUser(response.data.user || response.data.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Auth State from LocalStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Sync logout with Axios interceptor event
  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [logout]);

  // Email Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP login request simulation
  const loginWithPhone = async (phone) => {
    setLoading(true);
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Mock OTP sent to: ${phone}`);
      return { success: true };
    } catch (error) {
      console.error('Phone login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification simulation
  const verifyOTP = async (phone, code) => {
    setLoading(true);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (code === '123456') {
            resolve();
          } else {
            reject(new Error('Invalid OTP code. Please use 123456 for testing.'));
          }
        }, 800);
      });

      const mockUser = {
        id: 'mock-resident-uuid',
        first_name: 'Parth',
        last_name: 'Patel',
        email: 'parth@example.com',
        phone: phone,
        role: 'resident',
        status: 'Active',
        unit_assignment: 'Flat A-102'
      };

      localStorage.setItem('token', 'mock_token_for_parth_patel');
      setUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check role authorization helper
  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    const role = user.role;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(role);
    }
    return role === allowedRoles;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    loginWithPhone,
    verifyOTP,
    logout,
    hasRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
