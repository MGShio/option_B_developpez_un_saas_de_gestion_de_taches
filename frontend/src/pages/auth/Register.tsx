import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (password !== confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      // L'erreur est déjà gérée par useAuth
      console.error('Registration failed:', err);
    }
  };

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

  const hintStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#6B7280',
    marginTop: '0.25rem',
  };

  const errorHintStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#EF4444',
    marginTop: '0.25rem',
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
    opacity: isLoading || !password || password !== confirmPassword ? 0.5 : 1,
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#4B5563',
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    fontSize: '0.875rem',
    textDecoration: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Créer un compte</h1>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label htmlFor="name" style={labelStyle}>
              Nom
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle, inputStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
            />
          </div>

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
              minLength={8}
            />
            <p style={hintStyle}>Minimum 8 caractères</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle, inputStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              required
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p style={errorHintStyle}>Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || password !== confirmPassword}
            style={buttonStyle}
          >
            {isLoading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p style={footerStyle}>
          Déjà un compte ?{' '}
          <Link to="/login" style={linkStyle}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
