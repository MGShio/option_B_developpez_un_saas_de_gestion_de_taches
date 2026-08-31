import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

// ============================================
// layout.tsx - Layout principal de l'application Next.js
// ============================================
// ROLE: Composant racine qui enveloppe toute l'application avec :
// - Chargement des polices Google Fonts (Inter, Manrope)
// - Fournisseur du contexte d'authentification (AuthProvider)
// - Metadonnees de la page (SEO)
// - Structure HTML de base (html, body)
//
// DEPENDANCES :
// - next : Pour le type Metadata et le systeme de layout
// - next/font/google : Pour le chargement des polices Google Fonts
// - @/contexts/AuthContext : Pour le provider d'authentification
// - ./globals.css : Pour les styles globaux CSS
//

// ============================================
// 1. CONFIGURATION DES POLICES GOOGLE FONTS
// ============================================

// Charger la police Inter pour le corps du texte
// - subsets: ['latin'] - Sous-ensemble de caracteres (latin uniquement)
// - variable: '--font-body' - Variable CSS pour utiliser la police
// - display: 'swap' - Affiche la police de fallback puis echange quand Inter est chargee
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Charger la police Manrope pour les titres
// - variable: '--font-heading' - Variable CSS pour les titres
// Note: Manrope est utilisee pour les h1, h2, h3, etc.
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

// ============================================
// 2. METADONNEES DE L'APPLICATION (SEO)
// ============================================
// Metadonnees utilisees par Next.js pour le referencement et l'affichage
// dans les onglets du navigateur
//
// Proprietes:
// - title: Titre de l'application affiche dans l'onglet
// - description: Description pour le referencement SEO
export const metadata: Metadata = {
  title: 'SaaS Gestion de Taches',
  description: 'Application de gestion de projets et taches',
};

// ============================================
// 3. COMPOSANT ROOT LAYOUT
// ============================================
// Composant racine qui definit la structure HTML de base
//
// PROPS:
// - children {React.ReactNode} : Contenu de l'application (pages, composants enfants)
//
// RETOUR:
// - Structure HTML complete avec:
//   - Balise html avec attribut lang="fr" (francais) et classes CSS pour les polices
//   - Balise body contenant le AuthProvider qui enveloppe les enfants
//
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        {/* AuthProvider: Fournit le contexte d'authentification a toute l'application */}
        {/* Permet l'acces a user, isAuthenticated, login, logout dans tous les composants enfants */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
