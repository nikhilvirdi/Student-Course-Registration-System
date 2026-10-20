'use client';

/**
 * PageHeader — standardised top-of-page header.
 *
 * Replaces the inline h1 + description + icon + action-button pattern
 * that was duplicated in: dashboard, courses, tasks, activity,
 * notifications, documents, and settings pages.
 *
 * Props:
 *   icon       — Lucide icon component (rendered in a primary-tinted box)
 *   title      — Main heading text
 *   description — Subheading / description text
 *   action     — Optional ReactNode rendered on the right (e.g. a button)
 */
export default function PageHeader({ icon: Icon, title, description, action }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-sidebar-fg mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
