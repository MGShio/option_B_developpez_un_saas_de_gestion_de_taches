// Projects.tsx - Page liste des projets

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth, type User } from '../contexts/AuthContext';
import EditProjectModal from '../components/EditProjectModal';
import { canDeleteProject, canModifyProject, hasProjectAccess } from '../utils/permissions';
import { storage } from '../utils/storage';

import { getProjects, deleteProject, type Project } from '../services/projectService';

import { getProjectTasks, type Task } from '../services/taskService';
import equipeIcon from '../images/equipeicon.svg';

// Couleurs des statuts - Conforme WCAG 2.1 AA


const statusColors: Record<string, { bg: string; color: string }> = {
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
  'En attente': { bg: '#FFE0E0', color: '#EF4444' },
};




export default function Projects() {



  const { user, isAuthenticated } = useAuth();

  const navigate = useNavigate();


  const [windowWidth, setWindowWidth] = useState(window.innerWidth);


  const [searchQuery] = useState('');


  const [projects, setProjects] = useState<Project[]>([]);


  const [isLoading, setIsLoading] = useState(true);


  const [error, setError] = useState<string | null>(null);


  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Gestion du resize pour le responsive

  useEffect(() => {

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

// RENDER

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcul des tailles responsives

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;
  
  // Tailles adaptatives
  const headerWidth = isMobile ? '100%' : isTablet ? '95%' : '80.97vw';

  const containerPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2.5rem';
  const titleSize = isMobile ? '1.5rem' : '1.75rem';
  const subtitleSize = isMobile ? '1rem' : '1.125rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';
  const gridGap = isMobile ? '1rem' : '1.5rem';
  const cardPadding = isMobile ? '1rem' : isTablet ? '1.25rem' : '2rem';
  const cardGap = isMobile ? '1rem' : '1.5rem';

  // Récupérer les projets


  const fetchProjects = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const projectsData = await getProjects(token);
      
      // Pour chaque projet, récupérer le nombre de tâches
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project: Project) => {
          try {
            const tasks = await getProjectTasks(token, project.id);

            const completedTasks = tasks.filter((t: Task) => t.status === 'Terminé').length;
            return {
              ...project,
              tasksCount: tasks.length,
              completedTasks,
              progress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
            };
          } catch {
            return project;
          }
        })
      );
      
      setProjects(projectsWithTasks);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);


  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

  // Supprimer un projet



  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }
    
    setDeletingId(projectId);
    setError(null);
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      await deleteProject(token, projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du projet');
    } finally {
      setDeletingId(null);
    }
  };

  // Extraire les initiales du nom


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Obtenir la couleur du statut

  const getStatusColor = (status: string) => {
    return statusColors[status] || { bg: '#E5E7EB', color: '#6B7280' };
  };

  // Filtrer les projets

  const filteredProjects = projects.filter((p: Project) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Focus outline style pour l'accessibilite
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };


