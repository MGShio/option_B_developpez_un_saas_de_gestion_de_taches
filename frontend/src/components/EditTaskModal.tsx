import { useState } from 'react';

export interface EditTaskData {
  id: number;
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
  users: { id: number; name: string; role?: string }[];
}

const statusOptions = [
  { value: 'À faire', label: 'À faire', bg: '#FFE0E0', color: '#EF4444' },
  { value: 'En cours', label: 'En cours', bg: '#FFF0D7', color: '#E08D00' },
  { value: 'Terminé', label: 'Terminé', bg: '#F1FFF7', color: '#27AE60' },
];

export default function EditTaskModal({ task, onClose, onSave, users }: EditTaskModalProps) {
  const [selectAssigneeIds, setSelectAssigneeIds] = useState<string[]>(task.assigneeIds);
  const [editedTask, setEditedTask] = useState<EditTaskData>(task);

  const handleChange = (field: keyof EditTaskData, value: string | string[] | 'À faire' | 'En cours' | 'Terminé') => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

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
          <div style={{
            alignSelf: 'stretch',
            color: '#1F1F1F',
            fontSize: 24,
            fontFamily: 'Manrope',
            fontWeight: 600,
            wordWrap: 'break-word',
          }}>
            Modifier
          </div>

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
                wordWrap: 'break-word',
              }}>
                Titre
              </label>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => handleChange('title', e.target.value)}
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
                wordWrap: 'break-word',
              }}>
                Description
              </label>
              <textarea
                value={editedTask.description}
                onChange={(e) => handleChange('description', e.target.value)}
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
              />
            </div>

            {/* Échéance */}
            <div
              data-property-1="date picker"
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
                wordWrap: 'break-word',
              }}>
                Échéance
              </label>
              <input
                type="date"
                value={editedTask.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
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
              />
            </div>

            {/* Assigné à */}
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
                wordWrap: 'break-word',
              }}>
                Assigné à :
              </label>
              <select
                multiple
                value={selectAssigneeIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectAssigneeIds(selected);
                  setEditedTask(prev => ({ ...prev, assigneeIds: selected }));
                }}
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
              >
                {users.map(user => (
                  <option key={user.id} value={String(user.id)}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div style={{
              alignSelf: 'stretch',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 16,
              display: 'flex',
            }}>
              <label style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
                wordWrap: 'break-word',
              }}>
                Statut :
              </label>
              <div style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 8,
                display: 'inline-flex',
              }}>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange('status', option.value)}
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 4,
                      paddingBottom: 4,
                      background: editedTask.status === option.value ? option.bg : '#E5E7EB',
                      overflow: 'hidden',
                      borderRadius: 50,
                      border: 'none',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                      display: 'flex',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        color: editedTask.status === option.value ? option.color : '#6B7280',
                        fontSize: 14,
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        wordWrap: 'break-word',
                      }}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
          style={{
            width: 244,
            height: 50,
            paddingLeft: 74,
            paddingRight: 74,
            paddingTop: 13,
            paddingBottom: 13,
            background: editedTask.title.trim() ? '#1F1F1F' : '#E5E7EB',
            overflow: 'hidden',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            display: 'inline-flex',
            border: 'none',
            cursor: editedTask.title.trim() ? 'pointer' : 'not-allowed',
          }}
          disabled={!editedTask.title.trim()}
        >
          <span
            style={{
              textAlign: 'center',
              color: editedTask.title.trim() ? 'white' : '#9CA3AF',
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
