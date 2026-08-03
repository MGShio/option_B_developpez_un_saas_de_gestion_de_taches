import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
  const titleSize = isMobile ? '2rem' : '3rem';
  const subtitleSize = isMobile ? '1rem' : '1.25rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';
  const buttonPadding = isMobile ? '12px 24px' : '13px 74px';
  const gapSize = isMobile ? '1.5rem' : '2.5rem';

  // Focus outline style pour l'accessibilite - WCAG 2.1 AA
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: buttonPadding,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
    border: 'none',
    borderRadius: '10px',
    fontSize: buttonFontSize,
    fontFamily: 'Inter',
    fontWeight: '400',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#B54F00',
  };

  return (
    <div 
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: gapSize,
      }}
      role="main"
      aria-labelledby="notfound-title"
    >
      {/* Code d'erreur */}
      <h1 
        id="notfound-title"
        style={{
          color: 'var(--color-secondary)',
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
          fontSize: subtitleSize,
          fontFamily: 'Inter',
          fontWeight: '400',
          margin: '0',
          maxWidth: '500px',
        }}
      >
        Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
      </p>

      {/* Illustration simple */}
      <div 
        style={{
          width: isMobile ? '80px' : '100px',
          height: isMobile ? '80px' : '100px',
          backgroundColor: '#F3F4F6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: gapSize,
        }}
        aria-hidden="true"
      >
        <svg 
          width={isMobile ? '40' : '50'} 
          height={isMobile ? '40' : '50'} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
            stroke="#6B7280" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 22V16" 
            stroke="#6B7280" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Boutons d'action */}
      <div 
        style={{
          display: 'flex',
          gap: isMobile ? '1rem' : '1.5rem',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
          maxWidth: '400px',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={buttonStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle, buttonStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, buttonStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
          aria-label="Retour au tableau de bord"
        >
          ← Retour au tableau de bord
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            ...buttonStyle,
            backgroundColor: 'var(--color-secondary)',
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { backgroundColor: '#373737' }, buttonStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, buttonStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
          aria-label="Retour à l accueil"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
