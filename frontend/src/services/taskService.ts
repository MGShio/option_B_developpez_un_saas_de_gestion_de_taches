const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAssignee {
  id: string;
  userId: string;
  taskId: string;
  user: User;
  assignedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
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

// Backend response types
interface BackendTaskAssignee {
  id: string;
  userId: string;
  taskId: string;
  user?: {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
  };
  assignedAt?: string;
}

interface BackendTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    title?: string;
  };
  dueDate: string;
  status: string;
  priority: string;
  assignees?: BackendTaskAssignee[];
  createdAt: string;
  updatedAt: string;
}

// Function to convert task data from backend format to frontend format
export function formatTaskFromBackend(backendTask: BackendTask): Task {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    projectId: backendTask.projectId,
    project: backendTask.project ? {
      id: backendTask.project.id,
      title: backendTask.project.name || backendTask.project.title || '',
    } : undefined,
    dueDate: backendTask.dueDate,
    status: toFrontendStatus(backendTask.status) as Task['status'],
    priority: toFrontendPriority(backendTask.priority) as Task['priority'],
    assignees: backendTask.assignees?.map((a) => ({
      id: a.id,
      userId: a.userId,
      taskId: a.taskId,
      user: a.user ? {
        id: a.user.id,
        email: a.user.email,
        name: a.user.name,
        createdAt: a.user.createdAt,
        updatedAt: a.user.updatedAt,
      } : { id: '', email: '', name: 'Inconnu', createdAt: '', updatedAt: '' },
      assignedAt: a.assignedAt,
    })) || [],
    createdAt: backendTask.createdAt,
    updatedAt: backendTask.updatedAt,
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
  
  // Remove id if present (backend generates its own)
  delete result.id;
  
  return result;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  project?: ProjectSummary;
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
  projectId: string;
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

// Generic function to extract tasks from backend response
function extractTasksFromResponse(data: any): BackendTask[] {
  // Backend wraps in { success: true, message: '...', data: { tasks: [...] } } or { success: true, message: '...', data: [...] }
  if (data?.data?.tasks) {
    return data.data.tasks;
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

// Generic function to extract single task from backend response
function extractTaskFromResponse(data: any): BackendTask {
  if (data?.data?.task) {
    return data.data.task;
  }
  if (data?.data) {
    return data.data;
  }
  return data;
}

// Récupérer toutes les tâches assignées à l'utilisateur
// GET /dashboard/assigned-tasks
export async function getAssignedTasks(token: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/assigned-tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la récupération des tâches');
  }

  const data = await response.json();
  const backendTasks = extractTasksFromResponse(data);
  return backendTasks.map(formatTaskFromBackend);
}

// Alias for getAssignedTasks
export async function getTasks(token: string): Promise<Task[]> {
  return getAssignedTasks(token);
}

// Récupérer une tâche par ID
// GET /projects/{projectId}/tasks/{taskId}
export async function getTaskById(token: string, projectId: string, taskId: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Tâche non trouvée');
  }

  const data = await response.json();
  const backendTask = extractTaskFromResponse(data);
  return formatTaskFromBackend(backendTask);
}

// Créer une nouvelle tâche
// POST /projects/{projectId}/tasks
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
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la création de la tâche');
  }

  const data = await response.json();
  const backendTask = extractTaskFromResponse(data);
  return formatTaskFromBackend(backendTask);
}

// Mettre à jour une tâche
// PATCH /projects/{projectId}/tasks/{taskId}
export async function updateTask(token: string, projectId: string, taskId: string, taskData: UpdateTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(formatTaskToBackend(taskData)),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la mise à jour de la tâche');
  }

  const data = await response.json();
  const backendTask = extractTaskFromResponse(data);
  return formatTaskFromBackend(backendTask);
}

// Supprimer une tâche
// DELETE /projects/{projectId}/tasks/{taskId}
export async function deleteTask(token: string, projectId: string, taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la suppression de la tâche');
  }
}

// Rechercher des tâches
// GET /dashboard/assigned-tasks/search?q={query}
export async function searchTasks(token: string, query: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/assigned-tasks/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la recherche');
  }

  const data = await response.json();
  const backendTasks = extractTasksFromResponse(data);
  return backendTasks.map(formatTaskFromBackend);
}

// Récupérer les tâches d'un projet
// GET /projects/{projectId}/tasks
export async function getProjectTasks(token: string, projectId: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la récupération des tâches du projet');
  }

  const data = await response.json();
  const backendTasks = extractTasksFromResponse(data);
  return backendTasks.map(formatTaskFromBackend);
}
