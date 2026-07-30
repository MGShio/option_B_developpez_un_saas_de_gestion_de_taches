const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: number;
  role: string;
  user: User;
  joinedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  owner?: User;
  members?: ProjectMember[];
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
  // No status field - Project doesn't have status in backend
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

  const data = await response.json();
  // Format projects from backend
  const projects = (data.data || data || []).map((p: any) => ({
    ...p,
    id: parseInt(p.id) || p.id,
    ownerId: parseInt(p.ownerId) || p.ownerId,
    owner: p.owner ? {
      id: parseInt(p.owner.id) || p.owner.id,
      email: p.owner.email,
      name: p.owner.name,
      createdAt: p.owner.createdAt,
      updatedAt: p.owner.updatedAt,
    } : undefined,
    members: p.members || [],
  }));
  return projects;
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

  const data = await response.json();
  const p = data.data || data;
  return {
    ...p,
    id: parseInt(p.id) || p.id,
    ownerId: parseInt(p.ownerId) || p.ownerId,
    owner: p.owner ? {
      id: parseInt(p.owner.id) || p.owner.id,
      email: p.owner.email,
      name: p.owner.name,
      createdAt: p.owner.createdAt,
      updatedAt: p.owner.updatedAt,
    } : undefined,
    members: p.members || [],
  };
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

  const data = await response.json();
  const p = data.data || data;
  return {
    ...p,
    id: parseInt(p.id) || p.id,
    ownerId: parseInt(p.ownerId) || p.ownerId,
    owner: p.owner ? {
      id: parseInt(p.owner.id) || p.owner.id,
      email: p.owner.email,
      name: p.owner.name,
      createdAt: p.owner.createdAt,
      updatedAt: p.owner.updatedAt,
    } : undefined,
    members: p.members || [],
  };
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

  const data = await response.json();
  const p = data.data || data;
  return {
    ...p,
    id: parseInt(p.id) || p.id,
    ownerId: parseInt(p.ownerId) || p.ownerId,
    owner: p.owner ? {
      id: parseInt(p.owner.id) || p.owner.id,
      email: p.owner.email,
      name: p.owner.name,
      createdAt: p.owner.createdAt,
      updatedAt: p.owner.updatedAt,
    } : undefined,
    members: p.members || [],
  };
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

  const data = await response.json();
  return (data.data || data || []).map((p: any) => ({
    ...p,
    id: parseInt(p.id) || p.id,
    ownerId: parseInt(p.ownerId) || p.ownerId,
    owner: p.owner ? {
      id: parseInt(p.owner.id) || p.owner.id,
      email: p.owner.email,
      name: p.owner.name,
      createdAt: p.owner.createdAt,
      updatedAt: p.owner.updatedAt,
    } : undefined,
    members: p.members || [],
  }));
}

// Ajouter un contributeur à un projet
export async function addContributor(token: string, projectId: number, userId: number): Promise<ProjectMember> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/contributors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'ajout du contributeur');
  }

  const data = await response.json();
  return data.data || data;
}

// Supprimer un contributeur d'un projet
export async function removeContributor(token: string, projectId: number, userId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/contributors/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Erreur lors de la suppression du contributeur');
  }
}
