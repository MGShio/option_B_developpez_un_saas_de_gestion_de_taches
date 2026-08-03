import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { getAssignedTasks, searchTasks, type Task } from '../services/taskService';
import { getProjects, createProject, type Project } from '../services/projectService';
import CreateProjectModal, { type ModalCreateProjectData } from '../components/CreateProjectModal';

// Couleurs des statuts - Conforme WCAG 2.1 AA
const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444', border: '#FECACA' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00', border: '#FED7AA' },
  'Terminé': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
};

// Composant Separator réutilisable
const Separator = () => (
  <div 
    style={{ 
      width: 1, 
      height: 12, 
      background: '#9CA3AF', 
      transform: 'rotate(90deg)' 
    }}
    role="separator"
    aria-hidden="true"
  />
);

// Composant SearchIcon
const SearchIcon = ({ color = '#6B7280' }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1" fill="none" />
    <path d="M10 10L13 13" stroke={color} strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// Icônes pour les vues
const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill={active ? '#D3590B' : '#6B7280'} />
  </svg>
);

const ListIconSmall = ({ active }: { active: boolean }) => (
  <svg width="9.71" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="9.71" height="8" fill={active ? '#D3590B' : '#6B7280'} />
  </svg>
);

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeView, setActiveView] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users] = useState<{ id: number; name: string; role?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modale de création de projet
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<ModalCreateProjectData>({ name: '', description: '', contributorIds: [] });

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
  const welcomeSectionWidth = isMobile ? '100%' : isTablet ? '70%' : '530px';
  const mainContainerWidth = isMobile ? '100%' : isTablet ? '95%' : '85%';
  const maxContentWidth = isMobile ? '100%' : '1200px';
  const titleSize = isMobile ? '1.5rem' : '1.75rem';
  const subtitleSize = isMobile ? '1rem' : '1.125rem';
  const sectionTitleSize = isMobile ? '1.125rem' : '1.25rem';
  const sectionSubtitleSize = isMobile ? '0.875rem' : '1rem';
  const taskTitleSize = isMobile ? '1rem' : '1.125rem';
  const taskDescriptionSize = isMobile ? '0.875rem' : '0.9375rem';
  const metaTextSize = isMobile ? '0.75rem' : '0.8125rem';
  const statusBadgeSize = isMobile ? '0.75rem' : '0.875rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';
  const inputHeight = isMobile ? '44px' : '53px';
  const containerPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2.5rem';

  // Récupérer les données
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Récupérer les tâches assignées
      const tasksData = await getAssignedTasks(token);
      setTasks(tasksData);
      
      // Récupérer les projets
      const projectsData = await getProjects(token);
      setProjects(projectsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Rechercher des tâches
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      await fetchData();
      return;
    }
    
    try {
      const token = storage.getToken();
      if (!token) return;
      
      const results = await searchTasks(token, query);
      setTasks(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
    }
  }, [fetchData]);

  // Gérer la création d'un projet
  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setError('Le nom du projet est requis');
      return;
    }
    
    setError(null);
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const createdProject = await createProject(token, newProject);
      setProjects(prev => [...prev, createdProject]);
      setIsCreateModalOpen(false);
      setNewProject({ name: '', description: '', contributorIds: [] });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet');
    }
  };

  // Obtenir le nom du projet à partir de l'ID
  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Focus outline style pour l'accessibilite
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Welcome Section */}
      <div style={{
        width: welcomeSectionWidth,
        maxWidth: maxContentWidth,
        marginBottom: isMobile ? '2rem' : '5rem',
      }}>
        <h1 style={{
          color: 'var(--color-secondary)',
          fontSize: titleSize,
          fontFamily: 'var(--font-heading)',
          fontWeight: '600',
          marginBottom: isMobile ? '0.75rem' : '0.875rem',
        }}>
          Tableau de bord
        </h1>
        <p style={{
          color: 'var(--color-black)',
          fontSize: subtitleSize,
          fontFamily: 'var(--font-body)',
          fontWeight: '400',
        }}>
          Bonjour {user?.name}, voici un aperçu de vos projets et tâches
        </p>
      </div>

      {/* View Toggle */}
      <div style={{
        display: 'flex',
        gap: isMobile ? '0.5rem' : '0.625rem',
        marginBottom: isMobile ? '2rem' : '2.5rem',
        flexWrap: 'wrap',
      }} role="radiogroup" aria-label="Choisir la vue">
        <button
          onClick={() => setActiveView('list')}
          style={{
            padding: isMobile ? '0.75rem 1rem' : '0.875rem 1rem',
            background: activeView === 'list' ? '#FFE8D9' : 'white',
            border: activeView === 'list' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.5rem' : '0.875rem',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            fontFamily: 'Inter',
            fontWeight: '400',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, {
            background: activeView === 'list' ? '#FFE8D9' : 'white',
            border: activeView === 'list' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          })}
          onBlur={(e) => Object.assign(e.currentTarget.style, {
            background: activeView === 'list' ? '#FFE8D9' : 'white',
            border: activeView === 'list' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          })}
          aria-pressed={activeView === 'list'}
          aria-label="Vue Liste"
        >
          <ListIcon active={activeView === 'list'} />
          <ListIconSmall active={activeView === 'list'} />
          <span style={{
            color: activeView === 'list' ? 'var(--color-primary)' : '#6B7280',
          }}>
            Liste
          </span>
        </button>
        <button
          onClick={() => setActiveView('kanban')}
          style={{
            padding: isMobile ? '0.75rem 1rem' : '0.875rem 1rem',
            background: activeView === 'kanban' ? '#FFE8D9' : 'white',
            border: activeView === 'kanban' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.5rem' : '0.875rem',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            fontFamily: 'Inter',
            fontWeight: '400',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, {
            background: activeView === 'kanban' ? '#FFE8D9' : 'white',
            border: activeView === 'kanban' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          })}
          onBlur={(e) => Object.assign(e.currentTarget.style, {
            background: activeView === 'kanban' ? '#FFE8D9' : 'white',
            border: activeView === 'kanban' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          })}
          aria-pressed={activeView === 'kanban'}
          aria-label="Vue Kanban"
        >
          <span style={{
            color: activeView === 'kanban' ? 'var(--color-primary)' : '#6B7280',
          }}>
            Kanban
          </span>
        </button>
      </div>

      {isLoading ? (
        <div style={{
          textAlign: 'center', 
          padding: isMobile ? '2rem' : '4rem', 
          color: '#6B7280',
          fontSize: isMobile ? '0.875rem' : '1rem',
        }} aria-live="polite">
          Chargement des données...
        </div>
      ) : error ? (
        <div style={{ 
          textAlign: 'center', 
          padding: isMobile ? '2rem' : '4rem', 
          color: '#EF4444',
          background: '#FEE2E2',
          borderRadius: '0.625rem',
          fontSize: isMobile ? '0.875rem' : '1rem',
        }} role="alert">
          {error}
          <button 
            onClick={fetchData}
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
      ) : activeView === 'kanban' ? (
        /* Vue Kanban */
        <KanbanView 
          tasks={tasks} 
          getProjectName={getProjectName} 
          isMobile={isMobile} 
          isTablet={isTablet}
        />
      ) : (
        /* Vue Liste */
        <div style={{
          width: mainContainerWidth,
          maxWidth: maxContentWidth,
          background: 'white',
          borderRadius: '0.625rem',
          border: '1px solid var(--color-border)',
          padding: containerPadding,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1.5rem' : '2.5rem',
          margin: isMobile ? '0' : '0 auto',
        }}>
          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '1.5rem' : '0',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '0.5rem' : '0.5rem',
            }}>
              <h2 style={{
                color: 'var(--color-secondary)',
                fontSize: sectionTitleSize,
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
              }}>
                Mes tâches assignées
              </h2>
              <p style={{
                color: '#6B7280',
                fontSize: sectionSubtitleSize,
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
              }}>
                Par ordre de priorité
              </p>
            </div>

            {/* Search Bar */}
            <div style={{
              width: isMobile ? '100%' : '357px',
              maxWidth: '100%',
              padding: isMobile ? '0.75rem 1rem' : '1.4375rem 2rem',
              background: 'white',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <input
                type="text"
                placeholder="Rechercher une tâche"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  color: '#6B7280',
                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '400',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                }}
                aria-label="Rechercher une tâche"
                autoComplete="off"
              />
              <SearchIcon color="#6B7280" />
            </div>
          </div>

          {/* Tasks List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.0625rem',
            width: '100%',
          }}>
            {tasks.length === 0 ? (
              <div style={{
                textAlign: 'center', 
                padding: isMobile ? '2rem' : '4rem',
                color: '#6B7280',
                fontSize: isMobile ? '0.875rem' : '1rem',
              }} aria-live="polite">
                Aucune tâche trouvée
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  projectName={getProjectName(task.projectId)} 
                  onView={() => navigate(`/projects/${task.projectId}`)}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Project Button */}
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        style={{
          position: 'fixed' as const,
          height: isMobile ? '48px' : '50px',
          padding: isMobile ? '0.75rem 1.5rem' : '0.8125rem 4.625rem',
          background: 'var(--color-secondary)',
          color: 'var(--color-white)',
          border: 'none',
          borderRadius: '0.625rem',
          fontSize: buttonFontSize,
          fontFamily: 'var(--font-body)',
          fontWeight: '400',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'background-color 0.2s ease',
          bottom: isMobile ? '80px' : '100px',
          left: isMobile ? '50%' : undefined,
          right: isMobile ? undefined : (isTablet ? '2rem' : '6.25rem'),
          transform: isMobile ? 'translateX(-50%)' : undefined,
          width: isMobile ? '90%' : 'auto',
          maxWidth: isMobile ? '300px' : undefined,
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

      {/* Modale de création de projet */}
      {isCreateModalOpen && (
        <CreateProjectModal
          onClose={() => {
            setIsCreateModalOpen(false);
            setNewProject({ name: '', description: '', contributorIds: [] });
            setError(null);
          }}
          onSubmit={handleCreateProject}
          users={users}
        />
      )}
    </div>
  );
}

