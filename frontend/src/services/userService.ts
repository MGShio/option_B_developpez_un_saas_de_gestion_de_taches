// ============================================
// userService.ts - Service de gestion des utilisateurs
// ============================================
// ROLE: Fournit les fonctions pour interagir avec l'API des utilisateurs
//   - Recuperer la liste de tous les utilisateurs
//   - Rechercher des utilisateurs par nom ou email
//   - Gestion des tokens d'authentification
//
// DEPENDANCES:
// - @/config: fournit API_BASE_URL pour les requetes API
// - @/utils/storage: fournit storage pour la gestion du token

// ============================================
// 1. IMPORTS ET TYPES
// ============================================

import { API_BASE_URL } from '@/config';
import { storage } from '@/utils/storage';

// ============================================
// 2. INTERFACE USER
// ============================================
// @action: Definit la structure d'un utilisateur
//
export interface User {
  id: string;
  name: string;
  email: string;
}

// ============================================
// 3. FONCTION: RECUPERER TOUS LES UTILISATEURS
// ============================================
// @param: token - string - Le token JWT d'authentification
// @returns: Promise<User[]> - Promise avec la liste des utilisateurs
//
// @action:
//   1. Effectue une requete GET vers /users avec le token dans les headers
//   2. Gere les erreurs de reponse avec un message approprie
//   3. Parse et retourne les donnees des utilisateurs
//
export async function getUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message ||
      errorData.error ||
      "Erreur lors de la recuperation des utilisateurs"
    );
  }

  const data = await response.json();
  return data.data.users;
}

// ============================================
// 4. FONCTION: RECUPERER TOUS LES UTILISATEURS (TOKEN AUTO)
// ============================================
// @returns: Promise<User[]> - Promise avec la liste des utilisateurs
//
// @action:
//   1. Recupere le token depuis le stockage (sessionStorage)
//   2. Appelle getUsers avec le token recupere
//
export async function getAllUsers(): Promise<User[]> {
  const token = storage.getToken() || "";
  return getUsers(token);
}

// ============================================
// 5. FONCTION: RECHERCHER DES UTILISATEURS
// ============================================
// @param: token - string - Le token JWT d'authentification
// @param: query - string - Le terme de recherche (nom ou email)
// @returns: Promise<User[]> - Promise avec la liste des utilisateurs correspondants
//
// @action:
//   1. Effectue une requete GET vers /users/search avec le query en parametre
//   2. Gere les erreurs de reponse avec un message approprie
//   3. Parse et retourne les donnees des utilisateurs trouves
//   4. Retourne un tableau vide si aucun utilisateur n'est trouve
//
export async function searchUsers(token: string, query: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message ||
      errorData.error ||
      "Erreur lors de la recherche des utilisateurs"
    );
  }

  const data = await response.json();
  return data.data.users || [];
}
