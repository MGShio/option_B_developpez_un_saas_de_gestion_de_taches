'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';

const loadingStyle: React.CSSProperties = {
 display: 'flex',
 justifyContent: 'center',
 alignItems: 'center',
 height: '100vh',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
 const { isAuthenticated, isLoading } = useAuth();
 const router = useRouter();

 useEffect(() => {
  if (!isAuthenticated) {
   router.replace('/login');
  }
 }, [isAuthenticated, router]);

 if (isLoading) {
  return <div style={loadingStyle}>Chargement...</div>;
 }

 if (!isAuthenticated) {
  return null;
 }

 return <MainLayout>{children}</MainLayout>;
}
