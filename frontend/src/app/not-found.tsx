'use client';
// ============================================
// not-found.tsx - Page 404 Non trouvee
// ============================================
// ROLE: Page d'erreur affichee lorsqu'une URL introuvable est accedee
// Affiche un message clair avec le code 404 et une suggestion
//
// DEPENDANCES :
// - react : Pour les hooks (useState, useEffect)
// - @/layouts/MainLayout : Pour le layout principal de l'application
//

import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';


export default function NotFoundPage() {

  // ============================================
  // 1. ETATS (STATE MANAGEMENT)
  // ============================================

  // Etat pour la largeur de la fenetre (responsive)
  // Valeur par defaut: 1440px (taille desktop standard)
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);

  // ============================================
  // 2. EFFETS (USE EFFECT)
  // ============================================

  // EFFET: Gestion du resize pour le responsive design
  // - Ecoute les changements de taille de la fenetre
  // - Met a jour windowWidth lors du redimensionnement
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Nettoyage: Suppression de l'ecouteur lors du demontage du composant
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // 3. VARIABLES DE STYLE RESPONSIVE
  // ============================================

  // Calcul des tailles adaptatives
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  // Tailles adaptatives pour le conteneur et le texte
  const containerPadding = isMobile ? '2rem' : isTablet ? '4rem' : '6.25rem';
  const titleSize = isMobile ? '4rem' : '6rem';

  // ============================================
  // 4. RENDU (RENDER)
  // ============================================

  return (
    <MainLayout>
      <div
        style={{
          width: '100%',
          minHeight: '60vh',
          backgroundColor: 'var(--color-background)',
          padding: containerPadding,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
        role="main"
        aria-labelledby="notfound-title"
      >
        {/* Code d'erreur en orange */}
        <h1
          id="notfound-title"
          style={{
            color: 'var(--color-primary)',
            fontSize: titleSize,
            fontFamily: 'Manrope',
            fontWeight: '700',
            margin: '0',
          }}
        >
          404
        </h1>

        {/* Message d'erreur */}
        <p
          style={{
            color: '#6B7280',
            fontSize: isMobile ? '1rem' : '1.25rem',
            fontFamily: 'Inter',
            fontWeight: '400',
            margin: '0',
            maxWidth: '500px',
            marginTop: '1rem',
          }}
        >
          Desole, la page que vous cherchez n existe pas ou a ete deplacee.
        </p>
      </div>
    </MainLayout>
  );
}
