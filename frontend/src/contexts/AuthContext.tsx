// AuthContext.tsx - Context
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

import type { ReactNode } from 'react';
import { storage } from '@/utils/storage';
import { 

  login as loginService, 
  register as registerService, 
  logout as logoutService, 
  getCurrentUser,
  updateProfile as updateProfileService,
  updatePassword as updatePasswordService,

  type LoginCredentials, 

  type RegisterCredentials, 

  type AuthResponse,

  type UpdateProfileCredentials,

  type UpdatePasswordCredentials
} from '@/services/authService';


export interface User {
  id: string;
  email: string;
  name: string;
}


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (credentials: UpdateProfileCredentials) => Promise<void>;
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<void>;
  clearError: () => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface AuthProviderProps {
  children: ReactNode;
}





export function AuthProvider({ children }: AuthProviderProps) {


  const [user, setUser] = useState<User | null>(null);


  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const [isLoading, setIsLoading] = useState(true);


  const [error, setError] = useState<string | null>(null);

  // Vérifie le token au démarrage

  useEffect(() => {


    const checkAuth = async () => {
      const token = storage.getToken();
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          storage.removeToken();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);



  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await loginService(credentials);
      storage.setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);



  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await registerService(credentials);
      storage.setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);



  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      storage.removeToken();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);



  const updateProfile = useCallback(async (credentials: UpdateProfileCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Non authentifié');
      }
      const userData = await updateProfileService(token, credentials);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);



  const updatePassword = useCallback(async (credentials: UpdatePasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Non authentifié');
      }
      await updatePasswordService(token, credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);



  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    clearError,
  };


// RENDER



  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}



// Default context for when not inside AuthProvider (e.g., during prerendering)
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  updatePassword: async () => {},
  clearError: () => {},
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return defaultAuthContext;
  }
  return context;
}
