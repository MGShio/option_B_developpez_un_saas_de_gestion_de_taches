import { useParams, Link } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  
  // TODO: Récupérer depuis API /api/projects/:id
  const project = {
    id: parseInt(id || '1'),
    name: 'Application E-commerce',
    description: 'Développement d\'une application e-commerce complète avec panier et paiement en ligne.',
    status: 'En cours',
    owner: 'Alice Martin',
    createdAt: '2026-01-15',
    updatedAt: '2026-07-28',
    tasks: [
      { id: 1, title: 'Conception de la base de données', status: 'Terminé', assignee: 'Bob Dupont' },
      { id: 2, title: 'Développement de l\'API REST', status: 'En cours', assignee: 'David Moreau' },
      { id: 3, title: 'Interface utilisateur responsive', status: 'À faire', assignee: 'Caroline Leroy' },
      { id: 4, title: 'Intégration système de paiement', status: 'À faire', assignee: 'Bob Dupont' },
    ],
    members: [
      { id: 1, name: 'Alice Martin', role: 'Propriétaire' },
      { id: 2, name: 'Bob Dupont', role: 'Administrateur' },
      { id: 3, name: 'Caroline Leroy', role: 'Contributeur' },
      { id: 4, name: 'David Moreau', role: 'Contributeur' },
    ],
  };

  const taskStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête du projet */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className="text-gray-500">Propriétaire: {project.owner}</span>
              <span className="text-gray-500">Créé le: {project.createdAt}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'En cours' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/projects/${project.id}/edit`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Éditer
            </Link>
            <button className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors text-sm font-medium">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tâches */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Tâches</h2>
            <Link
              to={`/projects/${project.id}/tasks/new`}
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors text-sm font-medium"
            >
              + Nouvelle tâche
            </Link>
          </div>
          
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <div>
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-500">Assigné à: {task.assignee}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Membres */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Membres</h2>
          <div className="space-y-3">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                {member.role !== 'Propriétaire' && (
                  <button className="text-red-500 hover:text-red-700 text-sm">
                    Retirer
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
            + Ajouter un membre
          </button>
        </div>
      </div>
    </div>
  );
}
