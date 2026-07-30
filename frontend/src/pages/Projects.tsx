import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { getProjects, deleteProject, type Project } from '../services/projectService';
import { getProjectTasks, type Task } from '../services/taskService';

// Couleurs des statuts
const statusColors: Record<string, { bg: string; color: string }> = {
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
  'En attente': { bg: '#FFE0E0', color: '#EF4444' },
};

export default function Projects() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
  const handleDeleteProject = async (projectId: number) => {
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
    return <div style={{ textAlign: 'center', padding: 40 }}>Veuillez vous connecter</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        width: '100%',
        marginBottom: 40,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
        }}>
          <div style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 14,
            display: 'inline-flex',
          }}>
            <h1 style={{
              color: '#1F1F1F',
              fontSize: 24,
              fontFamily: 'Manrope',
              fontWeight: 600,
            }}>
              Mes projets
            </h1>
            <p style={{
              color: 'black',
              fontSize: 18,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Gérez vos projets
            </p>
          </div>
          
          <button
            onClick={() => navigate('/projects/new')}
            style={{
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
            + Créer un projet
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
          Chargement des projets...
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
            onClick={fetchProjects}
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
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {/* Grille de projets */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 24,
          }}>
            {filteredProjects.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 40,
                color: '#6B7280',
              }}>
                Aucun projet trouvé
              </div>
            ) : (
              filteredProjects.map((project: Project & { tasksCount?: number; completedTasks?: number; progress?: number }) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={() => navigate(`/projects/${project.id}`)}
                  onDelete={() => handleDeleteProject(project.id)}
                  isDeleting={deletingId === project.id}
                  getInitials={getInitials}
                  getStatusColor={getStatusColor}
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
  onView, 
  onDelete, 
  isDeleting,
  getInitials,
  getStatusColor,
}: {
  project: Project & {
    tasksCount?: number;
    completedTasks?: number;
    progress?: number;
  };
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  getInitials: (name: string) => string;
  getStatusColor: (status: string) => { bg: string; color: string };
}) {
  const colors = getStatusColor('En attente');
  
  // Obtenir les membres (mockés pour l'instant)
  const members = [
    { id: project.ownerId, name: project.owner?.name || 'Propriétaire', role: 'Propriétaire' },
    { id: 2, name: 'Bernard Dupont', role: '' },
    { id: 3, name: 'Claire Vincent', role: '' },
  ];

  return (
    <div style={{
      width: '100%',
      padding: '30px 34px',
      background: 'white',
      borderRadius: 10,
      border: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      gap: 56,
      cursor: 'pointer',
    }}>
      {/* Contenu principal */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <h3 style={{
          color: '#1F1F1F',
          fontSize: 18,
          fontFamily: 'Manrope',
          fontWeight: 600,
        }}>
          {project.name}
        </h3>
        <p style={{
          color: '#6B7280',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 400,
        }}>
          {project.description || 'Aucune description'}
        </p>
      </div>

      {/* Progression */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 16,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
          <span style={{
            color: '#6B7280',
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            Progression
          </span>
          <span style={{
            textAlign: 'right',
            color: '#1F1F1F',
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            {project.progress || 0}%
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
        }}>
          {/* Barre de progression */}
          <div style={{
            height: 7,
            background: '#E5E7EB',
            borderRadius: 40,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${project.progress || 0}%`,
              background: project.progress === 100 ? '#059669' : '#D3590B',
              borderRadius: 40,
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
              fontSize: 10,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              {project.completedTasks || 0}/{project.tasksCount || 0} tâches terminées
            </span>
          </div>
        </div>
      </div>

      {/* Équipe */}
      <div style={{
        width: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 15,
      }}>
        <div style={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 8,
          display: 'inline-flex',
        }}>
          <span style={{
            color: '#6B7280',
            fontSize: 10,
            fontFamily: 'Inter',
            fontWeight: 400,
          }}>
            Équipe ({members.length})
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {/* Première ligne - Propriétaire */}
          <div style={{
            display: 'flex',
            gap: 5,
          }}>
            <div style={{
              width: 27,
              height: 27,
              padding: '4.98px 4.98px 8.72px 8.72px',
              background: '#FFE8D9',
              borderRadius: 13.5,
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
                {getInitials(members[0].name)}
              </span>
            </div>
            <div style={{
              padding: '4px 16px',
              background: '#FFE8D9',
              borderRadius: 50,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <span style={{
                color: '#D3590B',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Propriétaire
              </span>
            </div>
          </div>
          
          {/* Deuxième ligne - Autres membres */}
          <div style={{
            display: 'flex',
            gap: 5,
          }}>
            {members.slice(1).map((member) => (
              <div key={member.id} style={{
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
                  {getInitials(member.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginTop: 'auto',
        paddingTop: 20,
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: '#1F1F1F',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 400,
            cursor: 'pointer',
          }}
        >
          Voir le projet
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          style={{
            padding: '12px 24px',
            background: isDeleting ? '#9CA3AF' : '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 400,
            cursor: isDeleting ? 'not-allowed' : 'pointer',
          }}
        >
          {isDeleting ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
    </div>
  );
}
