// ============================================
// layout.tsx - Layout de l'application protegee
// ============================================
// ROLE: Layout parent pour toutes les pages de l'application protegee
//   - Verifie l'authentification de l'utilisateur
//   - Affiche un ecran de chargement pendant la verification
//   - Redirige vers /login si non authentifie
//   - Rend le MainLayout avec les enfants si authentifie
//
// DEPENDANCES:
// - react: fournit useEffect pour les effets de bord
// - next/navigation: fournit useRouter pour la redirection
// - @/contexts/AuthContext: fournit useAuth pour l'etat d'authentification
// - @/layouts/MainLayout: composant de mise en page principale

// ============================================
// 1. MODE CLIENT
// ============================================
// @action: Active le rendu cote client pour utiliser les hooks React
'use client';

// ============================================
// 2. IMPORTS
// ============================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';

// ============================================
// 3. STYLES
// ============================================
// @action: Definit le style de l'ecran de chargement

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

// ============================================
// 4. COMPOSANT DE LAYOUT (APPLAYOUT)
// ============================================
// @param: { children: React.ReactNode }
//   - children: Les composants enfants a rendre
//
// @action:
//   1. Recupere l'etat d'authentification depuis AuthContext
//   2. Utilise useEffect pour rediriger si non authentifie
//   3. Affiche un ecran de chargement pendant la verification
//   4. Rend le MainLayout avec les enfants si authentifie
//
// @returns: JSX.Element - Le layout avec les enfants ou l'ecran de chargement

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // ============================================
  // 4.1. EFFET DE REDIRECTION
  // ============================================
  // @action: Redirige vers /login si l'utilisateur n'est pas authentifie
  // @depends: isAuthenticated, router

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // ============================================
  // 4.2. ECRAN DE CHARGEMENT
  // ============================================
  // @action: Affiche un ecran de chargement pendant la verification de l'auth

  if (isLoading) {
    return <div style={loadingStyle}>Chargement...</div>;
  }

  // ============================================
  // 4.3. NON AUTHENTIFIE
  // ============================================
  // @action: Retourne null pendant la redirection

  if (!isAuthenticated) {
    return null;
  }

  // ============================================
  // 4.4. RENDU PRINCIPAL
  // ============================================
  // @action: Rend le MainLayout avec les enfants

  return <MainLayout>{children}</MainLayout>;
}