// Composant TaskCard réutilisable
function TaskCard({ 
  task, 
  projectName, 
  onView, 
  isMobile,
  isTablet
}: { 
  task: Task; 
  projectName: string; 
  onView: () => void;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const colors = statusColors[task.status] || { bg: '#E5E7EB', color: '#6B7280', border: '#9CA3AF' };
  
  // Tailles adaptatives pour la carte
  const cardPaddingX = isMobile ? '1rem' : isTablet ? '1.5rem' : '2.5rem';
  const cardPaddingY = isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5625rem';
  const titleWidth = isMobile ? '100%' : '153px';
  const metaGap = isMobile ? '0.75rem' : '0.9375rem';
  const statusButtonPadding = isMobile ? '0.25rem 0.75rem' : '0.25rem 1rem';
  const statusButtonFontSize = isMobile ? '0.75rem' : '0.875rem';
  const viewButtonWidth = isMobile ? '100%' : '121px';
  const viewButtonPadding = isMobile ? '0.75rem' : '0.8125rem 0';

  return (
    <div style={{
      width: '100%',
      padding: `${cardPaddingY} ${cardPaddingX}`,
      background: 'white',
      borderRadius: '0.625rem',
      border: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '1rem' : '0',
    }} role="article" aria-label={`Tâche : ${task.title}`}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '0.75rem' : '2rem',
        width: isMobile ? '100%' : 'auto',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.5rem' : '0.4375rem',
          width: titleWidth,
        }}>
          <h3 style={{
            color: 'var(--color-black)',
            fontSize: isMobile ? '1rem' : '1.125rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
          }}>
            {task.title}
          </h3>
          <p style={{
            color: '#6B7280',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            fontFamily: 'var(--font-body)',
            fontWeight: '400',
          }}>
            {task.description || 'Aucune description'}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: metaGap,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'flex-start' : 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: isMobile ? '100%' : 'auto',
          }}>
            <span style={{
              color: '#6B7280',
              fontSize: isMobile ? '0.75rem' : '0.8125rem',
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {projectName}
            </span>
          </div>

          {!isMobile && <Separator />}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: isMobile ? '100%' : '62px',
          }}>
            <span style={{
              color: '#6B7280',
              fontSize: isMobile ? '0.75rem' : '0.8125rem',
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>

          {!isMobile && <Separator />}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <div style={{
              width: 15,
              height: 15,
              background: '#6B7280',
              borderRadius: '50%',
            }} aria-hidden="true" />
            <span style={{
              color: '#6B7280',
              fontSize: isMobile ? '0.75rem' : '0.8125rem',
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {task.assignees?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {!isMobile && (
        <div style={{
          width: viewButtonWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: isMobile ? '0.75rem' : '2.3125rem',
        }}>
          <div style={{
            padding: statusButtonPadding,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '9999px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }} role="status" aria-label={`Statut : ${task.status}`}>
            <span style={{
              color: colors.color,
              fontSize: statusButtonFontSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {task.status}
            </span>
          </div>

          <button 
            onClick={onView}
            style={{
              width: '100%',
              height: isMobile ? '44px' : '50px',
              padding: viewButtonPadding,
              background: 'var(--color-secondary)',
              color: 'var(--color-white)',
              border: 'none',
              borderRadius: '0.625rem',
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            aria-label={`Voir le projet : ${projectName}`}
          >
            Voir
          </button>
        </div>
      )}
      
      {isMobile && (
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '0.5rem',
        }}>
          <div style={{
            padding: statusButtonPadding,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '9999px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }} role="status" aria-label={`Statut : ${task.status}`}>
            <span style={{
              color: colors.color,
              fontSize: statusButtonFontSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {task.status}
            </span>
          </div>

          <button 
            onClick={onView}
            style={{
              flex: 1,
              height: '44px',
              padding: '0.75rem',
              background: 'var(--color-secondary)',
              color: 'var(--color-white)',
              border: 'none',
              borderRadius: '0.625rem',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            aria-label={`Voir le projet : ${projectName}`}
          >
            Voir
          </button>
        </div>
      )}
    </div>
  );
}

// Composant KanbanView
function KanbanView({ 
  tasks, 
  getProjectName, 
  isMobile,
  isTablet
}: { 
  tasks: Task[];
  getProjectName: (projectId: number) => string;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const navigate = useNavigate();
  
  // Regrouper les tâches par statut
  const tasksByStatus: Record<string, Task[]> = {
    'À faire': [],
    'En cours': [],
    'Terminé': [],
  };

  tasks.forEach(task => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  // Tailles adaptatives pour Kanban
  const columnMinWidth = isMobile ? '280px' : isTablet ? '300px' : '350px';
  const columnPadding = isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem';
  const statusIndicatorSize = isMobile ? '0.75rem' : '0.875rem';
  const statusTitleSize = isMobile ? '1rem' : '1.125rem';
  const countSize = isMobile ? '0.75rem' : '0.8125rem';
  const cardPadding = isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem';
  const cardTitleSize = isMobile ? '0.875rem' : '0.9375rem';
  const cardDescriptionSize = isMobile ? '0.75rem' : '0.8125rem';
  const cardMetaSize = isMobile ? '0.625rem' : '0.75rem';

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      gap: isMobile ? '1rem' : '1.5rem',
      overflowX: 'auto',
      paddingBottom: isMobile ? '1rem' : '1.25rem',
      paddingLeft: isMobile ? '0' : '2rem',
      margin: isMobile ? '0' : '0 auto',
      maxWidth: isMobile ? '100%' : '1200px',
    }} role="region" aria-label="Vue Kanban des tâches">
      {(['À faire', 'En cours', 'Terminé'] as const).map((status) => {
        const colors = statusColors[status];
        const statusTasks = tasksByStatus[status];
        
        return (
          <div 
            key={status} 
            style={{
              minWidth: columnMinWidth,
              maxWidth: isMobile ? '100%' : columnMinWidth,
              background: 'white',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-border)',
              padding: columnPadding,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.25rem',
            }}
          >
            {/* En-tête de la colonne */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
            }}>
              <div style={{
                width: 12,
                height: 12,
                background: colors.color,
                borderRadius: 3,
              }} aria-hidden="true" />
              <h3 style={{
                color: 'var(--color-secondary)',
                fontSize: statusTitleSize,
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
              }}>
                {status}
              </h3>
              <span style={{
                color: '#6B7280',
                fontSize: countSize,
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                marginLeft: 'auto',
              }}>
                {statusTasks.length}
              </span>
            </div>

            {/* Cartes des tâches */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '0.75rem' : '1rem',
            }}>
              {statusTasks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: isMobile ? '1.5rem' : '2rem',
                  color: '#9CA3AF',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontFamily: 'var(--font-body)',
                }} aria-live="polite">
                  Aucune tâche
                </div>
              ) : (
                statusTasks.map((task) => (
                  <div 
                    key={task.id}
                    style={{
                      padding: cardPadding,
                      background: '#F9FAFB',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => navigate(`/projects/${task.projectId}`)}
                    role="article"
                    aria-label={`Tâche : ${task.title}, statut : ${task.status}`}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') navigate(`/projects/${task.projectId}`); }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isMobile ? '0.5rem' : '0.75rem',
                    }}>
                      <h4 style={{
                        color: 'var(--color-secondary)',
                        fontSize: cardTitleSize,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '600',
                      }}>
                        {task.title}
                      </h4>
                      <p style={{
                        color: '#6B7280',
                        fontSize: cardDescriptionSize,
                        fontFamily: 'var(--font-body)',
                        fontWeight: '400',
                      }}>
                        {task.description || 'Aucune description'}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '0.5rem' : '0.75rem',
                        flexWrap: 'wrap',
                        marginTop: isMobile ? '0.5rem' : '0.75rem',
                      }}>
                        <span style={{
                          fontSize: cardMetaSize,
                          color: '#9CA3AF',
                          background: '#E5E7EB',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontFamily: 'var(--font-body)',
                          fontWeight: '400',
                        }}>
                          {getProjectName(task.projectId)}
                        </span>
                        <span style={{
                          fontSize: cardMetaSize,
                          color: '#9CA3AF',
                          fontFamily: 'var(--font-body)',
                          fontWeight: '400',
                        }}>
                          {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
