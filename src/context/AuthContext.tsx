import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Check for existing token and validate it on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken();
    }
  }, []);

  const validateToken = async () => {
    try {
      const { data } = await api.get('/auth/validate');
      setIsAuthenticated(true);
      setUser(data.user);
    } catch (error) {
      // If token validation fails, clear everything
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set the authenticated state and user data
      setIsAuthenticated(true);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Reset auth state
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 