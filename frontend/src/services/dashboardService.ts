// ============================================
// dashboardService.ts - Service pour le tableau de bord
// ============================================
// ROLE: Fournit les fonctions pour recuperer les donnees du tableau de bord
//   - Statistiques globales (projets, taches, etc.)
//   - Liste des projets avec compte de taches
//   - Liste des taches assignees
//
// DEPENDANCES:
// - @/config: fournit API_BASE_URL pour les requetes API

// ============================================
// 1. IMPORTS
// ============================================

import { API_BASE_URL } from '@/config';

// ============================================
// 2. INTERFACES
// ============================================

// ============================================
// 2.1. STATISTIQUES DU TABLEAU DE BORD
// ============================================
// @action: Definit la structure des statistiques du tableau de bord

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  assignedTasks: number;
}

// ============================================
// 2.2. PROJET AVEC COMPTE DE TACHES
// ============================================
// @action: Definit la structure d'un projet avec son nombre de taches

export interface ProjectWithTaskCount {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  tasksCount: number;
  completedTasks: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 2.3. RESUME DE TACHE
// ============================================
// @action: Definit la structure d'un resume de tache pour le tableau de bord

export interface TaskSummary {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  status: string;
  dueDate: string;
  priority: string;
}

// ============================================
// 3. FONCTION: RECUPERER LES STATISTIQUES
// ============================================
// @param: token - string - Le token JWT d'authentification
// @returns: Promise<DashboardStats> - Promise avec les statistiques du tableau de bord
//
// @action:
//   1. Effectue une requete GET vers /dashboard/stats
//   2. Gere les erreurs de reponse
//   3. Parse et retourne les statistiques
//
export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la recuperation des statistiques');
  }

  const data = await response.json();
  return data.data?.stats || data.stats || data;
}

// ============================================
// 4. FONCTION: RECUPERER LES PROJETS AVEC COMPTE DE TACHES
// ============================================
// @param: token - string - Le token JWT d'authentification
// @returns: Promise<ProjectWithTaskCount[]> - Promise avec la liste des projets et leurs comptes de taches
//
// @action:
//   1. Effectue une requete GET vers /projects
//   2. Gere les erreurs de reponse
//   3. Transform les projets en ProjectWithTaskCount avec calcul du progress
//
export async function getProjectsWithTaskCounts(token: string): Promise<ProjectWithTaskCount[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la recuperation des projets');
  }

  const data = await response.json();
  const projects: ProjectWithTaskCount[] = [];
  
  if (data?.data?.projects) {
    for (const project of data.data.projects) {
      const tasksCount = project._count?.tasks || project.tasksCount || 0;
      const completedTasks = project.completedTasks || 0;
      projects.push({
        id: project.id,
        name: project.name,
        description: project.description || '',
        ownerId: project.ownerId,
        tasksCount,
        completedTasks,
        progress: tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    }
  }
  
  return projects;
}

// ============================================
// 5. FONCTION: RECUPERER LES TACHES ASSIGNEES
// ============================================
// @param: token - string - Le token JWT d'authentification
// @returns: Promise<TaskSummary[]> - Promise avec la liste des taches assignees
//
// @action:
//   1. Effectue une requete GET vers /dashboard/assigned-tasks
//   2. Gere les erreurs de reponse
//   3. Transform les taches en TaskSummary
//
export async function getAssignedTasksForDashboard(token: string): Promise<TaskSummary[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/assigned-tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la recuperation des taches assignes');
  }

  const data = await response.json();
  const tasks: TaskSummary[] = [];
  
  if (data?.data?.tasks) {
    for (const task of data.data.tasks) {
      tasks.push({
        id: task.id,
        title: task.title,
        projectId: task.projectId,
        projectName: task.project?.name || 'Projet inconnu',
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
      });
    }
  }
  
  return tasks;
}
