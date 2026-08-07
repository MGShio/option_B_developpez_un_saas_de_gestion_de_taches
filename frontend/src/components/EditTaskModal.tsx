import { useState } from 'react';

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
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ marginTop: 0, color: '#1F1F1F', fontSize: '1.5rem' }}>Modifier la tâche</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
            Titre *
          </label>
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => handleChange('title', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
            Description *
          </label>
          <textarea
            value={editedTask.description}
            onChange={(e) => handleChange('description', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '1rem',
              minHeight: '100px',
              resize: 'vertical',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
            Statut *
          </label>
          <select
            value={editedTask.status}
            onChange={(e) => handleChange('status', e.target.value as 'À faire' | 'En cours' | 'Terminé')}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
            Date limite *
          </label>
          <input
            type="date"
            value={editedTask.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
            Assignés
          </label>
          <select
            multiple
            value={selectAssigneeIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setSelectAssigneeIds(selected);
              handleChange('assigneeIds', selected);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '1rem',
              minHeight: '100px',
            }}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#1F1F1F',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
