// dashboardService.ts - Service

import { API_BASE_URL } from '../config';

// Dashboard statistics types


export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  assignedTasks: number;
}



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



export interface TaskSummary {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  status: string;
  dueDate: string;
  priority: string;
}

/**
 * Get dashboard statistics
 * GET /dashboard/stats
 */

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la récupération des statistiques');
  }

  const data = await response.json();
  return data.data?.stats || data.stats || data;
}

/**
 * Get projects with task counts for dashboard
 * GET /projects
 */

export async function getProjectsWithTaskCounts(token: string): Promise<ProjectWithTaskCount[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la récupération des projets');
  }

  const data = await response.json();
  const projects: ProjectWithTaskCount[] = [];
  
  if (data?.data?.projects) {
    for (const project of data.data.projects) {
      const tasksCount = project.tasksCount || 0;
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

/**
 * Get assigned tasks for dashboard
 * GET /dashboard/assigned-tasks
 */

export async function getAssignedTasksForDashboard(token: string): Promise<TaskSummary[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/assigned-tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la récupération des tâches assignées');
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
