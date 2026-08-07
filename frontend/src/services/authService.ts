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

// Convert backend user to frontend user
function formatUserFromBackend(backendUser: BackendUser): { id: string; email: string; name: string } {
  return {
    id: backendUser.id,
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
    id: string;
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

// Mettre à jour le profil
export interface UpdateProfileCredentials {
  name?: string;
  email?: string;
}

export async function updateProfile(token: string, credentials: UpdateProfileCredentials): Promise<{ id: string; email: string; name: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors de la mise à jour du profil');
  }

  const data: BackendProfileResponse = await response.json();
  return formatUserFromBackend(data.data.user);
}

// Mettre à jour le mot de passe
export interface UpdatePasswordCredentials {
  currentPassword: string;
  newPassword: string;
}

export async function updatePassword(token: string, credentials: UpdatePasswordCredentials): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: { message?: string; error?: string } = await response.json();
    throw new Error(error.message || error.error || 'Erreur lors du changement de mot de passe');
  }
}

// Vérifier le token et récupérer l'utilisateur
export async function getCurrentUser(token: string): Promise<{ id: string; email: string; name: string }> {
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
