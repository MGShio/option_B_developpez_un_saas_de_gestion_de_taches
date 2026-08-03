import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { getProjectById, deleteProject, type Project } from '../services/projectService';
import { getProjectTasks, updateTask, createTask, type Task, type CreateTaskData } from '../services/taskService';
import AITaskListModal from '../components/AITaskListModal';
import EditProjectModal from '../components/EditProjectModal';
import EditTaskModal from '../components/EditTaskModal';

// Couleurs des statuts
const statusColors: Record<string, { bg: string; color: string }> = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
};

// Icônes
const BackIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill="#D3590B" />
  </svg>
);

const CalendarIcon = ({ size = 9.71 }: { size?: number }) => (
  <svg width={size} height={8} viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="9.71" height="8" fill="#D3590B" />
  </svg>
);

const SearchIcon = ({ size = 14, color = '#6B7280' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1" fill="none" />
    <path d="M10 10L13 13" stroke={color} strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const DownArrowIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={8} viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L8 6L14 2" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4L8 12M8 12L12 8M8 12L4 8" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 3.5H13.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3.5V4.5C12 4.79565 11.8946 5.08345 11.6967 5.28137C11.4988 5.47929 11.2109 5.58137 11 5.58137H5C4.7891 5.58137 4.5012 5.47929 4.3033 5.28137C4.1054 5.08345 4 4.79565 4 4.5V3.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6.5V12.5C6 13.0523 6.44772 13.5 7 13.5H9C9.55228 13.5 10 13.0523 10 12.5V6.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12.5V2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 2.5H10.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [project, setProject] = useState<Project | null>(null);

  // Vérifier si l'utilisateur actuel est le propriétaire du projet
  const isOwner = user?.id === project?.ownerId;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [activeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modale de création de tâche
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isAITaskModalOpen, setIsAITaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: number; title: string; description: string; dueDate: string; assigneeIds: string[]; status: 'À faire' | 'En cours' | 'Terminé' } | null>(null);
  const [editingProject, setEditingProject] = useState<{ id: number; name: string; description: string; contributorIds: number[] } | null>(null);
  const [newTask, setNewTask] = useState<Omit<CreateTaskData, 'projectId'>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Moyenne',
  });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'À faire' | 'En cours' | 'Terminé'>('À faire');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const containerPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2.5rem';
  const maxContentWidth = isMobile ? '100%' : '1400px';
  const titleSize = isMobile ? '1.25rem' : '1.5rem';
  const subtitleSize = isMobile ? '0.875rem' : '1rem';
  const sectionTitleSize = isMobile ? '1.125rem' : '1.25rem';
  const sectionSubtitleSize = isMobile ? '0.875rem' : '1rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';
  const iconSize = isMobile ? 20 : 24;
  const backButtonSize = isMobile ? 48 : 57;
  const backButtonPadding = isMobile ? 16 : 24;

  // Focus outline style pour l'accessibilite - WCAG 2.1 AA
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
  };

  // Récupérer les données du projet et ses tâches
  const fetchData = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Récupérer le projet
      const projectData = await getProjectById(token, parseInt(id));
      setProject(projectData);
      
      // Récupérer les tâches du projet
      const tasksData = await getProjectTasks(token, parseInt(id));
      setTasks(tasksData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du projet');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchData();
    }
  }, [isAuthenticated, id, fetchData]);

  // Supprimer le projet
  const handleDeleteProject = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      await deleteProject(token, project!.id);
      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du projet');
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  // Extraire les initiales
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = activeFilter === 'all' || task.status === activeFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Changer le statut d'une tâche
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      await updateTask(token, parseInt(id!), taskId, { status: newStatus as Task['status'] });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  // Créer une nouvelle tâche
  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.dueDate) {
      setError('Le titre et la date d\'échéance sont requis');
      return;
    }
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const taskData: CreateTaskData = {
        ...newTask,
        projectId: parseInt(id!),
        priority: newTask.priority as 'Faible' | 'Moyenne' | 'Haute',
      };
      
      const createdTask = await createTask(token, taskData);
      setTasks(prev => [...prev, createdTask]);
      setIsCreateTaskModalOpen(false);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'Moyenne' });
      setSelectedAssignees([]);
      setSelectedStatus('À faire');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la tâche');
    }
  };

  // Statuts disponibles
  const statusOptions = [
    { label: 'À faire', value: 'À faire' as const, color: '#FFE0E0', textColor: '#EF4444' },
    { label: 'En cours', value: 'En cours' as const, color: '#FFF0D7', textColor: '#E08D00' },
    { label: 'Terminé', value: 'Terminé' as const, color: '#D1FAE5', textColor: '#059669' },
  ];

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div 
        style={{ 
          textAlign: 'center', 
          padding: isMobile ? '2rem' : '4rem', 
          color: '#6B7280',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="status"
        aria-live="polite"
      >
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div 
        style={{ 
          textAlign: 'center', 
          padding: isMobile ? '2rem' : '4rem', 
          color: '#EF4444',
          background: '#FEE2E2',
          borderRadius: 10,
          margin: containerPadding,
        }}
        role="alert"
      >
        {error}
        <button 
          onClick={fetchData}
          style={{ 
            marginLeft: 16,
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: buttonFontSize,
          }}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div 
        style={{ 
          textAlign: 'center', 
          padding: isMobile ? '2rem' : '4rem',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Projet non trouvé
      </div>
    );
  }

  // Mock des contributeurs
  const contributors = [
    { id: project.ownerId, name: project.owner?.name || 'Propriétaire', role: 'Propriétaire' },
    { id: 2, name: 'Bertrand Dupont', role: '' },
    { id: 3, name: 'Anne Dupont', role: '' },
  ];
  const users = contributors;

  // Calcul des dimensions responsives pour le layout
  const headerGap = isMobile ? '1rem' : '1.5rem';
  const descriptionWidth = isMobile ? '100%' : isTablet ? '70%' : '60%';
  const tasksContainerPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
  const filterWidth = isMobile ? '100%' : '152px';
  const searchWidth = isMobile ? '100%' : '283px';
  const sidebarDisplay = isMobile ? 'none' : 'flex';
  const sidebarWidth = isMobile ? '100%' : '250px';

  return (
    <div 
      style={{ 
        width: '100%',
        minHeight: 'calc(100vh - 100px)',
        backgroundColor: 'var(--color-background)',
        padding: containerPadding,
      }}
      role="main"
      aria-label={`Détails du projet ${project.name}`}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: headerGap,
          marginBottom: isMobile ? '1.5rem' : '2.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => navigate('/projects')}
          style={{
            width: backButtonSize,
            height: backButtonSize,
            padding: backButtonPadding,
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          aria-label="Retour à la liste des projets"
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
        >
          <BackIcon size={iconSize} />
        </button>
        
        <div 
          style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: isMobile ? '0.75rem' : '1rem',
            display: 'inline-flex',
            flex: 1,
            minWidth: 0,
          }}
        >
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <h1 
              style={{
                color: '#1F1F1F',
                fontSize: titleSize,
                fontFamily: 'Manrope',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {project.name}
            </h1>
            {isOwner && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setEditingProject({
                      id: project.id,
                      name: project.name,
                      description: project.description || '',
                      contributorIds: contributors.map(c => c.id)
                    });
                    setIsEditProjectModalOpen(true);
                  }}
                  style={{
                    color: '#D3590B',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label={`Modifier le projet ${project.name}`}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                >
                  Modifier
                </button>
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  disabled={isDeleting}
                  style={{
                    color: '#EF4444',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label={`Supprimer le projet ${project.name}`}
                  onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
          <p 
            style={{
              width: descriptionWidth,
              color: '#6B7280',
              fontSize: subtitleSize,
              fontFamily: 'Inter',
              fontWeight: 400,
              margin: 0,
            }}
          >
            {project.description || 'Aucune description'}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div 
        style={{
          display: 'flex',
          gap: isMobile ? '1rem' : '1.5rem',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {/* Section principale - Tâches */}
        <div 
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem',
          }}
        >
          {/* Header des tâches */}
          <div 
            style={{
              background: 'white',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.5rem',
            }}
          >
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '0.25rem' : '0.5rem',
                }}
              >
                <h2 
                  style={{
                    color: '#1F1F1F',
                    fontSize: sectionTitleSize,
                    fontFamily: 'Manrope',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Tâches
                </h2>
                <p 
                  style={{
                    color: '#6B7280',
                    fontSize: sectionSubtitleSize,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    margin: 0,
                  }}
                >
                  Par ordre de priorité
                </p>
              </div>
              
              {!isMobile && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.75rem' : '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div 
                    style={{
                      width: filterWidth,
                      padding: isMobile ? '12px 16px' : '23px 32px',
                      background: 'white',
                      borderRadius: 8,
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span 
                      style={{
                        color: '#6B7280',
                        fontSize: isMobile ? '0.875rem' : '0.9375rem',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                      }}
                    >
                      Statut
                    </span>
                    <DownArrowIcon size={isMobile ? 14 : 16} />
                  </div>
                  
                  <div 
                    style={{
                      width: searchWidth,
                      padding: isMobile ? '12px 16px' : '23px 32px',
                      background: 'white',
                      borderRadius: 8,
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher une tâche"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        color: '#6B7280',
                        fontSize: isMobile ? '0.875rem' : '0.9375rem',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        width: '100%',
                      }}
                      aria-label="Rechercher une tâche"
                      onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                      onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                    />
                    <SearchIcon size={isMobile ? 14 : 14} />
                  </div>
                </div>
              )}
            </div>

            {/* Onglets de vue */}
            <div 
              style={{
                display: 'flex',
                gap: isMobile ? '0.5rem' : '0.75rem',
                flexWrap: 'wrap',
              }}
              role="tablist"
            >
              <button
                onClick={() => setActiveView('list')}
                style={{
                  padding: isMobile ? '12px 16px' : '14px 16px',
                  background: activeView === 'list' ? '#FFE8D9' : 'white',
                  border: activeView === 'list' ? '1px solid #D3590B' : '1px solid #E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.5rem' : '0.75rem',
                }}
                role="tab"
                aria-selected={activeView === 'list'}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                <ListIcon size={isMobile ? 14 : 16} />
                <span 
                  style={{
                    color: activeView === 'list' ? '#D3590B' : '#6B7280',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}
                >
                  Liste
                </span>
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                style={{
                  padding: isMobile ? '12px 16px' : '14px 16px',
                  background: activeView === 'calendar' ? '#FFE8D9' : 'white',
                  border: activeView === 'calendar' ? '1px solid #D3590B' : '1px solid #E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
                role="tab"
                aria-selected={activeView === 'calendar'}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                <span 
                  style={{
                    color: activeView === 'calendar' ? '#D3590B' : '#6B7280',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}
                >
                  Calendrier
                </span>
              </button>
            </div>
            
            {isMobile && (
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div 
                  style={{
                    padding: '12px 16px',
                    background: 'white',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span 
                    style={{
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      fontFamily: 'Inter',
                      fontWeight: 400,
                    }}
                  >
                    Statut
                  </span>
                  <DownArrowIcon size={14} />
                </div>
                <div 
                  style={{
                    padding: '12px 16px',
                    background: 'white',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Rechercher une tâche"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                    }}
                    aria-label="Rechercher une tâche"
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                  />
                  <SearchIcon size={14} />
                </div>
              </div>
            )}
          </div>

          {/* Liste des tâches */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.5rem',
            }}
            id={activeView === 'list' ? 'list-view' : 'calendar-view'}
            role="tabpanel"
          >
            {filteredTasks.length === 0 ? (
              <div 
                style={{
                  background: 'white',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  padding: isMobile ? '2rem' : '4rem',
                  textAlign: 'center',
                  color: '#6B7280',
                }}
              >
                Aucune tâche trouvée
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                  showBorder={index < filteredTasks.length - 1}
                  getInitials={getInitials}
                  onEdit={() => {
                    setEditingTask({
                      id: task.id,
                      title: task.title,
                      description: task.description || '',
                      dueDate: task.dueDate,
                      assigneeIds: task.assignees.map(a => String(a.userId)),
                      status: task.status
                    });
                    setIsEditTaskModalOpen(true);
                  }}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              ))
            )}
          </div>
        </div>

        {/* Panneau latéral - Contributeurs */}
        <div 
          style={{
            width: sidebarWidth,
            display: sidebarDisplay,
            background: '#F3F4F6',
            borderRadius: 10,
            padding: isMobile ? '1rem' : '1.5rem',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem',
          }}
          role="complementary"
          aria-label="Liste des contributeurs"
        >
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span 
                style={{
                  color: '#1F1F1F',
                  fontSize: sectionTitleSize,
                  fontFamily: 'Manrope',
                  fontWeight: 600,
                }}
              >
                Contributeurs
              </span>
              <span 
                style={{
                  color: '#6B7280',
                  fontSize: sectionSubtitleSize,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}
              >
                {contributors.length} personnes
              </span>
            </div>
          </div>

          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
            role="list"
          >
            {contributors.map((contributor, index) => (
              <div 
                key={contributor.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                role="listitem"
              >
                <div 
                  style={{
                    width: isMobile ? 24 : 27,
                    height: isMobile ? 24 : 27,
                    padding: isMobile ? '4px' : '4.98px 4.98px 8.72px 8.72px',
                    background: index === 0 ? '#FFE8D9' : '#E5E7EB',
                    borderRadius: isMobile ? 12 : 13.5,
                    border: index > 0 ? '1px solid white' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <span 
                    style={{
                      textAlign: 'center',
                      color: '#0F0F0F',
                      fontSize: 10,
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      letterSpacing: 0.2,
                      lineHeight: 1,
                    }}
                  >
                    {getInitials(contributor.name)}
                  </span>
                </div>
                <div 
                  style={{
                    padding: isMobile ? '4px 12px' : '4px 16px',
                    background: index === 0 ? '#FFE8D9' : '#E5E7EB',
                    borderRadius: 50,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <span 
                    style={{
                      color: index === 0 ? '#D3590B' : '#6B7280',
                      fontSize: isMobile ? '0.875rem' : '0.9375rem',
                      fontFamily: 'Inter',
                      fontWeight: 400,
                    }}
                  >
                    {contributor.role || contributor.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boutons flottants */}
      <div 
        style={{
          position: 'fixed',
          bottom: isMobile ? '80px' : '100px',
          right: isMobile ? '50%' : (isTablet ? '2rem' : '6.25rem'),
          transform: isMobile ? 'translateX(-50%)' : 'none',
          display: 'flex',
          gap: isMobile ? '0.5rem' : '1rem',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setIsAITaskModalOpen(true)}
          style={{
            width: isMobile ? '100px' : '94px',
            height: isMobile ? '50px' : '50px',
            padding: isMobile ? '13px 24px' : '13px 74px',
            background: '#D3590B',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: buttonFontSize,
            fontFamily: 'Inter',
            fontWeight: 400,
            cursor: 'pointer',
          }}
          aria-label="Créer une tâche avec l'intelligence artificielle"
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
        >
          IA
        </button>
        
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          style={{
            width: isMobile ? '200px' : '181px',
            height: '50px',
            padding: isMobile ? '13px 24px' : '13px 74px',
            background: '#1F1F1F',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: buttonFontSize,
            fontFamily: 'Inter',
            fontWeight: 400,
            cursor: 'pointer',
          }}
          aria-label="Créer une nouvelle tâche"
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
        >
          + Créer une tâche
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      {isConfirmingDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          onClick={(e) => { if (e.target === e.currentTarget) setIsConfirmingDelete(false); }}
        >
          <div
            style={{
              width: isMobile ? '90%' : '400px',
              maxWidth: '500px',
              padding: isMobile ? '1.5rem' : '2rem',
              background: 'white',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrashIcon size={isMobile ? 20 : 24} />
              <h2
                id="delete-confirm-title"
                style={{
                  color: '#1F1F1F',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontFamily: 'Manrope',
                  fontWeight: '600',
                  margin: 0,
                }}
              >
                Supprimer le projet ?
              </h2>
            </div>
            
            <p
              style={{
                color: '#6B7280',
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontFamily: 'Inter',
                fontWeight: '400',
                margin: 0,
              }}
            >
              Cette action est irréversible. Toutes les tâches associées à ce projet seront également supprimées.
            </p>
            
            <div
              style={{
                display: 'flex',
                gap: isMobile ? '0.75rem' : '1rem',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
                style={{
                  padding: isMobile ? '12px 24px' : '12px 32px',
                  background: 'white',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: buttonFontSize,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                aria-label="Annuler la suppression"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                style={{
                  padding: isMobile ? '12px 24px' : '12px 32px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: buttonFontSize,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
                onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                aria-label={`Confirmer la suppression du projet ${project.name}`}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de création de tâche */}
      {isCreateTaskModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          newTask={newTask}
          setNewTask={setNewTask}
          selectedAssignees={selectedAssignees}
          setSelectedAssignees={setSelectedAssignees}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          users={users}
          statusOptions={statusOptions}
          isMobile={isMobile}
          focusOutlineStyle={focusOutlineStyle}
        />
      )}
  
      {/* Modale liste de tâches IA */}
      {isAITaskModalOpen && (
        <AITaskListModal onClose={() => setIsAITaskModalOpen(false)} />
      )}

      {/* Modale Modifier Projet */}
      {isEditProjectModalOpen && editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setIsEditProjectModalOpen(false)}
          onSave={(updated) => {
            setProject(prev => prev ? { ...prev, ...updated } : null);
            setIsEditProjectModalOpen(false);
          }}
          users={users}
        />
      )}
      
      {/* Modale Modifier Tâche */}
      {isEditTaskModalOpen && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setIsEditTaskModalOpen(false)}
          onSave={(updated) => {
            setTasks(prev => prev.map(t => t.id === editingTask!.id ? { ...t, ...updated } : t));
            setIsEditTaskModalOpen(false);
          }}
          users={users}
        />
      )}
    </div>
  );
}

// Composant TaskCard
function TaskCard({ 
  task, 
  onStatusChange, 
  showBorder, 
  getInitials, 
  onEdit, 
  isMobile,
  isTablet
}: {
  task: Task;
  onStatusChange: (status: string) => void;
  showBorder: boolean;
  getInitials: (name: string) => string;
  onEdit?: () => void;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const colors = statusColors[task.status] || { bg: '#E5E7EB', color: '#6B7280' };
  
  const assignees = [
    { id: 2, name: 'Bertrand Dupont' },
    { id: 3, name: 'Anne Dupont' },
  ];

  const cardPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
  const titleSize = isMobile ? '1rem' : '1.125rem';
  const descriptionSize = isMobile ? '0.875rem' : '0.9375rem';
  const metaSize = isMobile ? '0.75rem' : '0.8125rem';
  const badgeSize = isMobile ? '0.75rem' : '0.875rem';
  const avatarSize = isMobile ? 24 : 27;
  const buttonSize = isMobile ? 48 : 57;
  const buttonPadding = isMobile ? 16 : 24;

  return (
    <div 
      style={{
        background: 'white',
        borderRadius: 10,
        border: '1px solid #E5E7EB',
        padding: cardPadding,
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '1rem' : '1.5rem',
      }}
      role="article"
      aria-label={`Tâche: ${task.title}`}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <h3 
            style={{
              color: 'black',
              fontSize: titleSize,
              fontFamily: 'Manrope',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {task.title}
          </h3>
          <div 
            style={{
              padding: '4px 16px',
              background: colors.bg,
              borderRadius: 50,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            role="status"
            aria-label={`Statut: ${task.status}`}
          >
            <span 
              style={{
                color: colors.color,
                fontSize: badgeSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              {task.status}
            </span>
          </div>
        </div>
        <button
          onClick={onEdit}
          style={{
            width: buttonSize,
            height: buttonSize,
            padding: buttonPadding,
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          aria-label={`Modifier la tâche ${task.title}`}
          onFocus={(e) => Object.assign(e.currentTarget.style, { outline: '2px solid var(--color-primary)', outlineOffset: '2px' })}
          onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
        >
          <PlusIcon size={isMobile ? 14 : 16} />
        </button>
      </div>

      <p 
        style={{
          color: '#6B7280',
          fontSize: descriptionSize,
          fontFamily: 'Inter',
          fontWeight: 400,
          margin: 0,
        }}
      >
        {task.description || 'Aucune description'}
      </p>

      {showBorder && <div style={{ width: '100%', height: 1, background: '#E5E7EB' }} />}

      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span 
            style={{
              color: '#6B7280',
              fontSize: metaSize,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}
          >
            Échéance :
          </span>
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span 
              style={{
                color: '#1F1F1F',
                fontSize: metaSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </div>

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span 
            style={{
              color: '#6B7280',
              fontSize: metaSize,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}
          >
            Assigné à :
          </span>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            {assignees.slice(0, 2).map((assignee) => (
              <div 
                key={assignee.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div 
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    padding: isMobile ? '4px' : '4.98px 4.98px 8.72px 8.72px',
                    background: '#E5E7EB',
                    borderRadius: avatarSize / 2,
                    border: '1px solid white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <span 
                    style={{
                      textAlign: 'center',
                      color: '#0F0F0F',
                      fontSize: 10,
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      letterSpacing: 0.2,
                      lineHeight: 1,
                    }}
                  >
                    {getInitials(assignee.name)}
                  </span>
                </div>
                <div 
                  style={{
                    padding: isMobile ? '4px 12px' : '4px 16px',
                    background: '#E5E7EB',
                    borderRadius: 50,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <span 
                    style={{
                      color: '#6B7280',
                      fontSize: isMobile ? '0.875rem' : '0.9375rem',
                      fontFamily: 'Inter',
                      fontWeight: 400,
                    }}
                  >
                    {assignee.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span 
          style={{
            color: '#1F1F1F',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            fontFamily: 'Inter',
            fontWeight: 400,
          }}
        >
          Commentaires (1)
        </span>
        <svg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L8 6L14 2" stroke="#1F1F1F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// Composant CreateTaskModal
function CreateTaskModal({ 
  onClose, 
  onSubmit, 
  newTask, 
  setNewTask,
  selectedAssignees,
  setSelectedAssignees,
  selectedStatus,
  setSelectedStatus,
  users,
  statusOptions,
  isMobile,
  focusOutlineStyle,
}: {
  onClose: () => void;
  onSubmit: () => void;
  newTask: Omit<CreateTaskData, 'projectId'>;
  setNewTask: (task: Omit<CreateTaskData, 'projectId'>) => void;
  selectedAssignees: string[];
  setSelectedAssignees: (ids: string[]) => void;
  selectedStatus: 'À faire' | 'En cours' | 'Terminé';
  setSelectedStatus: (status: 'À faire' | 'En cours' | 'Terminé') => void;
  users: { id: number; name: string; role?: string }[];
  statusOptions: { label: string; value: 'À faire' | 'En cours' | 'Terminé'; color: string; textColor: string }[];
  isMobile: boolean;
  focusOutlineStyle: React.CSSProperties;
}) {
  const isFormValid = newTask.title.trim() && newTask.dueDate && selectedAssignees.length > 0;
  const modalWidth = isMobile ? '95%' : '598px';
  const modalPadding = isMobile ? '1.5rem' : '79px 73px';
  const titleSize = isMobile ? '1.25rem' : '1.5rem';
  const labelSize = isMobile ? '0.875rem' : '0.9375rem';
  const inputSize = isMobile ? '0.875rem' : '0.9375rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: isMobile ? '1rem' : '0',
        overflowY: 'auto',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Créer une nouvelle tâche"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        style={{
          width: modalWidth,
          maxWidth: '900px',
          padding: modalPadding,
          background: 'white',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1.5rem' : '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 
          style={{
            color: '#1F1F1F',
            fontSize: titleSize,
            fontFamily: 'Manrope',
            fontWeight: 600,
            margin: 0,
          }}
        >
          Créer une tâche
        </h2>

        <form 
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem',
          }}
          aria-label="Formulaire de création de tâche"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="task-title"
              style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              Titre*
            </label>
            <input
              id="task-title"
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder=""
              style={{
                height: isMobile ? '44px' : '53px',
                padding: isMobile ? '12px 14px' : '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                fontSize: inputSize,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: '#0F0F0F',
                outline: 'none',
              }}
              aria-required="true"
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="task-description"
              style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              Description*
            </label>
            <textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder=""
              rows={3}
              style={{
                padding: isMobile ? '12px 14px' : '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                fontSize: inputSize,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: '#0F0F0F',
                outline: 'none',
                resize: 'vertical',
                minHeight: isMobile ? '100px' : '120px',
              }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="task-dueDate"
              style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              Échéance*
            </label>
            <input
              id="task-dueDate"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              style={{
                height: isMobile ? '44px' : '53px',
                padding: isMobile ? '12px 14px' : '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                fontSize: inputSize,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: '#0F0F0F',
                outline: 'none',
              }}
              aria-required="true"
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="task-assignees"
              style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              Assigné à :
            </label>
            <div 
              style={{
                height: isMobile ? '44px' : '53px',
                padding: isMobile ? '12px 14px' : '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <select
                id="task-assignees"
                multiple
                value={selectedAssignees}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedAssignees(selected);
                }}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: inputSize,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  color: '#6B7280',
                  width: '100%',
                  cursor: 'pointer',
                }}
                aria-label="Sélectionner les personnes assignées"
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <DownArrowIcon size={isMobile ? 14 : 16} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.5rem' : '1rem' }}>
            <label 
              style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              Statut :
            </label>
            <div 
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
              role="radiogroup"
              aria-label="Sélectionner le statut de la tâche"
            >
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  style={{
                    padding: isMobile ? '4px 12px' : '4px 16px',
                    background: option.value === selectedStatus ? option.color : '#E5E7EB',
                    borderRadius: 50,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  role="radio"
                  aria-selected={option.value === selectedStatus}
                  aria-label={option.label}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                >
                  <span 
                    style={{
                      color: option.value === selectedStatus ? option.textColor : '#6B7280',
                      fontSize: inputSize,
                      fontFamily: 'Inter',
                      fontWeight: 400,
                    }}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              width: isMobile ? '100%' : '181px',
              height: isMobile ? '48px' : '50px',
              padding: isMobile ? '13px 24px' : '13px 74px',
              background: isFormValid ? '#1F1F1F' : '#E5E7EB',
              color: isFormValid ? 'white' : '#9CA3AF',
              border: 'none',
              borderRadius: 10,
              fontSize: buttonFontSize,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              alignSelf: isMobile ? 'stretch' : 'flex-end',
            }}
            aria-disabled={!isFormValid}
            onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
          >
            + Ajouter une tâche
          </button>
        </form>
        
        {!isMobile && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: 'none',
              fontSize: '1.75rem',
              cursor: 'pointer',
              color: '#6B7280',
            }}
            aria-label="Fermer la modale"
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
