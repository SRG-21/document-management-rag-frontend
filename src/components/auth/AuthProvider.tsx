import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthState, User } from '../../types/auth';
import { loginUser, registerUser, logoutUser } from '../../lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);
    
    const user: User = {
      id: response.user_id,
      email: response.email,
    };
    
    localStorage.setItem('auth_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({
      user,
      token: response.access_token,
      isAuthenticated: true,
    });
  };

  const register = async (email: string, password: string) => {
    const response = await registerUser(email, password);
    
    const user: User = {
      id: response.user_id,
      email: response.email,
    };
    
    localStorage.setItem('auth_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({
      user,
      token: response.access_token,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Continue with local logout even if API fails
      console.error('Logout API error:', error);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
