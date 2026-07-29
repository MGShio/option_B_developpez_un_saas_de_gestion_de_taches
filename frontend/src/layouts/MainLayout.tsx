import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header / Navigation */}
      <header className="bg-[var(--color-secondary)] text-[var(--color-white)] px-6 py-4">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link to="/dashboard" className="text-xl font-bold">
            Abricot
          </Link>
          <div className="flex gap-6">
            <Link to="/projects" className="hover:text-[var(--color-primary)] transition-colors">
              Projets
            </Link>
            <Link to="/account" className="hover:text-[var(--color-primary)] transition-colors">
              Mon compte
            </Link>
            <Link to="/login" className="hover:text-[var(--color-primary)] transition-colors">
              Se connecter
            </Link>
          </div>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-secondary)] text-[var(--color-white)] px-6 py-4 mt-auto">
        <p className="text-center">© 2026 - Gestion de tâches</p>
      </footer>
    </div>
  );
}
