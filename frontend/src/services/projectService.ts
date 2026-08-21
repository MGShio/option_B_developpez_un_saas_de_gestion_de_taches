// projectService.ts - Service

import { API_BASE_URL } from '@//config';

// Backend response types


interface BackendUser {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}



interface BackendProjectMember {
  id: string;
  role: string;
  user?: BackendUser;
  joinedAt?: string;
}



interface BackendProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  userRole?: 'ADMIN' | 'CONTRIBUTOR' | null;
  owner?: BackendUser;
  members?: BackendProjectMember[];
  createdAt: string;
  updatedAt: string;
}

// Convert backend project to frontend project

function formatProjectFromBackend(backendProject: any): Project {
  const project: any = {
    id: backendProject.id,
    name: backendProject.name,
    description: backendProject.description || '',
    ownerId: backendProject.ownerId,
    createdAt: backendProject.createdAt,
    updatedAt: backendProject.updatedAt,
  };

  if (backendProject.owner) {
    project.owner = {
      id: backendProject.owner.id,
      email: backendProject.owner.email,
      name: backendProject.owner.name,
      createdAt: backendProject.owner.createdAt,
      updatedAt: backendProject.owner.updatedAt,
    };
  }

  if (backendProject.members) {
    project.members = backendProject.members.map((m: any) => ({
      id: m.id,
      role: m.role,
      user: m.user ? {
        id: m.user.id,
        email: m.user.email,
        name: m.user.name,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
      } : { id: '', email: '', name: 'Inconnu', createdAt: '', updatedAt: '' },
      joinedAt: m.joinedAt,
    }));
  }

  // Extraire userRole si présent
  if (backendProject.userRole !== undefined) {
    project.userRole = backendProject.userRole;
  }

  return project;
}

// Generic function to extract projects from backend response

function extractProjectsFromResponse(data: any): BackendProject[] {
  if (data?.data?.projects) {
    return data.data.projects;
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

// Generic function to extract single project from backend response

function extractProjectFromResponse(data: any): BackendProject {
  if (data?.data?.project) {
    return data.data.project;
  }
  if (data?.data) {
    return data.data;
  }
  return data;
}



export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}



export interface ProjectMember {
  id: string;
  role: string;
  user: User;
  joinedAt?: string;
}



export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  owner?: User;
  members?: ProjectMember[];
  createdAt: string;
  updatedAt: string;
  tasksCount?: number;
  membersCount?: number;
  userRole?: 'ADMIN' | 'CONTRIBUTOR' | null; // Rôle de l'utilisateur dans ce projet
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
// GET /projects

export async function getProjects(token: string): Promise<Project[]> {
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
  const backendProjects = extractProjectsFromResponse(data);
  return backendProjects.map((p: any) => {
    const project = formatProjectFromBackend(p);
    // Extraire userRole si présent dans la réponse
    if (p.userRole !== undefined) {
      project.userRole = p.userRole;
    }
    return project;
  });
}

// Récupérer un projet par ID
// GET /projects/{projectId}

export async function getProjectById(token: string, projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Projet non trouvé');
  }

  const data = await response.json();
  const backendProject = extractProjectFromResponse(data);
  const project = formatProjectFromBackend(backendProject);
  
  // Extraire userRole si présent dans la réponse
  if (backendProject.userRole !== undefined) {
    project.userRole = backendProject.userRole;
  } else if (data?.data?.project?.userRole !== undefined) {
    project.userRole = data.data.project.userRole;
  }
  
  return project;
}

// Créer un nouveau projet
// POST /projects

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
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la création du projet');
  }

  const data = await response.json();
  const backendProject = extractProjectFromResponse(data);
  return formatProjectFromBackend(backendProject);
}

// Mettre à jour un projet
// PATCH /projects/{projectId}

export async function updateProject(token: string, projectId: string, projectData: UpdateProjectData): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la mise à jour du projet');
  }

  const data = await response.json();
  const backendProject = extractProjectFromResponse(data);
  return formatProjectFromBackend(backendProject);
}

// Supprimer un projet
// DELETE /projects/{projectId}

export async function deleteProject(token: string, projectId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la suppression du projet');
  }
}

// Rechercher des projets
// GET /projects/search?q={query}

export async function searchProjects(token: string, query: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects/search?q=${encodeURIComponent(query)}`, {
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
  const backendProjects = extractProjectsFromResponse(data);
  return backendProjects.map(formatProjectFromBackend);
}

// Ajouter un contributeur à un projet
// POST /projects/{projectId}/contributors

export async function addContributor(token: string, projectId: string, userId: string): Promise<ProjectMember> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/contributors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId: String(userId) }),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || "Erreur lors de l'ajout du contributeur");
  }

  const data = await response.json();
  return data.data || data;
}

// Supprimer un contributeur d'un projet
// DELETE /projects/{projectId}/contributors/{userId}

export async function removeContributor(token: string, projectId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/contributors/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la suppression du contributeur');
  }
}
