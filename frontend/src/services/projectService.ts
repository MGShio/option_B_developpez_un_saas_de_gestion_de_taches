const API_BASE_URL = 'http://localhost:8000';

// Helper to convert backend string ID to frontend number ID
function convertBackendIdToNumber(backendId: string): number {
  const num = parseInt(backendId, 10);
  if (!isNaN(num)) return num;
  let hash = 0;
  for (let i = 0; i < backendId.length; i++) {
    hash = (hash << 5) - hash + backendId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

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
  owner?: BackendUser;
  members?: BackendProjectMember[];
  createdAt: string;
  updatedAt: string;
}

// Convert backend project to frontend project
export function formatProjectFromBackend(backendProject: BackendProject): Project {
  return {
    id: convertBackendIdToNumber(backendProject.id),
    name: backendProject.name,
    description: backendProject.description || '',
    ownerId: convertBackendIdToNumber(backendProject.ownerId),
    owner: backendProject.owner ? {
      id: convertBackendIdToNumber(backendProject.owner.id),
      email: backendProject.owner.email,
      name: backendProject.owner.name,
      createdAt: backendProject.owner.createdAt,
      updatedAt: backendProject.owner.updatedAt,
    } : undefined,
    members: backendProject.members?.map((m) => ({
      id: convertBackendIdToNumber(m.id),
      role: m.role,
      user: m.user ? {
        id: convertBackendIdToNumber(m.user.id),
        email: m.user.email,
        name: m.user.name,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
      } : { id: 0, email: '', name: 'Inconnu', createdAt: '', updatedAt: '' },
      joinedAt: m.joinedAt,
    })) || [],
    createdAt: backendProject.createdAt,
    updatedAt: backendProject.updatedAt,
  };
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
  if (data?.data) {
    return data.data;
  }
  return data;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: number;
  role: string;
  user: User;
  joinedAt?: string;
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
  return backendProjects.map(formatProjectFromBackend);
}

// Récupérer un projet par ID
// GET /projects/{projectId}
export async function getProjectById(token: string, projectId: number): Promise<Project> {
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
  return formatProjectFromBackend(backendProject);
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
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la mise à jour du projet');
  }

  const data = await response.json();
  const backendProject = extractProjectFromResponse(data);
  return formatProjectFromBackend(backendProject);
}

// Supprimer un projet
// DELETE /projects/{projectId}
export async function deleteProject(token: string, projectId: number): Promise<void> {
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
export async function addContributor(token: string, projectId: number, userId: number): Promise<ProjectMember> {
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
export async function removeContributor(token: string, projectId: number, userId: number): Promise<void> {
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
