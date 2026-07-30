const API_BASE_URL = 'http://localhost:8000/api';

export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  owner?: { id: number; name: string; email: string };
  status: 'En cours' | 'Terminé' | 'En attente';
  createdAt: string;
  updatedAt: string;
  tasksCount?: number;
  membersCount?: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: 'En cours' | 'Terminé' | 'En attente';
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// Récupérer tous les projets de l'utilisateur
export async function getProjects(token: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération des projets');
  }

  return response.json();
}

// Récupérer un projet par ID
export async function getProjectById(token: string, projectId: number): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Projet non trouvé');
  }

  return response.json();
}

// Créer un nouveau projet
export async function createProject(token: string, projectData: CreateProjectData): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la création du projet');
  }

  return response.json();
}

// Mettre à jour un projet
export async function updateProject(token: string, projectId: number, projectData: UpdateProjectData): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la mise à jour du projet');
  }

  return response.json();
}

// Supprimer un projet
export async function deleteProject(token: string, projectId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la suppression du projet');
  }
}

// Rechercher des projets
export async function searchProjects(token: string, query: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects/search?q=${encodeURIComponent(query)}`, {
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
export async function getProjectTasks(token: string, projectId: number): Promise<import('./taskService').Task[]> {
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
