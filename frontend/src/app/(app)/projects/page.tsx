// ============================================
// page.tsx - Page de liste des projets
// ============================================
// ROLE: Conteneur pour le composant Projects dans larchitecture App Router
//   - Charge le composant Projects depuis /pages/Projects
//   - Utilise le mode client (use client) pour les hooks React
//
// DEPENDANCES:
// - @/pages/Projects: composant principal de gestion des projets

// ============================================
// 1. MODE CLIENT
// ============================================
// @action: Active le rendu cote client pour utiliser les hooks React
'use client';

// ============================================
// 2. IMPORTS
// ============================================

import Projects from '@/pages/Projects';

// ============================================
// 3. COMPOSANT DE PAGE (PROJECTSPAGE)
// ============================================
// @action:
//   1. Rend le composant Projects qui affiche la liste des projets
//      avec filtrage, tri et pagination
//
// @returns: JSX.Element - Le composant Projects embarque

export default function ProjectsPage() {
  return <Projects />;
}
