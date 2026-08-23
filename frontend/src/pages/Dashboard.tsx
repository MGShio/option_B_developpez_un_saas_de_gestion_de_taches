'use client';
// Dashboard.tsx - Page tableau de bord

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import { getAssignedTasks, searchTasks, type Task } from '@/services/taskService';
import { getDashboardStats, getProjectsWithTaskCounts, type DashboardStats, type ProjectWithTaskCount, type TaskSummary } from '@/services/dashboardService';
import { getProjects, createProject, type Project } from '@/services/projectService';
import CreateProjectModal, { type ModalCreateProjectData } from '@/components/CreateProjectModal';
import ProjectsWithTasksView from '@/components/ProjectsWithTasksView';
const checkmarkIcon = '/images/checkmark.svg';
const calendarIcon = '/images/calendaricon.svg';
const folderIconGrey = '/images/foldericongrey.svg';
const calendarIconGrey = '/images/calendaricongrey.svg';
const textBubbleGrey = '/images/textbubblegrey.svg';


// Couleurs des statuts - Conforme WCAG 2.1 AA
const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444', border: '#FECACA' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00', border: '#FED7AA' },
  'Terminé': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
};

// Libellés des statuts
const TASK_STATUS_LABELS: Record<string, string> = {
  'À faire': 'À faire',
  'En cours': 'En cours',
  'Terminé': 'Terminé',
};


// Composant Separator réutilisable
const Separator = () => (
  <div 
    style={{
      width: '0.0625rem', 
      height: '0.75rem', 
      background: '#9CA3AF', 
      transform: 'rotate(90deg)',
      userSelect: 'none',
    }}
    role="separator"
    aria-hidden="true"
  />
);

// Composant SearchIcon
const SearchIcon = ({ color = '#6B7280' }: { color?: string }) => (
  <svg width="0.875rem" height="0.875rem" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="0.0625rem" fill="none" />
    <path d="M10 10L13 13" stroke={color} strokeWidth="0.0625rem" strokeLinecap="round" />
  </svg>
);

// Icônes pour les vues
const CheckmarkIcon = ({ isActive }: { isActive: boolean }) => (
  <img src={checkmarkIcon} alt="Vue Liste" style={{ width: '1rem', height: '1rem', userSelect: 'none' }} />
);

const CalendarIcon = ({ isActive }: { isActive: boolean }) => (
  <img src={calendarIcon} alt="Vue Kanban" style={{ width: '1rem', height: '1rem', userSelect: 'none' }} />
);

// Meta icons for TaskCard
const FolderIconGrey = () => (
  <img src={folderIconGrey} alt="" style={{ width: '1rem', height: '1rem', userSelect: 'none' }} />
);

const CalendarIconGrey = () => (
  <img src={calendarIconGrey} alt="" style={{ width: '1rem', height: '1rem', userSelect: 'none' }} />
);

