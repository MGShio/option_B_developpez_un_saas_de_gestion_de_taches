import { useState } from 'react';

export interface CreateProjectData {
  name: string;
  description: string;
  contributorIds: number[];
}

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (data: CreateProjectData) => void;
  users: { id: number; name: string; role?: string }[];
}

export default function CreateProjectModal({ onClose, onSubmit, users }: CreateProjectModalProps) {
  const [newProject, setNewProject] = useState<CreateProjectData>({
    name: '',
    description: '',
    contributorIds: [],
  });

  const [selectedContributors, setSelectedContributors] = useState<string[]>([]);

  const handleChange = (field: keyof Omit<CreateProjectData, 'contributorIds'>, value: string) => {
    setNewProject(prev => ({ ...prev, [field]: value }));
  };

  const handleContributorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedContributors(selected);
    setNewProject(prev => ({ ...prev, contributorIds: selected.map(Number) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newProject);
    onClose();
  };

  const isFormValid = newProject.name.trim() && newProject.description.trim();

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
        paddingLeft: 73,
        paddingRight: 73,
        paddingTop: 79,
        paddingBottom: 79,
        position: 'relative',
        background: 'white',
        overflow: 'hidden',
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 56,
        display: 'inline-flex',
      }}>
        {/* Header */}
        <div style={{
          alignSelf: 'stretch',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 40,
          display: 'flex',
        }}>
          <h2 style={{
            alignSelf: 'stretch',
            color: '#1F1F1F',
            fontSize: 24,
            fontFamily: 'Manrope',
            fontWeight: 600,
            wordWrap: 'break-word',
          }}>
            Créer un projet
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 24,
            display: 'flex',
          }}>
            {/* Titre */}
            <div
              data-property-1="Default"
              data-show-input="true"
              style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 7,
                display: 'flex',
              }}
            >
              <label style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Titre*
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder=""
                style={{
                  alignSelf: 'stretch',
                  height: 53,
                  paddingLeft: 17,
                  paddingRight: 17,
                  paddingTop: 19,
                  paddingBottom: 19,
                  background: 'white',
                  borderRadius: 4,
                  outline: '1px #E5E7EB solid',
                  outlineOffset: '-1px',
                  border: 'none',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  color: '#0F0F0F',
                }}
                required
              />
            </div>

            {/* Description */}
            <div
              data-property-1="Default"
              data-show-input="true"
              style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 7,
                display: 'flex',
              }}
            >
              <label style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Description*
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder=""
                rows={3}
                style={{
                  alignSelf: 'stretch',
                  padding: '19px 17px',
                  background: 'white',
                  borderRadius: 4,
                  outline: '1px #E5E7EB solid',
                  outlineOffset: '-1px',
                  border: 'none',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  color: '#0F0F0F',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            {/* Contributeurs */}
            <div
              data-property-1="Combo box"
              data-show-input="true"
              style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 7,
                display: 'flex',
              }}
            >
              <label style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Contributeurs
              </label>
              <div style={{
                alignSelf: 'stretch',
                height: 53,
                paddingLeft: 17,
                paddingRight: 17,
                paddingTop: 19,
                paddingBottom: 19,
                background: 'white',
                overflow: 'hidden',
                borderRadius: 4,
                outline: '1px #E5E7EB solid',
                outlineOffset: '-1px',
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'inline-flex',
                border: 'none',
              }}>
                <select
                  multiple
                  value={selectedContributors}
                  onChange={handleContributorsChange}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 12,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    color: selectedContributors.length > 0 ? '#0F0F0F' : '#6B7280',
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
                <svg
                  width="16"
                  height="8"
                  viewBox="0 0 16 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: 'rotate(180deg)' }}
                >
                  <path d="M2 2L8 6L14 2" stroke="#0F0F0F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Bouton Ajouter un projet */}
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                width: 181,
                height: 50,
                paddingLeft: 74,
                paddingRight: 74,
                paddingTop: 13,
                paddingBottom: 13,
                background: isFormValid ? '#1F1F1F' : '#E5E7EB',
                overflow: 'hidden',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                display: 'inline-flex',
                border: 'none',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
              }}
            >
              <span
                style={{
                  textAlign: 'center',
                  color: isFormValid ? 'white' : '#9CA3AF',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  wordWrap: 'break-word',
                }}
              >
                Ajouter un projet
              </span>
            </button>
          </form>
        </div>

        {/* Bouton de fermeture */}
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
      </div>
    </div>
  );
}
