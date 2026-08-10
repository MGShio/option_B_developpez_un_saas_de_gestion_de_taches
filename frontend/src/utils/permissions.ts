/**
 * Utilitaires de permissions pour le frontend
 * Ces fonctions permettent de vérifier les droits d'un utilisateur sur un projet
 * en fonction de son rôle (ADMIN, CONTRIBUTOR) et de son statut de propriétaire.
 */

import type { Project } from '../services/projectService';
import type { User } from '../contexts/AuthContext';

/**
 * Rôles possibles dans un projet
 */
export type ProjectRole = 'ADMIN' | 'CONTRIBUTOR' | null;

/**
 * Vérifie si l'utilisateur est le propriétaire du projet
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur est le propriétaire
 */
export const isProjectOwner = (user: User | null, project: Project | null): boolean => {
  if (!user || !project) return false;
  return user.id === project.ownerId || user.id === project.owner?.id;
};

/**
 * Vérifie si l'utilisateur a un rôle d'administrateur dans le projet
 * (propriétaire ou rôle ADMIN explicite)
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur est admin (propriétaire ou rôle ADMIN)
 */
export const isProjectAdmin = (user: User | null, project: Project | null): boolean => {
  if (!user || !project) return false;
  
  // Le propriétaire est toujours admin
  if (isProjectOwner(user, project)) return true;
  
  // Vérifier si l'utilisateur a le rôle ADMIN dans les membres
  return project.userRole === 'ADMIN' || 
         project.members?.some(m => m.user.id === user.id && m.role === 'ADMIN') || 
         false;
};

/**
 * Vérifie si l'utilisateur a accès au projet (propriétaire ou membre)
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur a accès au projet
 */
export const hasProjectAccess = (user: User | null, project: Project | null): boolean => {
  if (!user || !project) return false;
  return isProjectOwner(user, project) || 
         project.members?.some(m => m.user.id === user.id) || 
         false;
};

/**
 * Vérifie si l'utilisateur peut modifier un projet
 * (Seuls les administrateurs peuvent modifier un projet)
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur peut modifier le projet
 */
export const canModifyProject = (user: User | null, project: Project | null): boolean => {
  return isProjectAdmin(user, project);
};

/**
 * Vérifie si l'utilisateur peut supprimer un projet
 * (Seul le propriétaire peut supprimer un projet)
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur peut supprimer le projet
 */
export const canDeleteProject = (user: User | null, project: Project | null): boolean => {
  return isProjectOwner(user, project);
};

/**
 * Vérifie si l'utilisateur peut créer des tâches dans un projet
 * (Tous les membres peuvent créer des tâches)
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur peut créer des tâches
 */
export const canCreateTasks = (user: User | null, project: Project | null): boolean => {
  return hasProjectAccess(user, project);
};

/**
 * Vérifie si l'utilisateur peut modifier/supprimer des tâches dans un projet
 * (Tous les membres peuvent modifier leurs propres tâches ou celles du projet)
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur peut modifier des tâches
 */
export const canModifyTasks = (user: User | null, project: Project | null): boolean => {
  return hasProjectAccess(user, project);
};

/**
 * Vérifie si l'utilisateur peut gérer les contributeurs d'un projet
 * (Seuls les administrateurs peuvent gérer les contributeurs)
 * @param user - L'utilisateur connecté
 * @param project - Le projet à vérifier
 * @returns true si l'utilisateur peut gérer les contributeurs
 */
export const canManageContributors = (user: User | null, project: Project | null): boolean => {
  return isProjectAdmin(user, project);
};

/**
 * Vérifie si l'utilisateur peut modifier une tâche spécifique
 * (Le créateur de la tâche ou un membre du projet peut la modifier)
 * @param user - L'utilisateur connecté
 * @param project - Le projet contenant la tâche
 * @param taskCreatorId - L'ID du créateur de la tâche
 * @returns true si l'utilisateur peut modifier la tâche
 */
export const canModifyTask = (user: User | null, project: Project | null, taskCreatorId?: string): boolean => {
  if (!user || !project) return false;
  
  // Si l'utilisateur est admin ou propriétaire du projet, il peut modifier n'importe quelle tâche
  if (isProjectAdmin(user, project)) return true;
  
  // Sinon, vérifier si l'utilisateur est le créateur de la tâche
  if (taskCreatorId && user.id === taskCreatorId) return true;
  
  // Sinon, vérifier si l'utilisateur a accès au projet
  return hasProjectAccess(user, project);
};

/**
 * Vérifie si l'utilisateur peut supprimer une tâche spécifique
 * (Seul le créateur ou un admin peut supprimer une tâche)
 * @param user - L'utilisateur connecté
 * @param project - Le projet contenant la tâche
 * @param taskCreatorId - L'ID du créateur de la tâche
 * @returns true si l'utilisateur peut supprimer la tâche
 */
export const canDeleteTask = (user: User | null, project: Project | null, taskCreatorId?: string): boolean => {
  if (!user || !project) return false;
  
  // Si l'utilisateur est admin ou propriétaire du projet, il peut supprimer n'importe quelle tâche
  if (isProjectAdmin(user, project)) return true;
  
  // Sinon, vérifier si l'utilisateur est le créateur de la tâche
  if (taskCreatorId && user.id === taskCreatorId) return true;
  
  return false;
};

/**
 * Obtient le rôle de l'utilisateur dans un projet sous forme de libellé lisible
 * @param user - L'utilisateur connecté
 * @param project - Le projet
 * @returns Le rôle formaté (Propriétaire, Administrateur, Contributeur)
 */
export const getUserRoleLabel = (user: User | null, project: Project | null): string => {
  if (!user || !project) return 'Inconnu';
  
  if (isProjectOwner(user, project)) return 'Propriétaire';
  
  if (project.userRole === 'ADMIN') return 'Administrateur';
  if (project.userRole === 'CONTRIBUTOR') return 'Contributeur';
  
  // Vérifier dans les membres
  const member = project.members?.find(m => m.user.id === user.id);
  if (member) {
    return member.role === 'ADMIN' ? 'Administrateur' : 'Contributeur';
  }
  
  return 'Inconnu';
};
