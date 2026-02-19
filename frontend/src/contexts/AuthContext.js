import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const user = authService.getCurrentUser();
      setUser(user);
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        // Return both success and redirect path
        return { 
          success: true, 
          data: response.data,
          redirect: response.data.user.role === 'Admin' ? '/admin' : 
                   response.data.user.role === 'Driver' ? '/driver' : 
                   '/citizen'
        };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.data.user);
        return { 
          success: true, 
          data: response.data,
          redirect: response.data.user.role === 'Admin' ? '/admin' : 
                   response.data.user.role === 'Driver' ? '/driver' : 
                   '/citizen'
        };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // NEW: Update user information (used after profile updates)
  const updateUser = (updatedUserData) => {
    setUser(prevUser => {
      const updatedUser = {
        ...prevUser,
        ...updatedUserData
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  };

  // NEW: Refresh user data from server
  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUserFromServer();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // NEW: Update user preferences
  const updatePreferences = (preferences) => {
    setUser(prevUser => {
      const updatedUser = {
        ...prevUser,
        preferences: {
          ...prevUser?.preferences,
          ...preferences
        }
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // NEW: Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // NEW: Check if user has any of the given roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,           // Add this line
    refreshUser,          // Add this line
    updatePreferences,    // Add this line
    hasRole,              // Add this line
    hasAnyRole,           // Add this line
    loading,
    isAuthenticated: authService.isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};