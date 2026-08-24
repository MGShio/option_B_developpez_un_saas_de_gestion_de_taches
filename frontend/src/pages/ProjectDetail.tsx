'use client';
// ProjectDetail.tsx - Page détails projet

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type User } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import { getProjectById, updateProject, type Project } from '@/services/projectService';
import { getAllUsers } from '@/services/userService';
import { getProjectTasks, updateTask, createTask, type Task, type CreateTaskData, type Comment, getTaskComments, createComment, deleteCommentService } from '@/services/taskService';
import AITaskListModal from '@/components/AITaskListModal';
import EditProjectModal from '@/components/EditProjectModal';
import EditTaskModal from '@/components/EditTaskModal';
import { canModifyProject, canCreateTasks, isProjectOwner, isProjectAdmin, hasProjectAccess } from '@/utils/permissions';
import TaskComments from '@/components/TaskComments';
const checkmarkIcon = '/images/checkmark.svg';
const calendarIcon = '/images/calendaricon.svg';
const calendaricongreyIcon = '/images/calendaricongrey.svg';
const starIcon = '/images/Star.svg';
const displaycomIcon = '/images/displaycom.svg';
const retourIcon = '/images/retour.svg';

// Couleurs des statuts
const statusColors: Record<string, { bg: string; color: string }> = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
};

// Libellés des statuts
const TASK_STATUS_LABELS: Record<string, string> = {
  'À faire': 'À faire',
  'En cours': 'En cours',
  'Terminé': 'Terminé',
};




interface ProjectDetailProps {
  id: string;
  initialProject?: Project | null;
}

// Icônes
const BackIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="2" width="16" height="2" fill="#D3590B" />
    <rect y="7" width="16" height="2" fill="#D3590B" />
    <rect y="12" width="16" height="2" fill="#D3590B" />
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

const OptionsIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 96 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="#1F1F1F"/>
    <circle cx="48" cy="8" r="8" fill="#1F1F1F"/>
    <circle cx="88" cy="8" r="8" fill="#1F1F1F"/>
  </svg>
);


