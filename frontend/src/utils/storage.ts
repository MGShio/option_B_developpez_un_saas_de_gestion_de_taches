// storage.ts - Utility
// Gestion sécurisée du stockage des données sensibles

import { STORAGE_KEYS } from '@/config';

/**
 * Utilitaire de stockage sécurisé
 * Note: Pour une sécurité optimale, les tokens devraient être stockés
 * dans des cookies httpOnly côté backend. Cette implémentation utilise
 * sessionStorage qui est plus sécurisé que localStorage (les données
 * sont supprimées lorsque l'onglet est fermé).
 */
export const storage = {
  /**
   * Récupère le token d'authentification
   * @returns Le token ou null s'il n'existe pas
   */
  getToken: (): string | null => {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.token);
      return token || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Stocke le token d'authentification
   * @param token - Le token JWT à stocker
   */
  setToken: (token: string): void => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Token invalide');
      }
      sessionStorage.setItem(STORAGE_KEYS.token, token);
    } catch (error) {
    }
  },

  /**
   * Supprime le token d'authentification
   */
  removeToken: (): void => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.token);
    } catch (error) {
    }
  },

  /**
   * Stocke l'utilisateur authentifié
   * @param user - Les données de l'utilisateur
   */
  setUser: (user: object): void => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } catch (error) {
    }
  },

  /**
   * Récupère l'utilisateur authentifié
   * @returns Les données de l'utilisateur ou null
   */
  getUser: <T = any>(): T | null => {
    try {
      const user = sessionStorage.getItem(STORAGE_KEYS.user);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Supprime l'utilisateur stocké
   */
  removeUser: (): void => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.user);
    } catch (error) {
    }
  },

  /**
   * Efface toutes les données de session
   */
  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
    }
  },

  /**
   * Vérifie si l'utilisateur est authentifié (token présent)
   * @returns true si authentifié, false sinon
   */
  isAuthenticated: (): boolean => {
    return !!storage.getToken();
  },
};

/**
 * Récupère le token depuis les cookies (alternative si le backend utilise httpOnly cookies)
 * @returns Le token ou null s'il n'existe pas
 */
export const getTokenFromCookie = (): string | null => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${STORAGE_KEYS.token}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Supprime le token cookie (si le backend utilise des cookies)
 */
export const removeTokenFromCookie = (): void => {
  try {
    document.cookie = `${STORAGE_KEYS.token}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  } catch (error) {
  }
};

/**
 * Valide qu'un token a un format JWT valide
 * @param token - Le token à valider
 * @returns true si le format est valide, false sinon
 */
export const isValidTokenFormat = (token: string | null): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  // Un token JWT a 3 parties séparées par des points
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};
