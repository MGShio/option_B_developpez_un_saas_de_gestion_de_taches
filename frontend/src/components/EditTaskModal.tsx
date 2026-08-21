// EditTaskModal.tsx - Component

import { useState, useEffect, useRef } from 'react';
const calendaricongreyIcon = '/images/calendaricongrey.svg';
const DownArrowIcon = '/images/displaycom.svg';

// Define the icon component
const DownArrowIconComponent = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={8} viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L8 6L14 2" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Focus outline style for accessibility
const focusOutlineStyle: React.CSSProperties = {
  outline: '2px solid var(--color-primary)',
  outlineOffset: '2px',
};

// Status options with colors
const statusOptions = [
  { value: 'À faire', label: 'À faire', bg: '#FFE0E0', color: '#EF4444' },
  { value: 'En cours', label: 'En cours', bg: '#FFF0D7', color: '#E08D00' },
  { value: 'Terminé', label: 'Terminé', bg: '#D1FAE5', color: '#059669' },
];

export interface EditTaskData {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assigneeIds: string[];
  status: 'À faire' | 'En cours' | 'Terminé';
}

interface EditTaskModalProps {
  task: EditTaskData;
  onClose: () => void;
  onSave: (updatedTask: EditTaskData) => void;
  users: { id: string; name: string; role?: string }[];
}


export default function EditTaskModal({ task, onClose, onSave, users }: EditTaskModalProps) {
  const isMobile = window.innerWidth <= 768;
  const inputSize = isMobile ? '0.875rem' : '0.9375rem';
  const labelSize = isMobile ? '0.875rem' : '0.9375rem';
  const buttonFontSize = isMobile ? '0.875rem' : '1rem';

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<EditTaskData>(task);

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

  const handleChange = (field: keyof EditTaskData, value: string | string[] | 'À faire' | 'En cours' | 'Terminé') => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const handleStatusChange = (status: 'À faire' | 'En cours' | 'Terminé') => {
    setEditedTask(prev => ({ ...prev, status }));
  };

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
    }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
        background: 'white',
        padding: isMobile ? '1.5rem' : '2rem',
        borderRadius: 10,
        width: isMobile ? '95%' : '600px',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
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
          Modifier la tâche
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1rem' : '1.5rem',
          marginTop: isMobile ? '1.5rem' : '2rem',
        }}>
          {/* Titre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              color: 'black',
              fontSize: labelSize,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Titre*
            </label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => handleChange('title', e.target.value)}
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
              }}
              required
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              color: 'black',
              fontSize: labelSize,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Description*
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) => handleChange('description', e.target.value)}
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
              }}
              required
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            />
          </div>

          {/* Date limite */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              color: 'black',
              fontSize: labelSize,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Échéance*
            </label>
            <input
              id="edit-task-dueDate"
              type="date"
              value={editedTask.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: 0,
                height: 0,
                padding: 0,
                margin: 0,
                border: 'none',
              }}
              required
            />
            <button
              type="button"
              onClick={() => {
                const dateInput = document.getElementById('edit-task-dueDate') as HTMLInputElement;
                if (dateInput) {
                  if (!dateInput.value) {
                    const today = new Date().toISOString().split('T')[0];
                    dateInput.value = today;
                    handleChange('dueDate', today);
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
                color: editedTask.dueDate ? '#1F1F1F' : '#6B7280',
              }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
            >
              <span>
                {editedTask.dueDate
                  ? new Date(editedTask.dueDate).toLocaleDateString('fr-FR', {
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

          {/* Assignés */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              color: 'black',
              fontSize: labelSize,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              Assigné à :
            </label>
            <div className="assignee-dropdown" style={{
              position: 'relative',
            }}>
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
                onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                  {editedTask.assigneeIds.length > 0 ? (
                    users
                      .filter(user => editedTask.assigneeIds.includes(String(user.id)))
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
                              const newSelected = editedTask.assigneeIds.filter(id => id !== String(user.id));
                              handleChange('assigneeIds', newSelected);
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
                        const newSelectedAssignees = editedTask.assigneeIds.includes(String(user.id))
                          ? editedTask.assigneeIds.filter(id => id !== String(user.id))
                          : [...editedTask.assigneeIds, String(user.id)];
                        handleChange('assigneeIds', newSelectedAssignees);
                      }}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        background: editedTask.assigneeIds.includes(String(user.id)) ? '#F3F4F6' : 'white',
                        fontSize: inputSize,
                        color: '#1F1F1F',
                      }}
                      role="option"
                      aria-selected={editedTask.assigneeIds.includes(String(user.id))}
                    >
                      {user.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statut */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.5rem' : '1rem' }}>
            <label style={{
              color: 'black',
              fontSize: labelSize,
              fontFamily: 'Inter',
              fontWeight: 400,
              marginTop: '25px',
            }}>
              Statut :
            </label>
            <div style={{
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
                  onClick={() => handleStatusChange(option.value as 'À faire' | 'En cours' | 'Terminé')}
                  style={{
                    padding: isMobile ? '4px 12px' : '4px 16px',
                    background: (option.value === 'À faire' && option.value !== editedTask.status) ? '#E5E7EB' : option.bg,
                    borderRadius: 50,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  role="radio"
                  aria-selected={option.value === editedTask.status}
                  aria-label={option.label}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
                >
                  <span style={{
                    color: (option.value === 'À faire' && option.value !== editedTask.status) ? '#6B7280' : option.color,
                    fontSize: inputSize,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-start',
          marginTop: isMobile ? '1.5rem' : '2rem',
        }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: isMobile ? '13px 24px' : '13px 24px',
              border: 'none',
              borderRadius: 10,
              background: '#1F1F1F',
              color: 'white',
              fontSize: buttonFontSize,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: 'pointer',
            }}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

