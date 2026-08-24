# Abricot.co

SaaS de gestion de projets, de tâches et de collaboration.

Le projet est composé de :

- un backend Node.js, Express, TypeScript et Prisma ;
- un frontend Next.js, React et TypeScript ;
- une base de données SQLite pour le développement local.

## Prérequis

Installer les outils suivants :

- Node.js 20 ou une version LTS récente ;
- npm ;
- Git.

Vérifier l'installation :

```bash
node --version
npm --version
git --version
```

## Installation

Cloner le dépôt puis entrer dans le dossier du projet :

```bash
git clone <URL_DU_DEPOT>
cd option_B_developpez_un_saas_de_gestion_de_taches
```

Installer les dépendances du backend :

```bash
npm install
```

Installer les dépendances du frontend :

```bash
cd frontend
npm install
cd ..
```

## Variables d'environnement

### Backend

Créer un fichier `.env` à la racine du projet à partir de `.env.example`.

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Sous macOS ou Linux :

```bash
cp .env.example .env
```

Vérifier au minimum les variables suivantes :

```env
DATABASE_URL="file:./db.sqlite"
JWT_SECRET="remplacer-par-une-cle-secrete-longue-et-aleatoire"
JWT_EXPIRES_IN="7d"
PORT=8000
NODE_ENV=development
```

Ne jamais utiliser la valeur d'exemple de `JWT_SECRET` en production.

### Frontend

Créer `frontend/.env.local` :

Sous Windows PowerShell :

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

Sous macOS ou Linux :

```bash
cp frontend/.env.example frontend/.env.local
```

Contenu minimal :

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
PORT=3000
NODE_ENV=development
```

## Initialiser la base de données

Depuis la racine du projet :

```bash
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

Le seed crée des données de démonstration : utilisateurs, projets, tâches, assignations et commentaires.

Pour repartir d'une base locale vierge, supprimer le fichier SQLite créé par Prisma, puis relancer les commandes d'initialisation :

Sous Windows PowerShell :

```powershell
Remove-Item prisma/db.sqlite -ErrorAction SilentlyContinue
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

Sous macOS ou Linux :

```bash
rm -f prisma/db.sqlite
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

## Lancer l'application en développement

Ouvrir deux terminaux depuis la racine du projet.

### Terminal 1 : backend

```bash
npm run dev
```

Le backend est disponible à l'adresse suivante :

- API : http://localhost:8000
- Vérification de l'API : http://localhost:8000/health
- Documentation Swagger : http://localhost:8000/api-docs

### Terminal 2 : frontend

```bash
cd frontend
npm run dev
```

L'application est disponible à l'adresse suivante :

- http://localhost:3000

## Identifiants de démonstration

Tous les comptes de démonstration utilisent le mot de passe : `P@ssword123`.

| Email | Rôle global |
| --- | --- |
| alice@example.com | ADMIN |
| bob@example.com | USER |
| caroline@example.com | USER |
| david@example.com | USER |
| emma@example.com | USER |
| francois@example.com | USER |
| gabrielle@example.com | USER |
| henri@example.com | USER |
| isabelle@example.com | USER |
| jacques@example.com | USER |

Les rôles dans un projet sont indépendants du rôle global : un utilisateur peut être propriétaire, administrateur ou contributeur selon le projet.

## Commandes utiles

Depuis la racine :

```bash
npm run build       # Compiler le backend
npm run db:generate # Générer le client Prisma
npm run db:studio   # Ouvrir Prisma Studio
```

Depuis `frontend` :

```bash
npm run lint  # Vérifier le code frontend
npm run build # Compiler le frontend
npm run start # Lancer le frontend compilé
```

## Structure principale

```text
.
├── frontend/       # Application Next.js
├── prisma/         # Schéma, migrations et seed Prisma
├── src/            # API Express et logique backend
├── .env.example    # Variables backend
└── package.json    # Scripts backend
```

## Arrêter les serveurs

Arrêter chaque serveur avec `Ctrl+C` dans son terminal.

Sous Windows, les scripts `start.ps1` et `start_simple_next.bat` permettent également de lancer le backend et le frontend, mais le lancement dans deux terminaux reste recommandé pour suivre séparément les logs.

## Production

Avant un déploiement :

- remplacer `JWT_SECRET` par une clé secrète aléatoire ;
- définir `NODE_ENV=production` ;
- configurer `NEXT_PUBLIC_API_BASE_URL` avec l'URL publique de l'API ;
- utiliser une base de données adaptée à l'environnement de production ;
- lancer les migrations avec `npx prisma migrate deploy` ;
- construire puis démarrer le backend et le frontend.
