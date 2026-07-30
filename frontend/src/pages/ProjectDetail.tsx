import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { getProjectById, type Project } from '../services/projectService';
import { getProjectTasks, updateTask, createTask, type Task, type CreateTaskData } from '../services/taskService';
import AITaskListModal from '../components/AITaskListModal';

// Couleurs des statuts
const statusColors: Record<string, { bg: string; color: string }> = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
};

// Icônes
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill="#D3590B" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="9.71" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="9.71" height="8" fill="#D3590B" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke="#6B7280" strokeWidth="1" fill="none" />
    <path d="M10 10L13 13" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const DownArrowIcon = () => (
  <svg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L8 6L14 2" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4L8 12M8 12L12 8M8 12L4 8" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modale de création de tâche
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isAITaskModalOpen, setIsAITaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<CreateTaskData, 'projectId'>>({
    name: '',
    description: '',
    dueDate: '',
    priority: 'Moyenne',
  });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'À faire' | 'En cours' | 'Terminé'>('À faire');

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

  // Extraire les initiales
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = activeFilter === 'all' || task.status === activeFilter;
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      
      await updateTask(token, taskId, { status: newStatus as Task['status'] });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  // Créer une nouvelle tâche
  const handleCreateTask = async () => {
    if (!newTask.name.trim() || !newTask.dueDate) {
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
      setNewTask({ name: '', description: '', dueDate: '', priority: 'Moyenne' });
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
    return <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Chargement...</div>;
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 40, 
        color: '#EF4444',
        background: '#FEE2E2',
        borderRadius: 10,
      }}>
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
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!project) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Projet non trouvé</div>;
  }

  // Mock des contributeurs (à remplacer par des données réelles)
  const contributors = [
    { id: project.ownerId, name: project.owner?.name || 'Propriétaire', role: 'Propriétaire' },
    { id: 2, name: 'Bertrand Dupont', role: '' },
    { id: 3, name: 'Anne Dupont', role: '' },
  ];

  // Mock des utilisateurs pour l'assignation
  const users = contributors;

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 40,
      }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            width: 57,
            height: 57,
            padding: 24,
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <BackIcon />
        </button>
        
        <div style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 14,
          display: 'inline-flex',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}>
            <h1 style={{
              color: '#1F1F1F',
              fontSize: 24,
              fontFamily: 'Manrope',
              fontWeight: 600,
            }}>
              {project.name}
            </h1>
            <button
              onClick={() => navigate(`/projects/${project.id}/edit`)}
              style={{
                color: '#D3590B',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Modifier
            </button>
          </div>
          <p style={{
            width: 716,
            color: '#6B7280',
            fontSize: 18,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            {project.description || 'Aucune description'}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{
        display: 'flex',
        gap: 24,
      }}>
        {/* Section principale - Tâches */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {/* Header des tâches */}
          <div style={{
            background: 'white',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <h2 style={{
                  color: '#1F1F1F',
                  fontSize: 18,
                  fontFamily: 'Manrope',
                  fontWeight: 600,
                }}>
                  Tâches
                </h2>
                <p style={{
                  color: '#6B7280',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}>
                  Par ordre de priorité
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                {/* Filtre par statut */}
                <div style={{
                  width: 152,
                  padding: '23px 32px',
                  background: 'white',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}>
                    Statut
                  </span>
                  <DownArrowIcon />
                </div>
                
                {/* Recherche */}
                <div style={{
                  width: 283,
                  padding: '23px 32px',
                  background: 'white',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <input
                    type="text"
                    placeholder="Rechercher une tâche"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      color: '#6B7280',
                      fontSize: 14,
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                    }}
                  />
                  <SearchIcon />
                </div>
              </div>
            </div>

            {/* Onglets de vue */}
            <div style={{
              display: 'flex',
              gap: 10,
            }}>
              <button
                onClick={() => setActiveView('list')}
                style={{
                  padding: '14px 16px',
                  background: activeView === 'list' ? '#FFE8D9' : 'white',
                  border: activeView === 'list' ? '1px solid #D3590B' : '1px solid #E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <ListIcon />
                <CalendarIcon />
                <span style={{
                  color: activeView === 'list' ? '#D3590B' : '#6B7280',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}>
                  Liste
                </span>
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                style={{
                  padding: '14px 16px',
                  background: activeView === 'calendar' ? '#FFE8D9' : 'white',
                  border: activeView === 'calendar' ? '1px solid #D3590B' : '1px solid #E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  color: activeView === 'calendar' ? '#D3590B' : '#6B7280',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}>
                  Calendrier
                </span>
              </button>
            </div>
          </div>

          {/* Liste des tâches */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 17,
          }}>
            {filteredTasks.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                padding: 40,
                textAlign: 'center',
                color: '#6B7280',
              }}>
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
                />
              ))
            )}
          </div>
        </div>

        {/* Panneau latéral - Contributeurs */}
        <div style={{
          width: 300,
          background: '#F3F4F6',
          borderRadius: 10,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{
                color: '#1F1F1F',
                fontSize: 18,
                fontFamily: 'Manrope',
                fontWeight: 600,
              }}>
                Contributeurs
              </span>
              <span style={{
                color: '#6B7280',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                {contributors.length} personnes
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            {contributors.map((contributor, index) => (
              <div key={contributor.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <div style={{
                  width: 27,
                  height: 27,
                  padding: '4.98px 4.98px 8.72px 8.72px',
                  background: index === 0 ? '#FFE8D9' : '#E5E7EB',
                  borderRadius: 13.5,
                  border: index > 0 ? '1px solid white' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <span style={{
                    textAlign: 'center',
                    color: '#0F0F0F',
                    fontSize: 10,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: 0.2,
                  }}>
                    {getInitials(contributor.name)}
                  </span>
                </div>
                <div style={{
                  padding: '4px 16px',
                  background: index === 0 ? '#FFE8D9' : '#E5E7EB',
                  borderRadius: 50,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <span style={{
                    color: index === 0 ? '#D3590B' : '#6B7280',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}>
                    {contributor.role || contributor.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton flottant Créer une tâche */}
      <button
        onClick={() => setIsCreateTaskModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 184, // 100 + 94 + 12 (gap) = 206, mais ajusté
          width: 181,
          height: 50,
          padding: '13px 74px',
          background: '#1F1F1F',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: 400,
          cursor: 'pointer',
        }}
      >
        + Créer une tâche
      </button>

      {/* Bouton flottant IA */}
      <button
        onClick={() => setIsAITaskModalOpen(true)}
        style={{
        position: 'fixed',
        bottom: 100,
        right: 100,
        width: 94,
        height: 50,
        padding: '13px 74px',
        background: '#D3590B',
        color: 'white',
        border: 'none',
        borderRadius: 10,
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 400,
        cursor: 'pointer',
      }}>
        IA
      </button>

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
        />
      )}
  

      {/* Modale liste de tâches IA */}
      {isAITaskModalOpen && (
        <AITaskListModal onClose={() => setIsAITaskModalOpen(false)} />
      )}  </div>
  );
}

// Composant TaskCard
function TaskCard({ task, onStatusChange, showBorder, getInitials }: {
  task: Task;
  onStatusChange: (status: string) => void;
  showBorder: boolean;
  getInitials: (name: string) => string;
}) {
  const colors = statusColors[task.status] || { bg: '#E5E7EB', color: '#6B7280' };
  
  // Mock des assignés
  const assignees = [
    { id: 2, name: 'Bertrand Dupont' },
    { id: 3, name: 'Anne Dupont' },
  ];

  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      border: '1px solid #E5E7EB',
      padding: '25px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
    }}>
      {/* En-tête de la tâche */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}>
          <h3 style={{
            color: 'black',
            fontSize: 18,
            fontFamily: 'Manrope',
            fontWeight: 600,
          }}>
            {task.name}
          </h3>
          <div style={{
            padding: '4px 16px',
            background: colors.bg,
            borderRadius: 50,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <span style={{
              color: colors.color,
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              {task.status}
            </span>
          </div>
        </div>
        <div style={{
          width: 57,
          height: 57,
          padding: 24,
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: 10,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <PlusIcon />
        </div>
      </div>

      {/* Description */}
      <p style={{
        color: '#6B7280',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 400,
      }}>
        {task.description || 'Aucune description'}
      </p>

      {showBorder && <div style={{ width: '100%', height: 1, background: '#E5E7EB' }} />}

      {/* Détails */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span style={{
            color: '#6B7280',
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            Échéance :
          </span>
          <div style={{
            width: 62,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              color: '#1F1F1F',
              fontSize: 12,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            color: '#6B7280',
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            Assigné à :
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            {assignees.map((assignee) => (
              <div key={assignee.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <div style={{
                  width: 27,
                  height: 27,
                  padding: '4.98px 4.98px 8.72px 8.72px',
                  background: '#E5E7EB',
                  borderRadius: 13.5,
                  border: '1px solid white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <span style={{
                    textAlign: 'center',
                    color: '#0F0F0F',
                    fontSize: 10,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: 0.2,
                  }}>
                    {getInitials(assignee.name)}
                  </span>
                </div>
                <div style={{
                  padding: '4px 16px',
                  background: '#E5E7EB',
                  borderRadius: 50,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <span style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}>
                    {assignee.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commentaires */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          color: '#1F1F1F',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 400,
        }}>
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
}) {
  // Vérifier si le formulaire est valide
  const isFormValid = newTask.name.trim() && newTask.dueDate && selectedAssignees.length > 0;

  return (
    <div style={{
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
    }}>
      <div style={{
        width: 598,
        padding: '79px 73px',
        background: 'white',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 56,
      }}>
        {/* Titre */}
        <h2 style={{
          color: '#1F1F1F',
          fontSize: 24,
          fontFamily: 'Manrope',
          fontWeight: 600,
        }}>
          Créer une tâche
        </h2>

        {/* Formulaire */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {/* Titre */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}>
            <label style={{
              color: 'black',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Titre*
            </label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              placeholder=""
              style={{
                height: 53,
                padding: '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: '#0F0F0F',
                outline: 'none',
              }}
            />
          </div>

          {/* Description */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}>
            <label style={{
              color: 'black',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Description*
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder=""
              rows={3}
              style={{
                padding: '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: '#0F0F0F',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Échéance */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}>
            <label style={{
              color: 'black',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Échéance*
            </label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              style={{
                height: 53,
                padding: '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 400,
                color: '#0F0F0F',
                outline: 'none',
              }}
            />
          </div>

          {/* Assigné à */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}>
            <label style={{
              color: 'black',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Assigné à :
            </label>
            <div style={{
              height: 53,
              padding: '19px 17px',
              background: 'white',
              borderRadius: 4,
              border: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <select
                multiple
                value={selectedAssignees}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setSelectedAssignees(selected);
                }}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  color: '#6B7280',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <DownArrowIcon />
            </div>
          </div>

          {/* Statut */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <label style={{
              color: 'black',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Statut :
            </label>
            <div style={{
              display: 'flex',
              gap: 8,
            }}>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  style={{
                    padding: '4px 16px',
                    background: option.value === selectedStatus ? option.color : '#E5E7EB',
                    borderRadius: 50,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    color: option.value === selectedStatus ? option.textColor : '#6B7280',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bouton Ajouter */}
          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              width: 181,
              height: 50,
              padding: '13px 74px',
              background: isFormValid ? '#1F1F1F' : '#E5E7EB',
              color: isFormValid ? 'white' : '#9CA3AF',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              alignSelf: 'flex-end',
            }}
          >
            + Ajouter une tâche
          </button>
        </form>
      </div>
    </div>
  );
}
