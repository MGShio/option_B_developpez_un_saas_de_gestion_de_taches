import { useState } from 'react';

export interface EditProjectData {
  id: string;
  name: string;
  description: string;
  contributorIds: string[];
}

interface EditProjectModalProps {
  project: EditProjectData;
  onClose: () => void;
  onSave: (data: EditProjectData) => void;
  users: { id: string; name: string; role?: string }[];
}

export default function EditProjectModal({ project, onClose, onSave, users }: EditProjectModalProps) {
  const [editedProject, setEditedProject] = useState<EditProjectData>(project);
  const [selectContributorIds, setSelectContributorIds] = useState<string[]>(project.contributorIds);

  const handleChange = (field: keyof Omit<EditProjectData, 'contributorIds'>, value: string) => {
    setEditedProject(prev => ({ ...prev, [field]: value }));
  };

  const handleContributorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectContributorIds(selected);
    setEditedProject(prev => ({ ...prev, contributorIds: selected }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, color: '#1F1F1F', fontSize: '1.5rem' }}>Modifier le projet</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Nom du projet *
            </label>
            <input
              type="text"
              value={editedProject.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#F9FAFB',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Description *
            </label>
            <textarea
              value={editedProject.description}
              onChange={(e) => handleChange('description', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#F9FAFB',
                minHeight: '100px',
                resize: 'vertical',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Contributeurs
            </label>
            <select
              multiple
              value={selectContributorIds}
              onChange={handleContributorsChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#F9FAFB',
                minHeight: '100px',
              }}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.role && `(${user.role})`}
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
                fontSize: '1rem',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: isFormValid ? '#1F1F1F' : '#9CA3AF',
                color: 'white',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
              }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
