import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely, resolving conflicts.
 * Centralised here so no page file needs to redeclare this function.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Status / badge helpers — used across courses, tasks, notifications
// ---------------------------------------------------------------------------

/** Returns Tailwind color classes for a course enrollment status. */
export function enrollmentStatusClasses(status) {
  switch (status) {
    case 'Enrolled':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Waitlisted':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'Dropped':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
}

/** Returns Tailwind color classes for a task priority. */
export function priorityClasses(priority) {
  switch (priority) {
    case 'High':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'Medium':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'Low':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    default:
      return 'bg-sidebar-accent text-foreground border-card-border';
  }
}

/** Returns Tailwind color classes for a notification type. */
export function notificationTypeClasses(type) {
  switch (type) {
    case 'grade':
      return 'bg-purple-500/10 text-purple-500';
    case 'material':
      return 'bg-blue-500/10 text-blue-500';
    case 'reminder':
      return 'bg-amber-500/10 text-amber-500';
    case 'system':
      return 'bg-sidebar-accent text-sidebar-fg';
    default:
      return 'bg-primary/10 text-primary';
  }
}

// ---------------------------------------------------------------------------
// Name formatting — backend returns a single `name` string
// ---------------------------------------------------------------------------

/** Returns the user's display name — prefers firstName if available. */
export function displayName(user) {
  if (!user) return 'Student';
  if (user.firstName) return user.firstName;
  return user.name || 'Student';
}

/** Returns two-letter avatar initials from a user object. */
export function userInitials(user) {
  if (!user) return '??';
  const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return '??';
}

// ---------------------------------------------------------------------------
// API fetch wrapper — prevents scattered raw fetch() calls across pages
// ---------------------------------------------------------------------------

const API_BASE = 'http://localhost:5000/api';

/**
 * Typed API fetch with automatic auth header injection.
 * Returns parsed JSON data or throws an Error with the server message.
 *
 * Usage:
 *   const data = await apiFetch('/courses', { token });
 *   const data = await apiFetch('/auth/profile', { method: 'PATCH', token, body: { name } });
 */
export async function apiFetch(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

