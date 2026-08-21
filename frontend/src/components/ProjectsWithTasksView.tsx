// ProjectsWithTasksView.tsx - Component

/**

 * Composant ProjectsWithTasksView - Affiche les projets avec leurs tâches
 * 
 * Ce composant permet de visualiser:
 * - La liste des projets avec le nombre de tâches
 * - Le statut de progression de chaque projet
 * - Un aperçu des tâches associées
 */


import { useState, useEffect } from 'react';

import type { Project } from '@/services/projectService';

import type { Task } from '@/services/taskService';


interface ProjectsWithTasksViewProps {
  projects: (Project & { tasksCount?: number; completedTasks?: number; progress?: number })[];
  tasksByProject: Map<string, Task[]>;
  isLoading: boolean;
  error: string | null;
  onProjectClick?: (projectId: string) => void;
  isMobile: boolean;
}

// Couleurs des statuts

const statusColors: Record<string, { bg: string; color: string }> = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
};

// Icône de flèche droite

const ArrowRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3L11 8L6 13" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Icône de tâche

const TaskIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="12" height="8" rx="1" stroke="#6B7280" strokeWidth="1.5"/>
    <path d="M3 6H11" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Icône de progression

const ProgressIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke="#6B7280" strokeWidth="1.5"/>
    <path d="M7 3V7H11" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Extraire les initiales


const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// Formater une date

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};




export default function ProjectsWithTasksView({
  projects,
  tasksByProject,
  isLoading,
  error,
  onProjectClick,
  isMobile,
}: ProjectsWithTasksViewProps) {
  // Focus outline style pour l'accessibilité - WCAG 2.1 AA
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid #D3590B',
    outlineOffset: '2px',
  };


  if (isLoading) {

// RENDER



    return (
      <div
        style={{
          textAlign: 'center',
          padding: isMobile ? '2rem' : '4rem',
          color: '#6B7280',
        }}
        role="status"
        aria-live="polite"
      >
        Chargement...
      </div>
    );
  }


  if (error) {

// RENDER



    return (
      <div
        style={{
          textAlign: 'center',
          padding: isMobile ? '2rem' : '4rem',
          color: '#EF4444',
          background: '#FEE2E2',
          borderRadius: '10px',
        }}
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (projects.length === 0) {

// RENDER



    return (
      <div
        style={{
          textAlign: 'center',
          padding: isMobile ? '2rem' : '4rem',
          color: '#6B7280',
        }}
      >
        Aucun projet trouvé
      </div>
    );
  }


// RENDER



  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '1rem' : '1.5rem',
      }}
      role="list"
      aria-label="Liste des projets avec tâches"
    >
      {projects.map((project) => {
        const tasks = tasksByProject.get(project.id) || [];

        const completedTasks = tasks.filter(t => t.status === 'Terminé').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        // Obtenir les membres
        const members = [
          { id: project.ownerId, name: project.owner?.name || 'Propriétaire', role: 'Propriétaire' },
          ...(project.members?.map(m => ({ id: m.user.id, name: m.user.name, role: m.role })) || [])
        ];


// RENDER



        return (
          <div
            key={project.id}
            style={{
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              padding: isMobile ? '1rem' : '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.5rem',
              cursor: onProjectClick ? 'pointer' : 'default',
            }}
            role="listitem"
            aria-label={`Projet: ${project.name} avec ${tasks.length} tâches`}
            onClick={() => onProjectClick?.(project.id)}
          >
            {/* En-tête du projet */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    color: '#1F1F1F',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontFamily: 'Manrope',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {project.name}
                </h3>
                <p
                  style={{
                    color: '#6B7280',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    margin: 0,
                  }}
                >
                  {project.description || 'Aucune description'}
                </p>
              </div>
              
              {onProjectClick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onProjectClick(project.id); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  aria-label={`Voir les détails du projet ${project.name}`}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                >
                  <ArrowRightIcon size={isMobile ? 18 : 20} />
                </button>
              )}
            </div>

            {/* Statistiques du projet */}
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
                <TaskIcon size={isMobile ? 14 : 16} />
                <span
                  style={{
                    color: '#6B7280',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}
                >
                  {tasks.length} tâches ({completedTasks} terminées)
                </span>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ProgressIcon size={isMobile ? 14 : 16} />
                <span
                  style={{
                    color: progress >= 75 ? '#059669' : progress >= 50 ? '#E08D00' : '#EF4444',
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    fontFamily: 'Manrope',
                    fontWeight: 600,
                  }}
                >
                  {progress}%
                </span>
              </div>
            </div>

            {/* Barre de progression */}
            <div
              style={{
                height: isMobile ? '6px' : '8px',
                background: '#E5E7EB',
                borderRadius: '9999px',
                position: 'relative',
                overflow: 'hidden',
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: progress >= 75 ? '#059669' : progress >= 50 ? '#E08D00' : '#EF4444',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Équipe */}
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
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}
              >
                Équipe:
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id}
                    style={{
                      width: isMobile ? '24px' : '27px',
                      height: isMobile ? '24px' : '27px',
                      background: index === 0 ? '#FFE8D9' : '#E5E7EB',
                      borderRadius: '50%',
                      border: index > 0 ? '1px solid white' : 'none',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        textAlign: 'center',
                        color: '#1F1F1F',
                        fontSize: isMobile ? '0.625rem' : '0.75rem',
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.2,
                        lineHeight: 1,
                      }}
                    >
                      {getInitials(member.name)}
                    </span>
                  </div>
                ))}
                {members.length > 3 && (
                  <div
                    style={{
                      width: isMobile ? '24px' : '27px',
                      height: isMobile ? '24px' : '27px',
                      background: '#E5E7EB',
                      borderRadius: '50%',
                      border: '1px solid white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        textAlign: 'center',
                        color: '#1F1F1F',
                        fontSize: isMobile ? '0.625rem' : '0.75rem',
                        fontFamily: 'Inter',
                        fontWeight: 600,
                      }}
                    >
                      +{members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  color: '#9CA3AF',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}
              >
                Créé: {formatDate(project.createdAt)}
              </span>
              <span
                style={{
                  color: '#9CA3AF',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}
              >
                Modifié: {formatDate(project.updatedAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
