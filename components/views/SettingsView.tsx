'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  Sun,
  Moon,
  Laptop,
  Check,
  SlidersHorizontal,
  Coins,
  Bell,
} from 'lucide-react';
import { ThemeMode } from '@/types';

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { showNotice, setIsCustomizeModalOpen } = useApp();

  const browserNotificationPerm = useSyncExternalStore(
    () => () => {},
    () => (typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'),
    () => 'default'
  );
  const [requestedPermission, setRequestedPermission] = useState<string | null>(null);
  const notificationPermission = requestedPermission ?? browserNotificationPerm;

  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
  const [savingsRemindersEnabled, setSavingsRemindersEnabled] = useState(true);

  const requestBrowserNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setRequestedPermission(perm);
        showNotice(
          'Notification Permission',
          `Browser notifications status: ${perm.toUpperCase()}`,
          'info'
        );
      } catch {
        showNotice('Notification Blocked', 'Permission could not be requested.', 'warning');
      }
    } else {
      showNotice(
        'Feature Unsupported',
        'Browser notifications are not supported in this client environment.',
        'info'
      );
    }
  };

  const themeOptions: { id: ThemeMode; label: string; desc: string; icon: React.ElementType }[] = [
    { id: 'light', label: 'Light Mode', desc: 'Apple-inspired crisp light surfaces', icon: Sun },
    { id: 'dark', label: 'True Black Dark Mode', desc: 'Pure black (#000000) canvas with zero glare', icon: Moon },
    { id: 'system', label: 'System Default', desc: 'Syncs automatically with your operating system', icon: Laptop },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Preferences &amp; Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
          Appearance, Indian Rupee currency standard, threshold notifications, and widget visibility
        </p>
      </div>

      {/* 01. Appearance Theme System */}
      <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Appearance &amp; Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            Select your preferred display theme. Theme preference is preserved locally.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-[#262626] hover:bg-slate-50 dark:hover:bg-[#111111]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-[#111111] text-slate-600 dark:text-[#A3A3A3]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 02. Currency Settings */}
      <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Financial Currency Standard
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Default monetary currency formatted with safe integer paise arithmetic
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#111111] border border-slate-200/60 dark:border-[#262626]">
          <Coins className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            INR (₹) Indian Rupee
          </span>
        </div>
      </div>

      {/* 03. Notification Preferences */}
      <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500 dark:text-[#A3A3A3]" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Threshold &amp; Alert Notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
              Manage spending threshold alerts and browser permission
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#262626] space-y-3">
          <div className="flex items-center justify-between pt-3 first:pt-0">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Budget Threshold Warning Alerts (75%, 90%, 100%)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                Notify when category spending exceeds budget boundaries
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={budgetAlertsEnabled}
              onClick={() => setBudgetAlertsEnabled(!budgetAlertsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                budgetAlertsEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#262626]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  budgetAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Savings Target Reminders
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                Remind before upcoming savings goal deadlines
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={savingsRemindersEnabled}
              onClick={() => setSavingsRemindersEnabled(!savingsRemindersEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                savingsRemindersEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#262626]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  savingsRemindersEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Browser System Notifications
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3]">
                Current Permission: <span className="font-semibold uppercase">{notificationPermission}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={requestBrowserNotification}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#262626] rounded-xl border border-slate-200/60 dark:border-[#262626] transition-colors"
            >
              Request Permission
            </button>
          </div>
        </div>
      </div>

      {/* 04. Dashboard Customization Direct Trigger */}
      <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Dashboard Widget Customization
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Reorder widgets, pin essentials to the top, and toggle visibility
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomizeModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-black rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Manage Widgets
        </button>
      </div>
    </div>
  );
}
