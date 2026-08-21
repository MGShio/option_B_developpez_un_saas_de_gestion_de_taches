import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

// Charger les polices Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
 title: 'SaaS Gestion de Tâches',
 description: 'Application de gestion de projets et tâches',
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
   <body>
    <AuthProvider>{children}</AuthProvider>
   </body>
  </html>
 );
}
