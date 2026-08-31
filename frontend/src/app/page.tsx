// ============================================
// page.tsx - Page d'accueil principale
// ============================================
// ROLE: Point d'entree de l'application - redirige vers le dashboard
//   - Redirige immediatement vers /dashboard
//   - Utilise la redirection cote serveur de Next.js
//
// DEPENDANCES:
// - next/navigation: fournit la fonction redirect pour la navigation cote serveur

// ============================================
// 1. REDIRECTION PRINCIPALE
// ============================================

import { redirect } from 'next/navigation';

// ============================================
// 2. COMPOSANT PRINCIPAL (HOME)
// ============================================
// @action:
//   1. Redirige automatiquement vers /dashboard
//   2. Aucun rendu n'est effectue, la redirection est immediate

export default function Home() {
  redirect('/dashboard');
}
