// ============================================
// AuthContext.tsx - Contexte d'authentification
// ============================================
// ROLE: Fournit un contexte global pour la gestion de l'authentification dans l'application.
// Ce contexte permet a tous les composants d'acceder a :
// - L'utilisateur connecte (user)
// - L'etat de connexion (isAuthenticated)
// - Les fonctions de login, register, logout, updateProfile, updatePassword
// - La gestion des erreurs globales
//
// DEPENDANCES :
// - react : Pour createContext, useContext, useState, useEffect, useCallback
// - @/utils/storage : Pour la gestion du token JWT (getToken, setToken, removeToken)
// - @/services/authService : Pour les appels API d'authentification
//
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


// ============================================
// INTERFACES ET TYPES
// ============================================

// Interface representant un utilisateur connecte
// Utilisee dans tout le contexte d'authentification
export interface User {
  id: string;    // Identifiant unique de l'utilisateur
  email: string; // Adresse email de l'utilisateur
  name: string;  // Nom complet de l'utilisateur (format: "Nom Prenom")
}


// Interface definissant les proprietes et methodes disponibles dans le contexte
// Toutes les fonctions sont asynchrones et peuvent lancer des erreurs
interface AuthContextType {
  user: User | null;                                      // Utilisateur connecte ou null
  isAuthenticated: boolean;                              // Etat de connexion
  isLoading: boolean;                                    // Indicateur de chargement
  error: string | null;                                  // Message d'erreur global
  login: (credentials: LoginCredentials) => Promise<void>;     // Connexion
  register: (credentials: RegisterCredentials) => Promise<void>; // Inscription
  logout: () => Promise<void>;                                // Deconnexion
  updateProfile: (credentials: UpdateProfileCredentials) => Promise<void>; // Mise a jour profil
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<void>; // Changement mot de passe
  clearError: () => void;                                    // Effacer l'erreur
}


// ============================================
// CREATION DU CONTEXTE
// ============================================

// Creation du contexte avec une valeur par defaut undefined
// Le contexte sera toujours fourni via AuthProvider, donc undefined ne devrait jamais etre utilise
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Interface pour les props du fournisseur de contexte
interface AuthProviderProps {
  children: ReactNode; // Composants enfants qui auront acces au contexte
}


// ============================================
// FOURNISSEUR DE CONTEXTE (AuthProvider)
// ============================================

export function AuthProvider({ children }: AuthProviderProps) {

  // ============================================
  // 1. ETATS (STATE MANAGEMENT)
  // ============================================

  // Etat de l'utilisateur connecte
  const [user, setUser] = useState<User | null>(null);

  // Etat de connexion
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Indicateur de chargement (utilise lors des appels API)
  const [isLoading, setIsLoading] = useState(true);

  // Message d'erreur global
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // 2. EFFETS (USE EFFECT)
  // ============================================

  // EFFET: Verification du token au demarrage de l'application
  // Ce useEffect s'execute une seule fois au montage du composant
  // Il verifie si un token JWT existe dans le storage et tente de recuperer l'utilisateur
  useEffect(() => {
    const checkAuth = async () => {
      const token = storage.getToken();
      if (token) {
        try {
          // Si un token existe, on recuperer les donnees de l'utilisateur
          const userData = await getCurrentUser(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          // Si le token est invalide, on le supprime
          storage.removeToken();
        } finally {
          // On desactive l'indicateur de chargement dans tous les cas
          setIsLoading(false);
        }
      } else {
        // Pas de token = pas d'utilisateur connecte
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []); // Tableau de dependances vide = s'execute une seule fois

  // ============================================
  // 3. FONCTIONS (USE CALLBACK pour memoisation)
  // ============================================

  // Fonction de connexion
  // @param credentials {LoginCredentials} - Identifiants de connexion (email, password)
  // @action:
  //   1. Active l'indicateur de chargement
  //   2. Efface les erreurs precedentes
  //   3. Appelle le service login (POST /auth/login)
  //   4. Stocke le token JWT dans le storage
  //   5. Met a jour l'utilisateur et l'etat de connexion
  //   6. En cas d'erreur, la stocke et la relance
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
      throw err; // Relance l'erreur pour que le composant appelant puisse la gerer
    } finally {
      setIsLoading(false);
    }
  }, []); // Pas de dependances = memoisation optimale


  // Fonction d'inscription
  // @param credentials {RegisterCredentials} - Donnees d'inscription (name, email, password)
  // @action:
  //   1. Active l'indicateur de chargement
  //   2. Efface les erreurs precedentes
  //   3. Appelle le service register (POST /auth/register)
  //   4. Stocke le token JWT dans le storage
  //   5. Met a jour l'utilisateur et l'etat de connexion
  //   6. En cas d'erreur, la stocke et la relance
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


  // Fonction de deconnexion
  // @action:
  //   1. Appelle le service logout (POST /auth/logout)
  //   2. Supprime le token JWT du storage
  //   3. Reinitialise l'utilisateur et l'etat de connexion
  //   4. Efface les erreurs
  // Note: L'erreur est ignoree car la deconnexion doit fonctionner meme si l'API echoue
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (err) {
      // Ignore l'erreur: la deconnexion locale doit fonctionner
    } finally {
      storage.removeToken();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);


  // Fonction de mise a jour du profil
  // @param credentials {UpdateProfileCredentials} - Nouvelles donnees du profil (name, email)
  // @action:
  //   1. Active l'indicateur de chargement
  //   2. Efface les erreurs precedentes
  //   3. Verifie qu'un token existe
  //   4. Appelle le service updateProfile (PATCH /auth/profile)
  //   5. Met a jour l'utilisateur avec les nouvelles donnees
  //   6. En cas d'erreur, la stocke et la relance
  const updateProfile = useCallback(async (credentials: UpdateProfileCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Non authentifie');
      }
      const userData = await updateProfileService(token, credentials);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour du profil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Fonction de changement de mot de passe
  // @param credentials {UpdatePasswordCredentials} - Current et nouveau mot de passe
  // @action:
  //   1. Active l'indicateur de chargement
  //   2. Efface les erreurs precedentes
  //   3. Verifie qu'un token existe
  //   4. Appelle le service updatePassword (PATCH /auth/password)
  //   5. En cas d'erreur, la stocke et la relance
  const updatePassword = useCallback(async (credentials: UpdatePasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Non authentifie');
      }
      await updatePasswordService(token, credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Fonction pour effacer les erreurs globales
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // ============================================
  // 4. VALEUR DU CONTEXTE
  // ============================================

  // Objet contenant toutes les valeurs et fonctions a fournir aux composants enfants
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


  // ============================================
  // 5. RENDU (RENDER)
  // ============================================

  // Fournit le contexte a tous les composants enfants
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


// ============================================
// CONTEXTE PAR DEFAUT
// ============================================

// Contexte par defaut pour les cas ou le composant n'est pas dans AuthProvider
// (ex: pendant le prerendering, ou si useAuth est appele hors du provider)
// Toutes les fonctions sont des no-op (ne font rien)
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


// ============================================
// HOOK PERSONNALISE
// ============================================

// Hook personnalise pour faciliter l'acces au contexte d'authentification
// @returns {AuthContextType} - Le contexte d'authentification
// @throws {Error} - Si le hook est appele hors d'un AuthProvider (en mode development)
// @note: En production, retourne defaultAuthContext au lieu de lancer une erreur
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return defaultAuthContext;
  }
  return context;
}
