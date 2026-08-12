/**
 * ProjectDetail.styles.ts
 * Tous les styles extraits de ProjectDetail.tsx
 * Utilisez : import * as styles from './ProjectDetail.styles'
 * Puis remplacez style={{...}} par style={styles.nomDuStyle}
 */

import { CSSProperties } from 'react';

// ============================================
// COULEURS
// ============================================
export const colors = {
  primary: '#D3590B',
  primaryLight: '#FFE8D9',
  background: '#F9FAFB',
  white: 'white',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#E08D00',
  warningLight: '#FFF0D7',
  black: '#000000',
  textPrimary: '#1F1F1F',
  textSecondary: '#6B7280',
} as const;

// ============================================
// STYLES DE LA PAGE PRINCIPALE
// ============================================
export const pageContainer: CSSProperties = {
  width: '100%',
  minHeight: 'calc(100vh - 100px)',
  backgroundColor: 'var(--color-background)',
};

// ============================================
// STYLES DU HEADER
// ============================================
export const headerContainer: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1.5rem',
  marginBottom: '2.5rem',
  flexWrap: 'wrap',
};

export const headerLeft: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

export const backButton: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export const headerRight: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

export const editDeleteButton: CSSProperties = {
  textDecoration: 'underline',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Inter',
  fontWeight: 400,
};

// ============================================
// STYLES DE LA DESCRIPTION
// ============================================
export const descriptionContainer: CSSProperties = {
  background: 'white',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  padding: '2rem',
  marginBottom: '2rem',
};

export const descriptionLabel: CSSProperties = {
  color: '#1F1F1F',
  fontSize: '1rem',
  fontFamily: 'Manrope',
  fontWeight: 600,
  marginBottom: '0.75rem',
};

export const descriptionText: CSSProperties = {
  color: '#6B7280',
  fontSize: '0.9375rem',
  fontFamily: 'Inter',
  fontWeight: 400,
  lineHeight: 1.5,
  margin: 0,
};

// ============================================
// STYLES DU CONTENU PRINCIPAL
// ============================================
export const mainContent: CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  flexDirection: 'row',
};

// ============================================
// STYLES DU CONTENEUR TÂCHES (Correction 2 appliquée)
// ============================================
export const tasksContainer: CSSProperties = {
  flex: 1,
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: 10,
  padding: 'clamp(1rem, 1.5vw, 1.5rem)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(1rem, 1.5vw, 1.5rem)',
};

export const tasksHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
};

export const tasksTitle: CSSProperties = {
  color: '#1F1F1F',
  fontFamily: 'Manrope',
  fontWeight: 600,
  margin: 0,
};

export const tasksSubtitle: CSSProperties = {
  color: '#6B7280',
  fontFamily: 'Inter',
  fontWeight: 400,
  margin: 0,
};

// ============================================
// STYLES DES FILTRES
// ============================================
export const filtersContainer: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
};

