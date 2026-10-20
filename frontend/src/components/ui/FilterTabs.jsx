'use client';

import { cn } from '@/lib/utils';

/**
 * FilterTabs — standardised horizontal tab bar.
 *
 * Replaces the duplicated tab-row pattern in:
 * courses, tasks, documents, notifications pages.
 *
 * Props:
 *   tabs     — Array of { id: string, label: string, count?: number }
 *   active   — Currently active tab id
 *   onChange — Callback(id: string)
 *   className — Optional additional wrapper classes
 */
export default function FilterTabs({ tabs = [], active, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-sidebar-accent rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
            active === tab.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-sidebar-fg hover:text-foreground hover:bg-card/50'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-bold tabular-nums',
                active === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-card-border/50 text-sidebar-fg'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
