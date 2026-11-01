'use client';

import React from 'react';
import {
  Utensils,
  Home,
  GraduationCap,
  BookOpen,
  Bus,
  Printer,
  Laptop,
  Coffee,
  Target,
  Library,
  FileText,
  BusFront,
  Shirt,
  Apple,
  Wallet,
  Award,
  BookMarked,
  Briefcase,
  Trophy,
  Gift,
  Tag,
  CircleDollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export function CategoryIcon({ name, className = 'w-4 h-4', color }: CategoryIconProps) {
  const iconMap: Record<string, React.ElementType> = {
    Utensils,
    Home,
    GraduationCap,
    BookOpen,
    Bus,
    Printer,
    Laptop,
    Coffee,
    Target,
    Library,
    FileText,
    BusFront,
    Shirt,
    Apple,
    Wallet,
    Award,
    BookMarked,
    Briefcase,
    Trophy,
    Gift,
    Tag,
    CircleDollarSign,
    Layers,
    Sparkles,
  };

  const IconComponent = iconMap[name] || Tag;

  return (
    <IconComponent
      className={className}
      style={color ? { color } : undefined}
      aria-hidden="true"
    />
  );
}
