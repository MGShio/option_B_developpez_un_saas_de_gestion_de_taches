"use client";
// ============================================
// Dashboard.tsx - Page tableau de bord
// ============================================
// ROLE: Page principale de l'application affichant :
// - Les statistiques du dashboard
// - La liste des taches assignees a l'utilisateur
// - Une vue Kanban des taches
// - Une vue Projets avec les taches par projet
// - Un bouton pour creer un nouveau projet
//
// DEPENDANCES :
// - react : Pour les hooks (useState, useEffect, useCallback, useMemo)
// - next/navigation : Pour la navigation (useRouter)
// - @/contexts/AuthContext : Pour l'utilisateur connecte
// - @/utils/storage : Pour le token JWT
// - @/services/taskService : Pour recuperer les taches assignees
// - @/services/dashboardService : Pour les statistiques et projets avec comptes de taches
// - @/services/projectService : Pour les projets et creation de projet
// - @/services/userService : Pour la liste des utilisateurs
// - @/components/CreateProjectModal : Modal de creation de projet
// - @/components/ProjectsWithTasksView : Vue des projets avec leurs taches
//

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/utils/storage";
import {
  getAssignedTasks,
  searchTasks,
  type Task,
} from "@/services/taskService";
import {
  getDashboardStats,
  getProjectsWithTaskCounts,
  type DashboardStats,
  type ProjectWithTaskCount,
  type TaskSummary,
} from "@/services/dashboardService";
import {
  getProjects,
  createProject,
  type Project,
} from "@/services/projectService";
import CreateProjectModal,
{ type ModalCreateProjectData } from "@/components/CreateProjectModal";
import ProjectsWithTasksView from "@/components/ProjectsWithTasksView";
import { getUsers } from "@/services/userService";

// ============================================
// IMPORTS DES ICONES
// ============================================
const checkmarkIcon = "/images/checkmark.svg";
const calendarIcon = "/images/calendaricon.svg";
const folderIconGrey = "/images/foldericongrey.svg";
const calendarIconGrey = "/images/calendaricongrey.svg";
const textBubbleGrey = "/images/textbubblegrey.svg";


// ============================================
// CONSTANTES GLOBALES
// ============================================

// Couleurs des statuts - Conforme WCAG 2.1 AA
// Chaque statut a : fond (bg), texte (color), bordure (border)
const statusColors: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  "À faire": { bg: "#FFE0E0", color: "#EF4444", border: "#FECACA" },
  "En cours": { bg: "#FFF0D7", color: "#E08D00", border: "#FED7AA" },
  Terminé: { bg: "#D1FAE5", color: "#059669", border: "#A7F3D0" },
};

// Libelles des statuts pour l'accessibilite
const TASK_STATUS_LABELS: Record<string, string> = {
  "À faire": "À faire",
  "En cours": "En cours",
  Terminé: "Terminé",
};


// ============================================
// COMPOSANTS REUTILISABLES (Icones et Separateurs)
// ============================================

// Composant Separator reutilisable - barre verticale de separation
const Separator = () => (
  <div
    style={{
      width: "0.0625rem",
      height: "0.75rem",
      background: "#9CA3AF",
      transform: "rotate(90deg)",
      userSelect: "none",
    }}
    role="separator"
    aria-hidden="true"
  />
);

// Composant SearchIcon - Icone de recherche personnalisee
const SearchIcon = ({ color = "#6B7280" }: { color?: string }) => (
  <svg
    width="0.875rem"
    height="0.875rem"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="7"
      cy="7"
      r="6"
      stroke={color}
      strokeWidth="0.0625rem"
      fill="none"
    />
    <path
      d="M10 10L13 13"
      stroke={color}
      strokeWidth="0.0625rem"
      strokeLinecap="round"
    />
  </svg>
);

// Icones pour les vues
const CheckmarkIcon = ({ isActive }: { isActive: boolean }) => (
  <img
    src={checkmarkIcon}
    alt="Vue Liste"
    style={{ width: "1rem", height: "1rem", userSelect: "none" }}
  />
);

const CalendarIcon = ({ isActive }: { isActive: boolean }) => (
  <img
    src={calendarIcon}
    alt="Vue Kanban"
    style={{ width: "1rem", height: "1rem", userSelect: "none" }}
  />
);

// Meta icons for TaskCard
const FolderIconGrey = () => (
  <img
    src={folderIconGrey}
    alt=""
    style={{ width: "1rem", height: "1rem", userSelect: "none" }}
  />
);

