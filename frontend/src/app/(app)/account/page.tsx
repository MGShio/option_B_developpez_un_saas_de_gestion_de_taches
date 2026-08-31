// ============================================
// page.tsx - Page du compte utilisateur
// ============================================
// ROLE: Conteneur pour le composant Account dans larchitecture App Router
//   - Charge le composant Account depuis /pages/Account
//   - Utilise le mode client (use client) pour les hooks React
//
// DEPENDANCES:
// - @/pages/Account: composant principal de gestion de compte

// ============================================
// 1. MODE CLIENT
// ============================================
// @action: Active le rendu cote client pour utiliser les hooks React
'use client';

// ============================================
// 2. IMPORTS
// ============================================

import Account from '@/pages/Account';

// ============================================
// 3. COMPOSANT DE PAGE (ACCOUNTPAGE)
// ============================================
// @action:
//   1. Rend le composant Account qui gere la page de profil utilisateur
//
// @returns: JSX.Element - Le composant Account embarque

export default function AccountPage() {
  return <Account />;
}
