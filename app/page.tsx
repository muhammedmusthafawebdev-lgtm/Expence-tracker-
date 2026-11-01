'use client';

import React from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AppProvider } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenRouter } from '@/components/views/ScreenRouter';

export default function HomePage() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppShell>
          <ScreenRouter />
        </AppShell>
      </AppProvider>
    </ThemeProvider>
  );
}
