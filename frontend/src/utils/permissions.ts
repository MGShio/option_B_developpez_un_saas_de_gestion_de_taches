// ============================================
// permissions.ts - Utility de gestion des permissions
// ============================================
// ROLE: Fournit des fonctions pour verifier les droits des utilisateurs
//   - Verification du role de l'utilisateur sur un projet
//   - Verification des permissions pour differentes actions
//   - Formatage des roles pour l'affichage
//
// DEPENDANCES:
// - @/services/projectService: fournit le type Project
// - @/contexts/AuthContext: fournit le type User

// ============================================
// 1. IMPORTS
// ============================================

import type { Project } from '@/services/projectService';
import type { User } from '@/contexts/AuthContext';

// ============================================
// 2. TYPES
// ============================================

// ============================================
// 2.1. ROLES POSSIBLES DANS UN PROJET
// ============================================
// @action: Definit les roles possibles pour un utilisateur dans un projet

export type ProjectRole = 'ADMIN' | 'CONTRIBUTOR' | null;

// ============================================
// 3. FONCTIONS DE VERIFICATION DE PROPRIETE
// ============================================

// ============================================
// 3.1. EST PROPRIETAIRE DU PROJET
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur est le proprietaire
//
// @action:
//   1. Verifie que user et project existent
//   2. Compare l'ID de l'utilisateur avec ownerId ou owner.id du projet

export const isProjectOwner = (user: User | null, project: Project | null): boolean => {
  if (!user || !project) return false;
  return user.id === project.ownerId || user.id === project.owner?.id;
};

// ============================================
// 4. FONCTIONS DE VERIFICATION DE ROLE ADMIN
// ============================================

// ============================================
// 4.1. EST ADMINISTRATEUR DU PROJET
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur est admin (proprietaire ou role ADMIN)
//
// @action:
//   1. Verifie que user et project existent
//   2. Le proprietaire est toujours admin
//   3. Verifie si l'utilisateur a le role ADMIN dans les membres

export const isProjectAdmin = (user: User | null, project: Project | null): boolean => {
  if (!user || !project) return false;
  
  // Le proprietaire est toujours admin
  if (isProjectOwner(user, project)) return true;
  
  // Verifier si l'utilisateur a le role ADMIN dans les membres
  return project.userRole === 'ADMIN' || 
         project.members?.some(m => m.user.id === user.id && m.role === 'ADMIN') || 
         false;
};

// ============================================
// 5. FONCTIONS DE VERIFICATION D'ACCES
// ============================================

// ============================================
// 5.1. A ACCES AU PROJET
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur a acces au projet
//
// @action:
//   1. Verifie que user et project existent
//   2. Verifie si l'utilisateur est proprietaire ou membre du projet

export const hasProjectAccess = (user: User | null, project: Project | null): boolean => {
  if (!user || !project) return false;
  return isProjectOwner(user, project) || 
         project.members?.some(m => m.user.id === user.id) || 
         false;
};

// ============================================
// 6. FONCTIONS DE VERIFICATION DE PERMISSIONS SUR LE PROJET
// ============================================

// ============================================
// 6.1. PEUT MODIFIER LE PROJET
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur peut modifier le projet
//
// @action: Seuls les administrateurs peuvent modifier un projet

export const canModifyProject = (user: User | null, project: Project | null): boolean => {
  return isProjectAdmin(user, project);
};

// ============================================
// 6.2. PEUT SUPPRIMER LE PROJET
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur peut supprimer le projet
//
// @action: Seul le proprietaire peut supprimer un projet

export const canDeleteProject = (user: User | null, project: Project | null): boolean => {
  return isProjectOwner(user, project);
};

// ============================================
// 6.3. PEUT CREER DES TACHES
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur peut creer des taches
//
// @action: Tous les membres peuvent creer des taches

export const canCreateTasks = (user: User | null, project: Project | null): boolean => {
  return hasProjectAccess(user, project);
};