export const filterButtonBase: CSSProperties = {
  padding: '23px 32px',
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const filterButtonActive: CSSProperties = {
  background: '#FFE8D9',
  border: '1px solid #D3590B',
};

export const filterTextBase: CSSProperties = {
  color: '#6B7280',
  fontSize: '0.9375rem',
  fontFamily: 'Inter',
  fontWeight: 400,
};

export const filterTextActive: CSSProperties = {
  color: '#D3590B',
};

export const searchContainer: CSSProperties = {
  width: '283px',
  padding: '23px 32px',
  background: 'white',
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const searchInput: CSSProperties = {
  color: '#6B7280',
  fontSize: '0.9375rem',
  fontFamily: 'Inter',
  fontWeight: 400,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  width: '100%',
};

// ============================================
// STYLES DES ONGLETS DE VUE
// ============================================
export const viewTabsContainer: CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
};

export const tabButtonBase: CSSProperties = {
  padding: '14px 16px',
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

export const tabButtonActive: CSSProperties = {
  background: '#FFE8D9',
  border: '1px solid #D3590B',
};

export const tabTextBase: CSSProperties = {
  color: '#6B7280',
  fontSize: '0.9375rem',
  fontFamily: 'Inter',
  fontWeight: 400,
};

export const tabTextActive: CSSProperties = {
  color: '#D3590B',
};

// ============================================
// STYLES DE LA LISTE DES TÂCHES
// ============================================
export const taskListContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

export const emptyState: CSSProperties = {
  background: 'white',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  padding: '4rem',
  textAlign: 'center',
  color: '#6B7280',
};

// ============================================
// STYLES DES BOUTONS FIXES (Correction 4 appliquée)
// ============================================
export const fixedButtonsContainer: CSSProperties = {
  position: 'fixed',
  bottom: 'clamp(2rem, 5vh, 3rem)',
  right: 'clamp(1rem, 2vw, 2rem)',
  display: 'flex',
  gap: 'clamp(0.5rem, 1vw, 1rem)',
  flexDirection: 'row',
  alignItems: 'center',
  zIndex: 1000,
};

export const aiButton: CSSProperties = {
  width: '94px',
  height: '50px',
  padding: '13px 74px',
  background: '#D3590B',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontFamily: 'Inter',
  fontWeight: 400,
  cursor: 'pointer',
};

export const createTaskButton: CSSProperties = {
  width: '181px',
  height: '50px',
  padding: '13px 74px',
  background: '#1F1F1F',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontFamily: 'Inter',
  fontWeight: 400,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
};

// ============================================
// STYLES DU SIDEBAR
// ============================================
export const sidebarContainer: CSSProperties = {
  width: '250px',
  display: 'flex',
  background: '#F3F4F6',
  borderRadius: 10,
  padding: '1.5rem',
  flexDirection: 'column',
  gap: '1.5rem',
};

export const sidebarHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const sidebarTitle: CSSProperties = {
  color: '#1F1F1F',
  fontFamily: 'Manrope',
  fontWeight: 600,
  margin: 0,
};

export const sidebarSubtitle: CSSProperties = {
  color: '#6B7280',
  fontFamily: 'Inter',
  fontWeight: 400,
};

export const contributorList: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export const contributorItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

// ============================================
// STYLES DES MODALES
// ============================================
export const modalOverlay: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

export const modalContent: CSSProperties = {
  background: 'white',
  borderRadius: 10,
  width: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: '2rem',
};

export const modalHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

export const modalTitle: CSSProperties = {
  color: '#1F1F1F',
  fontSize: '1.5rem',
  fontFamily: 'Manrope',
  fontWeight: 600,
  margin: 0,
};

export const closeButton: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  fontSize: '1.75rem',
  color: '#6B7280',
};

// ============================================
// STYLES DES CARTES DE TÂCHES (TaskCard)
// ============================================
export const taskCard: CSSProperties = {
  background: 'white',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

export const taskCardHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '1rem',
};

export const taskTitle: CSSProperties = {
  color: 'black',
  fontFamily: 'Manrope',
  fontWeight: 600,
  margin: 0,
};

export const statusBadge: (bgColor: string) => ({
  padding: '4px 16px',
  background: bgColor,
  borderRadius: 50,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
} as CSSProperties);

export const statusText: (color: string) => ({
  color: color,
  fontSize: '0.875rem',
  fontFamily: 'Inter',
  fontWeight: 400,
} as CSSProperties);

export const editTaskButton: CSSProperties = {
  width: 57,
  height: 57,
  padding: 24,
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: 10,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export const taskDescription: CSSProperties = {
  color: '#6B7280',
  fontFamily: 'Inter',
  fontWeight: 400,
  margin: 0,
};

export const taskMeta: CSSProperties = {
  color: '#6B7280',
  fontFamily: 'Inter',
  fontWeight: 400,
};

// ============================================
// STYLES DIVERS
// ============================================
export const focusOutline: CSSProperties = {
  outline: '2px solid var(--color-primary)',
  outlineOffset: '2px',
};

export const divider: CSSProperties = {
  width: '100%',
  height: 1,
  background: '#E5E7EB',
};

// Couleurs des statuts (déjà définies dans le fichier original)
export const statusColors = {
  'À faire': { bg: '#FFE0E0', color: '#EF4444' },
  'En cours': { bg: '#FFF0D7', color: '#E08D00' },
  'Terminé': { bg: '#D1FAE5', color: '#059669' },
};

export default {
  // Couleurs
  colors,
  statusColors,
  // Styles de page
  pageContainer,
  // Styles de header
  headerContainer,
  headerLeft,
  backButton,
  headerRight,
  editDeleteButton,
  // Styles de description
  descriptionContainer,
  descriptionLabel,
  descriptionText,
  // Styles de contenu
  mainContent,
  // Styles du conteneur Tâches
  tasksContainer,
  tasksHeader,
  tasksTitle,
  tasksSubtitle,
  // Styles des filtres
  filtersContainer,
  filterButtonBase,
  filterButtonActive,
  filterTextBase,
  filterTextActive,
  searchContainer,
  searchInput,
  // Styles des onglets
  viewTabsContainer,
  tabButtonBase,
  tabButtonActive,
  tabTextBase,
  tabTextActive,
  // Styles de la liste
  taskListContainer,
  emptyState,
  // Styles des boutons fixes
  fixedButtonsContainer,
  aiButton,
  createTaskButton,
  // Styles du sidebar
  sidebarContainer,
  sidebarHeader,
  sidebarTitle,
  sidebarSubtitle,
  contributorList,
  contributorItem,
  // Styles des modales
  modalOverlay,
  modalContent,
  modalHeader,
  modalTitle,
  closeButton,
  // Styles des cartes
  taskCard,
  taskCardHeader,
  taskTitle,
  statusBadge,
  statusText,
  editTaskButton,
  taskDescription,
  taskMeta,
  divider,
  // Style divers
  focusOutline,
};
