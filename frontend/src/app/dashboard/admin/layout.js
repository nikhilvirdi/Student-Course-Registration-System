'use client';

import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';

export default function AdminSubLayout({ children }) {
  const { user, switchRole } = useApp();

  useEffect(() => {
    // In unauthenticated dev mode, browsing admin routes seamlessly activates the Admin demo identity
    if (user && user.role !== 'ADMIN') {
      switchRole('ADMIN');
    }
  }, [user, switchRole]);

  return <>{children}</>;
}

