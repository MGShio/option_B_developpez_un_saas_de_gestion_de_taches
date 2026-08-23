'use client';
// not-found.tsx - Page non trouvée

import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';


export default function NotFoundPage() {

 const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);

 // Gestion du resize pour le responsive

 useEffect(() => {

  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
 }, []);

 // Calcul des tailles responsives

 const isMobile = windowWidth <= 768;
 const isTablet = windowWidth <= 1024;

 // Tailles adaptatives

 const containerPadding = isMobile ? '2rem' : isTablet ? '4rem' : '6.25rem';
 const titleSize = isMobile ? '4rem' : '6rem';


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

     {/* Message */}
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
      Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
     </p>
    </div>
  </MainLayout>
 );
}
