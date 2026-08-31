// ============================================
// page.tsx - Page de connexion
// ============================================
// ROLE: Conteneur pour le composant Login avec protection de redirection
//   - Verifie si l'utilisateur est deja authentifie
//   - Redirige vers /dashboard si authentifie
//   - Affiche un ecran de chargement pendant la verification
//   - Rend le composant Login si non authentifie
//
// DEPENDANCES:
// - react: fournit useEffect pour les effets de bord
// - next/navigation: fournit useRouter pour la redirection
// - @/contexts/AuthContext: fournit useAuth pour l'etat d'authentification
// - @/pages/auth/Login: composant principal de connexion

// ============================================
// 1. MODE CLIENT
// ============================================
// @action: Active le rendu cote client pour utiliser les hooks React
'use client';

// ============================================
// 2. DYNAMIC RENDERING
// ============================================
// @action: Force le rendu dynamique pour chaque requete
//   - Empeche la mise en cache statique de cette page

export const dynamic = 'force-dynamic';

// ============================================
// 3. IMPORTS
// ============================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/auth/Login';

// ============================================
// 4. STYLES
// ============================================
// @action: Definit le style de l'ecran de chargement

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

// ============================================
// 5. COMPOSANT DE PAGE (LOGINPAGE)
// ============================================
// @action:
//   1. Recupere l'etat d'authentification depuis AuthContext
//   2. Utilise useEffect pour rediriger si deja authentifie
//   3. Affiche un ecran de chargement pendant la verification
//   4. Rend le composant Login si non authentifie
//
// @returns: JSX.Element - Le composant Login ou l'ecran de chargement

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // ============================================
  // 5.1. EFFET DE REDIRECTION
  // ============================================
  // @action: Redirige vers /dashboard si l'utilisateur est deja authentifie
  // @depends: isAuthenticated, router

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // ============================================
  // 5.2. ECRAN DE CHARGEMENT
  // ============================================
  // @action: Affiche un ecran de chargement pendant la verification de l'auth

  if (isLoading) {
    return <div style={loadingStyle}>Chargement...</div>;
  }

  // ============================================
  // 5.3. RENDU PRINCIPAL
  // ============================================
  // @action: Rend le composant Login

  return <Login />;
}
