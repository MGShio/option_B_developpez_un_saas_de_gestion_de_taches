import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Account() {
  const { user, logout, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // TODO: Appel API /api/users/me
    try {
      // const response = await fetch('http://localhost:8000/api/users/me', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${storage.getToken()}`,
      //   },
      //   body: JSON.stringify({ name, email }),
      // });
      setSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    // TODO: Appel API /api/auth/change-password
    try {
      // const response = await fetch('http://localhost:8000/api/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${storage.getToken()}`,
      //   },
      //   body: JSON.stringify({ currentPassword, newPassword }),
      // });
      setSuccess('Mot de passe changé avec succès !');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError('Erreur lors du changement de mot de passe');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Erreur lors de la déconnexion');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mon Compte</h1>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Informations du profil */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Informations personnelles
        </h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
              readOnly
            />
          </div>
          
          <button
            type="submit"
            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors font-medium"
          >
            Mettre à jour le profil
          </button>
        </form>
      </div>

      {/* Changer le mot de passe */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Changer le mot de passe
        </h2>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
          </div>
          
          <button
            type="submit"
            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors font-medium"
          >
            Changer le mot de passe
          </button>
        </form>
      </div>

      {/* Actions du compte */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Actions du compte
        </h2>
        <div className="space-y-3">
          <Link
            to="/projects"
            className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Mes projets
          </Link>
          <button 
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full text-center bg-red-100 text-red-700 py-2 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Déconnexion...' : 'Supprimer mon compte'}
          </button>
        </div>
      </div>
    </div>
  );
}
