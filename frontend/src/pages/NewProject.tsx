import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { createProject, type CreateProjectData } from '../services/projectService';

export default function NewProject() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [newProject, setNewProject] = useState<CreateProjectData>({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const containerWidth = isMobile ? '90%' : isTablet ? '80%' : '60%';
  const maxContainerWidth = isMobile ? '100%' : '800px';
  const titleSize = isMobile ? '1.25rem' : '1.5rem';
  const labelSize = isMobile ? '0.875rem' : '0.9375rem';
  const inputSize = isMobile ? '0.875rem' : '0.9375rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';
  const paddingSize = '12px 16px';
  const containerPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
  const buttonPadding = '12px 24px';
  const gapSize = isMobile ? '1rem' : '1.5rem';

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setError('Le nom du projet est requis');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const createdProject = await createProject(token, newProject);
      navigate(`/projects/${createdProject.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Focus outline style pour l'accessibilite - WCAG 2.1 AA
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  return (
    <div 
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 100px)',
        backgroundColor: 'var(--color-background)',
        padding: containerPadding,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
      role="main"
      aria-label="Créer un nouveau projet"
    >
      <div style={{
        width: containerWidth,
        maxWidth: maxContainerWidth,
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: gapSize,
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h1 style={{
            color: '#1F1F1F',
            fontSize: titleSize,
            fontFamily: 'Manrope',
            fontWeight: 600,
          }}>
            Créer un nouveau projet
          </h1>
          <button
            onClick={() => navigate('/projects')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: isMobile ? '1.5rem' : '1.75rem',
              color: '#6B7280',
              padding: isMobile ? '8px' : '0',
              lineHeight: 1,
            }}
            aria-label="Fermer et retourner à la liste des projets"
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
          >
            ×
          </button>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: gapSize,
          }}
          aria-label="Formulaire de création de projet"
        >
          {/* Nom du projet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="project-name"
              style={{
                display: 'block',
                color: '#1F1F1F',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 500,
              }}
            >
              Nom du projet *
            </label>
            <input
              id="project-name"
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Application E-commerce"
              style={{
                width: '100%',
                padding: paddingSize,
                border: error && !newProject.name.trim() ? '2px solid #EF4444' : '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: inputSize,
                fontFamily: 'Inter',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              aria-required="true"
              aria-invalid={!!(error && !newProject.name.trim())}
              aria-describedby={error && !newProject.name.trim() ? 'name-error' : undefined}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            />
            {error && !newProject.name.trim() && (
              <span 
                id="name-error"
                style={{ 
                  color: '#EF4444', 
                  fontSize: '0.875rem', 
                  fontFamily: 'Inter',
                }}
                role="alert"
              >
                {error}
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="project-description"
              style={{
                display: 'block',
                color: '#1F1F1F',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 500,
              }}
            >
              Description
            </label>
            <textarea
              id="project-description"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du projet (optionnel)"
              rows={isMobile ? 4 : 6}
              style={{
                width: '100%',
                padding: paddingSize,
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: inputSize,
                fontFamily: 'Inter',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                minHeight: isMobile ? '100px' : '150px',
              }}
              aria-label="Description du projet"
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            />
          </div>

          {/* Message d'erreur général */}
          {error && newProject.name.trim() && (
            <div 
              style={{ 
                color: '#EF4444', 
                fontSize: '0.875rem',
                fontFamily: 'Inter',
                marginBottom: '1rem',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Boutons */}
          <div style={{
            display: 'flex',
            justifyContent: isMobile ? 'stretch' : 'flex-end',
            gap: isMobile ? '0.75rem' : '1rem',
            flexWrap: 'wrap',
          }}>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              style={{
                padding: buttonPadding,
                background: 'white',
                color: '#6B7280',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: buttonFontSize,
                fontFamily: 'Inter',
                fontWeight: 500,
                cursor: 'pointer',
                flex: isMobile ? '1' : 'none',
                minWidth: isMobile ? '120px' : 'auto',
              }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCreating || !newProject.name.trim()}
              style={{
                padding: buttonPadding,
                background: isCreating || !newProject.name.trim() ? '#9CA3AF' : '#1F1F1F',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: buttonFontSize,
                fontFamily: 'Inter',
                fontWeight: 500,
                cursor: isCreating || !newProject.name.trim() ? 'not-allowed' : 'pointer',
                flex: isMobile ? '1' : 'none',
                minWidth: isMobile ? '120px' : 'auto',
              }}
              aria-disabled={isCreating || !newProject.name.trim()}
              onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            >
              {isCreating ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
