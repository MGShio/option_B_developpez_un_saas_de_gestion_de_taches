// prisma/seed.ts - Seed complet pour la base de données

import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";

// Types pour les données de test
interface SeedUser {
  email: string;
  name: string;
  password: string;
  role: string;
}

interface SeedProject {
  name: string;
  description: string;
  ownerEmail: string;
  contributors: string[];
}

interface SeedTask {
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date;
  projectName: string;
  assignees: string[];
}

// Données de test - 10 utilisateurs
const usersData: SeedUser[] = [
  { email: "alice@example.com", name: "Alice Martin", password: "P@ssword123", role: "ADMIN" },
  { email: "bob@example.com", name: "Bob Dupont", password: "P@ssword123", role: "USER" },
  { email: "caroline@example.com", name: "Caroline Leroy", password: "P@ssword123", role: "USER" },
  { email: "david@example.com", name: "David Moreau", password: "P@ssword123", role: "USER" },
  { email: "emma@example.com", name: "Emma Rousseau", password: "P@ssword123", role: "USER" },
  { email: "francois@example.com", name: "François Dubois", password: "P@ssword123", role: "USER" },
  { email: "gabrielle@example.com", name: "Gabrielle Simon", password: "P@ssword123", role: "USER" },
  { email: "henri@example.com", name: "Henri Laurent", password: "P@ssword123", role: "USER" },
  { email: "isabelle@example.com", name: "Isabelle Petit", password: "P@ssword123", role: "USER" },
  { email: "jacques@example.com", name: "Jacques Durand", password: "P@ssword123", role: "USER" },
];

// 5 projets
const projectsData: SeedProject[] = [
  {
    name: "Application E-commerce",
    description: "Développement d'une plateforme de vente en ligne moderne avec paiement sécurisé et gestion des stocks.",
    ownerEmail: "alice@example.com",
    contributors: ["bob@example.com", "caroline@example.com", "david@example.com"],
  },
  {
    name: "Système de Gestion RH",
    description: "Application web pour la gestion des ressources humaines : congés, évaluations, planning.",
    ownerEmail: "emma@example.com",
    contributors: ["francois@example.com", "gabrielle@example.com"],
  },
  {
    name: "Application Mobile Fitness",
    description: "App mobile pour le suivi d'entraînement, nutrition et objectifs fitness personnalisés.",
    ownerEmail: "henri@example.com",
    contributors: ["isabelle@example.com"],
  },
  {
    name: "Plateforme de Formation",
    description: "Système de gestion de cours en ligne avec vidéos, quiz et suivi des progrès.",
    ownerEmail: "jacques@example.com",
    contributors: ["alice@example.com"],
  },
  {
    name: "Dashboard Analytics",
    description: "Interface de visualisation de données avec graphiques interactifs et rapports automatisés.",
    ownerEmail: "bob@example.com",
    contributors: ["emma@example.com", "henri@example.com"],
  },
];

