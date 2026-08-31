// ============================================
// config.ts - Configuration globale de l'application
// ============================================
// ROLE: Fichier de configuration centrale pour :
// - URL de base de l'API backend
// - Timeouts des requetes HTTP
// - Cles de stockage pour le localStorage/sessionStorage
// - Configuration de la pagination
// - Messages d'erreur standardises
//
// UTILISATION :
// Ces constantes sont utilisees dans toute l'application pour :
// - Les appels API (services/*Service.ts)
// - La gestion du token (utils/storage.ts)
// - L'affichage des erreurs (composants et pages)
//

// ============================================
// 1. CONFIGURATION DE L'API
// ============================================

// URL de base de l'API - peut etre ecrasee par NEXT_PUBLIC_API_BASE_URL
// Pour la production, configurer via .env ou variables d'environnement
// Exemple: NEXT_PUBLIC_API_BASE_URL=https://api.monapp.com
// Valeur par defaut: http://localhost:8000 (backend local)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ============================================
// 2. CONFIGURATION DES TIMEOUTS (en millisecondes)
// ============================================
// Definit les delais d'expiration pour les requetes API
// - default: Timeout standard pour la majorite des requetes
// - long: Pour les operations longues (upload de fichiers, traitements batch)
// - short: Pour les requetes rapides (health check, ping)
export const API_TIMEOUTS = {
  default: 10000,  // 10 secondes
  long: 30000,     // 30 secondes
  short: 5000,     // 5 secondes
};

// ============================================
// 3. CONFIGURATION DU STOCKAGE (localStorage/sessionStorage)
// ============================================
// Cles utilisees pour stocker les donnees dans le navigateur
// as const: Rend l'objet immutable pour une meilleure type inference
//
// Cles disponibles:
// - token: Stocke le JWT d'authentification
// - user: Stocke les informations de l'utilisateur connecte
// - rememberMe: Stocke la preference "Se souvenir de moi"
export const STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
  rememberMe: 'auth_remember_me',
} as const;

// ============================================
// 4. CONFIGURATION DE LA PAGINATION
// ============================================
// Parametres par defaut pour la pagination des listes (taches, projets, etc.)
// - defaultLimit: Nombre d'elements par page par defaut
// - maxLimit: Nombre maximum d'elements autorise par requete
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
};

// ============================================
// 5. MESSAGES D'ERREUR STANDARDISES
// ============================================
// Messages d'erreur predefinis pour une experience utilisateur cohérente
// Utilises par les services et composants pour afficher des erreurs comprehensibles
//
// Types d'erreurs couvertes:
// - network: Probleme de connexion internet
// - unauthorized: Token invalide ou expire
// - forbidden: Droits insuffisants
// - notFound: Ressource introuvable
// - server: Erreur serveur interne
// - validation: Donnees invalides
//
export const ERROR_MESSAGES = {
  network: 'Erreur de connexion. Verifiez votre connexion internet.',
  unauthorized: 'Session expiree. Veuillez vous reconnecter.',
  forbidden: "Vous navez pas les permissions necessaires.",
  notFound: 'Ressource non trouvee.',
  server: 'Erreur serveur. Veuillez reessayer plus tard.',
  validation: 'Donnees invalides. Verifiez les informations saisies.',
};
