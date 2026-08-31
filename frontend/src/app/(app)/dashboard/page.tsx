// ============================================
// page.tsx - Page du tableau de bord
// ============================================
// ROLE: Conteneur pour le composant Dashboard dans larchitecture App Router
//   - Charge le composant Dashboard depuis /pages/Dashboard
//   - Utilise le mode client (use client) pour les hooks React
//
// DEPENDANCES:
// - @/pages/Dashboard: composant principal du tableau de bord

// ============================================
// 1. MODE CLIENT
// ============================================
// @action: Active le rendu cote client pour utiliser les hooks React
'use client';

// ============================================
// 2. IMPORTS
// ============================================

import Dashboard from '@/pages/Dashboard';

// ============================================
// 3. COMPOSANT DE PAGE (DASHBOARDPAGE)
// ============================================
// @action:
//   1. Rend le composant Dashboard qui affiche le tableau de bord
//      avec statistiques, projets et taches
//
// @returns: JSX.Element - Le composant Dashboard embarque

export default function DashboardPage() {
  return <Dashboard />;
}
