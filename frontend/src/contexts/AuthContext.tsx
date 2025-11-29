import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'medico' | 'empleado';
  centroId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
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
      const response = await axios.get('http://localhost:5158/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`
        }
      });
      
      if (response.data.valid) {
        setUser({
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
          centroId: response.data.centroId
        });
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
      // Try Gateway API first, fallback to direct Admin API
      let response;
      try {
        response = await axios.post('http://localhost:5158/api/auth/login', {
          username,
          password
        });
      } catch (gatewayError) {
        console.warn('Gateway API failed, trying direct Admin API login...');
        // Fallback: validate credentials directly with Admin API
        const validateResponse = await axios.post('http://localhost:3000/usuarios/validate', {
          username,
          password
        });
        
        if (validateResponse.data) {
          // Create a simple token for demo purposes (in production, this should come from Gateway)
          const simpleToken = btoa(JSON.stringify({
            id: validateResponse.data.id,
            username: validateResponse.data.username,
            role: validateResponse.data.role,
            centroId: validateResponse.data.centroId,
            exp: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
          }));
          
          response = { data: { token: simpleToken } };
          
          setUser({
            id: validateResponse.data.id.toString(),
            username: validateResponse.data.username,
            role: validateResponse.data.role,
            centroId: validateResponse.data.centroId
          });
        } else {
          throw new Error('Invalid credentials');
        }
      }

      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        
        // If we got token from Gateway, validate it to get user info
        if (!user) {
          await validateToken(response.data.token);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
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
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isMedico: user?.role === 'medico'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};