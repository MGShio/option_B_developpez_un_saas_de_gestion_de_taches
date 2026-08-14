// CreateProjectModal.tsx - Component

import { useState } from 'react';



export interface ModalCreateProjectData {
  name: string;
  description: string;
  contributorIds: string[];
}


interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (data: ModalCreateProjectData) => void;
  users: { id: string; name: string; role?: string }[];
}




export default function CreateProjectModal({ onClose, onSubmit, users }: CreateProjectModalProps) {


  const [newProject, setNewProject] = useState<ModalCreateProjectData>({
    name: '',
    description: '',
    contributorIds: [],
  });



  const [selectedContributors, setSelectedContributors] = useState<string[]>([]);


  const handleChange = (field: keyof Omit<ModalCreateProjectData, 'contributorIds'>, value: string) => {
    setNewProject(prev => ({ ...prev, [field]: value }));
  };


  const handleContributorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedContributors(selected);
    setNewProject(prev => ({ ...prev, contributorIds: selected }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newProject);
    onClose();
  };

  const isFormValid = newProject.name.trim() && newProject.description.trim();


// RENDER



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
        <h2 style={{ marginTop: 0, color: '#1F1F1F', fontSize: '1.5rem' }}>Nouveau Projet</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Nom du projet *
            </label>
            <input
              type="text"
              value={newProject.name}
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
              value={newProject.description}
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
              value={selectedContributors}
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
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
