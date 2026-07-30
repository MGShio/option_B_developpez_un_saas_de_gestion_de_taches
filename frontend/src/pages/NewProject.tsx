import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { createProject, type CreateProjectData } from '../services/projectService';

export default function NewProject() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [newProject, setNewProject] = useState<CreateProjectData>({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setError('Le nom du projet est requis');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const token = storage.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const createdProject = await createProject(token, newProject);
      navigate(`/projects/${createdProject.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Veuillez vous connecter</div>;
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 600,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
      }}>
        <h1 style={{
          color: '#1F1F1F',
          fontSize: 24,
          fontFamily: 'Manrope',
          fontWeight: 600,
        }}>
          Créer un nouveau projet
        </h1>
        <button
          onClick={() => navigate('/projects')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            color: '#6B7280',
          }}
        >
          ×
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            color: '#1F1F1F',
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 500,
            marginBottom: 8,
          }}>
            Nom du projet *
          </label>
          <input
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Application E-commerce"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: error && !newProject.name.trim() ? '1px solid #EF4444' : '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'Inter',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            color: '#1F1F1F',
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 500,
            marginBottom: 8,
          }}>
            Description
          </label>
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description du projet (optionnel)"
            rows={6}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'Inter',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{ 
            color: '#EF4444', 
            fontSize: 14, 
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isCreating || !newProject.name.trim()}
            style={{
              padding: '12px 24px',
              background: isCreating ? '#9CA3AF' : '#1F1F1F',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 500,
              cursor: isCreating ? 'not-allowed' : 'pointer',
            }}
          >
            {isCreating ? 'Création...' : 'Créer le projet'}
          </button>
        </div>
      </form>
    </div>
  );
}

