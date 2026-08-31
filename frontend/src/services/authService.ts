// ============================================
// authService.ts - Service d'authentification
// ============================================
// ROLE: Fournit les fonctions pour l'authentification et la gestion du profil
//   - Connexion et inscription des utilisateurs
//   - Deconnexion
//   - Mise a jour du profil et du mot de passe
//   - Recuperation de l'utilisateur courant
//
// DEPENDANCES:
// - @/config: fournit API_BASE_URL pour les requetes API

// ============================================
// 1. IMPORTS
// ============================================

import { API_BASE_URL } from '@/config';

// ============================================
// 2. INTERFACES BACKEND
// ============================================

// ============================================
// 2.1. UTILISATEUR BACKEND
// ============================================
// @action: Definit la structure d'un utilisateur retourne par le backend

interface BackendUser {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// 2.2. REPONSE D'AUTHENTIFICATION BACKEND
// ============================================
// @action: Definit la structure de la reponse d'authentification du backend

interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    token: string;
  };
}

// ============================================
// 2.3. REPONSE DE PROFIL BACKEND
// ============================================
// @action: Definit la structure de la reponse de profil du backend

interface BackendProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
  };
}

// ============================================
// 3. FONCTIONS UTILITAIRES
// ============================================

// ============================================
// 3.1. FORMATER L'UTILISATEUR DEPUIS LE BACKEND
// ============================================
// @param: backendUser - BackendUser - L'utilisateur recu du backend
// @returns: { id: string; email: string; name: string } - L'utilisateur formate
//
// @action: Transform un BackendUser en objet utilisateur frontend

function formatUserFromBackend(backendUser: BackendUser): { id: string; email: string; name: string } {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name || 'Utilisateur',
  };
}

// ============================================
// 4. INTERFACES FRONTEND
// ============================================

// ============================================
// 4.1. CREDENTIALS DE CONNEXION
// ============================================
// @action: Definit les credentials necessaires pour la connexion

export interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================
// 4.2. CREDENTIALS D'INSCRIPTION
// ============================================
// @action: Definit les credentials necessaires pour l'inscription (extends LoginCredentials)

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// ============================================
// 4.3. REPONSE D'AUTHENTIFICATION FRONTEND
// ============================================
// @action: Definit la structure de la reponse d'authentification pour le frontend

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// ============================================
// 4.4. ERREUR API
// ============================================
// @action: Definit la structure d'une erreur API

export interface ApiError {
  message: string;
  statusCode: number;
}

// ============================================
// 5. FONCTION: CONNEXION
// ============================================
// @param: credentials - LoginCredentials - Les credentials de connexion
// @returns: Promise<AuthResponse> - Promise avec le token et l'utilisateur
//
// @action:
//   1. Effectue une requete POST vers /auth/login avec les credentials
//   2. Gere les erreurs de reponse
//   3. Formate et retourne la reponse avec le token et l'utilisateur
//
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Identifiants invalides');
  }

  const data: BackendAuthResponse = await response.json();
  return {
    token: data.data.token,
    user: formatUserFromBackend(data.data.user),
  };
}

// ============================================
// 6. FONCTION: INSCRIPTION
// ============================================
// @param: credentials - RegisterCredentials - Les credentials d'inscription
// @returns: Promise<AuthResponse> - Promise avec le token et l'utilisateur
//
// @action:
//   1. Effectue une requete POST vers /auth/register avec les credentials
//   2. Gere les erreurs de reponse
//   3. Formate et retourne la reponse avec le token et l'utilisateur
//
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || "Erreur lors de l'inscription");
  }

  const data: BackendAuthResponse = await response.json();
  return {
    token: data.data.token,
    user: formatUserFromBackend(data.data.user),
  };
}

// ============================================
// 7. FONCTION: DECONNEXION
// ============================================
// @returns: Promise<void>
//
// @action: Effectue une requete POST vers /auth/logout pour deconnecter l'utilisateur

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

// ============================================
// 8. FONCTION: METTRE A JOUR LE PROFIL
// ============================================

// ============================================
// 8.1. CREDENTIALS DE MISE A JOUR DU PROFIL
// ============================================
// @action: Definit les credentials pour la mise a jour du profil

export interface UpdateProfileCredentials {
  name?: string;
  email?: string;
}

// ============================================
// 8.2. FONCTION DE MISE A JOUR
// ============================================
// @param: token - string - Le token JWT d'authentification
// @param: credentials - UpdateProfileCredentials - Les donnees a mettre a jour
// @returns: Promise<{ id: string; email: string; name: string }> - Promise avec l'utilisateur mis a jour
//
// @action:
//   1. Effectue une requete PUT vers /auth/profile avec les credentials
//   2. Gere les erreurs de reponse
//   3. Formate et retourne l'utilisateur mis a jour
//
export async function updateProfile(token: string, credentials: UpdateProfileCredentials): Promise<{ id: string; email: string; name: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la mise a jour du profil');
  }

  const data: BackendProfileResponse = await response.json();
  return formatUserFromBackend(data.data.user);
}

// ============================================
// 9. FONCTION: METTRE A JOUR LE MOT DE PASSE
// ============================================

// ============================================
// 9.1. CREDENTIALS DE MISE A JOUR DU MOT DE PASSE
// ============================================
// @action: Definit les credentials pour le changement de mot de passe

export interface UpdatePasswordCredentials {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// 9.2. FONCTION DE MISE A JOUR
// ============================================
// @param: token - string - Le token JWT d'authentification
// @param: credentials - UpdatePasswordCredentials - Les anciens et nouveaux mots de passe
// @returns: Promise<void>
//
// @action:
//   1. Effectue une requete PUT vers /auth/password avec les credentials
//   2. Gere les erreurs de reponse
//
export async function updatePassword(token: string, credentials: UpdatePasswordCredentials): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors du changement de mot de passe');
  }
}

// ============================================
// 10. FONCTION: RECUPERER L'UTILISATEUR COURANT
// ============================================
// @param: token - string - Le token JWT d'authentification
// @returns: Promise<{ id: string; email: string; name: string }> - Promise avec l'utilisateur courant
//
// @action:
//   1. Effectue une requete GET vers /auth/profile
//   2. Gere les erreurs de reponse
//   3. Formate et retourne l'utilisateur
//
export async function getCurrentUser(token: string): Promise<{ id: string; email: string; name: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Token invalide');
  }

  const data: BackendProfileResponse = await response.json();
  return formatUserFromBackend(data.data.user);
}
