import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import des logos et icônes
import logoOrange from '../images/logoorange.svg';
import logoBlack from '../images/logoblack.svg';
import dashboardIconWhite from '../images/dashboardiconwhite.svg';
import dashboardIconOrange from '../images/dashboardiconorange.svg';
import folderIcon from '../images/fodlericon.svg';

export default function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gestion du resize pour le responsive
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extraire les initiales du nom de l'utilisateur
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calcul des tailles responsives
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;
  
  // Padding horizontal
  const headerPaddingX = isMobile ? '1rem' : isTablet ? '2rem' : '6.25rem'; // 100px
  const mainPaddingX = isMobile ? '1rem' : isTablet ? '2rem' : '6.25rem';
  const footerPaddingX = isMobile ? '1rem' : isTablet ? '2rem' : '1.875rem'; // 30px
  
  // Tailles des éléments
  const logoWidth = isMobile ? '100px' : '147px';
  const logoHeight = isMobile ? '24px' : '18.72px';
  const navButtonPaddingX = isMobile ? '1rem' : isTablet ? '2rem' : '3.875rem'; // 62px
  const navButtonPaddingY = isMobile ? '0.75rem' : isTablet ? '1rem' : '1.6875rem'; // 27px
  const navFontSize = isMobile ? '0.875rem' : '1rem';
  const avatarSize = isMobile ? '45px' : '65px';
  const avatarInitialsFontSize = isMobile ? '0.75rem' : '0.875rem';

  // Couleurs
  const primaryColor = '#D3590B';
  const secondaryColor = '#1F1F1F';
  const backgroundColor = '#F9FAFB';
  const white = '#FFFFFF';

  // Styles
  const layoutStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: backgroundColor,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: `8px ${headerPaddingX}`,
    background: white,
    boxShadow: '0px 4px 12px 1px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const logoStyle: React.CSSProperties = {
    width: logoWidth,
    height: logoHeight,
    display: 'flex',
    alignItems: 'center',
  };

  const navStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'flex',
    gap: '1rem',
    alignItems: 'center',
  };

  const navButtonStyle: React.CSSProperties = {
    padding: `${navButtonPaddingY} ${navButtonPaddingX}`,
    border: 'none',
    borderRadius: '0.625rem', // 10px
    fontSize: navFontSize,
    fontFamily: 'Inter',
    fontWeight: 400,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  const navButtonActiveStyle: React.CSSProperties = {
    backgroundColor: secondaryColor,
    color: white,
  };

  const navButtonInactiveStyle: React.CSSProperties = {
    backgroundColor: white,
    color: primaryColor,
  };

  const iconStyle: React.CSSProperties = {
    width: isMobile ? '14px' : '11px',
    height: isMobile ? '14px' : 'auto',
    fill: 'currentColor',
  };

  const userAvatarStyle: React.CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    padding: isMobile ? '8px' : '21px 12px',
    backgroundColor: '#FFE8D9', // Orange clair pour l'avatar
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  };

  const avatarTextStyle: React.CSSProperties = {
    textAlign: 'center',
    color: secondaryColor, // #1F1F1F
    fontSize: avatarInitialsFontSize,
    fontFamily: 'Inter',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.28px',
    lineHeight: 1,
  };

  const mobileMenuButtonStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: avatarSize,
    height: avatarSize,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  };

  const mobileMenuStyle: React.CSSProperties = {
    display: isMobile && mobileMenuOpen ? 'flex' : 'none',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: white,
    boxShadow: '0px 4px 12px 1px rgba(0, 0, 0, 0.08)',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    zIndex: 99,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: `2.5rem ${mainPaddingX}`,
    display: 'flex',
    flexDirection: 'column',
  };

  const footerStyle: React.CSSProperties = {
    width: '100%',
    height: isMobile ? '56px' : '68px',
    background: white,
    position: 'sticky',
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${footerPaddingX}`,
    borderTop: '1px solid #E5E7EB',
  };

  const footerLogoStyle: React.CSSProperties = {
    width: isMobile ? '80px' : '101px',
    height: isMobile ? '16px' : '12.86px',
  };

  const footerTextStyle: React.CSSProperties = {
    position: 'absolute',
    right: footerPaddingX,
    color: 'black',
    fontSize: isMobile ? '0.875rem' : '1rem',
    fontFamily: 'Inter',
    fontWeight: 400,
  };

  // Focus outline style pour l'accessibilite
  const focusOutlineStyle: React.CSSProperties = {
    outline: `2px solid ${primaryColor}`,
    outlineOffset: '2px',
  };

  return (
    <div style={layoutStyle}>
      {/* Header */}
      <header style={headerStyle} role="banner">
        {/* Logo */}
        <Link to="/dashboard" style={logoStyle} aria-label="Accueil - Tableau de bord">
          <img src={logoOrange} alt="Logo Abricot" style={{ height: '100%', width: 'auto' }} />
        </Link>

        {/* Navigation desktop */}
        <nav style={navStyle} role="navigation" aria-label="Navigation principale">
          <Link
            to="/dashboard"
            style={{ ...navButtonStyle, ...navButtonActiveStyle }}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, navButtonStyle, navButtonActiveStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, navButtonStyle, navButtonActiveStyle)}
          >
            <img src={dashboardIconWhite} alt="" style={iconStyle} />
            <img src={dashboardIconWhite} alt="" style={iconStyle} />
            <img src={dashboardIconWhite} alt="" style={iconStyle} />
            <img src={dashboardIconWhite} alt="" style={iconStyle} />
            Tableau de bord
          </Link>
          <Link
            to="/projects"
            style={{ ...navButtonStyle, ...navButtonInactiveStyle }}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, navButtonStyle, navButtonInactiveStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, navButtonStyle, navButtonInactiveStyle)}
          >
            <img src={folderIcon} alt="" style={iconStyle} />
            <img src={folderIcon} alt="" style={iconStyle} />
            Projets
          </Link>
        </nav>

        {/* User Avatar ou menu mobile */}
        {user && isAuthenticated ? (
          <>
            {/* Menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={mobileMenuButtonStyle}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <div style={{ width: '20px', height: '2px', backgroundColor: secondaryColor, margin: '2px 0' }} />
              <div style={{ width: '20px', height: '2px', backgroundColor: secondaryColor, margin: '2px 0' }} />
              <div style={{ width: '20px', height: '2px', backgroundColor: secondaryColor, margin: '2px 0' }} />
            </button>
            
            {/* Menu mobile déroulant */}
            <div id="mobile-menu" style={mobileMenuStyle}>
              <Link
                to="/dashboard"
                style={{ ...navButtonStyle, ...navButtonActiveStyle, width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, navButtonStyle, navButtonActiveStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, navButtonStyle, navButtonActiveStyle)}
              >
                <img src={dashboardIconOrange} alt="" style={{ ...iconStyle, width: '16px', height: '16px' }} />
                Tableau de bord
              </Link>
              <Link
                to="/projects"
                style={{ ...navButtonStyle, ...navButtonInactiveStyle, width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, navButtonStyle, navButtonInactiveStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, navButtonStyle, navButtonInactiveStyle)}
              >
                <img src={folderIcon} alt="" style={{ ...iconStyle, width: '16px', height: '16px' }} />
                Projets
              </Link>
              <Link
                to="/account"
                style={{ ...navButtonStyle, ...navButtonInactiveStyle, width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, navButtonStyle, navButtonInactiveStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, navButtonStyle, navButtonInactiveStyle)}
              >
                Mon compte
              </Link>
            </div>

            {/* Avatar desktop */}
            <div 
              onClick={() => navigate('/account')}
              style={{ ...userAvatarStyle, display: isMobile ? 'none' : 'flex' }}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') navigate('/account'); }}
              aria-label={`Compte de ${user.name}`}
            >
              <span style={avatarTextStyle}>
                {getInitials(user.name)}
              </span>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              ...navButtonStyle,
              backgroundColor: secondaryColor,
              color: white,
              padding: isMobile ? '0.75rem 1.5rem' : `${navButtonPaddingY} ${navButtonPaddingX}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, navButtonStyle, { backgroundColor: secondaryColor, color: white })}
            onBlur={(e) => Object.assign(e.currentTarget.style, navButtonStyle, { backgroundColor: secondaryColor, color: white })}
          >
            Se connecter
          </Link>
        )}
      </header>

      {/* Contenu principal */}
      <main style={mainStyle} role="main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={footerStyle} role="contentinfo">
        <div style={footerLogoStyle} aria-hidden="true">
          <img src={logoBlack} alt="Logo Abricot" style={{ height: '100%', width: 'auto' }} />
        </div>
        <span style={footerTextStyle}>
          Abricot 2025
        </span>
      </footer>
    </div>
  );
}
