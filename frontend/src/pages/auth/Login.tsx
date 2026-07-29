import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      // L'erreur est déjà gérée par useAuth
      console.error('Login failed:', err);
    }
  };

  // Comptes de test (d'après le seed)
  const testAccounts = [
    { email: 'alice@example.com', password: 'P@ssword123' },
    { email: 'bob@example.com', password: 'P@ssword123' },
    { email: 'caroline@example.com', password: 'P@ssword123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-[var(--color-primary)]">
          Connexion
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              required
              placeholder="alice@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              required
              placeholder="P@ssword123"
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-[var(--color-primary)] text-sm hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Comptes de test pour faciliter le développement */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Comptes de test :</p>
          <div className="space-y-1 text-xs">
            {testAccounts.map((account, index) => (
              <div key={index} className="flex justify-between">
                <span>{account.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="text-[var(--color-primary)] text-xs hover:underline"
                >
                  Remplir
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center mt-6 text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-[var(--color-primary)] hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
