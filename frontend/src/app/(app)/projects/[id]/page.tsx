// ============================================
// page.tsx - Page de detail d'un projet
// ============================================
// ROLE: Conteneur pour le composant ProjectDetail avec parametre dynamique
//   - Charge le composant ProjectDetail depuis /pages/ProjectDetail
//   - Recupere l'ID du projet depuis les parametres de l'URL
//   - Utilise le mode client (use client) pour les hooks React
//
// DEPENDANCES:
// - @/pages/ProjectDetail: composant principal d'affichage du detail d'un projet
// - react: fournit le hook use pour la lecture des parametres

// ============================================
// 1. MODE CLIENT
// ============================================
// @action: Active le rendu cote client pour utiliser les hooks React
'use client';

// ============================================
// 2. IMPORTS
// ============================================

import ProjectDetail from '@/pages/ProjectDetail';
import { use } from 'react';

// ============================================
// 3. COMPOSANT DE PAGE (PROJECTDETAILPAGE)
// ============================================
// @param: { params: Promise<{ id: string }> }
//   - params: Promise contenant l'ID du projet extrait de l'URL
//
// @action:
//   1. Extraire l'ID du projet depuis params en utilisant le hook use
//   2. Passer l'ID au composant ProjectDetail pour chargement des donnees
//
// @returns: JSX.Element - Le composant ProjectDetail avec l'ID specifie

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectDetail id={id} />;
}
