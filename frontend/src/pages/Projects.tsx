import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [search, setSearch] = useState('');
  
  // TODO: Récupérer depuis API /api/projects
  const projects = [
    { id: 1, name: 'Application E-commerce', status: 'En cours', owner: 'Alice Martin' },
    { id: 2, name: 'Système de Gestion RH', status: 'Terminé', owner: 'Emma Rousseau' },
    { id: 3, name: 'Application Mobile Fitness', status: 'En cours', owner: 'Henri Laurent' },
    { id: 4, name: 'Plateforme de Formation', status: 'Terminé', owner: 'Jacques Durand' },
    { id: 5, name: 'Dashboard Analytics', status: 'En cours', owner: 'Bob Dupont' },
  ];

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mes Projets</h1>
        <Link
          to="/projects/new"
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors font-medium"
        >
          + Nouveau projet
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Liste des projets */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-[var(--color-primary)] hover:underline font-medium"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'En cours' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {project.owner}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    to={`/projects/${project.id}/edit`}
                    className="text-gray-500 hover:text-gray-700 mr-3"
                  >
                    Éditer
                  </Link>
                  <button className="text-red-500 hover:text-red-700">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProjects.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucun projet trouvé
          </div>
        )}
      </div>
    </div>
  );
}