export default function ProjectDetail({ id, initialProject }: ProjectDetailProps) {

  const { isAuthenticated, user } = useAuth();
  const router = useRouter();;
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  
  const [project, setProject] = useState<Project | null>(initialProject || null);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; role?: string }[]>([]);

  // Vérifier si l'utilisateur a accès au projet (propriétaire ou membre de l'équipe)
  const hasAccess = hasProjectAccess(user, project);
  
  // Vérifier si l'utilisateur est le propriétaire du projet
  const isOwner = isProjectOwner(user, project);
  const canModify = canModifyProject(user, project);
  const canCreate = canCreateTasks(user, project);

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
  const [editingTask, setEditingTask] = useState<{ id: string; title: string; description: string; dueDate: string; assigneeIds: string[]; status: 'À faire' | 'En cours' | 'Terminé' } | null>(null);
  const [editingProject, setEditingProject] = useState<{ id: string; name: string; description: string; contributorIds: string[] } | null>(null);
  const [newTask, setNewTask] = useState<Omit<CreateTaskData, 'projectId'>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Moyenne',
  });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'À faire' | 'En cours' | 'Terminé'>('À faire');
  
  // Comments state
  const [commentsByTask, setCommentsByTask] = useState<Record<string, Comment[]>>({});
  const [loadingCommentsByTask, setLoadingCommentsByTask] = useState<Record<string, boolean>>({});
  const [commentsError, setCommentsError] = useState<string | null>(null);

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
  const fetchData = useCallback(async (skipProjectFetch: boolean = false) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = storage.getToken() || "";
      
      // Récupérer le projet (ou utiliser celui déjà chargé)
      let projectData = project;
      if (!skipProjectFetch || !project) {
        projectData = await getProjectById(token, id);
        setProject(projectData);
      }
      
      // Vérifier si l'utilisateur a accès au projet
      const userHasAccess = hasProjectAccess(user, projectData);
      
      console.log('Debug access:', {
        userId: user?.id,
        projectOwnerId: projectData.ownerId,
        projectOwnerUserId: projectData.owner?.id,
        members: projectData.members?.map(m => m.user.id),
        hasAccess: userHasAccess
      });
      
      if (!userHasAccess) {
        setError('Accès refusé: vous devez être propriétaire ou membre de ce projet');
        router.push('/projects');
        return;
      }
      
      // Récupérer les tâches du projet
      const tasksData = await getProjectTasks(token, id);
      setTasks(tasksData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du projet';
      if (errorMessage.includes('Accès refusé')) {
        setError('Accès refusé: vous devez être propriétaire ou membre de ce projet pour y accéder.');
      } else {
        setError(errorMessage);
      }
      console.error('Erreur:', err);
      console.error('User ID:', user?.id, 'Project ownerId:', project?.ownerId);
    } finally {
      // Récupérer tous les utilisateurs
      const usersData = await getAllUsers();
      setAllUsers(usersData);

      setIsLoading(false);
    }
  }, [id, router, user]);
    // Fetch comments for a specific task
  const fetchCommentsForTask = useCallback(async (taskId: string) => {
    if (!id || !project || !user || !taskId) return;
    
    const token = storage.getToken() || "";
    if (!token) return;
    
    setLoadingCommentsByTask(prev => ({ ...prev, [taskId]: true }));
    setCommentsError(null);
    
    try {
      const taskComments = await getTaskComments(token, id, taskId);
      setCommentsByTask(prev => ({ ...prev, [taskId]: taskComments }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des commentaires';
      setCommentsError(errorMessage);
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingCommentsByTask(prev => ({ ...prev, [taskId]: false }));
    }
  }, [id, project, user]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchData(!!initialProject);
    }
  }, [isAuthenticated, id, fetchData, initialProject]);

  

  // Handle adding a comment to a task
  const handleAddComment = async (taskId: string, content: string) => {
    if (!id || !user) return;
    
    const token = storage.getToken() || "";
    
    try {
      const newComment = await createComment(token, id, taskId, content);
      setCommentsByTask(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), newComment]
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de ajout du commentaire';
      setCommentsError(errorMessage);
      throw err;
    }
  };

  // Handle deleting a comment from a task
  const handleDeleteComment = async (taskId: string, commentId: string) => {
    if (!id || !user) return;
    
    const token = storage.getToken() || "";
    
    try {
      await deleteCommentService(token, id, taskId, commentId);
      setCommentsByTask(prev => ({
        ...prev,
        [taskId]: (prev[taskId] || []).filter(c => c.id !== commentId)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du commentaire';
      setCommentsError(errorMessage);
      throw err;
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
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = storage.getToken() || "";
      
      await updateTask(token, id!, taskId, { status: newStatus as Task['status'] });
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
      const token = storage.getToken() || "";
      
      const taskData: CreateTaskData = {
        ...newTask,
        projectId: id!,
        priority: newTask.priority as 'Faible' | 'Moyenne' | 'Haute',
        assigneeIds: selectedAssignees,
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
  const memberContribs = project.members?.map(m => ({ id: m.user.id, name: m.user.name, role: m.role })) || [];
  const contributors = [
    { id: project.ownerId, name: project.owner?.name || 'Propriétaire', role: 'Propriétaire' },
    ...memberContribs.filter(m => m.id !== project.ownerId)
  ];
  const users = contributors;

  // Calcul des dimensions responsives pour le layout
  const headerGap = isMobile ? '1rem' : '1.5rem';
  const descriptionWidth = isMobile ? '100%' : isTablet ? '70%' : '60%';
  const tasksContainerPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
  const filterWidth = isMobile ? '100%' : '102px';
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
          maxWidth: maxContentWidth,
          margin: '0 auto',
          marginBottom: isMobile ? '1.5rem' : '2.5rem',
          position: 'relative',
        }}
      >
        <button
          onClick={() => router.push('/projects')}
          style={{
            position: 'absolute',
            left: isMobile ? 0 : -70,
            top: 0,
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
            zIndex: 1,
          }}
          aria-label="Retour a la liste des projets"
          onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
        >
          <img src={retourIcon} alt="Retour" style={{ width: iconSize, height: iconSize }} />
        </button>
        
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            flexWrap: 'wrap',
            paddingLeft: isMobile ? backButtonSize + 16 : 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '0.75rem' : '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
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
          {canCreate && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                marginLeft: 'auto',
                flexWrap: 'wrap',
                maxWidth: '100%',
              }}
            >
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                style={{
                  width: isMobile ? '200px' : 'auto',
                  maxWidth: '100%',
                  height: '50px',
                  padding: isMobile ? '13px 24px' : '13px 0.5vw',
                  background: '#1F1F1F',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: buttonFontSize,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  cursor: 'pointer',
                }}
                aria-label="Creer une nouvelle tache"
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                Creer une tache
              </button>
              <button
                onClick={() => setIsAITaskModalOpen(true)}
                style={{
                  width: isMobile ? '100px' : 'auto',
                  maxWidth: '100%',
                  height: isMobile ? '50px' : '50px',
                  padding: isMobile ? '13px 24px' : '13px 0.5vw',
                  background: '#D3590B',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: buttonFontSize,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingLeft: isMobile ? '13px' : '1vw',
                  paddingRight: isMobile ? '13px' : '1vw',
                }}
                aria-label="Creer une tache avec l intelligence artificielle"
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                <img src={starIcon} alt="IA" style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16 }} /> IA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1rem' : '1.5rem',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {/* Section Contributeurs */}
        <div 
          style={{
            background: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            padding: isMobile ? '1rem' : '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            gap: isMobile ? '1rem' : '1.5rem',
            width: '100%',
          }}
          role="complementary"
          aria-label="Liste des contributeurs"
        >
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              minWidth: 0,
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
              Contributeurs <span style={{ color: '#6B7280', fontSize: isMobile ? '0.75rem' : '0.875rem', marginLeft: '0.5rem' }}>{contributors.length} personnes</span>
            </h2>
          </div>

          <div 
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: '0.5rem',
            }}
            role="list"
          >
            {contributors.map((contributor, index) => (
              <div 
                key={`${contributor.id}-${index}`} 
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
                    background: index === 0 ? '#FFE8D9' : '#E5E7EB',
                    borderRadius: '50%',
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

        {/* Section principale - Tâches */}
        <div 
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            padding: 'clamp(1rem, 1.5vw, 1.5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(1rem, 1.5vw, 1.5rem)',
            width: '100%',
          }}
        >
          {/* Header des tâches */}
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
                  marginLeft: '30px',
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
                  border: activeView === 'list' ? '#D3590B' : '#E5E7EB',
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
                <img src={checkmarkIcon} alt="Checkmark" style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16 }} />
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
                  border: activeView === 'calendar' ? '#D3590B' : '#E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.5rem' : '0.75rem',
                }}
                role="tab"
                aria-selected={activeView === 'calendar'}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                <img src={calendarIcon} alt="Calendar" style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16 }} />
                <span 
                  style={{
                    color: activeView === 'calendar' ? '#D3590B' : '#D3590B',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}
                >
                  Calendrier
                </span>
              </button>
            </div>
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
                      marginRight: '30px',
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

          {/* Liste des tâches */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.5rem',
              width: '100%',
              maxWidth: '1215px',
              marginLeft: 'auto',
              marginRight: 'auto',
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
                  key={`${task.id}-${index}`}
                  task={task}
                  project={project}
                  currentUser={user}
                  onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                  onAddComment={(content) => handleAddComment(task.id, content)}
                  onDeleteComment={(commentId) => handleDeleteComment(task.id, commentId)}
                  comments={commentsByTask[task.id] || []}
                  isLoadingComments={loadingCommentsByTask[task.id] || false}
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

      </div>

      {/* Modal de confirmation de suppression */}
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
          users={allUsers}
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
          onSave={async (updated) => {
            try {
              const token = storage.getToken() || "";
              const updatedProject = await updateProject(token, id!, updated);
              setProject(updatedProject);
              setIsEditProjectModalOpen(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du projet');
            }
          }}
          users={allUsers}
        />
      )}

      {/* Modale Modifier Tâche */}
      {isEditTaskModalOpen && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setIsEditTaskModalOpen(false)}
          onSave={async (updated) => {
            try {
              const token = storage.getToken() || "";
              const updatedTask = await updateTask(token, id!, editingTask!.id, updated);
              setTasks(prev => prev.map(t => t.id === editingTask!.id ? updatedTask : t));
              setIsEditTaskModalOpen(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la tâche');
            }
          }}
          users={allUsers}
        />
      )}
    </div>
  );
}