// RENDER



  return (
    <div style={{ 
      width: '100%',
      padding: isMobile ? '1rem' : '0',
    }}>
      <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: headerWidth,
          margin: isMobile ? '0 auto 2rem' : '0 auto 3rem',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1.5rem' : '0',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h1 style={{
              color: 'var(--color-secondary)',
              fontSize: titleSize,
              fontFamily: 'var(--font-heading)',
              fontWeight: '600',
              margin: '0',
              marginBottom: isMobile ? '0.75rem' : '0',
            }}>
              Mes projets
            </h1>
            <p style={{
              color: 'var(--color-black)',
              fontSize: subtitleSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              Gérez vos projets
            </p>
          </div>
          
          <button
            onClick={() => navigate('/projects/new')}
            style={{
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '300px' : '200px',
              height: isMobile ? '48px' : '50px',
              padding: isMobile ? '0.75rem 1.5rem' : '0.8125rem 2rem',
              background: 'var(--color-secondary)',
              color: 'var(--color-white)',
              border: 'none',
              borderRadius: '0.625rem',
              fontSize: buttonFontSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, {
              background: 'var(--color-secondary)',
              color: 'var(--color-white)',
            })}
            onBlur={(e) => Object.assign(e.currentTarget.style, {
              background: 'var(--color-secondary)',
              color: 'var(--color-white)',
            })}
            aria-label="Créer un nouveau projet"
          >
            + Créer un projet
          </button>
        </div>

      {isLoading ? (
        <div style={{
          textAlign: 'center', 
          padding: isMobile ? '2rem' : '4rem', 
          color: '#6B7280',
          fontSize: isMobile ? '0.875rem' : '1rem',
        }} aria-live="polite">
          Chargement des projets...
        </div>
      ) : error ? (
        <div style={{ 
          textAlign: 'center', 
          padding: isMobile ? '2rem' : '4rem', 
          color: '#EF4444',
          background: '#FEE2E2',
          borderRadius: '0.625rem',
          fontSize: isMobile ? '0.875rem' : '1rem',
          margin: '0 auto',
        }} role="alert">
          {error}
          <button 
            onClick={fetchProjects}
            style={{
              marginLeft: '1rem',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              padding: isMobile ? '0.5rem 1rem' : '0.5rem 1.5rem',
              cursor: 'pointer',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
            }}
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div style={{
          width: headerWidth,
          margin: '0 auto',
          marginBottom: 'clamp(3rem, 8vh, 5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1.5rem' : '2rem',
        }}>
          {/* Grille de projets */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '20px',
            width: '100%',
          }} role="list" aria-label="Liste des projets">
            {filteredProjects.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: isMobile ? '2rem' : '4rem',
                color: '#6B7280',
                fontSize: isMobile ? '0.875rem' : '1rem',
              }} aria-live="polite">
                Aucun projet trouvé
              </div>
            ) : (
              filteredProjects.map((project: Project & { tasksCount?: number; completedTasks?: number; progress?: number }) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  navigate={navigate}
                  getInitials={getInitials}
                  getStatusColor={getStatusColor}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant ProjectCard

function ProjectCard({ 
  project, 
  navigate,
  getInitials,
  getStatusColor,
  isMobile,
  isTablet
}: { 
  project: Project & {
    tasksCount?: number;
    completedTasks?: number;
    progress?: number;
  };
  navigate: (path: string) => void;
  getInitials: (name: string) => string;
  getStatusColor: (status: string) => { bg: string; color: string };
  isMobile: boolean;
  isTablet: boolean;
}) {
  const colors = getStatusColor('En attente');
  
  // Obtenir les membres réels du projet
  const members = [
    { id: project.ownerId, name: project.owner?.name || 'Propriétaire', role: 'Propriétaire' },
    ...(project.members?.map(m => ({
      id: m.user.id,
      name: m.user.name,
      role: m.role
    })) || [])
  ];
  
  // Focus outline style
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  // Tailles adaptatives pour la carte
  const cardPadding = isMobile ? '1rem' : isTablet ? '1.25rem' : '2rem';
  const cardGap = isMobile ? '1.25rem' : '2rem';
  const titleSize = isMobile ? '1.125rem' : '1.25rem';
  const descriptionSize = isMobile ? '0.875rem' : '0.9375rem';
  const metaSize = isMobile ? '0.75rem' : '0.8125rem';
  const progressSize = isMobile ? '0.875rem' : '0.875rem';
  const teamLabelSize = isMobile ? '0.75rem' : '0.75rem';
  const avatarSize = isMobile ? '24px' : '27px';
  const avatarFontSize = isMobile ? '0.625rem' : '0.625rem';
  const buttonFontSize = isMobile ? '0.75rem' : '0.875rem';
  const badgeFontSize = isMobile ? '0.75rem' : '0.875rem';
  const progressBarHeight = isMobile ? '6px' : '7px';


// RENDER



  return (
    <div style={{
      width: 'auto',
      padding: cardPadding,
      background: 'white',
      borderRadius: '0.625rem',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: cardGap,
      cursor: 'pointer',
    }} role="listitem" aria-label={`Projet : ${project.name}`} onClick={() => navigate(`/projects/${project.id}`)}>
      {/* Contenu principal */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '0.5rem' : '0.5rem',
      }}>
        <h3 style={{
          color: 'var(--color-secondary)',
          fontSize: titleSize,
          fontFamily: 'var(--font-heading)',
          fontWeight: '600',
        }}>
          {project.name}
        </h3>
        <p style={{
          color: '#6B7280',
          fontSize: descriptionSize,
          fontFamily: 'var(--font-body)',
          fontWeight: '400',
        }}>
          {project.description || 'Aucune description'}
        </p>
      </div>

      {/* Progression */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: isMobile ? '0.75rem' : '1rem',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
          <span style={{
            color: '#6B7280',
            fontSize: metaSize,
            fontFamily: 'var(--font-body)',
            fontWeight: '400',
          }}>
            Progression
          </span>
          <span style={{
            textAlign: 'right',
            color: 'var(--color-secondary)',
            fontSize: progressSize,
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
          }}>
            {project.progress || 0}%
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.5rem' : '0.5rem',
          width: '100%',
        }}>
          {/* Barre de progression */}
          <div style={{
            height: progressBarHeight,
            background: 'var(--color-border)',
            borderRadius: '9999px',
            position: 'relative',
            overflow: 'hidden',
          }} aria-hidden="true">
            <div style={{
              height: '100%',
              width: `${project.progress || 0}%`,
              background: project.progress === 100 ? '#059669' : 'var(--color-primary)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              color: '#6B7280',
              fontSize: metaSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {project.completedTasks || 0}/{project.tasksCount || 0} tâches terminées
            </span>
          </div>
        </div>
      </div>

      {/* Équipe */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: isMobile ? '0.75rem' : '1rem',
      }}>
        <div style={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '0.5rem',
          display: 'inline-flex',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <img src={equipeIcon} alt="" style={{ width: '1rem', height: '1rem', userSelect: 'none' }} />
            <span style={{
              color: '#6B7280',
              fontSize: teamLabelSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              Équipe ({members.length})
            </span>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          width: '100%',
        }}>
            <div style={{
              width: avatarSize,
              height: avatarSize,
              background: '#FFE8D9',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }} aria-hidden="true">
              <span style={{
                textAlign: 'center',
                color: 'var(--color-secondary)',
                fontSize: avatarFontSize,
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                lineHeight: 1,
              }}>
                {getInitials(members[0].name)}
              </span>
            </div>
            <div style={{
              padding: isMobile ? '0.25rem 0.75rem' : '0.25rem 1rem',
              background: '#FFE8D9',
              borderRadius: '9999px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'fit-content',
            }}>
              <span style={{
                color: 'var(--color-primary)',
                fontSize: badgeFontSize,
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
              }}>
                Propriétaire
              </span>
            </div>
            {members.slice(1).map((member) => (
              <div key={member.id} style={{
                width: avatarSize,
                height: avatarSize,
                background: '#E5E7EB',
                borderRadius: '50%',
                outline: '1px white solid',
                outlineOffset: '-1px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }} aria-hidden="true">
                <span style={{
                  textAlign: 'center',
                  color: 'var(--color-secondary)',
                  fontSize: avatarFontSize,
                  fontFamily: 'var(--font-body)',
                  fontWeight: '400',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px',
                  lineHeight: 1,
                }}>
                  {getInitials(member.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}










