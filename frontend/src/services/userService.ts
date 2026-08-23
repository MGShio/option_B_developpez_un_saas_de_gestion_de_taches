// userService.ts - Service pour la gestion des utilisateurs

import { API_BASE_URL } from '@/config';
import { storage } from '@/utils/storage';

export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Récupérer la liste de tous les utilisateurs
 * @param token - Le token JWT d'authentification
 * @returns Promise avec la liste des utilisateurs
 */
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
      "Erreur lors de la récupération des utilisateurs"
    );
  }

  const data = await response.json();
  return data.data.users;
}

/**
 * Récupérer la liste de tous les utilisateurs (avec token automatique)
 * @returns Promise avec la liste des utilisateurs
 */
export async function getAllUsers(): Promise<User[]> {
  const token = storage.getToken() || "";
  return getUsers(token);
}

/**
 * Rechercher des utilisateurs par nom ou email
 * @param token - Le token JWT d'authentification
 * @param query - Le terme de recherche
 * @returns Promise avec la liste des utilisateurs correspondants
 */
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