// 20 tâches réparties sur les projets
const tasksData: SeedTask[] = [
  // Projet E-commerce (5 tâches)
  {
    title: "Conception de la base de données",
    description: "Créer le schéma de base de données pour les produits, utilisateurs, commandes et paiements.",
    status: "DONE",
    priority: "HIGH",
    dueDate: new Date("2025-02-15"),
    projectName: "Application E-commerce",
    assignees: ["bob@example.com", "caroline@example.com"],
  },
  {
    title: "Développement de l'API REST",
    description: "Implémenter les endpoints pour la gestion des produits, panier et commandes.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date("2025-02-20"),
    projectName: "Application E-commerce",
    assignees: ["david@example.com"],
  },
  {
    title: "Interface utilisateur responsive",
    description: "Créer les composants React pour la liste des produits, panier et checkout.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date("2025-02-25"),
    projectName: "Application E-commerce",
    assignees: ["alice@example.com", "caroline@example.com"],
  },
  {
    title: "Intégration système de paiement",
    description: "Intégrer Stripe pour le traitement des paiements sécurisés.",
    status: "TODO",
    priority: "HIGH",
    dueDate: new Date("2025-02-28"),
    projectName: "Application E-commerce",
    assignees: ["bob@example.com"],
  },
  {
    title: "Tests automatisés",
    description: "Écrire les tests unitaires et d'intégration pour l'API et l'interface.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date("2025-03-10"),
    projectName: "Application E-commerce",
    assignees: ["david@example.com", "caroline@example.com"],
  },
  // Projet RH (5 tâches)
  {
    title: "Module de gestion des congés",
    description: "Développer le système de demande et validation des congés avec workflow d'approbation.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date("2025-02-20"),
    projectName: "Système de Gestion RH",
    assignees: ["emma@example.com", "francois@example.com"],
  },
  {
    title: "Interface d'évaluation des employés",
    description: "Créer les formulaires d'évaluation et le système de notation.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date("2025-02-25"),
    projectName: "Système de Gestion RH",
    assignees: ["gabrielle@example.com"],
  },
  {
    title: "Tableau de bord RH",
    description: "Dashboard avec statistiques sur les effectifs, congés et performances.",
    status: "TODO",
    priority: "LOW",
    dueDate: new Date("2025-03-05"),
    projectName: "Système de Gestion RH",
    assignees: ["emma@example.com"],
  },
  {
    title: "Système de notification",
    description: "Implémenter les notifications pour les congés et évaluations.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date("2025-03-10"),
    projectName: "Système de Gestion RH",
    assignees: ["francois@example.com"],
  },
  {
    title: "Export des données",
    description: "Créer des rapports Excel pour les données RH.",
    status: "TODO",
    priority: "LOW",
    dueDate: new Date("2025-03-15"),
    projectName: "Système de Gestion RH",
    assignees: ["gabrielle@example.com"],
  },
  // Projet Fitness (4 tâches)
  {
    title: "Design de l'interface mobile",
    description: "Créer les maquettes et prototypes pour l'application mobile.",
    status: "DONE",
    priority: "HIGH",
    dueDate: new Date("2025-01-25"),
    projectName: "Application Mobile Fitness",
    assignees: ["henri@example.com"],
  },
  {
    title: "Développement des écrans principaux",
    description: "Implémenter les écrans d'accueil, profil utilisateur et suivi d'entraînement.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date("2025-02-20"),
    projectName: "Application Mobile Fitness",
    assignees: ["isabelle@example.com", "henri@example.com"],
  },
  {
    title: "Intégration API nutrition",
    description: "Connecter l'app à une API de données nutritionnelles pour les calories et nutriments.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date("2025-02-25"),
    projectName: "Application Mobile Fitness",
    assignees: ["henri@example.com"],
  },
  {
    title: "Tests utilisateurs",
    description: "Organiser des tests avec des utilisateurs réels.",
    status: "TODO",
    priority: "LOW",
    dueDate: new Date("2025-03-05"),
    projectName: "Application Mobile Fitness",
    assignees: ["isabelle@example.com"],
  },
  // Projet Formation (3 tâches)
  {
    title: "Système de gestion des cours",
    description: "Créer l'interface d'administration pour ajouter et organiser les cours.",
    status: "DONE",
    priority: "HIGH",
    dueDate: new Date("2025-01-20"),
    projectName: "Plateforme de Formation",
    assignees: ["jacques@example.com"],
  },
  {
    title: "Lecteur vidéo personnalisé",
    description: "Développer un lecteur vidéo avec contrôles de progression et notes.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date("2025-02-20"),
    projectName: "Plateforme de Formation",
    assignees: ["alice@example.com", "jacques@example.com"],
  },
  {
    title: "Système de quiz interactif",
    description: "Créer les quiz avec questions à choix multiples et évaluation automatique.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date("2025-02-25"),
    projectName: "Plateforme de Formation",
    assignees: ["alice@example.com"],
  },
  // Projet Analytics (3 tâches)
  {
    title: "Architecture des données",
    description: "Concevoir l'architecture pour la collecte et le stockage des données analytiques.",
    status: "DONE",
    priority: "HIGH",
    dueDate: new Date("2025-01-20"),
    projectName: "Dashboard Analytics",
    assignees: ["bob@example.com"],
  },
  {
    title: "Développement des graphiques",
    description: "Implémenter les composants de visualisation avec Chart.js ou D3.js.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date("2025-02-20"),
    projectName: "Dashboard Analytics",
    assignees: ["emma@example.com", "henri@example.com"],
  },
  {
    title: "Système d'alertes",
    description: "Créer le système de notifications pour les seuils et anomalies détectées.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date("2025-02-25"),
    projectName: "Dashboard Analytics",
    assignees: ["bob@example.com"],
  },
];

// Commentaires pour les tâches
const commentsData: string[] = [
  "Base de données créée avec succès. Toutes les tables sont en place.",
  "API REST en cours de développement. Les endpoints produits sont terminés.",
  "Interface responsive en cours. Les composants de base sont créés.",
  "Intégration Stripe prévue pour la semaine prochaine.",
  "Tests unitaires écrits pour 80% des fonctions.",
  "Module congés bien avancé. Workflow d'approbation fonctionnel.",
  "Formulaires d'évaluation créés. Interface intuitive.",
  "Dashboard RH en cours. Statistiques de base affichées.",
  "Design mobile terminé et validé par le client.",
  "Écrans principaux en développement. Navigation fluide.",
  "API nutrition identifiée. Documentation reçue.",
  "Système de cours opérationnel. Interface complète.",
  "Lecteur vidéo en cours. Contrôles de base implémentés.",
  "Quiz interactif en développement. Système de notation en place.",
  "Architecture données validée. Performance optimisée.",
  "Graphiques en cours. Chart.js intégré.",
  "Système d'alertes planifié. Notifications par email.",
  "Excellent travail ! Code propre et bien documenté.",
  "Attention à la sécurité des données.",
  "Deadline respectée, bravo à toute l'équipe !",
  "Petit bug détecté sur mobile. À corriger.",
  "Documentation mise à jour. Tutoriel créé.",
];