// Composant TaskCard
function TaskCard({ 
  task,
  project,
  currentUser,
  onStatusChange, 
  onAddComment,
  onDeleteComment,
  comments,
  isLoadingComments,
  showBorder, 
  getInitials, 
  onEdit, 
  isMobile,
  isTablet
}: {
  task: Task;
  project: Project | null;
  currentUser: User | null;
  onStatusChange: (status: string) => void;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  comments: Comment[];
  isLoadingComments: boolean;
  showBorder: boolean;
  getInitials: (name: string) => string;
  onEdit?: () => void;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const colors = statusColors[task.status] || { bg: '#E5E7EB', color: '#6B7280' };
  
  const [showComments, setShowComments] = useState(false);
  const assignees = task.assignees?.map(a => ({ id: a.userId, name: a.user.name })) || [];

  const cardPadding = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
  const titleSize = isMobile ? '1rem' : '1.125rem';
  const descriptionSize = isMobile ? '0.875rem' : '0.9375rem';
  const metaSize = isMobile ? '0.75rem' : '0.875rem';
  const badgeSize = isMobile ? '0.75rem' : '0.875rem';
  const avatarSize = isMobile ? 24 : 27;
  const buttonSize = isMobile ? 48 : 57;
  const buttonPadding = isMobile ? 16 : 18;

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
          gap: '1rem',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            flex: 1,
            minWidth: 0,
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
              aria-label={`Statut: ${TASK_STATUS_LABELS[task.status] || task.status}`}
            >
              <span
                style={{
                  color: colors.color,
                  fontSize: badgeSize,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}
              >
                {TASK_STATUS_LABELS[task.status] || task.status}
              </span>
            </div>
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
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}
        >
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
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}>
            <OptionsIcon size={isMobile ? 14 : 16} />
          </button>
        </div>
      </div>

      

      

      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
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
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <img src={calendaricongreyIcon} alt="Calendar" style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16 }} />
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
            {assignees.slice(0, 2).map((assignee, index) => (
              <div 
                key={`${assignee.id}-${index}`} 
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

      {showBorder && <div style={{ width: '100%', height: 1, background: '#E5E7EB' }} />}

      <div>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            background: 'none',
            border: 'none',
            padding: '0.5rem 0',
            cursor: 'pointer',
            fontSize: metaSize,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#1F1F1F',
          }}
          onFocus={(e) => Object.assign(e.currentTarget.style, { outline: '2px solid var(--color-primary)', outlineOffset: '2px' })}
          onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
        >
          <span>Commentaires ({comments.length || 0})</span>
          <img src={displaycomIcon} alt="Commentaires" style={{ width: 16, height: 16, transform: showComments ? 'rotate(180deg)' : 'none' }} />
        </button>
        {showComments && project && currentUser && (
          <TaskComments
            taskId={task.id}
            projectId={project.id}
            project={project}
            comments={comments}
            currentUser={currentUser}
            onAddComment={(content) => onAddComment(content)}
            onDeleteComment={(commentId) => onDeleteComment(commentId)}
            isLoading={isLoadingComments}
          />
        )}
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
  users: { id: string; name: string; role?: string }[];
  statusOptions: { label: string; value: 'À faire' | 'En cours' | 'Terminé'; color: string; textColor: string }[];
  isMobile: boolean;
  focusOutlineStyle: React.CSSProperties;
}) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const isFormValid = newTask.title.trim() && newTask.dueDate && selectedAssignees.length > 0;
  const modalWidth = isMobile ? '95%' : '598px';
  const modalPadding = isMobile ? '1.5rem' : '79px 73px';
  const titleSize = isMobile ? '1.25rem' : '1.5rem';
  const labelSize = isMobile ? '0.875rem' : '0.9375rem';
  const inputSize = isMobile ? '0.875rem' : '0.9375rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest && !target.closest('.assignee-dropdown')) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                height: isMobile ? '44px' : 'auto',
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
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                fontSize: inputSize,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: '#0F0F0F',
                outline: 'none',
                resize: 'vertical',
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
                position: 'absolute',
                opacity: 0,
                width: 0,
                height: 0,
                padding: 0,
                margin: 0,
                border: 'none',
              }}
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => {
                const dateInput = document.getElementById('task-dueDate') as HTMLInputElement;
                if (dateInput) {
                  if (!dateInput.value) {
                    const today = new Date().toISOString().split('T')[0];
                    dateInput.value = today;
                    setNewTask({ ...newTask, dueDate: today });
                  }
                  if (dateInput.showPicker) {
                    dateInput.showPicker();
                  } else {
                    dateInput.click();
                  }
                }
              }}
              style={{
                height: isMobile ? '44px' : '53px',
                width: '100%',
                padding: isMobile ? '12px 14px' : '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: inputSize,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: newTask.dueDate ? '#1F1F1F' : '#6B7280',
              }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            >
              <span>
                {newTask.dueDate
                  ? new Date(newTask.dueDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : ''}
              </span>
              <img
                src={calendaricongreyIcon}
                alt="Calendrier"
                style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16 }}
              />
            </button>
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
            <div className="assignee-dropdown" style={{
              position: 'relative',
            }}>
              <div
                style={{
                  height: isMobile ? '44px' : 'auto',
                  padding: isMobile ? '12px 14px' : '19px 17px',
                  background: 'white',
                  borderRadius: 4,
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsUserDropdownOpen(!isUserDropdownOpen);
                  }
                }}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                  {selectedAssignees.length > 0 ? (
                    users
                      .filter(user => selectedAssignees.includes(user.id))
                      .map(user => (
                        <div
                          key={user.id}
                          style={{
                            background: '#E5E7EB',
                            padding: '4px 8px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: inputSize,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span style={{ color: '#1F1F1F' }}>{user.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssignees(selectedAssignees.filter(id => id !== user.id));
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6B7280',
                              fontSize: '1rem',
                              lineHeight: 1,
                              padding: 0,
                              margin: 0,
                            }}
                            aria-label={`Retirer ${user.name}`}
                          >
                            ×
                          </button>
                        </div>
                      ))
                  ) : (
                    <span style={{ color: '#6B7280', fontSize: inputSize }}>Choisir un ou plusieurs collaborateurs</span>
                  )}
                </div>
                <DownArrowIcon size={isMobile ? 14 : 16} />
              </div>
              {isUserDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: 4,
                    marginTop: '4px',
                    zIndex: 100,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                  role="listbox"
                >
                  {users.map((user, index) => (
                    <div
                      key={`${user.id}-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSelectedAssignees = selectedAssignees.includes(user.id)
                          ? selectedAssignees.filter(id => id !== user.id)
                          : [...selectedAssignees, user.id];
                        setSelectedAssignees(newSelectedAssignees);
                      }}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        background: selectedAssignees.includes(user.id) ? '#F3F4F6' : 'white',
                        fontSize: inputSize,
                        color: '#1F1F1F',
                      }}
                      role="option"
                      aria-selected={selectedAssignees.includes(user.id)}
                    >
                      {user.name}
                    </div>
                  ))}
                </div>
              )}
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
              {statusOptions.map((option, index) => (
                <button
                  key={`${option.value}-${index}`}
                  onClick={() => setSelectedStatus(option.value)}
                  style={{
                    padding: isMobile ? '4px 12px' : '4px 16px',
                    background: (option.value === 'À faire' && option.value !== selectedStatus) ? '#E5E7EB' : option.color,
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
                      color: (option.value === 'À faire' && option.value !== selectedStatus) ? '#6B7280' : option.textColor,
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
              width: isMobile ? '100%' : 'auto',
              height: isMobile ? '48px' : '50px',
              padding: isMobile ? '13px 24px' : '13px 24px',
              background: isFormValid ? '#1F1F1F' : '#E5E7EB',
              color: isFormValid ? 'white' : '#9CA3AF',
              border: 'none',
              borderRadius: 10,
              fontSize: buttonFontSize,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              alignSelf: 'flex-start',
              marginTop: '25px',
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

