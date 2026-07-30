const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: number;
  userId: number;
  taskId: number;
  user: User;
  assignedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  authorId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}

// Mapping des statuts et priorités entre frontend (FR) et backend (EN)
const STATUS_MAP: Record<string, string> = {
  'À faire': 'TODO',
  'En cours': 'IN_PROGRESS',
  'Terminé': 'DONE',
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
  CANCELLED: 'Annulé',
};

const PRIORITY_MAP: Record<string, string> = {
  'Faible': 'LOW',
  'Moyenne': 'MEDIUM',
  'Haute': 'HIGH',
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

// Fonctions de conversion pour l'envoi au backend
export function toBackendStatus(status: string): string {
  return STATUS_MAP[status] || status;
}

export function toBackendPriority(priority: string): string {
  return PRIORITY_MAP[priority] || priority;
}

// Fonctions de conversion pour l'affichage frontend
export function toFrontendStatus(status: string): string {
  return STATUS_MAP[status] || status;
}

export function toFrontendPriority(priority: string): string {
  return PRIORITY_MAP[priority] || priority;
}

// Function to convert task data from backend format to frontend format
export function formatTaskFromBackend(backendTask: any): Task {
  return {
    ...backendTask,
    id: parseInt(backendTask.id) || backendTask.id,
    projectId: parseInt(backendTask.projectId) || backendTask.projectId,
    status: toFrontendStatus(backendTask.status) as Task['status'],
    priority: toFrontendPriority(backendTask.priority) as Task['priority'],
    // Convert assignees if needed
    assignees: backendTask.assignees || [],
    project: backendTask.project ? {
      id: parseInt(backendTask.project.id) || backendTask.project.id,
      title: backendTask.project.name || backendTask.project.title,
    } : undefined,
  };
}

// Function to convert task data from frontend format to backend format
export function formatTaskToBackend(frontendTask: Partial<CreateTaskData>): any {
  const result: any = { ...frontendTask };
  
  if (result.status) {
    result.status = toBackendStatus(result.status);
  }
  
  if (result.priority) {
    result.priority = toBackendPriority(result.priority);
  }
  
  // Remove id from create/update data (backend uses different ID format)
  delete result.id;
  
  return result;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  project?: { id: number; title: string };
  dueDate: string;
  status: 'À faire' | 'En cours' | 'Terminé';
  priority: 'Faible' | 'Moyenne' | 'Haute';
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  dueDate: string;
  priority: 'Faible' | 'Moyenne' | 'Haute';
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: 'À faire' | 'En cours' | 'Terminé';
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// Récupérer toutes les tâches de l'utilisateur
// Uses dashboard endpoint for assigned tasks
export async function getTasks(token: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/assigned-tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération des tâches');
  }

  const data = await response.json();
  // Map tasks from backend format to frontend format
  const tasks = (data.data?.tasks || data.tasks || []).map(formatTaskFromBackend);
  return tasks;
}

// Récupérer les tâches assignées à l'utilisateur
// Same as getTasks - uses dashboard endpoint
export async function getAssignedTasks(token: string): Promise<Task[]> {
  return getTasks(token);
}

// Récupérer une tâche par ID
// Tasks are nested under projects: /projects/{projectId}/tasks/{taskId}
export async function getTaskById(token: string, projectId: number, taskId: number): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Tâche non trouvée');
  }

  const data = await response.json();
  return formatTaskFromBackend(data.data || data);
}

// Créer une nouvelle tâche
export async function createTask(token: string, taskData: CreateTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/projects/${taskData.projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(formatTaskToBackend(taskData)),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la création de la tâche');
  }

  const data = await response.json();
  return formatTaskFromBackend(data.data || data);
}

// Mettre à jour une tâche
export async function updateTask(token: string, projectId: number, taskId: number, taskData: UpdateTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(formatTaskToBackend(taskData)),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la mise à jour de la tâche');
  }

  const data = await response.json();
  return formatTaskFromBackend(data.data || data);
}

// Supprimer une tâche
export async function deleteTask(token: string, projectId: number, taskId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la suppression de la tâche');
  }
}

// Rechercher des tâches
export async function searchTasks(token: string, query: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/assigned-tasks/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la recherche');
  }

  const data = await response.json();
  return (data.data?.tasks || data.tasks || []).map(formatTaskFromBackend);
}

// Récupérer les tâches d'un projet
export async function getProjectTasks(token: string, projectId: number): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération des tâches du projet');
  }

  const data = await response.json();
  return (data.data || data || []).map(formatTaskFromBackend);
}
