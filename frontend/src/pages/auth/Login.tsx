import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Import de l'image de fond locale
import loginBackground from '../../images/Loginbackground.svg';
// Import du logo
import logoOrange from '../../images/logoorange.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Reset body margin pour éviter les bordures blanches
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.minHeight = '';
    };
  }, []);

  // Gestion du resize pour le responsive
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // Comptes de test
  const testAccounts = [
    { email: 'alice@example.com', password: 'P@ssword123' },
    { email: 'bob@example.com', password: 'P@ssword123' },
    { email: 'caroline@example.com', password: 'P@ssword123' },
  ];

  // Calcul des tailles responsives
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;
  
  // Largeur du card : 90% sur mobile, 45% sur tablette, 39% sur desktop (562px/1440px)
  const cardWidth = isMobile ? '90%' : isTablet ? '45%' : '39%';
  const padding = isMobile ? '1.5rem' : '2rem';
  const titleSize = isMobile ? '1.75rem' : '2rem';
  const inputPadding = isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem';
  const logoHeight = isMobile ? '28px' : '36px';

  // Styles - Conforme WCAG 2.1 AA
  const containerStyle: React.CSSProperties = {
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundImage: `url(${loginBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    margin: 0,
    padding: 0,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    padding: padding,
    height: '93%',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    width: cardWidth,
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: titleSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-heading)',
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-body)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: inputPadding,
    border: '1px solid var(--color-border)',
    borderRadius: '0.375rem',
    outline: 'none',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontFamily: 'var(--font-body)',
    transition: 'box-shadow 0.2s ease',
  };

  const inputFocusStyle: React.CSSProperties = {
    borderColor: 'transparent',
    boxShadow: '0 0 0 3px rgba(211, 89, 11, 0.3)',
  };

  const forgotPasswordStyle: React.CSSProperties = {
    textAlign: 'right',
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)',
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
  };

  const linkHoverStyle: React.CSSProperties = {
    textDecoration: 'underline',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-white)',
    padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    fontFamily: 'var(--font-body)',
    transition: 'background-color 0.2s ease',
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#373737',
  };

  const testSectionStyle: React.CSSProperties = {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.5rem',
  };

  const testTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
    color: '#4B5563',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font-body)',
  };

  const testAccountStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-body)',
  };

  const fillButtonStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
    padding: '0.25rem 0.5rem',
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '2rem',
    color: '#4B5563',
    fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)',
    fontFamily: 'var(--font-body)',
  };

  // Focus outline style
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  return (
    <div style={containerStyle} role="main" aria-label="Page de connexion">
      <div 
        style={cardStyle}
        aria-labelledby="login-title"
        aria-describedby="login-form"
      >
        {/* Logo de l'application */}
        <div style={logoContainerStyle}>
          <img
            src={logoOrange}
            alt="Logo de l'application"
            style={{ height: logoHeight, width: 'auto' }}
          />
        </div>
        
        <h1 id="login-title" style={titleStyle}>Connexion</h1>

        {error && (
          <div 
            style={errorStyle}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          style={formStyle}
          id="login-form"
          aria-label="Formulaire de connexion"
        >
          <div>
            <label htmlFor="email" style={labelStyle}>
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle, inputStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
              aria-required="true"
              placeholder="votre@email.com"
              autoComplete="email"
              autoCapitalize="none"
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle, inputStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
              aria-required="true"
              placeholder="8 caracteres minimum"
              minLength={8}
              autoComplete="current-password"
            />
          </div>

          <div style={forgotPasswordStyle}>
            <Link 
              to="/forgot-password" 
              style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle, linkStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, linkStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              aria-label="Mot de passe oublie, cliquez pour reinitialiser"
            >
              Mot de passe oublie ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyle}
            onMouseEnter={(e) => !isLoading && Object.assign(e.currentTarget.style, buttonHoverStyle, buttonStyle)}
            onMouseLeave={(e) => !isLoading && Object.assign(e.currentTarget.style, buttonStyle)}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, buttonStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
            aria-busy={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Section des comptes de test */}
        <div style={testSectionStyle}>
          <p id="test-accounts-title" style={testTitleStyle}>Comptes de test pour demonstration :</p>
          <div role="list" aria-label="Liste des comptes de test">
            {testAccounts.map((account, index) => (
              <div 
                key={index} 
                style={testAccountStyle}
                role="listitem"
              >
                <span>{account.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  style={fillButtonStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, fillButtonStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, fillButtonStyle)}
                  aria-label={`Remplir avec le compte ${account.email}`}
                >
                  Remplir
                </button>
              </div>
            ))}
          </div>
        </div>

        <p style={footerStyle}>
          Pas encore de compte ?{' '}
          <Link 
            to="/register" 
            style={linkStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle, linkStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, linkStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, linkStyle)}
            aria-label="Creer un nouveau compte"
          >
            Creer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
