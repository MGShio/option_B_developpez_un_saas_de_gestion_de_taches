// config.ts - Configuration globale de l'application

// URL de base de l'API - peut être écrasée par NEXT_PUBLIC_API_BASE_URL
// Pour la production, configurer via .env ou variables d'environnement

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Configuration des timeouts (en ms)
export const API_TIMEOUTS = {
  default: 10000,
  long: 30000,
  short: 5000,
};

// Configuration du stockage
export const STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
  rememberMe: 'auth_remember_me',
} as const;

// Configuration de la pagination
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
};

// Messages d'erreur par défaut
export const ERROR_MESSAGES = {
  network: 'Erreur de connexion. Vérifiez votre connexion internet.',
  unauthorized: 'Session expirée. Veuillez vous reconnecter.',
  forbidden: "Vous n'avez pas les permissions nécessaires.",
  notFound: 'Ressource non trouvée.',
  server: 'Erreur serveur. Veuillez réessayer plus tard.',
  validation: 'Données invalides. Vérifiez les informations saisies.',
};
