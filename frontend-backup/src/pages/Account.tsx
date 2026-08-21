// Account.tsx - Page compte utilisateur

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


export default function Account() {

  const { user, isAuthenticated, logout, updateProfile, updatePassword, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // États pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Form data pour le profil
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Form data pour le mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Gestion du resize pour le responsive
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialiser les données du profil
  useEffect(() => {
    if (user) {
      const firstName = user.name?.split(' ').slice(1).join(' ') || '';
      const lastName = user.name?.split(' ')[0] || '';
      setProfileForm({
        firstName,
        lastName,
        email: user.email || '',
      });
    }
  }, [user]);

  // Calcul des tailles responsives
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;
  
  const containerPadding = isMobile ? '20px' : '40px 59px';
  const containerWidth = isMobile ? '100%' : isTablet ? '95%' : '1215px';
  const maxContainerWidth = isMobile ? '100%' : '1215px';
  const titleSize = isMobile ? '1.25rem' : '1.125rem';
  const subtitleSize = isMobile ? '1rem' : '1rem';
  const labelSize = isMobile ? '0.875rem' : '0.875rem';
  const inputSize = isMobile ? '0.875rem' : '0.9375rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';
  const inputHeight = isMobile ? '48px' : 'auto';
  const inputPadding = isMobile ? '12px 14px' : '19px 17px';
  const buttonPadding = isMobile ? '13px 24px' : '13px 74px';
  const gapSize = isMobile ? '1rem' : '41px';

  // Focus outline style - WCAG 2.1 AA
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // Gestion de la soumission du profil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsUpdating(true);
    setUpdateSuccess(null);

    try {
      const fullName = `${profileForm.lastName} ${profileForm.firstName}`.trim();
      await updateProfile({
        name: fullName,
        email: profileForm.email,
      });
      setIsEditingProfile(false);
      setUpdateSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      // L'erreur est gérée par AuthContext et affichée via error
    } finally {
      setIsUpdating(false);
    }
  };

  // Gestion de la soumission du mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError(null);
    setIsUpdating(true);
    setUpdateSuccess(null);

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      setIsUpdating(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      setIsUpdating(false);
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setIsEditingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setUpdateSuccess('Mot de passe changé avec succès !');
    } catch (err) {
      // L'erreur est gérée par AuthContext
    } finally {
      setIsUpdating(false);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setIsEditingPassword(false);
    clearError();
    setPasswordError(null);
    if (user) {
      const firstName = user.name?.split(' ').slice(1).join(' ') || '';
      const lastName = user.name?.split(' ')[0] || '';
      setProfileForm({ firstName, lastName, email: user.email || '' });
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  // Styles
  const pageStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 'calc(100vh - 100px)',
    backgroundColor: 'var(--color-background)',
    padding: isMobile ? '1rem' : '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  };

  const containerStyle: React.CSSProperties = {
    width: containerWidth,
    maxWidth: maxContainerWidth,
    backgroundColor: 'var(--color-white)',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    padding: containerPadding,
    display: 'flex',
    flexDirection: 'column',
    gap: gapSize,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: isMobile ? '1rem' : '2.5rem',
    flexDirection: isMobile ? 'column' : 'row',
  };

  const titleStyle: React.CSSProperties = {
    color: 'var(--color-black)',
    fontSize: titleSize,
    fontFamily: 'Manrope',
    fontWeight: '600',
    margin: '0',
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#6B7280',
    fontSize: subtitleSize,
    fontFamily: 'Inter',
    fontWeight: '400',
    margin: '0',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: gapSize,
  };

  const fieldGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--color-black)',
    fontSize: labelSize,
    fontFamily: 'Inter',
    fontWeight: '400',
  };

  const inputStyle: React.CSSProperties = {
    height: inputHeight,
    padding: inputPadding,
    backgroundColor: 'var(--color-white)',
    borderRadius: '4px',
    border: '1px solid #E5E7EB',
    fontSize: inputSize,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#0F0F0F',
    outline: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    width: isMobile ? '100%' : 'auto',
    height: isMobile ? '48px' : '50px',
    padding: buttonPadding,
    backgroundColor: 'var(--color-black)',
    color: 'var(--color-white)',
    border: 'none',
    borderRadius: '10px',
    fontSize: buttonFontSize,
    fontFamily: 'Inter',
    fontWeight: '400',
    cursor: 'pointer',
    alignSelf: isMobile ? 'stretch' : 'flex-start',
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#6B7280',
    border: '1px solid #E5E7EB',
  };

  const buttonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: '1rem',
    flexWrap: 'wrap',
  };

  const successStyle: React.CSSProperties = {
    color: '#059669',
    fontSize: inputSize,
    fontFamily: 'Inter',
    fontWeight: '500',
    padding: '0.5rem',
    backgroundColor: '#D1FAE5',
    borderRadius: '4px',
  };

  const errorStyle: React.CSSProperties = {
    color: '#EF4444',
    fontSize: inputSize,
    fontFamily: 'Inter',
    fontWeight: '400',
    marginTop: '0.25rem',
  };

  const logoutButtonStyle: React.CSSProperties = {
    ...buttonSecondaryStyle,
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    border: '1px solid #FECACA',
    width: isMobile ? '100%' : 'auto',
    alignSelf: 'flex-end',
  };

  return (
    <div style={pageStyle} role="main" aria-label="Mon compte">
      <div style={containerStyle}>
        {/* En-tête */}
        <div style={headerStyle}>
          <div style={fieldGroupStyle}>
            <h1 id="account-title" style={titleStyle}>
              Mon compte
            </h1>
            <p style={subtitleStyle}>
              {user.name}
            </p>
          </div>
        </div>

        {updateSuccess && !isEditingProfile && !isEditingPassword && (
          <div style={successStyle} role="alert" aria-live="polite">
            {updateSuccess}
          </div>
        )}

        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} style={formStyle} aria-label="Formulaire d'édition du profil">
            {/* Nom */}
            <div style={fieldGroupStyle}>
              <label htmlFor="lastName" style={labelStyle}>
                Nom *
              </label>
              <input
                id="lastName"
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                placeholder="Votre nom de famille"
                style={inputStyle}
                required
                aria-required="true"
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              />
            </div>

            {/* Prénom */}
            <div style={fieldGroupStyle}>
              <label htmlFor="firstName" style={labelStyle}>
                Prénom *
              </label>
              <input
                id="firstName"
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                placeholder="Votre prénom"
                style={inputStyle}
                required
                aria-required="true"
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              />
            </div>

            {/* Email */}
            <div style={fieldGroupStyle}>
              <label htmlFor="email" style={labelStyle}>
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Votre adresse email"
                style={inputStyle}
                required
                aria-required="true"
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              />
            </div>

            {error && (
              <div style={errorStyle} role="alert">
                {error}
              </div>
            )}

            <div style={buttonsContainerStyle}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={buttonStyle}
                  aria-disabled={isUpdating}
                  onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                >
                  {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  style={buttonSecondaryStyle}
                  aria-disabled={isUpdating}
                  onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                >
                  Annuler
                </button>
              </div>
              <button
                onClick={logout}
                style={logoutButtonStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                aria-label="Se déconnecter"
              >
                Se déconnecter
              </button>
            </div>
          </form>
        ) : (
          <div style={formStyle} aria-label="Informations du profil">
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Nom</label>
              <div 
                style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}
                role="textbox"
                aria-readonly="true"
              >
                <span style={{ color: '#6B7280', fontSize: inputSize }}>
                  {profileForm.lastName || 'Non spécifié'}
                </span>
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Prénom</label>
              <div 
                style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}
                role="textbox"
                aria-readonly="true"
              >
                <span style={{ color: '#6B7280', fontSize: inputSize }}>
                  {profileForm.firstName || 'Non spécifié'}
                </span>
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Email</label>
              <div 
                style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}
                role="textbox"
                aria-readonly="true"
              >
                <span style={{ color: '#6B7280', fontSize: inputSize }}>
                  {profileForm.email}
                </span>
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Mot de passe</label>
              <div 
                style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}
                role="textbox"
                aria-readonly="true"
              >
                <span style={{ color: '#6B7280', fontSize: inputSize }}>
                  ••••••••••••
                </span>
              </div>
            </div>

            <div style={buttonsContainerStyle}>
              <button
                onClick={() => {
                  clearError();
                  setIsEditingProfile(true);
                }}
                style={buttonStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                aria-label="Modifier les informations du profil"
              >
                Modifier les informations
              </button>
              <button
                onClick={logout}
                style={logoutButtonStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                aria-label="Se déconnecter"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
