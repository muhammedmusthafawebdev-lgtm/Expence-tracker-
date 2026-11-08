'use client';

import React from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenRouter } from '@/components/views/ScreenRouter';
import { RouteSeoManager } from '@/components/seo/RouteSeoManager';
import { AuthSupervisorPanel } from '@/components/auth/AuthSupervisorPanel';

export default function HomePage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <RouteSeoManager />
          <AppShell>
            <ScreenRouter />
          </AppShell>
          <AuthSupervisorPanel />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
