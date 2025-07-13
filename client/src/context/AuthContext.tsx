import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

interface Ward {
  wardId: string;
  name: string;
  age: number;
  grade: string;
  bikeId: string;
  bikeName: string;
  createdAt: string;
  status: string;
}

interface Guardian {
  guardianId: string;
  userId: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: string;
  wards: Ward[];
}

interface AuthContextType {
  user: User | null;
  guardian: Guardian | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, mobile: string) => Promise<void>;
  logout: () => void;
  fetchGuardian: () => Promise<void>;
  addWard: (wardData: { name: string; age: number; grade: string; bikeName: string }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get API base URL from environment variables
  const getApiBaseUrl = () => {
    // First try to get from environment variable
    const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (envBaseUrl) {
      return envBaseUrl;
    }
    
    // Fallback to dynamic hostname (for backward compatibility)
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
  };
  
  // Set up axios defaults
  axios.defaults.baseURL = getApiBaseUrl();

  // Log the API base URL for debugging
  console.log('API Base URL:', getApiBaseUrl());

  useEffect(() => {
    const savedToken = Cookies.get('token');
    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/me');
      setUser(response.data);
      // Fetch guardian data after user is loaded
      await fetchGuardian();
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchGuardian = async () => {
    try {
      const response = await axios.get('/api/guardian/me');
      setGuardian(response.data.guardian);
    } catch (error) {
      console.error('Error fetching guardian data:', error);
    }
  };

  const addWard = async (wardData: { name: string; age: number; grade: string; bikeName: string }) => {
    try {
      const response = await axios.post('/api/guardian/wards', wardData);
      // Refresh guardian data to include new ward
      await fetchGuardian();
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add ward');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      Cookies.set('token', newToken, { expires: 7 }); // 7 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Fetch guardian data after login
      await fetchGuardian();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signup = async (name: string, email: string, password: string, mobile: string) => {
    try {
      const response = await axios.post('/api/signup', { name, email, password, mobile });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      Cookies.set('token', newToken, { expires: 7 }); // 7 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Fetch guardian data after signup
      await fetchGuardian();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  };

  const logout = () => {
    setUser(null);
    setGuardian(null);
    setToken(null);
    Cookies.remove('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    guardian,
    token,
    login,
    signup,
    logout,
    fetchGuardian,
    addWard,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};