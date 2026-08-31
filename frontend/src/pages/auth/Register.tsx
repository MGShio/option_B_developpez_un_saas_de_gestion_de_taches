'use client';
// ============================================
// Register.tsx - Page d'inscription
// ============================================
// ROLE: Page d'inscription permettant a un nouvel utilisateur de :
// - Creer un compte avec nom, email et mot de passe
// - Se connecter si deja inscrit
//
// DEPENDANCES :
// - react : Pour les hooks (useState, useEffect)
// - next/navigation : Pour la navigation (useRouter, Link)
// - next/link : Pour les liens de navigation
// - @/contexts/AuthContext : Pour la fonction register() et la gestion des erreurs
//

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';


// ============================================
// IMPORTS LOCAUX
// ============================================

// Import de l'image de fond locale
const registerBackground = '/images/signinbackground.svg';

// Import du logo
const logoOrange = '/images/logoorange.svg';


// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function Register() {

  // ============================================
  // 1. ETATS (STATE MANAGEMENT)
  // ============================================

  // Etat pour le formulaire d'inscription
  const [name, setName] = useState('');             // Nom complet de l'utilisateur
  const [email, setEmail] = useState('');           // Adresse email de l'utilisateur
  const [password, setPassword] = useState('');     // Mot de passe de l'utilisateur
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation du mot de passe

  // Etats pour la largeur et hauteur de la fenetre - utilise pour le responsive design
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  const [windowHeight, setWindowHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 900);

  // Recuperation du contexte d'authentification
  // - register : Fonction async pour creer un nouveau compte (name, email, password) -> appel API POST /auth/register
  // - isLoading : Booleen indiquant si une requete d'inscription est en cours
  // - error : Message d'erreur global (ex: email deja utilise)
  // - clearError : Fonction pour effacer les erreurs
  const { register, isLoading, error, clearError } = useAuth();

  // Router Next.js pour la redirection après inscription
  const router = useRouter();

  // ============================================
  // 2. EFFETS (USE EFFECT)
  // ============================================

  // EFFET: Reset des marges du body pour eviter les bordures blanches
  // Ce useEffect s'execute une fois au montage pour nettoyer le style du body
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';

    // Nettoyage: Restore les styles par defaut lors du demontage
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.minHeight = '';
      document.body.style.overflow = '';
    };
  }, []);

  // EFFET: Gestion du resize pour le responsive design
  // Met a jour windowWidth et windowHeight a chaque redimensionnement de la fenetre
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Nettoyage: Suppression de l'ecouteur lors du demontage
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // 3. GESTIONNAIRES D'EVENEMENTS
  // ============================================

  // Gestion de la soumission du formulaire d'inscription
  // @param e {React.FormEvent} - Evenement de soumission du formulaire
  // @action:
  //   1. Empeche le comportement par defaut du formulaire
  //   2. Efface les erreurs precedentes
  //   3. Valide que password === confirmPassword
  //   4. Appelle la fonction register() du contexte avec name, email, password
  //   5. Redirige vers /dashboard en cas de succes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // VALIDATION: Verification que les mots de passe correspondent
    if (password !== confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    
    try {
      await register({ name, email, password });
      router.push('/dashboard');
    } catch (err) {
      // L'erreur est geree par AuthContext et affichee via le state 'error'
      // Pas de traitement supplementaire necessaire ici
    }
  };

  // ============================================
  // 4. VARIABLES DE STYLE RESPONSIVE
  // ============================================

  // Determination du type d'appareil en fonction de la largeur
  const isMobile = windowWidth <= 768;    // <= 768px = Mobile
  const isTablet = windowWidth <= 1024;   // <= 1024px = Tablette

  // Largeur du card : 90% sur mobile, 45% sur tablette, 39% sur desktop (562px/1440px)
  const cardWidth = isMobile ? '90%' : isTablet ? '45%' : '39%';
  const padding = isMobile ? '1.5rem' : isTablet ? '2rem' : 'clamp(1.5rem, 4vw, 4rem)';
  const titleSize = isMobile ? '1.75rem' : '2rem';
  const inputPadding = isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem';
  const logoHeight = isMobile ? '28px' : '36px';

  // Marges pour le logo
  const logoMarginBottom = isMobile ? '1.5rem' : isTablet ? '2rem' : 'clamp(2rem, 8vh, 3rem)';

  // Etat pour le bouton: desactive si chargement en cours, pas de password, ou password != confirmPassword
  const isButtonDisabled = isLoading || !password || password !== confirmPassword;

  // ============================================
  // 5. STYLES DES COMPOSANTS (WCAG 2.1 AA compliant)
  // ============================================

  // Style du conteneur principal (pleine page)
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundImage: `url(${registerBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    margin: 0,
    padding: 0,
    overflowY: 'auto',
    userSelect: 'none',
  };

  // Style de la carte d'inscription (conteneur blanc)
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

  // Style du conteneur du logo
  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '19.73vh',
    flexShrink: 0,
    userSelect: 'none',
  };

  // Style du titre "Inscription"
  const titleStyle: React.CSSProperties = {
    fontSize: titleSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-heading)',
    flexShrink: 0,
    userSelect: 'none',
  };

  // Style des messages d'erreur
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

  // Style du formulaire d'inscription
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

  // Style des labels
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-body)',
    userSelect: 'none',
  };

  // Style des inputs
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

  // Style des inputs au focus
  const inputFocusStyle: React.CSSProperties = {
    borderColor: 'transparent',
    boxShadow: '0 0 0 3px rgba(211, 89, 11, 0.3)',
  };

  // Style des messages d'aide (hints)
  const hintStyle: React.CSSProperties = {
    fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)',
    color: '#6B7280',
    marginTop: '0.25rem',
    fontFamily: 'var(--font-body)',
    userSelect: 'none',
  };

  // Style des messages d'erreur (hints)
  const errorHintStyle: React.CSSProperties = {
    fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)',
    color: '#EF4444',
    marginTop: '0.25rem',
    fontFamily: 'var(--font-body)',
    userSelect: 'none',
  };

  // Style du bouton d'inscription
  const buttonStyle: React.CSSProperties = {
    width: '80%',
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-white)',
    padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    border: 'none',
    cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
    opacity: isButtonDisabled ? 0.7 : 1,
    fontFamily: 'var(--font-body)',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
    userSelect: 'none',
  };

  // Style du bouton d'inscription au survol
  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#373737',
  };

  // Style du footer (Deja inscrit ?)
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

  // Style des liens
  const linkStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)',
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
    borderBottom: '1px solid var(--color-primary)',
    userSelect: 'none',
  };

  // Style des liens au survol
  const linkHoverStyle: React.CSSProperties = {
    textDecoration: 'underline',
  };

  // Style de focus pour l'accessibilite WCAG 2.1 AA
  // Applique dynamiquement via onFocus sur les elements interactifs
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  // ============================================
  // 6. RENDU (RENDER)
  // ============================================

  return (
    <div style={containerStyle} role="main" aria-label="Page d'inscription">
      <div 
        style={cardStyle}
        aria-labelledby="register-title"
        aria-describedby="register-form"
      >
        {/* LOGO - Logo de l'application */}
        <div style={logoContainerStyle}>
          <img
            src={logoOrange}
            alt="Logo de l'application"
            style={{ height: logoHeight, width: 'auto', userSelect: 'none' }}
          />
        </div>
        
        {/* TITRE - Titre de la page */}
        <h1 id="register-title" style={titleStyle}>Inscription</h1>

        {/* MESSAGE D'ERREUR - Affichage des erreurs d'inscription */}
        {error && (
          <div 
            style={errorStyle}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* FORMULAIRE D'INSCRIPTION */}
        <form 
          onSubmit={handleSubmit} 
          style={formStyle}
          id="register-form"
          aria-label="Formulaire d'inscription"
        >
          {/* CHAMP NOM */}
          <div>
            <label htmlFor="name" style={labelStyle}>
              Nom
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, { ...inputStyle, ...inputFocusStyle })}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
              aria-required="true"
              placeholder="Votre nom"
              autoComplete="name"
            />
          </div>

          {/* CHAMP EMAIL */}
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email
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

          {/* CHAMP MOT DE PASSE */}
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
              autoComplete="new-password"
            />
            <p style={hintStyle}>Minimum 8 caracteres</p>
          </div>

          {/* CHAMP CONFIRMER MOT DE PASSE */}
          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, { ...inputStyle, ...inputFocusStyle })}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
              aria-required="true"
              placeholder="Confirmez votre mot de passe"
              autoComplete="new-password"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p style={errorHintStyle}>Les mots de passe ne correspondent pas</p>
            )}
          </div>

          {/* BOUTON D'INSCRIPTION */}
          <button
            type="submit"
            disabled={isButtonDisabled}
            style={buttonStyle}
            onMouseEnter={(e) => !isButtonDisabled && Object.assign(e.currentTarget.style, buttonHoverStyle, buttonStyle)}
            onMouseLeave={(e) => !isButtonDisabled && Object.assign(e.currentTarget.style, buttonStyle)}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, buttonStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
            aria-busy={isLoading}
            aria-disabled={isButtonDisabled}
          >
            {isLoading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        {/* FOOTER - Lien vers la page de connexion */}
        <p style={footerStyle}>
          Deja inscrit ?{' '}
          <Link 
            href="/login" 
            style={linkStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, linkHoverStyle, linkStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, linkStyle)}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, linkStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, linkStyle)}
            aria-label="Aller a la page de connexion"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
