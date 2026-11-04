'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, paiseToRupees } from '@/lib/calculations/financial';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import {
  PieChart as PieIcon,
  RotateCcw,
  Plus,
  Utensils,
  Shirt,
  Bus,
  Home,
  Coffee,
  GraduationCap,
  Apple,
  Tag,
  ArrowUpRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Transaction } from '@/types';

export interface CategorySpendingItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  amountPaise: number;
  percentage: number;
  transactionCount: number;
}

// 8 Canonical Categories requested: Food, Shopping, Transport, Bills, Entertainment, Education, Health, Other
export const CANONICAL_CATEGORIES: {
  id: string;
  name: string;
  color: string;
  icon: string;
  keywords: string[];
}[] = [
  {
    id: 'food',
    name: 'Food',
    color: '#F59E0B', // Amber
    icon: 'Utensils',
    keywords: ['food', 'mess', 'canteen', 'snack', 'dining', 'groceries', 'tiffin', 'meal', 'cafe'],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    color: '#EC4899', // Pink / Rose
    icon: 'Shirt',
    keywords: ['shopping', 'clothing', 'uniform', 'kit', 'apparel', 'shoes', 'retail'],
  },
  {
    id: 'transport',
    name: 'Transport',
    color: '#06B6D4', // Cyan
    icon: 'Bus',
    keywords: ['transport', 'transit', 'metro', 'bus', 'commute', 'cab', 'auto', 'fuel', 'petrol', 'train', 'rickshaw'],
  },
  {
    id: 'bills',
    name: 'Bills',
    color: '#6366F1', // Indigo
    icon: 'Home',
    keywords: ['bill', 'rent', 'hostel', 'pg', 'utility', 'electricity', 'internet', 'tech', 'software', 'wifi', 'recharge'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    color: '#F97316', // Orange
    icon: 'Coffee',
    keywords: ['entertainment', 'outing', 'social', 'movie', 'cinema', 'games', 'gaming', 'party', 'trip', 'hangout'],
  },
  {
    id: 'education',
    name: 'Education',
    color: '#3B82F6', // Blue
    icon: 'GraduationCap',
    keywords: ['education', 'tuition', 'college', 'course', 'book', 'stationery', 'exam', 'coaching', 'library', 'lab', 'fee'],
  },
  {
    id: 'health',
    name: 'Health',
    color: '#10B981', // Emerald
    icon: 'Apple',
    keywords: ['health', 'medical', 'medicine', 'doctor', 'hospital', 'gym', 'fitness', 'pharmacy', 'wellness'],
  },
  {
    id: 'other',
    name: 'Other',
    color: '#8B5CF6', // Purple
    icon: 'Tag',
    keywords: ['other', 'misc', 'general', 'personal'],
  },
];

interface CircularExpenseChartProps {
  transactions?: Transaction[];
  title?: string;
  subtitle?: string;
}

export function CircularExpenseChart({
  transactions: propTransactions,
  title = 'Spending by Category',
  subtitle = 'Circular breakdown of your recorded outgoing expenses',
}: CircularExpenseChartProps) {
  const { transactions: contextTransactions, categories, openAddTransaction } = useApp();
  const txList = propTransactions || contextTransactions;

  const isReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [activeCategory, setActiveCategory] = useState<CategorySpendingItem | null>(null);
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [viewGrouping, setViewGrouping] = useState<'canonical' | 'ledger'>('ledger');

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setIsActivated(true);
        setAnimationProgress(1);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Filter active expenses
  const expenseTransactions = useMemo(() => {
    return txList.filter((t) => t.type === 'expense' && !t.deletedAt);
  }, [txList]);

  // Total expenses in paise
  const totalExpensesPaise = useMemo(() => {
    return expenseTransactions.reduce((sum, t) => sum + t.amountPaise, 0);
  }, [expenseTransactions]);

  // Map expenses to canonical or ledger categories
  const spendingBreakdown = useMemo<CategorySpendingItem[]>(() => {
    if (totalExpensesPaise === 0) return [];

    if (viewGrouping === 'canonical') {
      const bucketMap: Record<
        string,
        {
          id: string;
          name: string;
          color: string;
          icon: string;
          amountPaise: number;
          count: number;
        }
      > = {};

      // Initialize all canonical buckets
      CANONICAL_CATEGORIES.forEach((can) => {
        bucketMap[can.id] = {
          id: can.id,
          name: can.name,
          color: can.color,
          icon: can.icon,
          amountPaise: 0,
          count: 0,
        };
      });

      // Distribute expenses to best-matching canonical bucket
      expenseTransactions.forEach((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        const nameLower = (cat?.name || t.description || '').toLowerCase();

        let matchedId = 'other';
        for (const can of CANONICAL_CATEGORIES) {
          if (can.id === 'other') continue;
          if (can.keywords.some((kw) => nameLower.includes(kw))) {
            matchedId = can.id;
            break;
          }
        }

        bucketMap[matchedId].amountPaise += t.amountPaise;
        bucketMap[matchedId].count += 1;
      });

      // Filter only buckets that have actual spending, sorted descending
      return Object.values(bucketMap)
        .filter((b) => b.amountPaise > 0)
        .map((b) => ({
          id: b.id,
          name: b.name,
          color: b.color,
          icon: b.icon,
          amountPaise: b.amountPaise,
          percentage: (b.amountPaise / totalExpensesPaise) * 100,
          transactionCount: b.count,
        }))
        .sort((a, b) => b.amountPaise - a.amountPaise);
    } else {
      // Detailed by ledger category
      const catMap: Record<string, { amountPaise: number; count: number }> = {};
      expenseTransactions.forEach((t) => {
        catMap[t.categoryId] = {
          amountPaise: (catMap[t.categoryId]?.amountPaise || 0) + t.amountPaise,
          count: (catMap[t.categoryId]?.count || 0) + 1,
        };
      });

      return Object.entries(catMap)
        .map(([catId, data]) => {
          const cat = categories.find((c) => c.id === catId);
          return {
            id: catId,
            name: cat?.name || 'Uncategorized',
            color: cat?.color || '#94A3B8',
            icon: cat?.icon || 'Tag',
            amountPaise: data.amountPaise,
            percentage: (data.amountPaise / totalExpensesPaise) * 100,
            transactionCount: data.count,
          };
        })
        .sort((a, b) => b.amountPaise - a.amountPaise);
    }
  }, [expenseTransactions, totalExpensesPaise, viewGrouping, categories]);

  // Run smooth animation from 0% to 100% drawing progress
  const startDrawingAnimation = useCallback(() => {
    if (isReducedMotion()) {
      setAnimationProgress(1);
      return;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setAnimationProgress(0);
    const duration = 1200; // ms
    const startTime = performance.now();

    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimationProgress(eased);

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(frame);
      } else {
        setAnimationProgress(1);
      }
    };

    animationFrameRef.current = requestAnimationFrame(frame);
  }, [isReducedMotion]);

  // Scroll-triggered viewport activation using IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isReducedMotion()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsActivated(true);
          startDrawingAnimation();
          // Disconnect to avoid repeated animations on each minor scroll
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startDrawingAnimation, isReducedMotion]);

  // Donut geometry constants
  const size = 260;
  const center = size / 2; // 130
  const radius = 86;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius; // ~540.35

  // Calculate segment arcs and continuous drawing progression
  const segments = useMemo(() => {
    if (spendingBreakdown.length === 0 || totalExpensesPaise === 0) return [];

    let accumulatedLength = 0;
    const drawnLength = animationProgress * circumference;

    return spendingBreakdown.map((item) => {
      const targetLength = (item.amountPaise / totalExpensesPaise) * circumference;
      const startOffset = accumulatedLength;
      accumulatedLength += targetLength;

      // Determine how much of this segment is drawn based on current progress
      let currentSegLength = 0;
      if (drawnLength > startOffset) {
        currentSegLength = Math.min(targetLength, drawnLength - startOffset);
      }

      // Small visual gap between segments when multiple items exist
      const gap = spendingBreakdown.length > 1 ? 2 : 0;
      const effectiveLength = Math.max(0, currentSegLength - gap);

      return {
        ...item,
        startOffset,
        targetLength,
        effectiveLength,
        isDrawn: currentSegLength > 0,
      };
    });
  }, [spendingBreakdown, totalExpensesPaise, animationProgress, circumference]);

  return (
    <div
      ref={containerRef}
      className="p-5 md:p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626]"
    >
      {/* Header with Title, Grouping Selector, and Replay Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View grouping toggle: Canonical 8 vs Detailed */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#141414] rounded-xl border border-slate-200/60 dark:border-[#262626]">
            <button
              onClick={() => setViewGrouping('canonical')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                viewGrouping === 'canonical'
                  ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-[#A3A3A3] hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Standard (8)
            </button>
            <button
              onClick={() => setViewGrouping('ledger')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                viewGrouping === 'ledger'
                  ? 'bg-white dark:bg-[#262626] text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-[#A3A3A3] hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All Categories
            </button>
          </div>

          {/* Replay animation button */}
          <button
            onClick={startDrawingAnimation}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors duration-150 border border-slate-200/60 dark:border-[#262626]"
            title="Replay drawing animation"
            aria-label="Replay drawing animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Donut Chart on Left/Top, Breakdown Legend on Right/Bottom */}
      {spendingBreakdown.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart Visualizer (5 columns on large screen) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] max-w-full flex items-center justify-center select-none">
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full h-full transform -rotate-90 origin-center overflow-visible"
              >
                {/* Background Track Circle */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-slate-100 dark:text-[#171717]"
                />

                {/* Animated Proportional Segments */}
                {segments.map((seg) => {
                  const isHovered = activeCategory?.id === seg.id;
                  return (
                    <circle
                      key={seg.id}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={`${seg.effectiveLength} ${circumference}`}
                      strokeDashoffset={-seg.startOffset}
                      strokeLinecap="round"
                      className="transition-all duration-150 cursor-pointer"
                      style={{
                        filter: isHovered
                          ? `drop-shadow(0 0 6px ${seg.color}80)`
                          : undefined,
                      }}
                      onMouseEnter={() => setActiveCategory(seg)}
                      onMouseLeave={() => setActiveCategory(null)}
                      onClick={() =>
                        setActiveCategory(
                          activeCategory?.id === seg.id ? null : seg
                        )
                      }
                    />
                  );
                })}
              </svg>

              {/* Center Informational Badge */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none transition-all duration-200"
                aria-live="polite"
              >
                {activeCategory ? (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{
                        backgroundColor: `${activeCategory.color}20`,
                        color: activeCategory.color,
                      }}
                    >
                      {activeCategory.name}
                    </span>
                    <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {formatINR(activeCategory.amountPaise)}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                      {activeCategory.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-150">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-[#A3A3A3] uppercase tracking-wider">
                      Total Spent
                    </span>
                    <div className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {formatINR(totalExpensesPaise)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#A3A3A3] mt-0.5">
                      {spendingBreakdown.length}{' '}
                      {spendingBreakdown.length === 1 ? 'category' : 'categories'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hint message under chart */}
            <div className="mt-3 text-[11px] text-slate-400 dark:text-[#737373] text-center flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Hover or tap any slice or category to inspect details</span>
            </div>
          </div>

          {/* Category Breakdown List (7 columns on large screen) */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-[#A3A3A3] px-2 pb-1 uppercase tracking-wider">
              <span>Category &amp; Proportion</span>
              <span>Amount &amp; Share</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {spendingBreakdown.map((item, index) => {
                const isSelected = activeCategory?.id === item.id;
                // Staggered reveal transition: respects scroll activation and reduced-motion
                const delayMs = isReducedMotion() ? 0 : Math.min(index * 55 + 180, 800);

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveCategory(item)}
                    onMouseLeave={() => setActiveCategory(null)}
                    onClick={() =>
                      setActiveCategory(isSelected ? null : item)
                    }
                    className={`p-3 rounded-xl transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-[#141414] ring-1 ring-slate-300 dark:ring-[#333333]'
                        : 'hover:bg-slate-50 dark:hover:bg-[#141414]/70'
                    }`}
                    style={{
                      opacity: isActivated ? 1 : 0,
                      transform: isActivated ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 300ms ease, transform 300ms ease, background-color 150ms ease`,
                      transitionDelay: `${delayMs}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Swatch + Category name + Transaction count */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${item.color}20`,
                            color: item.color,
                          }}
                        >
                          <CategoryIcon
                            name={item.icon}
                            color={item.color}
                            className="w-3.5 h-3.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-[#A3A3A3]">
                            {item.transactionCount}{' '}
                            {item.transactionCount === 1 ? 'transaction' : 'transactions'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Percentage */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatINR(item.amountPaise)}
                        </div>
                        <div
                          className="text-xs font-semibold tabular-nums mt-0.5"
                          style={{ color: item.color }}
                        >
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Proportional Progress Bar below row */}
                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-[#141414] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, item.percentage * animationProgress)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Zero-State: Elegant Donut Outline & Action */
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg
              width="144"
              height="144"
              viewBox="0 0 144 144"
              className="transform -rotate-90"
            >
              <circle
                cx="72"
                cy="72"
                r="56"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="14"
                strokeDasharray="4 4"
                className="text-slate-200 dark:text-[#262626]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-[#737373]">
              <span className="text-lg font-bold text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs uppercase font-semibold tracking-wider">No Spending</span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            No expense records available
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] max-w-sm mt-1">
            Record your first expense transaction to generate a live, animated circular spending breakdown.
          </p>

          <button
            onClick={openAddTransaction}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-colors duration-150"
          >
            <Plus className="w-3.5 h-3.5" /> Record Expense
          </button>
        </div>
      )}
    </div>
  );
}
