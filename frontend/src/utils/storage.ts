// ============================================
// storage.ts - Utility de stockage securise
// ============================================
// ROLE: Fournit des utilitaires pour le stockage securise des donnees
//   - Gestion du token JWT dans sessionStorage
//   - Gestion des donnees utilisateur dans sessionStorage
//   - Validation du format des tokens
//   - Support alternatif des cookies
//
// DEPENDANCES:
// - @/config: fournit STORAGE_KEYS pour les cles de stockage

// ============================================
// 1. IMPORTS
// ============================================

import { STORAGE_KEYS } from '@/config';

// ============================================
// 2. OBJET STORAGE PRINCIPAL
// ============================================
// @action: Fournit des methodes pour gerer le stockage des donnees
//   - Utilise sessionStorage (plus securise que localStorage)
//   - Les donnees sont supprimees a la fermeture de l'onglet
//
// NOTE: Pour une securite optimale, les tokens devraient etre stockes
//       dans des cookies httpOnly cote backend.

export const storage = {
  // ============================================
  // 2.1. RECUPERER LE TOKEN
  // ============================================
  // @action: Recupere le token d'authentification depuis sessionStorage
  // @returns: string | null - Le token ou null s'il n'existe pas
  
  getToken: (): string | null => {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.token);
      return token || null;
    } catch (error) {
      return null;
    }
  },

  // ============================================
  // 2.2. STOCKER LE TOKEN
  // ============================================
  // @param: token - string - Le token JWT a stocker
  // @action: Stocke le token dans sessionStorage
  // @throws: Error si le token est invalide
  
  setToken: (token: string): void => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Token invalide');
      }
      sessionStorage.setItem(STORAGE_KEYS.token, token);
    } catch (error) {
      // Silently fail - s'il y a une erreur, on ne stocke pas
    }
  },

  // ============================================
  // 2.3. SUPPRIMER LE TOKEN
  // ============================================
  // @action: Supprime le token de sessionStorage
  
  removeToken: (): void => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.token);
    } catch (error) {
      // Silently fail
    }
  },

  // ============================================
  // 2.4. STOCKER L'UTILISATEUR
  // ============================================
  // @param: user - object - Les donnees de l'utilisateur a stocker
  // @action: Stocke les donnees utilisateur dans sessionStorage
  
  setUser: (user: object): void => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } catch (error) {
      // Silently fail
    }
  },

  // ============================================
  // 2.5. RECUPERER L'UTILISATEUR
  // ============================================
  // @returns: T | null - Les donnees de l'utilisateur parsees ou null
  // @action: Recupere et parse les donnees utilisateur depuis sessionStorage
  
  getUser: <T = any>(): T | null => {
    try {
      const user = sessionStorage.getItem(STORAGE_KEYS.user);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // ============================================
  // 2.6. SUPPRIMER L'UTILISATEUR
  // ============================================
  // @action: Supprime les donnees utilisateur de sessionStorage
  
  removeUser: (): void => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.user);
    } catch (error) {
      // Silently fail
    }
  },

  // ============================================
  // 2.7. EFFACER TOUTES LES DONNEES
  // ============================================
  // @action: Efface toutes les donnees de sessionStorage
  
  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      // Silently fail
    }
  },

  // ============================================
  // 2.8. VERIFIER L'AUTHENTIFICATION
  // ============================================
  // @returns: boolean - true si un token existe, false sinon
  // @action: Verifie si l'utilisateur est authentifie (token present)
  
  isAuthenticated: (): boolean => {
    return !!storage.getToken();
  },
};

// ============================================
// 3. FONCTIONS DE GESTION DES COOKIES (ALTERNATIVE)
// ============================================
// @action: Fournit des methodes pour gerer les tokens via cookies
//   - Utilise comme alternative si le backend utilise des cookies httpOnly

// ============================================
// 3.1. RECUPERER LE TOKEN DEPUIS LES COOKIES
// ============================================
// @returns: string | null - Le token ou null s'il n'existe pas
// @action: Parse les cookies du document pour extraire le token

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

// ============================================
// 3.2. SUPPRIMER LE TOKEN COOKIE
// ============================================
// @action: Supprime le token cookie en leant un cookie expire dans le passe

export const removeTokenFromCookie = (): void => {
  try {
    document.cookie = `${STORAGE_KEYS.token}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  } catch (error) {
    // Silently fail
  }
};

// ============================================
// 4. VALIDATION DU TOKEN
// ============================================

// ============================================
// 4.1. VALIDER LE FORMAT DU TOKEN
// ============================================
// @param: token - string | null - Le token a valider
// @returns: boolean - true si le format est valide, false sinon
// @action: Verifie qu'un token a le format JWT valide (3 parties separees par des points)

export const isValidTokenFormat = (token: string | null): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  // Un token JWT a 3 parties separees par des points
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};
