// App.tsx - Application root component

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import ProjectDetail from './pages/ProjectDetail';
import Account from './pages/Account';
import NotFound from './pages/NotFound';


const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

// Composant pour les routes protégées

function PrivateRoute({ children }: { children: React.ReactNode }) {



  const { isAuthenticated, isLoading } = useAuth();


  if (isLoading) {
    return <div style={loadingStyle}>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Composant pour les routes publiques (redirect si déjà connecté)

function PublicRoute({ children }: { children: React.ReactNode }) {



  const { isAuthenticated, isLoading } = useAuth();


  if (isLoading) {
    return <div style={loadingStyle}>Chargement...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}





export default function App() {

// RENDER



  return (


    <AuthProvider>
      <BrowserRouter>


        <Routes>
          {/* Routes publiques (sans layout) */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Routes protégées (avec layout) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="projects" element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            } />
            <Route path="projects/new" element={
              <PrivateRoute>
                <NewProject />
              </PrivateRoute>
            } />
            <Route path="projects/:id" element={
              <PrivateRoute>
                <ProjectDetail />
              </PrivateRoute>
            } />
            <Route path="account" element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            } />
          </Route>

          {/* Page 404 - doit être en dehors du layout */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