const TextBubbleGrey = () => (
  <img src={textBubbleGrey} alt="" style={{ width: '1rem', height: '1rem', userSelect: 'none' }} />
);

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();;
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'projects'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsWithStats, setProjectsWithStats] = useState<ProjectWithTaskCount[]>([]);

  // Handler for project click
  const handleProjectClick = useCallback((projectId: string) => {
    router.push('/projects/' + projectId);
  }, [router]);

  // Compute tasks by project for ProjectsWithTasksView
  const tasksByProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (!map.has(task.projectId)) {
        map.set(task.projectId, []);
      }
      map.get(task.projectId)?.push(task);
    });
    return map;
  }, [tasks]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [users] = useState<{ id: string; name: string; role?: string }[]>([]);
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
  const welcomeSectionWidth = isMobile ? '100%' : isTablet ? '70%' : '36vw';
  const mainContainerWidth = isMobile ? '100%' : isTablet ? '95%' : '88%';
  const tasksContainerWidth = isMobile ? '100%' : isTablet ? '95%' : '85%';

  const maxContentWidth = isMobile ? '100%' : '82vw';
  const titleSize = isMobile ? '1.5rem' : '1.75rem';
  const subtitleSize = isMobile ? '1rem' : '1.125rem';
  const sectionTitleSize = isMobile ? '1.125rem' : '1.25rem';
  const sectionSubtitleSize = isMobile ? '0.875rem' : '1rem';
  const taskTitleSize = isMobile ? '1rem' : '1.125rem';
  const taskDescriptionSize = isMobile ? '0.875rem' : '0.9375rem';
  const metaTextSize = isMobile ? '0.75rem' : '0.875rem';
  const statusBadgeSize = isMobile ? '0.75rem' : '0.875rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';
  const inputHeight = isMobile ? 'min(2.75rem, 6.5vh)' : 'min(3.3125rem, 4vh)';
  const containerPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2.5rem';

  // Récupérer les données
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = storage.getToken() || "";
      
      // Récupérer les tâches assignées
      const tasksData = await getAssignedTasks(token);
      setTasks(tasksData);
      
      // Récupérer les projets avec statistiques
      const projectsWithStatsData = await getProjectsWithTaskCounts(token);
      setProjectsWithStats(projectsWithStatsData);
      setProjects(projectsWithStatsData);
      
      // Récupérer les statistiques du dashboard
      const statsData = await getDashboardStats(token);
      setDashboardStats(statsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, router]);

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
      const token = storage.getToken() || "";
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
      const token = storage.getToken() || "";
      
      const createdProject = await createProject(token, newProject);
      setProjects(prev => [...prev, createdProject]);
      setIsCreateModalOpen(false);
      setNewProject({ name: '', description: '', contributorIds: [] });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet');
    }
  };

  // Obtenir le nom du projet à partir de l'ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  };


  // Focus outline style pour l'accessibilite
  const focusOutlineStyle: React.CSSProperties = {
    outline: '0.125rem solid var(--color-primary)',
    outlineOffset: '0.125rem',
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Welcome Section */}
      <div style={{
        width: mainContainerWidth,
        marginBottom: isMobile ? '2rem' : 'clamp(3rem, 8vh, 5rem)',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: containerPadding,
        paddingRight: containerPadding,
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '1.5rem' : '2vw',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{
            color: 'var(--color-secondary)',
            fontSize: titleSize,
            fontFamily: 'var(--font-heading)',
            fontWeight: '600', whiteSpace: 'nowrap',
            marginBottom: isMobile ? '0.75rem' : '0',
          }}>
            Tableau de bord
          </h1>
          <p style={{
            color: 'var(--color-black)',
            fontSize: subtitleSize,
            fontFamily: 'var(--font-body)',
            fontWeight: '400',
                            whiteSpace: 'nowrap',
                          }}>
            Bonjour {user?.name}, voici un aperçu de vos projets et tâches
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            height: isMobile ? 'min(3rem, 6.5vh)' : 'min(3.125rem, 4vh)',
            paddingLeft: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 4.625rem)',
            paddingRight: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 4.625rem)',
            background: 'var(--color-secondary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '0.625rem',
            fontSize: buttonFontSize,
            fontFamily: 'var(--font-body)',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, {
            height: isMobile ? 'min(3rem, 6.5vh)' : 'min(3.125rem, 4vh)',
            paddingLeft: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 4.625rem)',
            paddingRight: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 4.625rem)',
            background: 'var(--color-secondary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '0.625rem',
            fontSize: buttonFontSize,
            fontFamily: 'var(--font-body)',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            whiteSpace: 'nowrap',
            outline: '0.125rem solid var(--color-primary)',
            outlineOffset: '0.125rem',
          })}
          onBlur={(e) => Object.assign(e.currentTarget.style, {
            height: isMobile ? 'min(3rem, 6.5vh)' : 'min(3.125rem, 4vh)',
            paddingLeft: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 4.625rem)',
            paddingRight: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 4.625rem)',
            background: 'var(--color-secondary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '0.625rem',
            fontSize: buttonFontSize,
            fontFamily: 'var(--font-body)',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            whiteSpace: 'nowrap',
          })}
          aria-label="Créer un nouveau projet"
        >
          + Créer un projet
        </button>
      </div>

      {/* View Toggle */}
      <div style={{
        width: mainContainerWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: containerPadding,
        paddingRight: containerPadding,
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
            border: activeView === 'list' ? '0.0625rem solid var(--color-primary)' : '0.0625rem solid var(--color-border)',
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
            border: activeView === 'list' ? '0.0625rem solid var(--color-primary)' : '0.0625rem solid var(--color-border)',
          })}
          onBlur={(e) => Object.assign(e.currentTarget.style, {
            background: activeView === 'list' ? '#FFE8D9' : 'white',
            border: activeView === 'list' ? '0.0625rem solid var(--color-primary)' : '0.0625rem solid var(--color-border)',
          })}
          aria-pressed={activeView === 'list'}
          aria-label="Vue Liste"
        >
          <CheckmarkIcon isActive={activeView === 'list'} />
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
            border: activeView === 'kanban' ? '0.0625rem solid var(--color-primary)' : '0.0625rem solid var(--color-border)',
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
            border: activeView === 'kanban' ? '0.0625rem solid var(--color-primary)' : '0.0625rem solid var(--color-border)',
          })}
          onBlur={(e) => Object.assign(e.currentTarget.style, {
            background: activeView === 'kanban' ? '#FFE8D9' : 'white',
            border: activeView === 'kanban' ? '0.0625rem solid var(--color-primary)' : '0.0625rem solid var(--color-border)',
          })}
          aria-pressed={activeView === 'kanban'}
          aria-label="Vue Kanban"
        >
          <CalendarIcon isActive={activeView === 'kanban'} />
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
          padding: isMobile ? '2rem' : 'clamp(2rem, 8vh, 4rem)', 
          color: '#6B7280',
          fontSize: isMobile ? '0.875rem' : '1rem',
        }} aria-live="polite">
          Chargement des données...
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center', 
          padding: isMobile ? '2rem' : 'clamp(2rem, 8vh, 4rem)', 
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
              paddingLeft: isMobile ? '1rem' : 'clamp(1rem, 2vw, 1.5rem)', paddingRight: isMobile ? '1rem' : 'clamp(1rem, 2vw, 1.5rem)',
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

      ) : activeView === 'projects' ? (
        /* Vue Projets */
        <ProjectsWithTasksView
          projects={projectsWithStats}
          tasksByProject={tasksByProject}
          isLoading={isLoading}
          error={error}
          onProjectClick={handleProjectClick}
          isMobile={isMobile}
        />
      ) : (
        /* Vue Liste */
        <div style={{
          width: tasksContainerWidth,
          background: 'white',
          borderRadius: '0.625rem',
          border: '0.0625rem solid var(--color-border)',
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
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '1.5rem' : '0',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
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
              width: isMobile ? '100%' : 'min(22.3125rem, 25vw)',
              paddingLeft: isMobile ? '1rem' : 'clamp(1.5rem, 3vw, 2rem)', paddingRight: isMobile ? '1rem' : 'clamp(1.5rem, 3vw, 2rem)',
              background: 'white',
              borderRadius: '0.5rem',
              border: '0.0625rem solid var(--color-border)',
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
                  minHeight: '63px',
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
          }}>
            {tasks.length === 0 ? (
              <div style={{
                textAlign: 'center', 
                padding: isMobile ? '2rem' : 'clamp(2rem, 8vh, 4rem)',
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
                  onView={() => router.push(`/projects/${task.projectId}`)} 
                  isMobile={isMobile} 
                  isTablet={isTablet} 
                />
              ))
            )}
          </div>
        </div>
      )}


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
  const titleWidth = isMobile ? '100%' : 'min(9.5625rem, 12vw)';
  const metaGap = isMobile ? '0.75rem' : '0.9375rem';
  const taskTitleSize = isMobile ? `1rem` : `1.125rem`;
  const statusButtonPadding = isMobile ? '0.25rem 0.75rem' : '0.25rem 1rem';
  const statusButtonFontSize = isMobile ? '0.75rem' : '0.875rem';
  const viewButtonWidth = isMobile ? '100%' : 'min(7.5625rem, 9vw)';
  const viewButtonPadding = isMobile ? '0 1rem' : '0 1rem';

  return (
    <div style={{
      padding: `${cardPaddingY} ${cardPaddingX}`,
      background: 'white',
      borderRadius: '0.625rem',
      border: '0.0625rem solid var(--color-border)',
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
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.5rem' : '0.4375rem',
        }}>
          <h3 style={{ color: 'var(--color-secondary)', fontSize: taskTitleSize,
            fontFamily: 'var(--font-heading)',
            fontWeight: '600'
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
          justifyContent: 'left',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: isMobile ? '100%' : 'auto',
          }}>
            <FolderIconGrey />
            <span style={{
              color: '#6B7280',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
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
            width: isMobile ? '100%' : 'auto',
          }}>
            <CalendarIconGrey />
            <span style={{
              color: '#6B7280',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
              marginLeft: '0.5rem',
            }}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              }) : 'Non définie'}
            </span>
          </div>

          {!isMobile && <Separator />}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <TextBubbleGrey />
            <span style={{
              color: '#6B7280',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
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
            border: `0.0625rem solid ${colors.border}`,
            borderRadius: '6.25rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }} role="status" aria-label={`Statut : ${TASK_STATUS_LABELS[task.status] || task.status}`}>
            <span style={{
              color: colors.color,
              fontSize: statusButtonFontSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {TASK_STATUS_LABELS[task.status] || task.status}
            </span>
          </div>

          <button 
            onClick={onView}
            style={{
              width: '100%',
              height: isMobile ? 'min(2.75rem, 6.5vh)' : 'min(3.125rem, 4vh)',
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '0.5rem',
        }}>
          <div style={{
            padding: statusButtonPadding,
            background: colors.bg,
            border: `0.0625rem solid ${colors.border}`,
            borderRadius: '6.25rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }} role="status" aria-label={`Statut : ${TASK_STATUS_LABELS[task.status] || task.status}`}>
            <span style={{
              color: colors.color,
              fontSize: statusButtonFontSize,
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
            }}>
              {TASK_STATUS_LABELS[task.status] || task.status}
            </span>
          </div>

          <button 
            onClick={onView}
            style={{
              flex: 1,
              height: 'min(2.75rem, 2.8vh)',
              padding: '0 1rem',
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
  getProjectName: (projectId: string) => string; 
  isMobile: boolean; 
  isTablet: boolean; 
}) { 
  const router = useRouter();;
  
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
  const columnMinWidth = isMobile ? '80vw' : isTablet ? '30vw' : '24vw';
  const columnPadding = isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem';
  const statusIndicatorSize = isMobile ? '0.75rem' : '0.875rem';
  const statusTitleSize = isMobile ? '1rem' : '1.125rem';
  const countSize = isMobile ? '0.75rem' : '0.875rem';

  // Tailles adaptatives pour les cartes Kanban
  const kanbanCardPaddingX = isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem';
  const kanbanCardPaddingY = isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5625rem';
  const kanbanCardGap = isMobile ? '1.25rem' : '2rem';
  const kanbanHeaderGap = isMobile ? '0.5rem' : '2rem';
  const kanbanTitleSize = isMobile ? '1rem' : '1.125rem';
  const kanbanDescriptionSize = isMobile ? '0.875rem' : '0.9375rem';
  const kanbanMetaSize = isMobile ? '0.75rem' : '0.875rem';
  const kanbanMetaGap = isMobile ? '0.5rem' : '0.9375rem';
  const kanbanStatusPadding = isMobile ? '0.25rem 0.75rem' : '0.25rem 1rem';
  const kanbanStatusFontSize = isMobile ? '0.75rem' : '0.875rem';

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      gap: isMobile ? '1rem' : '1.5rem',
      overflowX: 'auto',
      paddingBottom: isMobile ? '1rem' : '1.25rem',
      paddingLeft: isMobile ? '0' : '2rem',
      margin: isMobile ? '0' : '0 auto',
      maxWidth: isMobile ? '100%' : '82vw',
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
              border: '0.0625rem solid var(--color-border)',
              padding: columnPadding,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.25rem',
            }}
          >
            {/* En-tête de la colonne */}
            <div style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 8,
              display: 'inline-flex',
            }}>
              <h3 style={{ color: 'var(--color-secondary)', fontSize: statusTitleSize,
                fontFamily: 'var(--font-heading)',
                fontWeight: '600'
              }}>
                {status}
              </h3>
              <div style={{
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 4,
                paddingBottom: 4,
                background: '#E5E7EB',
                overflow: 'hidden',
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                display: 'flex',
                height: 'fit-content',
              }}>
                <div style={{
                  color: '#6B7280',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: '400',
                  wordWrap: 'break-word',
                }}>
                  {statusTasks.length}
                </div>
              </div>
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
                statusTasks.map((task) => {
                  const taskColors = statusColors[task.status];
                  
                  return (
                    <div 
                      key={task.id}
                      style={{
                        padding: `${kanbanCardPaddingY} ${kanbanCardPaddingX}`,
                        background: 'white',
                        borderRadius: '0.625rem',
                        border: '0.0625rem solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: kanbanCardGap,
                      }}
                      role="article"
                      aria-label={`Tâche : ${task.title}, statut : ${TASK_STATUS_LABELS[task.status] || task.status}`}
                    >
                      {/* En-tête avec titre et statut */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        minWidth: 0,
                      }}>
                        <h4 style={{
                          color: 'var(--color-black)',
                          fontSize: kanbanTitleSize,
                          fontFamily: 'var(--font-heading)',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1,
                          minWidth: 0,
                        }}>
                          {task.title}
                        </h4>
                        <div style={{
                          padding: kanbanStatusPadding,
                          background: taskColors.bg,
                          border: `0.0625rem solid ${taskColors.border}`,
                          borderRadius: '6.25rem',
                          justifyContent: 'center',
                          alignItems: 'center',
                          display: 'flex',
                          height: 'fit-content',
                          flexShrink: 0,
                        }}>
                          <span style={{
                            color: taskColors.color,
                            fontSize: kanbanStatusFontSize,
                            fontFamily: 'var(--font-body)',
                            fontWeight: '400',
                          }}>
                            {TASK_STATUS_LABELS[task.status] || task.status}
                          </span>
                        </div>
                      </div>
                      <p style={{
                        color: '#6B7280',
                        fontSize: kanbanDescriptionSize,
                        fontFamily: 'var(--font-body)',
                        fontWeight: '400',
                      }}>
                        {task.description || 'Aucune description'}
                      </p>
                      <div style={{
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: kanbanMetaGap,
                        display: 'inline-flex',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: '0.5rem',
                          display: 'flex',
                        }}>
                          <FolderIconGrey />
                          <span style={{
                            color: '#6B7280',
                            fontSize: kanbanMetaSize,
                            fontFamily: 'var(--font-body)',
                            fontWeight: '400',
                          }}>
                            {getProjectName(task.projectId)}
                          </span>
                        </div>

                        <Separator />

                        <div style={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex',
                        }}>
                          <CalendarIconGrey />
                          <span style={{
                            color: '#6B7280',
                            fontSize: kanbanMetaSize,
                            fontFamily: 'var(--font-body)',
                            fontWeight: '400',
                            marginLeft: '0.5rem',
                          }}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            }) : 'Non définie'}
                          </span>
                        </div>

                        <Separator />

                        <div style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: '0.5rem',
                          display: 'flex',
                        }}>
                          <TextBubbleGrey />
                          <span style={{
                            color: '#6B7280',
                            fontSize: kanbanMetaSize,
                            fontFamily: 'var(--font-body)',
                            fontWeight: '400',
                          }}>
                            {task.assignees?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Bouton Voir - toujours en dessous des métadonnées */}
                      <div style={{
                        alignSelf: 'flex-start',
                        marginTop: isMobile ? '0.75rem' : '0',
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${task.projectId}`);
                          }}
                          style={{
                            width: isMobile ? '100%' : 'min(7.5625rem, 9vw)',
                            height: isMobile ? 'min(2.75rem, 6.5vh)' : 'min(3.125rem, 4vh)',
                            padding: '0 1rem',
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
                          aria-label={`Voir le projet : ${getProjectName(task.projectId)}`}
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}