async function seed(): Promise<void> {
  console.log("🌱 Début du seeding de la base de données...");

  try {
    // Nettoyer la base de données
    console.log("🧹 Nettoyage de la base de données...");
    await prisma.comment.deleteMany();
    await prisma.taskAssignee.deleteMany();
    await prisma.task.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Créer les utilisateurs
    console.log("👥 Création des utilisateurs...");
    const createdUsers: Record<string, string> = {};

    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
        },
      });
      createdUsers[userData.email] = user.id;
      console.log(`  ✅ ${userData.role}: ${userData.name} (${userData.email})`);
    }

    // Créer les projets
    console.log("\n📁 Création des projets...");
    const createdProjects: Record<string, string> = {};

    for (const projectData of projectsData) {
      const ownerId = createdUsers[projectData.ownerEmail];
      if (!ownerId) {
        throw new Error(`Owner introuvable: ${projectData.ownerEmail}`);
      }

      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          ownerId,
        },
      });
      createdProjects[projectData.name] = project.id;
      console.log(`  ✅ ${projectData.name} (owner: ${projectData.ownerEmail})`);

      // Ajouter les contributeurs
      for (const contributorEmail of projectData.contributors) {
        const contributorId = createdUsers[contributorEmail];
        if (contributorId) {
          await prisma.projectMember.create({
            data: {
              userId: contributorId,
              projectId: project.id,
              role: "CONTRIBUTOR",
            },
          });
          console.log(`    👤 Contributeur: ${contributorEmail}`);
        }
      }
    }

    // Créer les tâches
    console.log("\n📋 Création des tâches...");
    for (const taskData of tasksData) {
      const projectId = createdProjects[taskData.projectName];
      if (!projectId) {
        throw new Error(`Projet introuvable: ${taskData.projectName}`);
      }

      const project = projectsData.find((p) => p.name === taskData.projectName);
      const creatorId = createdUsers[project!.ownerEmail];

      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          projectId,
          creatorId,
        },
      });
      console.log(`  ✅ ${taskData.title}`);

      // Assigner les utilisateurs à la tâche
      for (const assigneeEmail of taskData.assignees) {
        const assigneeId = createdUsers[assigneeEmail];
        if (assigneeId) {
          await prisma.taskAssignee.create({
            data: {
              userId: assigneeId,
              taskId: task.id,
            },
          });
          console.log(`    👤 Assigné: ${assigneeEmail}`);
        }
      }

      // Ajouter 1-3 commentaires aléatoires
      const commentCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < commentCount; i++) {
        const randomIndex = Math.floor(Math.random() * commentsData.length);
        const authorEmail =
          taskData.assignees[Math.floor(Math.random() * taskData.assignees.length)];
        const authorId = createdUsers[authorEmail];

        if (authorId) {
          await prisma.comment.create({
            data: {
              content: commentsData[randomIndex],
              authorId,
              taskId: task.id,
            },
          });
          console.log(`    💬 Commentaire par ${authorEmail}`);
        }
      }
    }

    console.log("\n🎉 Seeding terminé avec succès !");
    console.log(`📊 Résumé:`);
    console.log(`  - ${Object.keys(createdUsers).length} utilisateurs créés`);
    console.log(`  - ${Object.keys(createdProjects).length} projets créés`);
    console.log(`  - ${tasksData.length} tâches créées`);
    console.log(`  - ~${tasksData.length * 2} commentaires créés`);
    console.log("\n🔐 Identifiants de connexion:");
    console.log("  Email: alice@example.com");
    console.log("  Mot de passe: P@ssword123");
    console.log("  Rôle: ADMIN");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seeding et gérer l'exit proprement
seed()
  .then(() => {
    console.log("\n✅ Script de seeding exécuté avec succès");
    // Exit avec code 0
    const exitCode = 0;
    console.log("Exit code:", exitCode);
  })
  .catch((error) => {
    console.error("\n❌ Erreur:", error);
    // Exit avec code 1
    const exitCode = 1;
    console.error("Exit code:", exitCode);
  });