// ============================================
// 6.4. PEUT MODIFIER DES TACHES
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur peut modifier des taches
//
// @action: Tous les membres peuvent modifier leurs propres taches ou celles du projet

export const canModifyTasks = (user: User | null, project: Project | null): boolean => {
  return hasProjectAccess(user, project);
};

// ============================================
// 6.5. PEUT GERER LES CONTRIBUTEURS
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet a verifier
// @returns: boolean - true si l'utilisateur peut gerer les contributeurs
//
// @action: Seuls les administrateurs peuvent gerer les contributeurs

export const canManageContributors = (user: User | null, project: Project | null): boolean => {
  return isProjectAdmin(user, project);
};

// ============================================
// 7. FONCTIONS DE VERIFICATION DE PERMISSIONS SUR LES TACHES
// ============================================

// ============================================
// 7.1. PEUT MODIFIER UNE TACHE SPECIFIQUE
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet contenant la tache
// @param: taskCreatorId - string | undefined - L'ID du createur de la tache
// @returns: boolean - true si l'utilisateur peut modifier la tache
//
// @action:
//   1. Verifie que user et project existent
//   2. Si l'utilisateur est admin ou proprietaire, il peut modifier n'importe quelle tache
//   3. Sinon, verifie si l'utilisateur est le createur de la tache
//   4. Sinon, verifie si l'utilisateur a acces au projet

export const canModifyTask = (user: User | null, project: Project | null, taskCreatorId?: string): boolean => {
  if (!user || !project) return false;
  
  // Si l'utilisateur est admin ou proprietaire du projet, il peut modifier n'importe quelle tache
  if (isProjectAdmin(user, project)) return true;
  
  // Sinon, verifier si l'utilisateur est le createur de la tache
  if (taskCreatorId && user.id === taskCreatorId) return true;
  
  // Sinon, verifier si l'utilisateur a acces au projet
  return hasProjectAccess(user, project);
};

// ============================================
// 7.2. PEUT SUPPRIMER UNE TACHE SPECIFIQUE
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet contenant la tache
// @param: taskCreatorId - string | undefined - L'ID du createur de la tache
// @returns: boolean - true si l'utilisateur peut supprimer la tache
//
// @action:
//   1. Verifie que user et project existent
//   2. Si l'utilisateur est admin ou proprietaire, il peut supprimer n'importe quelle tache
//   3. Sinon, verifie si l'utilisateur est le createur de la tache
//
export const canDeleteTask = (user: User | null, project: Project | null, taskCreatorId?: string): boolean => {
  if (!user || !project) return false;
  
  // Si l'utilisateur est admin ou proprietaire du projet, il peut supprimer n'importe quelle tache
  if (isProjectAdmin(user, project)) return true;
  
  // Sinon, verifier si l'utilisateur est le createur de la tache
  if (taskCreatorId && user.id === taskCreatorId) return true;
  
  return false;
};

// ============================================
// 8. FONCTIONS DE FORMATAGE
// ============================================

// ============================================
// 8.1. OBTENIR LE LIBELLE DU ROLE
// ============================================
// @param: user - User | null - L'utilisateur connecte
// @param: project - Project | null - Le projet
// @returns: string - Le role formate (Proprietaire, Administrateur, Contributeur, Inconnu)
//
// @action:
//   1. Verifie que user et project existent
//   2. Si proprietaire, retourne 'Proprietaire'
//   3. Sinon, retourne le role de l'utilisateur ou 'Inconnu'

export const getUserRoleLabel = (user: User | null, project: Project | null): string => {
  if (!user || !project) return 'Inconnu';
  
  if (isProjectOwner(user, project)) return 'Proprietaire';
  
  if (project.userRole === 'ADMIN') return 'Administrateur';
  if (project.userRole === 'CONTRIBUTOR') return 'Contributeur';
  
  // Verifier dans les membres
  const member = project.members?.find(m => m.user.id === user.id);
  if (member) {
    return member.role === 'ADMIN' ? 'Administrateur' : 'Contributeur';
  }
  
  return 'Inconnu';
};
