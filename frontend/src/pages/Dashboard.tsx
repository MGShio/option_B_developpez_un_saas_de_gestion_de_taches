import { Link } from 'react-router-dom';

export default function Dashboard() {
  // TODO: Récupérer les données de l'utilisateur et ses projets depuis l'API
  const user = { name: 'Alice Martin', email: 'alice@example.com' };
  const recentProjects = [
    { id: 1, name: 'Application E-commerce', status: 'En cours' },
    { id: 2, name: 'Système de Gestion RH', status: 'Terminé' },
  ];
  const stats = {
    totalProjects: 5,
    completedTasks: 42,
    pendingTasks: 8,
  };

  return (
    <div className="space-y-8">
      {/* Bienvenue */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour, {user.name} !
        </h1>
        <p className="text-gray-600 mt-2">
          Voici votre tableau de bord. Gérez vos projets et tâches efficacement.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-700">Projets</h3>
          <p className="text-3xl font-bold text-[var(--color-primary)] mt-2">
            {stats.totalProjects}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-700">Tâches terminées</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.completedTasks}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-700">Tâches en attente</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">
            {stats.pendingTasks}
          </p>
        </div>
      </div>

      {/* Projets récents */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Projets récents
          </h2>
          <Link
            to="/projects"
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors text-sm font-medium"
          >
            Voir tous les projets
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block p-4 border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.status}</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
