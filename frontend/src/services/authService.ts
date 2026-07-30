const API_BASE_URL = 'http://localhost:8000';

// Types for backend responses
interface BackendUser {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    token: string;
  };
}

interface BackendProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
  };
}

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

// Convert backend user to frontend user
function formatUserFromBackend(backendUser: BackendUser): { id: number; email: string; name: string } {
  return {
    id: convertBackendIdToNumber(backendUser.id),
    email: backendUser.email,
    name: backendUser.name || 'Utilisateur',
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// Login
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Identifiants invalides');
  }

  const data: BackendAuthResponse = await response.json();
  return {
    token: data.data.token,
    user: formatUserFromBackend(data.data.user),
  };
}

// Register
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || "Erreur lors de l'inscription");
  }

  const data: BackendAuthResponse = await response.json();
  return {
    token: data.data.token,
    user: formatUserFromBackend(data.data.user),
  };
}

// Logout
export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

// Vérifier le token et récupérer l'utilisateur
export async function getCurrentUser(token: string): Promise<{ id: number; email: string; name: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Token invalide');
  }

  const data: BackendProfileResponse = await response.json();
  return formatUserFromBackend(data.data.user);
}