const CalendarIconGrey = () => (
  <img
    src={calendarIconGrey}
    alt=""
    style={{ width: "1rem", height: "1rem", userSelect: "none" }}
  />
);

const TextBubbleGrey = () => (
  <img
    src={textBubbleGrey}
    alt=""
    style={{ width: "1rem", height: "1rem", userSelect: "none" }}
  />
);


// ============================================
// COMPOSANT PRINCIPAL - Dashboard
// ============================================
export default function Dashboard() {
  // ============================================
  // 1. HOOKS ET CONTEXTES
  // ============================================

  // Recuperation de l'utilisateur connecte depuis AuthContext
  const { user, isAuthenticated } = useAuth();
  
  // Router Next.js pour la navigation
  const router = useRouter();

  // ============================================
  // 2. ETATS (STATE MANAGEMENT)
  // ============================================

  // Etat pour la largeur de la fenetre (responsive)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440,
  );

  // Etat pour la vue active : 'list', 'kanban', ou 'projects'
  const [activeView, setActiveView] = useState<"list" | "kanban" | "projects">(
    "list",
  );

  // Etat pour la recherche
  const [searchQuery, setSearchQuery] = useState("");

  // Etat pour les taches recuperees
  const [tasks, setTasks] = useState<Task[]>([]);

  // Etat pour les projets
  const [projects, setProjects] = useState<Project[]>([]);

  // Etat pour les projets avec statistiques (nombre de taches)
  const [projectsWithStats, setProjectsWithStats] = useState<
    ProjectWithTaskCount[]
  >([]);

  // Handler for project click - Redirige vers la page du projet
  const handleProjectClick = useCallback(
    (projectId: string) => {
      router.push("/projects/" + projectId);
    },
    [router],
  );

  // Compute tasks by project for ProjectsWithTasksView
  // Memoisation pour eviter les recalculs inutiles
  const tasksByProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (!map.has(task.projectId)) {
        map.set(task.projectId, []);
      }
      map.get(task.projectId)?.push(task);
    });
    return map;
  }, [tasks]);

  // Etat pour les statistiques du dashboard
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );

  // Etat pour la liste des utilisateurs
  const [users, setUsers] = useState<
    { id: string; name: string; role?: string }[]
  >([]);

  // Etat de chargement
  const [isLoading, setIsLoading] = useState(true);

  // Etat d'erreur
  const [error, setError] = useState<string | null>(null);

  // Etat pour la modale de creation de projet
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Etat pour les donnees du nouveau projet
  const [newProject, setNewProject] = useState<ModalCreateProjectData>({
    name: "",
    description: "",
    contributorIds: [],
  });

  // ============================================
  // 3. EFFETS (USE EFFECT)
  // ============================================

  // EFFET: Gestion du resize pour le responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ============================================
  // 4. VARIABLES DE STYLE RESPONSIVE
  // ============================================

  // Calcul des tailles adaptatives
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  // Tailles adaptatives pour differentes sections
  const welcomeSectionWidth = isMobile ? "100%" : isTablet ? "70%" : "36vw";
  const mainContainerWidth = isMobile
    ? "100%"
    : isTablet
      ? "95%"
      : "min(80.97vw, 1400px)";
  const tasksContainerWidth = mainContainerWidth;

  const maxContentWidth = isMobile ? "100%" : "82vw";
  const titleSize = isMobile ? "1.5rem" : "1.75rem";
  const subtitleSize = isMobile ? "1rem" : "1.125rem";
  const sectionTitleSize = isMobile ? "1.125rem" : "1.25rem";
  const sectionSubtitleSize = isMobile ? "0.875rem" : "1rem";
  const taskTitleSize = isMobile ? "1rem" : "1.125rem";
  const taskDescriptionSize = isMobile ? "0.875rem" : "0.9375rem";
  const metaTextSize = isMobile ? "0.75rem" : "0.875rem";
  const statusBadgeSize = isMobile ? "0.75rem" : "0.875rem";
  const buttonFontSize = isMobile ? "0.875rem" : "1rem";
  const inputHeight = isMobile ? "min(2.75rem, 6.5vh)" : "min(3.3125rem, 4vh)";
  const containerPadding = isMobile ? "1rem" : isTablet ? "1.5rem" : "2.5rem";

  // ============================================
  // 5. FONCTIONS DE RECUPERATION DES DONNEES
  // ============================================

  // Fonction pour recuperer toutes les donnees du dashboard
  // @action:
  //   1. Recupere les taches assignees
  //   2. Recupere les projets avec nombre de taches
  //   3. Recupere les statistiques du dashboard
  //   4. Recupere la liste des utilisateurs
  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = storage.getToken() || "";

      // Recuperer les taches assignees
      const tasksData = await getAssignedTasks(token);
      setTasks(tasksData);

      // Recuperer les projets avec statistiques
      const projectsWithStatsData = await getProjectsWithTaskCounts(token);
      setProjectsWithStats(projectsWithStatsData);
      setProjects(projectsWithStatsData);

      // Recuperer les statistiques du dashboard
      const statsData = await getDashboardStats(token);
      setDashboardStats(statsData);
      
      // Recuperer les utilisateurs
      const usersData = await getUsers(token);
      setUsers(usersData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des donnes",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, router]);

  // EFFET: Charger les donnees au montage ou lors du changement d'authentification
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // ============================================
  // 6. FONCTIONS DE GESTION
  // ============================================

  // Rechercher des taches par query
  // @param query {string} - Terme de recherche
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        await fetchData();
        return;
      }

      try {
        const token = storage.getToken() || "";
        if (!token) return;

        const results = await searchTasks(token, query);
        setTasks(results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de la recherche",
        );
      }
    },
    [fetchData],
  );

  // Gerer la creation d'un projet
  // @param data {ModalCreateProjectData} - Donnees du nouveau projet
  const handleCreateProject = async (
    data: ModalCreateProjectData,
  ): Promise<void> => {
    if (!data.name.trim()) {
      setError("Le nom du projet est requis");
      return;
    }

    setError(null);

    try {
      const token = storage.getToken() || "";

      const createdProject = await createProject(token, data);
      setProjects((prev) => [...prev, createdProject]);
      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la creation du projet",
      );
    }
  };

  // Obtenir le nom du projet a partir de l'ID
  // @param projectId {string} - ID du projet
  // @returns {string} - Nom du projet ou "Projet inconnu"
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Projet inconnu";
  };

  // Style de focus pour l'accessibilite
  const focusOutlineStyle: React.CSSProperties = {
    outline: "0.125rem solid var(--color-primary)",
    outlineOffset: "0.125rem",
  };

  // ============================================
  // 7. RENDU (RENDER)
  // ============================================

  return (
    <div style={{ width: "100%" }}>
      {/* ============================================ */}
      {/* SECTION: Bienvenue - En-tete du dashboard */}
      {/* ============================================ */}
      <div
        style={{
          width: mainContainerWidth,
          marginBottom: isMobile ? "2rem" : "clamp(3rem, 8vh, 5rem)",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "1.5rem" : "2vw",
          justifyContent: "space-between",
        }}
      >
        {/* Titre et sous-titre de bienvenue */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1
            style={{
              color: "var(--color-secondary)",
              fontSize: titleSize,
              fontFamily: "var(--font-heading)",
              fontWeight: "600",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              marginBottom: isMobile ? "0.75rem" : "0",
            }}
          >
            Tableau de bord
          </h1>
          <p
            style={{
              color: "var(--color-black)",
              fontSize: subtitleSize,
              fontFamily: "var(--font-body)",
              fontWeight: "400",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
            }}
          >
            Bonjour {user?.name}, voici un apercu de vos projets et taches
          </p>
        </div>

        {/* Bouton de creation de projet */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? "300px" : "200px",
            height: isMobile ? "48px" : "50px",
            padding: isMobile ? "0.75rem 1.5rem" : "0.8125rem 2rem",
            background: "var(--color-secondary)",
            color: "var(--color-white)",
            border: "none",
            borderRadius: "0.625rem",
            fontSize: buttonFontSize,
            fontFamily: "var(--font-body)",
            fontWeight: "400",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          aria-label="Creer un nouveau projet"
        >
          + Creer un projet
        </button>
      </div>

      {/* ============================================ */}
      {/* SECTION: Toggle des vues (Liste, Kanban, Projets) */}
      {/* ============================================ */}
      <div
        style={{
          width: mainContainerWidth,
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          gap: isMobile ? "0.5rem" : "0.625rem",
          marginBottom: isMobile ? "2rem" : "2.5rem",
          flexWrap: "wrap",
        }}
        role="radiogroup"
        aria-label="Choisir la vue"
      >
        {/* Bouton Vue Liste */}
        <button
          onClick={() => setActiveView("list")}
          style={{
            padding: isMobile ? "0.75rem 1rem" : "0.875rem 1rem",
            background: activeView === "list" ? "#FFE8D9" : "white",
            border:
              activeView === "list"
                ? "0.0625rem solid var(--color-primary)"
                : "0.0625rem solid var(--color-border)",
            borderRadius: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.5rem" : "0.875rem",
            fontSize: isMobile ? "0.875rem" : "0.9375rem",
            fontFamily: "Inter",
            fontWeight: "400",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) =>
            Object.assign(e.currentTarget.style, focusOutlineStyle, {
              background: activeView === "list" ? "#FFE8D9" : "white",
              border:
                activeView === "list"
                  ? "0.0625rem solid var(--color-primary)"
                  : "0.0625rem solid var(--color-border)",
            })
          }
          onBlur={(e) =>
            Object.assign(e.currentTarget.style, {
              background: activeView === "list" ? "#FFE8D9" : "white",
              border:
                activeView === "list"
                  ? "0.0625rem solid var(--color-primary)"
                  : "0.0625rem solid var(--color-border)",
            })
          }
          aria-pressed={activeView === "list"}
          aria-label="Vue Liste"
        >
          <CheckmarkIcon isActive={activeView === "list"} />
          <span
            style={{
              color: activeView === "list" ? "var(--color-primary)" : "#6B7280",
            }}
          >
            Liste
          </span>
        </button>

        {/* Bouton Vue Kanban */}
        <button
          onClick={() => setActiveView("kanban")}
          style={{
            padding: isMobile ? "0.75rem 1rem" : "0.875rem 1rem",
            background: activeView === "kanban" ? "#FFE8D9" : "white",
            border:
              activeView === "kanban"
                ? "0.0625rem solid var(--color-primary)"
                : "0.0625rem solid var(--color-border)",
            borderRadius: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.5rem" : "0.875rem",
            fontSize: isMobile ? "0.875rem" : "0.9375rem",
            fontFamily: "Inter",
            fontWeight: "400",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) =>
            Object.assign(e.currentTarget.style, focusOutlineStyle, {
              background: activeView === "kanban" ? "#FFE8D9" : "white",
              border:
                activeView === "kanban"
                  ? "0.0625rem solid var(--color-primary)"
                  : "0.0625rem solid var(--color-border)",
            })
          }
          onBlur={(e) =>
            Object.assign(e.currentTarget.style, {
              background: activeView === "kanban" ? "#FFE8D9" : "white",
              border:
                activeView === "kanban"
                  ? "0.0625rem solid var(--color-primary)"
                  : "0.0625rem solid var(--color-border)",
            })
          }
          aria-pressed={activeView === "kanban"}
          aria-label="Vue Kanban"
        >
          <CalendarIcon isActive={activeView === "kanban"} />
          <span
            style={{
              color:
                activeView === "kanban" ? "var(--color-primary)" : "#6B7280",
            }}
          >
            Kanban
          </span>
        </button>
      </div>

      {/* ============================================ */}
      {/* SECTION: Affichage conditionnel des vues */}
      {/* ============================================ */}

      {isLoading ? (
        /* Etat de chargement */
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "2rem" : "clamp(2rem, 8vh, 4rem)",
            color: "#6B7280",
            fontSize: isMobile ? "0.875rem" : "1rem",
          }}
          aria-live="polite"
        >
          Chargement des donnees...
        </div>
      ) : error ? (
        /* Etat d'erreur avec bouton de rechargement */
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "2rem" : "clamp(2rem, 8vh, 4rem)",
            color: "#EF4444",
            background: "#FEE2E2",
            borderRadius: "0.625rem",
            fontSize: isMobile ? "0.875rem" : "1rem",
          }}
          role="alert"
        >
          {error}
          <button
            onClick={fetchData}
            style={{
              marginLeft: "1rem",
              background: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              paddingLeft: isMobile ? "1rem" : "clamp(1rem, 2vw, 1.5rem)",
              paddingRight: isMobile ? "1rem" : "clamp(1rem, 2vw, 1.5rem)",
              cursor: "pointer",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
            }}
          >
            Reessayer
          </button>
        </div>
      ) : activeView === "kanban" ? (
        /* Vue Kanban - Affichage par colonnes de statut */
        <KanbanView
          tasks={tasks}
          getProjectName={getProjectName}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      ) : activeView === "projects" ? (
        /* Vue Projets - Affichage des projets avec leurs taches */
        <ProjectsWithTasksView
          projects={projectsWithStats}
          tasksByProject={tasksByProject}
          isLoading={isLoading}
          error={error}
          onProjectClick={handleProjectClick}
          isMobile={isMobile}
        />
      ) : (
        /* Vue Liste - Affichage des taches en liste */
        <div
          style={{
            width: tasksContainerWidth,
            background: "white",
            borderRadius: "0.625rem",
            border: "0.0625rem solid var(--color-border)",
            padding: containerPadding,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "1.5rem" : "2.5rem",
            margin: isMobile ? "0" : "0 auto",
          }}
        >
          {/* En-tete de la section des taches */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "1.5rem" : "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h2
                style={{
                  color: "var(--color-secondary)",
                  fontSize: sectionTitleSize,
                  fontFamily: "var(--font-heading)",
                  fontWeight: "600",
                }}
              >
                Mes taches assignees
              </h2>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: sectionSubtitleSize,
                  fontFamily: "var(--font-body)",
                  fontWeight: "400",
                }}
              >
                Par ordre de priorite
              </p>
            </div>

            {/* Barre de recherche */}
            <div
              style={{
                width: isMobile ? "100%" : "min(22.3125rem, 25vw)",
                maxWidth: "100%",
                minWidth: 0,
                paddingLeft: isMobile ? "1rem" : "clamp(1.5rem, 3vw, 2rem)",
                paddingRight: isMobile ? "1rem" : "clamp(1.5rem, 3vw, 2rem)",
                background: "white",
                borderRadius: "0.5rem",
                border: "0.0625rem solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Rechercher une tache"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  color: "#6B7280",
                  fontSize: isMobile ? "0.875rem" : "0.9375rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: "400",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  minHeight: "63px",
                }}
                aria-label="Rechercher une tache"
                autoComplete="off"
              />
              <SearchIcon color="#6B7280" />
            </div>
          </div>

          {/* Liste des taches */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? "1rem" : "1.0625rem",
            }}
          >
            {tasks.length === 0 ? (
              /* Message quand aucune tache n'est trouvee */
              <div
                style={{
                  textAlign: "center",
                  padding: isMobile ? "2rem" : "clamp(2rem, 8vh, 4rem)",
                  color: "#6B7280",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
                aria-live="polite"
              >
                Aucune tache trouvee
              </div>
            ) : (
              /* Mapping des taches avec le composant TaskCard */
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectName={getProjectName(task.projectId)}
                  onView={() => router.push(`/projects/${task.projectId}`)}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* SECTION: Modale de creation de projet */}
      {/* ============================================ */}
      {isCreateModalOpen && (
        <CreateProjectModal
          onClose={() => {
            setIsCreateModalOpen(false);
            setNewProject({ name: "", description: "", contributorIds: [] });
            setError(null);
          }}
          onSubmit={handleCreateProject}
          users={users}
        />
      )}
    </div>
  );
}

// ============================================
// COMPOSANT TaskCard - Carte de tache reutilisable
// ============================================
// ROLE: Affiche les informations d'une tache dans la vue Liste
// Affiche: titre, description, projet, date, nombre d'assignes, statut, bouton Voir
//
// PROPS:
// - task {Task} : La tache a afficher
// - projectName {string} : Nom du projet associe
// - onView {function} : Callback pour naviguer vers le projet
// - isMobile {boolean} : Indique si l'ecran est mobile
// - isTablet {boolean} : Indique si l'ecran est tablette
//
function TaskCard({
  task,
  projectName,
  onView,
  isMobile,
  isTablet,
}: {
  task: Task;
  projectName: string;
  onView: () => void;
  isMobile: boolean;
  isTablet: boolean;
}) {
  // Recuperation des couleurs du statut
  const colors = statusColors[task.status] || {
    bg: "#E5E7EB",
    color: "#6B7280",
    border: "#9CA3AF",
  };

  // ============================================
  // VARIABLES DE STYLE RESPONSIVE
  // ============================================

  // Tailles adaptatives pour la carte
  const cardPaddingX = isMobile ? "1rem" : isTablet ? "1.5rem" : "2.5rem";
  const cardPaddingY = isMobile ? "1rem" : isTablet ? "1.25rem" : "1.5625rem";
  const titleWidth = isMobile ? "100%" : "min(9.5625rem, 12vw)";
  const metaGap = isMobile ? "0.75rem" : "0.9375rem";
  const taskTitleSize = isMobile ? "1rem" : "1.125rem";
  const statusButtonPadding = isMobile ? "0.25rem 0.75rem" : "0.25rem 1rem";
  const statusButtonFontSize = isMobile ? "0.75rem" : "0.875rem";
  const viewButtonWidth = isMobile ? "100%" : "min(7.5625rem, 9vw)";
  const viewButtonPadding = isMobile ? "0 1rem" : "0 1rem";

  return (
    <div
      style={{
        padding: `${cardPaddingY} ${cardPaddingX}`,
        background: "white",
        borderRadius: "0.625rem",
        border: "0.0625rem solid var(--color-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "1rem" : "1.5rem",
        minWidth: 0,
      }}
      role="article"
      aria-label={`Tache : ${task.title}`}
    >
      {/* Contenu principal de la carte */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "0.75rem" : "2rem",
          minWidth: 0,
          flex: 1,
        }}
      >
        {/* Section titre et description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "0.5rem" : "0.4375rem",
          }}
        >
          <h3
            style={{
              color: "var(--color-secondary)",
              fontSize: taskTitleSize,
              fontFamily: "var(--font-heading)",
              fontWeight: "600",
            }}
          >
            {task.title}
          </h3>
          <p
            style={{
              color: "#6B7280",
              fontSize: isMobile ? "0.875rem" : "0.9375rem",
              fontFamily: "var(--font-body)",
              fontWeight: "400",
            }}
          >
            {task.description || "Aucune description"}
          </p>
        </div>

        {/* Section metadonnees (projet, date, assignees) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: metaGap,
            flexWrap: isMobile ? "wrap" : "nowrap",
            width: isMobile ? "100%" : "auto",
            justifyContent: "left",
          }}
        >
          {/* Projet */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <FolderIconGrey />
            <span
              style={{
                color: "#6B7280",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                fontFamily: "var(--font-body)",
                fontWeight: "400",
              }}
            >
              {projectName}
            </span>
          </div>

          {/* Separateur */}
          {!isMobile && <Separator />}

          {/* Date */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <CalendarIconGrey />
            <span
              style={{
                color: "#6B7280",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                fontFamily: "var(--font-body)",
                fontWeight: "400",
                marginLeft: "0.5rem",
              }}
            >
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })
                : "Non definie"}
            </span>
          </div>

          {/* Separateur */}
          {!isMobile && <Separator />}

          {/* Nombre d'assignes */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <TextBubbleGrey />
            <span
              style={{
                color: "#6B7280",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                fontFamily: "var(--font-body)",
                fontWeight: "400",
              }}
            >
              {task.assignees?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Boutons statut et Voir - Desktop */}
      {!isMobile && (
        <div
          style={{
            width: viewButtonWidth,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: isMobile ? "0.75rem" : "2.3125rem",
          }}
        >
          {/* Badge de statut */}
          <div
            style={{
              padding: statusButtonPadding,
              background: colors.bg,
              border: `0.0625rem solid ${colors.border}`,
              borderRadius: "6.25rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            role="status"
            aria-label={`Statut : ${TASK_STATUS_LABELS[task.status] || task.status}`}
          >
            <span
              style={{
                color: colors.color,
                fontSize: statusButtonFontSize,
                fontFamily: "var(--font-body)",
                fontWeight: "400",
              }}
            >
              {TASK_STATUS_LABELS[task.status] || task.status}
            </span>
          </div>

          {/* Bouton Voir */}
          <button
            onClick={onView}
            style={{
              width: "100%",
              height: isMobile ? "min(2.75rem, 6.5vh)" : "min(3.125rem, 4vh)",
              padding: viewButtonPadding,
              background: "var(--color-secondary)",
              color: "var(--color-white)",
              border: "none",
              borderRadius: "0.625rem",
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontFamily: "var(--font-body)",
              fontWeight: "400",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            aria-label={`Voir le projet : ${projectName}`}
          >
            Voir
          </button>
        </div>
      )}

      {/* Boutons statut et Voir - Mobile */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          {/* Badge de statut */}
          <div
            style={{
              padding: statusButtonPadding,
              background: colors.bg,
              border: `0.0625rem solid ${colors.border}`,
              borderRadius: "6.25rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            role="status"
            aria-label={`Statut : ${TASK_STATUS_LABELS[task.status] || task.status}`}
          >
            <span
              style={{
                color: colors.color,
                fontSize: statusButtonFontSize,
                fontFamily: "var(--font-body)",
                fontWeight: "400",
              }}
            >
              {TASK_STATUS_LABELS[task.status] || task.status}
            </span>
          </div>

          {/* Bouton Voir */}
          <button
            onClick={onView}
            style={{
              flex: 1,
              height: "min(2.75rem, 2.8vh)",
              padding: "0 1rem",
              background: "var(--color-secondary)",
              color: "var(--color-white)",
              border: "none",
              borderRadius: "0.625rem",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              fontWeight: "400",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            aria-label={`Voir le projet : ${projectName}`}
          >
            Voir
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPOSANT KanbanView - Vue Kanban des taches
// ============================================
// ROLE: Affiche les taches organisees par colonnes de statut
// Colonnes: À faire, En cours, Terminé
//
// PROPS:
// - tasks {Task[]} : Liste des taches a afficher
// - getProjectName {function} : Fonction pour recuperer le nom du projet
// - isMobile {boolean} : Indique si l'ecran est mobile
// - isTablet {boolean} : Indique si l'ecran est tablette
//
function KanbanView({
  tasks,
  getProjectName,
  isMobile,
  isTablet,
}: {
  tasks: Task[];
  getProjectName: (projectId: string) => string;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const router = useRouter();

  // ============================================
  // GROUPEMENT DES TACHES PAR STATUT
  // ============================================

  // Regrouper les taches par statut
  const tasksByStatus: Record<string, Task[]> = {
    "À faire": [],
    "En cours": [],
    Terminé: [],
  };

  tasks.forEach((task) => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  // ============================================
  // VARIABLES DE STYLE RESPONSIVE POUR KANBAN
  // ============================================

  // Tailles adaptatives pour Kanban
  const columnMinWidth = isMobile ? "80vw" : isTablet ? "30vw" : "24vw";
  const columnPadding = isMobile ? "1rem" : isTablet ? "1.25rem" : "1.5rem";
  const statusIndicatorSize = isMobile ? "0.75rem" : "0.875rem";
  const statusTitleSize = isMobile ? "1rem" : "1.125rem";
  const countSize = isMobile ? "0.75rem" : "0.875rem";

  // Tailles adaptatives pour les cartes Kanban
  const kanbanCardPaddingX = isMobile ? "1.5rem" : isTablet ? "2rem" : "2.5rem";
  const kanbanCardPaddingY = isMobile
    ? "1rem"
    : isTablet
      ? "1.25rem"
      : "1.5625rem";
  const kanbanCardGap = isMobile ? "1.25rem" : "2rem";
  const kanbanHeaderGap = isMobile ? "0.5rem" : "2rem";
  const kanbanTitleSize = isMobile ? "1rem" : "1.125rem";
  const kanbanDescriptionSize = isMobile ? "0.875rem" : "0.9375rem";
  const kanbanMetaSize = isMobile ? "0.75rem" : "0.875rem";
  const kanbanMetaGap = isMobile ? "0.5rem" : "0.9375rem";
  const kanbanStatusPadding = isMobile ? "0.25rem 0.75rem" : "0.25rem 1rem";
  const kanbanStatusFontSize = isMobile ? "0.75rem" : "0.875rem";

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        gap: isMobile ? "1rem" : "1.5rem",
        overflowX: "auto",
        paddingBottom: isMobile ? "1rem" : "1.25rem",
        paddingLeft: "0",
        margin: isMobile ? "0" : "0 auto",
        maxWidth: isMobile
          ? "100%"
          : isTablet
            ? "95%"
            : "min(80.97vw, 1400px)",
      }}
      role="region"
      aria-label="Vue Kanban des taches"
    >
      {/* Mapping des colonnes par statut */}
      {(["À faire", "En cours", "Terminé"] as const).map((status) => {
        const colors = statusColors[status];
        const statusTasks = tasksByStatus[status];

        return (
          <div
            key={status}
            style={{
              minWidth: columnMinWidth,
              maxWidth: isMobile ? "100%" : columnMinWidth,
              background: "white",
              borderRadius: "0.75rem",
              border: "0.0625rem solid var(--color-border)",
              padding: columnPadding,
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? "1rem" : "1.25rem",
            }}
          >
            {/* En-tete de la colonne avec nom et compteur */}
            <div
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 8,
                display: "inline-flex",
              }}
            >
              <h3
                style={{
                  color: "var(--color-secondary)",
                  fontSize: statusTitleSize,
                  fontFamily: "var(--font-heading)",
                  fontWeight: "600",
                }}
              >
                {status}
              </h3>
              {/* Badge de compteur de taches */}
              <div
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 4,
                  paddingBottom: 4,
                  background: "#E5E7EB",
                  overflow: "hidden",
                  borderRadius: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                  display: "flex",
                  height: "fit-content",
                }}
              >
                <div
                  style={{
                    color: "#6B7280",
                    fontSize: 14,
                    fontFamily: "Inter",
                    fontWeight: "400",
                    wordWrap: "break-word",
                  }}
                >
                  {statusTasks.length}
                </div>
              </div>
            </div>

            {/* Conteneur des cartes de taches */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "0.75rem" : "1rem",
              }}
            >
              {statusTasks.length === 0 ? (
                /* Message quand aucune tache dans la colonne */
                <div
                  style={{
                    textAlign: "center",
                    padding: isMobile ? "1.5rem" : "2rem",
                    color: "#9CA3AF",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    fontFamily: "var(--font-body)",
                  }}
                  aria-live="polite"
                >
                  Aucune tache
                </div>
              ) : (
                /* Mapping des taches dans la colonne */
                statusTasks.map((task) => {
                  const taskColors = statusColors[task.status];

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: `${kanbanCardPaddingY} ${kanbanCardPaddingX}`,
                        background: "white",
                        borderRadius: "0.625rem",
                        border: "0.0625rem solid #E5E7EB",
                        display: "flex",
                        flexDirection: "column",
                        gap: kanbanCardGap,
                      }}
                      role="article"
                      aria-label={`Tache : ${task.title}, statut : ${TASK_STATUS_LABELS[task.status] || task.status}`}
                    >
                      {/* En-tete avec titre et badge de statut */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          minWidth: 0,
                        }}
                      >
                        <h4
                          style={{
                            color: "var(--color-black)",
                            fontSize: kanbanTitleSize,
                            fontFamily: "var(--font-heading)",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {task.title}
                        </h4>
                        {/* Badge de statut */}
                        <div
                          style={{
                            padding: kanbanStatusPadding,
                            background: taskColors.bg,
                            border: `0.0625rem solid ${taskColors.border}`,
                            borderRadius: "6.25rem",
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                            height: "fit-content",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: taskColors.color,
                              fontSize: kanbanStatusFontSize,
                              fontFamily: "var(--font-body)",
                              fontWeight: "400",
                            }}
                          >
                            {TASK_STATUS_LABELS[task.status] || task.status}
                          </span>
                        </div>
                      </div>

                      {/* Description de la tache */}
                      <p
                        style={{
                          color: "#6B7280",
                          fontSize: kanbanDescriptionSize,
                          fontFamily: "var(--font-body)",
                          fontWeight: "400",
                        }}
                      >
                        {task.description || "Aucune description"}
                      </p>

                      {/* Metadonnees (projet, date, assignees) */}
                      <div
                        style={{
                          justifyContent: "flex-start",
                          alignItems: "center",
                          gap: kanbanMetaGap,
                          display: "inline-flex",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Projet */}
                        <div
                          style={{
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "0.5rem",
                            display: "flex",
                          }}
                        >
                          <FolderIconGrey />
                          <span
                            style={{
                              color: "#6B7280",
                              fontSize: kanbanMetaSize,
                              fontFamily: "var(--font-body)",
                              fontWeight: "400",
                            }}
                          >
                            {getProjectName(task.projectId)}
                          </span>
                        </div>

                        {/* Separateur */}
                        <Separator />

                        {/* Date */}
                        <div
                          style={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            display: "flex",
                          }}
                        >
                          <CalendarIconGrey />
                          <span
                            style={{
                              color: "#6B7280",
                              fontSize: kanbanMetaSize,
                              fontFamily: "var(--font-body)",
                              fontWeight: "400",
                              marginLeft: "0.5rem",
                            }}
                          >
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  },
                                )
                              : "Non definie"}
                          </span>
                        </div>

                        {/* Separateur */}
                        <Separator />

                        {/* Nombre d'assignes */}
                        <div
                          style={{
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "0.5rem",
                            display: "flex",
                          }}
                        >
                          <TextBubbleGrey />
                          <span
                            style={{
                              color: "#6B7280",
                              fontSize: kanbanMetaSize,
                              fontFamily: "var(--font-body)",
                              fontWeight: "400",
                            }}
                          >
                            {task.assignees?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Bouton Voir - toujours en dessous des metadonnees */}
                      <div
                        style={{
                          alignSelf: "flex-start",
                          marginTop: isMobile ? "0.75rem" : "0",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${task.projectId}`);
                          }}
                          style={{
                            width: isMobile ? "100%" : "min(7.5625rem, 9vw)",
                            height: isMobile
                              ? "min(2.75rem, 6.5vh)"
                              : "min(3.125rem, 4vh)",
                            padding: "0 1rem",
                            background: "var(--color-secondary)",
                            color: "var(--color-white)",
                            border: "none",
                            borderRadius: "0.625rem",
                            fontSize: isMobile ? "0.875rem" : "1rem",
                            fontFamily: "var(--font-body)",
                            fontWeight: "400",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                          }}
                          aria-label={`Voir le projet : ${getProjectName(task.projectId)}`}
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
