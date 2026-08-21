// userService.ts - Service pour la gestion des utilisateurs

import { API_BASE_URL } from '../config';
import { storage } from '../utils/storage';


export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Rechercher des utilisateurs par nom ou email
 * @param query - Terme de recherche (minimum 2 caractères)
 * @param limit - Nombre maximum de résultats (défaut: 10)
 * @returns Promise avec la liste des utilisateurs correspondants
 */
export async function searchUsers(query: string = '', limit: number = 10): Promise<User[]> {
  const token = storage.getToken();
  
  if (!token) {
    throw new Error('Non authentifié');
  }

  const url = new URL(`${API_BASE_URL}/users/search`);
  url.searchParams.append('query', query);
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Erreur lors de la recherche d\'utilisateurs');
  }

  const data = await response.json();
  return data.data?.users || [];
}

/**
 * Récupérer tous les utilisateurs (pour les dropdowns)
 * @returns Promise avec la liste de tous les utilisateurs
 */
export async function getAllUsers(): Promise<User[]> {
  return searchUsers('', 100); // Recherche vide = tous les utilisateurs
}

/**
 * Récupérer un utilisateur par ID
 * @param userId - ID de l'utilisateur
 * @returns Promise avec l'utilisateur
 */
export async function getUserById(userId: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(u => u.id === userId) || null;
}
