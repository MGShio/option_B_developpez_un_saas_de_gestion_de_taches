import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { getAssignedTasks, searchTasks, type Task } from '../services/taskService';
import { getProjects, createProject, type Project, type CreateProjectData } from '../services/projectService';

// Couleurs des statuts
const statusColors: Record<string, { bg: string; color: string }> = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
};

// Composant Separator réutilisable
const Separator = () => (
  <div style={{ width: 1, height: 12, background: '#9CA3AF', transform: 'rotate(90deg)' }} />
);

// Composant SearchIcon
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke="#6B7280" strokeWidth="1" fill="none" />
    <path d="M10 10L13 13" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modale de création de projet
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<CreateProjectData>({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

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
    
    setIsCreating(true);
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
      setNewProject({ name: '', description: '' });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet');
    } finally {
      setIsCreating(false);
    }
  };

  // Obtenir le nom du projet à partir de l'ID
  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  };

  if (!isAuthenticated) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Veuillez vous connecter</div>;
  }

  return (
    <div style={{
      width: '100%',
    }}>
      {/* Welcome Section */}
      <div style={{
        width: 530,
        marginBottom: 80,
      }}>
        <h1 style={{
          color: '#1F1F1F',
          fontSize: 24,
          fontFamily: 'Manrope',
          fontWeight: 600,
          marginBottom: 14,
        }}>
          Tableau de bord
        </h1>
        <p style={{
          color: 'black',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: 400,
        }}>
          Bonjour {user?.name}, voici un aperçu de vos projets et tâches
        </p>
      </div>

      {/* View Toggle */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 40,
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" fill={activeView === 'list' ? '#D3590B' : '#6B7280'} />
          </svg>
          <svg width="9.71" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="9.71" height="8" fill={activeView === 'list' ? '#D3590B' : '#6B7280'} />
          </svg>
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
          onClick={() => setActiveView('kanban')}
          style={{
            padding: '14px 16px',
            background: activeView === 'kanban' ? '#FFE8D9' : 'white',
            border: activeView === 'kanban' ? '1px solid #D3590B' : '1px solid #E5E7EB',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{
            color: activeView === 'kanban' ? '#D3590B' : '#6B7280',
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            Kanban
          </span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
          Chargement des données...
        </div>
      ) : error ? (
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
      ) : activeView === 'kanban' ? (
        /* Vue Kanban */
        <KanbanView tasks={tasks} getProjectName={getProjectName} />
      ) : (
        /* Vue Liste */
        <div style={{
          width: '100%',
          background: 'white',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 41,
        }}>
          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
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
                Mes tâches assignées
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

            {/* Search Bar */}
            <div style={{
              width: 357,
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
                onChange={(e) => handleSearch(e.target.value)}
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

          {/* Tasks List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 17,
            width: '100%',
          }}>
            {tasks.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 40,
                color: '#6B7280',
              }}>
                Aucune tâche trouvée
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  projectName={getProjectName(task.projectId)} 
                  onView={() => navigate(`/projects/${task.projectId}`)}
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
          width: 181,
          height: 50,
          padding: '13px 74px',
          position: 'fixed',
          bottom: 100,
          right: 100,
          background: '#1F1F1F',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: 400,
          cursor: 'pointer',
          zIndex: 50,
        }}
      >
        + Créer un projet
      </button>

      {/* Modale de création de projet */}
      {isCreateModalOpen && (
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
            background: 'white',
            borderRadius: 16,
            padding: 40,
            width: 500,
            maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <h2 style={{
                color: '#1F1F1F',
                fontSize: 20,
                fontFamily: 'Manrope',
                fontWeight: 600,
              }}>
                Créer un nouveau projet
              </h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewProject({ name: '', description: '' });
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 24,
                  color: '#6B7280',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  color: '#1F1F1F',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  marginBottom: 8,
                }}>
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Application E-commerce"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: error && !newProject.name.trim() ? '1px solid #EF4444' : '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Inter',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  color: '#1F1F1F',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  marginBottom: 8,
                }}>
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du projet (optionnel)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Inter',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <div style={{ 
                  color: '#EF4444', 
                  fontSize: 14, 
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewProject({ name: '', description: '' });
                    setError(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'white',
                    color: '#6B7280',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProject.name.trim()}
                  style={{
                    padding: '12px 24px',
                    background: isCreating ? '#9CA3AF' : '#1F1F1F',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    cursor: isCreating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isCreating ? 'Création...' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant TaskCard réutilisable
function TaskCard({ task, projectName, onView }: { 
  task: Task; 
  projectName: string;
  onView: () => void;
}) {
  const colors = statusColors[task.status] || { bg: '#E5E7EB', color: '#6B7280' };

  return (
    <div style={{
      width: '100%',
      padding: '25px 40px',
      background: 'white',
      borderRadius: 10,
      border: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          width: 153,
        }}>
          <h3 style={{
            color: 'black',
            fontSize: 18,
            fontFamily: 'Manrope',
            fontWeight: 600,
          }}>
            {task.name}
          </h3>
          <p style={{
            color: '#6B7280',
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            {task.description || 'Aucune description'}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 15,
        }}>
          <div style={{
            width: 107,
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
              {projectName}
            </span>
          </div>

          <Separator />

          <div style={{
            width: 62,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              color: '#6B7280',
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

          <Separator />

          <div style={{
            width: 62,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              width: 15,
              height: 15,
              background: '#6B7280',
              borderRadius: '50%',
            }} />
            <span style={{
              color: '#6B7280',
              fontSize: 12,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              {task.assignees}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        width: 121,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 37,
      }}>
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

        <button 
          onClick={onView}
          style={{
            width: '100%',
            height: 50,
            padding: '13px 0',
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
          Voir
        </button>
      </div>
    </div>
  );
}

// Composant KanbanView
function KanbanView({ tasks, getProjectName }: { 
  tasks: Task[],
  getProjectName: (projectId: number) => string,\n}) {
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

  return (
    <div style={{
      display: 'flex',
      gap: 24,
      overflowX: 'auto',
      paddingBottom: 20,
    }}>
      {(['À faire', 'En cours', 'Terminé'] as const).map((status) => {
        const colors = statusColors[status];
        const statusTasks = tasksByStatus[status];
        
        return (
          <div 
            key={status}
            style={{
              minWidth: 350,
              background: 'white',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* En-tête de la colonne */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}>
              <div style={{
                width: 12,
                height: 12,
                background: colors.color,
                borderRadius: 3,
              }} />
              <h3 style={{
                color: '#1F1F1F',
                fontSize: 16,
                fontFamily: 'Manrope',
                fontWeight: 600,
              }}>
                {status}
              </h3>
              <span style={{
                color: '#6B7280',
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 400,
                marginLeft: 'auto',
              }}>
                {statusTasks.length}
              </span>
            </div>

            {/* Cartes des tâches */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {statusTasks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: 20,
                  color: '#9CA3AF',
                  fontSize: 14,
                }}>
                  Aucune tâche
                </div>
              ) : (
                statusTasks.map((task) => (
                  <div 
                    key={task.id}
                    style={{
                      padding: 16,
                      background: '#F9FAFB',
                      borderRadius: 8,
                      border: '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => navigate(`/projects/${task.projectId}`)}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      <h4 style={{
                        color: '#1F1F1F',
                        fontSize: 14,
                        fontFamily: 'Manrope',
                        fontWeight: 600,
                      }}>
                        {task.name}
                      </h4>
                      <p style={{
                        color: '#6B7280',
                        fontSize: 12,
                        fontFamily: 'Inter',
                        fontWeight: 400,
                      }}>
                        {task.description || 'Aucune description'}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 8,
                      }}>
                        <span style={{
                          fontSize: 10,
                          color: '#9CA3AF',
                          background: '#E5E7EB',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}>
                          {getProjectName(task.projectId)}
                        </span>
                        <span style={{
                          fontSize: 10,
                          color: '#9CA3AF',
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








