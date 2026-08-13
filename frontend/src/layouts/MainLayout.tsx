import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import des logos et icônes
import logoOrange from '../images/logoorange.svg';
import logoBlack from '../images/logoblack.svg';
import dashboardIconWhite from '../images/dashboardiconwhite.svg';
import dashboardIconOrange from '../images/dashboardiconorange.svg';
import folderIcon from '../images/foldericon.svg';
import folderIconWhite from '../images/foldericonwhite.svg';

export default function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const isDashboard = location.pathname === '/dashboard';
  const isProjects = location.pathname === '/projects';
  const isAccount = location.pathname === '/account';
  const isTablet = windowWidth <= 1024;
  
  // Padding horizontal (selon maquette: 100px de chaque côté à 1440px)
  const headerPaddingX = '100px';
  const mainPaddingX = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
  
  // Padding droit pour l'avatar
  const avatarPaddingRight = '100px';
  const footerPaddingX = isMobile ? '1rem' : isTablet ? '2rem' : '1.875rem'; // 30px
  
  // Tailles des éléments
  const logoWidth = isMobile ? '100px' : '147px';
  const logoHeight = isMobile ? '24px' : '18.72px';
  // Boutons de navigation (248x76.5px selon maquette)
  const navButtonWidth = '248px';
  const navButtonHeight = '76.5px';
  const navButtonPaddingX = isMobile ? '1rem' : '1rem';
  const navButtonPaddingY = isMobile ? '0.75rem' : '0.75rem';
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
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 0',
    background: white,
    boxShadow: '0px 4px 12px 1px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const logoStyle: React.CSSProperties = {
    width: logoWidth,
    height: logoHeight,
    paddingLeft: '100px',
    display: 'flex',
    alignItems: 'center',
  };

  const navStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'flex',
    flex: 1,
    justifyContent: 'center',
    gap: '16px',
    alignItems: 'center',
  };

  const navButtonStyle: React.CSSProperties = {
    width: navButtonWidth,
    height: navButtonHeight,
    padding: `${navButtonPaddingY} ${navButtonPaddingX}`,
    border: 'none',
    borderRadius: '0.625rem', // 10px
    fontSize: navFontSize,
    fontFamily: 'Inter',
    fontWeight: 400,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
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
    width: isMobile ? '18px' : '24px',
    height: isMobile ? '18px' : '24px',
    fill: 'currentColor',
  };

  const userAvatarStyle: React.CSSProperties = {
    width: avatarSize,
    height: avatarSize,
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
    color: '#0F0F0F',
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
    width: '100%',
    padding: `2.5rem ${mainPaddingX}`,
    display: 'flex',
    flexDirection: 'column',
  };

  const footerStyle: React.CSSProperties = {
    width: '100%',
    height: isMobile ? '56px' : '68px',
    background: white,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #E5E7EB',
  };

  const footerLogoStyle: React.CSSProperties = {
    width: isMobile ? '80px' : '101px',
    height: isMobile ? '16px' : '12.86px',
    display: 'flex',
    alignItems: 'center',
  };

  const footerTextStyle: React.CSSProperties = {
    color: 'black',
    fontSize: isMobile ? '0.875rem' : '1rem',
    fontFamily: 'Inter',
    fontWeight: 400,
    whiteSpace: 'nowrap',
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
            style={{ ...navButtonStyle, ...(isDashboard ? navButtonActiveStyle : navButtonInactiveStyle) }}
          >
            <img src={isDashboard ? dashboardIconWhite : dashboardIconOrange} alt="" style={iconStyle} />
            Tableau de bord
          </Link>
          <Link
            to="/projects"
            style={{ ...navButtonStyle, ...(isProjects ? navButtonActiveStyle : navButtonInactiveStyle) }}
          >
            <img src={isProjects ? folderIconWhite : folderIcon} alt="" style={iconStyle} />
            Projets
          </Link>
        </nav>

        {/* User Avatar ou menu mobile */}
        {user && isAuthenticated ? (
          <div style={{ marginLeft: 'auto', paddingRight: avatarPaddingRight }}>
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
                style={{ ...navButtonStyle, ...(isDashboard ? navButtonActiveStyle : navButtonInactiveStyle), width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <img src={isDashboard ? dashboardIconWhite : dashboardIconOrange} alt="" style={iconStyle} />
                Tableau de bord
              </Link>
              <Link
                to="/projects"
                style={{ ...navButtonStyle, ...(isProjects ? navButtonActiveStyle : navButtonInactiveStyle), width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <img src={isProjects ? folderIconWhite : folderIcon} alt="" style={iconStyle} />
                Projets
              </Link>
              <Link
                to="/account"
                style={{ ...navButtonStyle, ...navButtonInactiveStyle, width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
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
          </div>
        ) : (
          <div style={{ marginLeft: 'auto', paddingRight: avatarPaddingRight }}>
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
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main style={mainStyle} role="main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={footerStyle} role="contentinfo">
        <div style={footerLogoStyle} aria-hidden="true">
          <img src={logoBlack} alt="Logo Abricot" style={{ height: '100%', width: 'auto', paddingLeft: '20px' }} />
        </div>
        <span style={{ ...footerTextStyle, paddingRight: '20px' }}>
          Abricot 2025
        </span>
      </footer>
    </div>
  );
}

