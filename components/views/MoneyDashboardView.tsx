'use client';

import React from 'react';
import { MoneyDashboard } from '@/components/money/MoneyDashboard';

export function MoneyDashboardView() {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      <MoneyDashboard widgetMode={false} />
    </div>
  );
}
