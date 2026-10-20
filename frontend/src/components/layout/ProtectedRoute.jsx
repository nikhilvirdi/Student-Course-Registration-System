'use client';

/**
 * ProtectedRoute: In unauthenticated development mode, all routes
 * are directly accessible without requiring authentication or redirects.
 */
export default function ProtectedRoute({ children }) {
  return children;
}

