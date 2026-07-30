import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Extraire les initiales du nom de l'utilisateur
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#F9FAFB',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        width: '100%',
        padding: '8px 100px',
        background: 'white',
        boxShadow: '0px 4px 12px 1px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
          width: 147,
          height: 18.72,
          background: '#D3590B',
          borderRadius: 4,
          display: 'block',
        }} />

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: 16 }}>
          <Link
            to="/dashboard"
            style={{
              padding: '27px 62px',
              background: '#0F0F0F',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textDecoration: 'none',
            }}
          >
            <svg width="11" height="8" viewBox="0 0 11 8" fill="white" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="8" fill="currentColor" />
            </svg>
            <svg width="11" height="8" viewBox="0 0 11 8" fill="white" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="8" fill="currentColor" />
            </svg>
            <svg width="11" height="8" viewBox="0 0 11 8" fill="white" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="8" fill="currentColor" />
            </svg>
            <svg width="11" height="8" viewBox="0 0 11 8" fill="white" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="8" fill="currentColor" />
            </svg>
            Tableau de bord
          </Link>
          <Link
            to="/projects"
            style={{
              padding: '27px 62px',
              background: 'white',
              color: '#D3590B',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textDecoration: 'none',
            }}
          >
            <svg width="11" height="14" viewBox="0 0 11 14" fill="#D3590B" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="14" fill="currentColor" />
            </svg>
            <svg width="11" height="14" viewBox="0 0 11 14" fill="#D3590B" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="14" fill="currentColor" />
            </svg>
            Projets
          </Link>
        </nav>

        {/* User Avatar */}
        {user && isAuthenticated ? (
          <div 
            onClick={() => navigate('/account')}
            style={{
              width: 65,
              height: 65,
              padding: '21px 12px',
              background: '#FFE8D9',
              borderRadius: 32.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              textAlign: 'center',
              color: '#0F0F0F',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: 0.28,
            }}>
              {getInitials(user.name)}
            </span>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              padding: '21px 24px',
              background: '#1F1F1F',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Se connecter
          </Link>
        )}
      </header>

      {/* Contenu principal */}
      <main style={{
        flex: 1,
        padding: '40px 100px',
      }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        width: '100%',
        height: 68,
        background: 'white',
        position: 'sticky',
        bottom: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        borderTop: '1px solid #E5E7EB',
      }}>
        <div style={{ width: 101, height: 12.86, background: '#0F0F0F', borderRadius: 2 }} />
        <span style={{
          position: 'absolute',
          right: 30,
          color: 'black',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: 400,
        }}>
          Abricot 2025
        </span>
      </footer>
    </div>
  );
}
