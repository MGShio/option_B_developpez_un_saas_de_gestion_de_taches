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

  return response.json();
}

// Récupérer les tâches assignées à l'utilisateur
// Same as getTasks - uses dashboard endpoint
export async function getAssignedTasks(token: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/assigned-tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération des tâches assignées');
  }

  return response.json();
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

  return response.json();
}

// Créer une nouvelle tâche
export async function createTask(token: string, taskData: CreateTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/projects/${taskData.projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la création de la tâche');
  }

  return response.json();
}

// Mettre à jour une tâche
export async function updateTask(token: string, projectId: number, taskId: number, taskData: UpdateTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la mise à jour de la tâche');
  }

  return response.json();
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

  return response.json();
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

  return response.json();
}
