import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'medico' | 'empleado';
  centroId?: number;
  doctorId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMedico: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      validateToken(storedToken);
    }
  }, []);

  const validateToken = async (tokenToValidate: string) => {
    try {
      console.log('Validating token:', tokenToValidate.substring(0, 50) + '...');
      const response = await axios.get('http://localhost:5158/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`
        }
      });
      
      console.log('Token validation response:', response.data);
      
      if (response.data.valid) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
          centroId: response.data.centroId,
          doctorId: response.data.doctorId
        };
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with Gateway API...');
      const response = await axios.post('http://localhost:5158/api/auth/login', {
        username,
        password
      });

      if (response.data.token) {
        console.log('Login successful, token received');
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        
        // Validate token to get user info
        await validateToken(response.data.token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const googleLogin = async (credential: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:5158/api/auth/google-login', {
        credential
      });

      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        
        // Validate token to get user info
        await validateToken(response.data.token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login failed:', error);
      
      // Check if the error contains user info (user not registered)
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message && errorData.userInfo) {
          throw new Error(errorData.message);
        }
      }
      
      throw new Error('Error al iniciar sesión con Google');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    googleLogin,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isMedico: user?.role === 'medico'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};