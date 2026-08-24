// CreateProjectModal.tsx - Component

import { useState, useEffect } from 'react';
const DownArrowIcon = '/images/displaycom.svg';


// Define the icon component
const DownArrowIconComponent = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={8} viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L8 6L14 2" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


export interface ModalCreateProjectData {
  name: string;
  description: string;
  contributorIds: string[];
}


interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (data: ModalCreateProjectData) => Promise<void>;
  users: { id: string; name: string; role?: string }[];
}



export default function CreateProjectModal({ onClose, onSubmit, users }: CreateProjectModalProps) {

  const isMobile = window.innerWidth <= 768;
  const inputSize = isMobile ? '0.875rem' : '0.9375rem';
  const labelSize = isMobile ? '0.875rem' : '0.9375rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';


  const [newProject, setNewProject] = useState<ModalCreateProjectData>({
    name: '',
    description: '',
    contributorIds: [],
  });

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [selectContributorIds, setSelectContributorIds] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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


  const handleChange = (field: keyof Omit<ModalCreateProjectData, 'contributorIds'>, value: string) => {
    setNewProject(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newProject);
    onClose();
  };

  const isFormValid = newProject.name.trim();


// RENDER


  return (
    <div
      onClick={onClose}
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
      aria-label="Créer un projet"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          paddingTop: isMobile ? 40 : 79,
          paddingBottom: isMobile ? 20 : 50,
          paddingLeft: isMobile ? 20 : 73,
          paddingRight: isMobile ? 20 : 73,
          borderRadius: 10,
          width: isMobile ? '95%' : '600px',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre de création de projet"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          ×
        </button>

        <h2 style={{
          margin: 0,
          color: '#1F1F1F',
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          fontFamily: 'Manrope',
          fontWeight: 600,
        }}>
          Créer un projet
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem',
            marginTop: isMobile ? '1.5rem' : '2rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Titre *
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Titre"
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
                  width: 'auto',
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Description
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description du projet"
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
                  width: '100%',
                }}

              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{
                color: 'black',
                fontSize: labelSize,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Contributeurs
              </label>
              <div className="assignee-dropdown" style={{ position: 'relative' }}>
                <div
                  style={{
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
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                    {selectContributorIds.length > 0 ? (
                      users
                        .filter(user => selectContributorIds.includes(user.id))
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
                                const newSelected = selectContributorIds.filter(id => id !== user.id);
                                setSelectContributorIds(newSelected);
                                setNewProject(prev => ({ ...prev, contributorIds: newSelected }));
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
                  <DownArrowIconComponent size={isMobile ? 14 : 16} />
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
                    {users.map(user => (
                      <div
                        key={user.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSelected = selectContributorIds.includes(user.id)
                            ? selectContributorIds.filter(id => id !== user.id)
                            : [...selectContributorIds, user.id];
                          setSelectContributorIds(newSelected);
                          setNewProject(prev => ({ ...prev, contributorIds: newSelected }));
                        }}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          background: selectContributorIds.includes(user.id) ? '#F3F4F6' : 'white',
                          fontSize: inputSize,
                          color: '#1F1F1F',
                        }}
                        role="option"
                        aria-selected={selectContributorIds.includes(user.id)}
                      >
                        {user.name} {user.role && `(${user.role})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginTop: isMobile ? '1.5rem' : '2rem',
          }}>
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                padding: isMobile ? '13px 24px' : '13px 24px',
                border: 'none',
                borderRadius: 10,
                background: isFormValid ? '#1F1F1F' : '#E5E7EB',
                color: isFormValid ? 'white' : '#9CA3AF',
                fontSize: buttonFontSize,
                fontFamily: 'Inter',
                fontWeight: 400,
                cursor: isFormValid ? 'pointer' : 'not-allowed',
              }}
            >
              Ajouter un projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

