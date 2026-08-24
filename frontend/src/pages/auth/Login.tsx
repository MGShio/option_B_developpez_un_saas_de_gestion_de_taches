'use client';

// Login.tsx - Page connexion

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Import de l'image de fond locale
const loginBackground = '/images/Loginbackground.svg';

// Import du logo
const logoOrange = '/images/logoorange.svg';




export default function Login() {


  const [email, setEmail] = useState('');


  const [password, setPassword] = useState('');


  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);



  const { login, isLoading, error, clearError } = useAuth();

  const router = useRouter();

  // Reset body margin pour éviter les bordures blanches

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';

// RENDER

    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.minHeight = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Gestion du resize pour le responsive

  useEffect(() => {

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

// RENDER

    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // Calcul des tailles responsives

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;
  
  // Largeur du card : 90% sur mobile, 45% sur tablette, 39% sur desktop (562px/1440px)
  const cardWidth = isMobile ? '90%' : isTablet ? '45%' : '39%';
  const padding = isMobile ? '1.5rem' : isTablet ? '2rem' : 'clamp(1.5rem, 4vw, 4rem)';
  const titleSize = isMobile ? '1.75rem' : '2rem';
  const inputPadding = isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem';
  const logoHeight = isMobile ? '28px' : '36px';

  // Styles - Conforme WCAG 2.1 AA
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundImage: `url(${loginBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    margin: 0,
    padding: 0,
    overflowY: 'auto',
    userSelect: 'none',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    padding: padding,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    width: cardWidth,
    maxWidth: '562px',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 'clamp(2rem, 8vh, 3rem)',
    flexShrink: 0,
    userSelect: 'none',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: titleSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '1.5rem',
    marginTop: '19.73vh',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-heading)',
    flexShrink: 0,
    userSelect: 'none',
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    flexShrink: 0,
    userSelect: 'none',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    flex: 1,
    minHeight: 0,
    width: 'clamp(280px, 20vw, 282px)',
    margin: '0 auto',
    overflowY: 'auto',
    paddingRight: '0.5rem',
    alignItems: 'center',
    userSelect: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-body)',
    userSelect: 'none',
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
    boxShadow: 'none',
  };

  const inputFocusStyle: React.CSSProperties = {
    borderColor: 'transparent',
    boxShadow: '0 0 0 3px rgba(211, 89, 11, 0.3)',
  };

  const forgotPasswordStyle: React.CSSProperties = {
    textAlign: 'center',
    userSelect: 'none',
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)',
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
    borderBottom: '1px solid var(--color-primary)',
    userSelect: 'none',
  };

  const linkHoverStyle: React.CSSProperties = {
    textDecoration: 'underline',
  };

  const buttonStyle: React.CSSProperties = {
    width: '80%',
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
    flexShrink: 0,
    userSelect: 'none',
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#373737',
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: 'auto',
    padding: 'clamp(1rem, 4vh, 2rem) 0',
    color: '#4B5563',
    fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)',
    fontFamily: 'var(--font-body)',
    flexShrink: 0,
    userSelect: 'none',
  };

  // Focus outline style
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };


// RENDER



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
            style={{ height: logoHeight, width: 'auto', userSelect: 'none' }}
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
              onFocus={(e) => Object.assign(e.target.style, { ...inputStyle, ...inputFocusStyle })}
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
              onFocus={(e) => Object.assign(e.target.style, { ...inputStyle, ...inputFocusStyle })}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
              aria-required="true"
              placeholder="8 caracteres minimum"
              minLength={8}
              autoComplete="current-password"
            />
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

          <div style={forgotPasswordStyle}>
            <Link 
              href="/forgot-password" 
              style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle, linkStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, linkStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, linkStyle)}
              aria-label="Mot de passe oublie, cliquez pour reinitialiser"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

        <p style={footerStyle}>
          Pas encore de compte ?{' '}
          <Link 
            href="/register" 
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
