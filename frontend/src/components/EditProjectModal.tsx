import { useState } from 'react';

export interface EditProjectData {
  id: number;
  name: string;
  description: string;
  contributorIds: number[];
}

interface EditProjectModalProps {
  project: EditProjectData;
  onClose: () => void;
  onSave: (data: EditProjectData) => void;
  users: { id: number; name: string; role?: string }[];
}

export default function EditProjectModal({ project, onClose, onSave, users }: EditProjectModalProps) {
  const [editedProject, setEditedProject] = useState<EditProjectData>(project);
  const [selectContributorIds, setSelectContributorIds] = useState<string[]>(project.contributorIds.map(String));

  const handleChange = (field: keyof Omit<EditProjectData, 'contributorIds'>, value: string) => {
    setEditedProject(prev => ({ ...prev, [field]: value }));
  };

  const handleContributorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectContributorIds(selected);
    setEditedProject(prev => ({ ...prev, contributorIds: selected.map(Number) }));
  };

  const handleSave = () => {
    onSave(editedProject);
    onClose();
  };

  const isFormValid = editedProject.name.trim() && editedProject.description.trim();

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
            Modifier un projet
          </h2>

          {/* Form */}
          <div style={{
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
                value={editedProject.name}
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
                  overflow: 'hidden',
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
                value={editedProject.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder=""
                rows={3}
                style={{
                  alignSelf: 'stretch',
                  padding: '19px 17px',
                  background: 'white',
                  overflow: 'hidden',
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
                  value={selectContributorIds}
                  onChange={handleContributorsChange}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 12,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    color: selectContributorIds.length > 0 ? '#0F0F0F' : '#6B7280',
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
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
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
            Enregistrer
          </span>
        </button>

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
