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

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background)',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '28rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'var(--color-primary)',
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 1rem',
    border: '1px solid var(--color-border)',
    borderRadius: '0.375rem',
    outline: 'none',
  };

  const inputFocusStyle: React.CSSProperties = {
    borderColor: 'transparent',
    boxShadow: '0 0 0 2px var(--color-primary)',
  };

  const forgotPasswordStyle: React.CSSProperties = {
    textAlign: 'right',
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    fontSize: '0.875rem',
    textDecoration: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    opacity: isLoading ? 0.5 : 1,
  };

  const testSectionStyle: React.CSSProperties = {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.5rem',
  };

  const testTitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#4B5563',
    marginBottom: '0.5rem',
  };

  const testAccountStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
  };

  const fillButtonStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    fontSize: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#4B5563',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Connexion</h1>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle, inputStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
              placeholder="alice@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle, inputStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
              placeholder="P@ssword123"
            />
          </div>

          <div style={forgotPasswordStyle}>
            <Link to="/forgot-password" style={linkStyle}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyle}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Comptes de test pour faciliter le développement */}
        <div style={testSectionStyle}>
          <p style={testTitleStyle}>Comptes de test :</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {testAccounts.map((account, index) => (
              <div key={index} style={testAccountStyle}>
                <span>{account.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  style={fillButtonStyle}
                >
                  Remplir
                </button>
              </div>
            ))}
          </div>
        </div>

        <p style={footerStyle}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={linkStyle}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
