'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/auth/Login';

const loadingStyle: React.CSSProperties = {
 display: 'flex',
 justifyContent: 'center',
 alignItems: 'center',
 height: '100vh',
};

export default function LoginPage() {
 const { isAuthenticated, isLoading } = useAuth();
 const router = useRouter();

 useEffect(() => {
  if (isAuthenticated) {
   router.replace('/dashboard');
  }
 }, [isAuthenticated, router]);

 if (isLoading) {
  return <div style={loadingStyle}>Chargement...</div>;
 }

 return <Login />;
}
