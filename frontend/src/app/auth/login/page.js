'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Github } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-lg shadow-primary/5">
            <LogIn className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">SCRS Dashboard</h1>
          <p className="text-sidebar-fg mt-2 font-medium">Welcome back, Scholar!</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-card/80">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1" htmlFor="email">
                  University Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="alex.doe@university.edu"
                    className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-sidebar-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-foreground" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-medium text-primary hover:underline underline-offset-4">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-sidebar-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-card-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-sidebar-fg font-medium">Or continue with</span>
              </div>
            </div>

            <button className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 border border-card-border text-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]">
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              University SSO
            </button>
          </div>

          <div className="p-6 bg-sidebar-accent/50 border-t border-card-border text-center">
            <p className="text-sm text-sidebar-fg font-medium">
              New to the platform?{' '}
              <Link href="/auth/register" className="text-primary hover:underline underline-offset-4 font-bold">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-sidebar-fg/60 text-xs mt-8 font-medium">
          &copy; 2026 Student Course Registration System (SCRS). All rights reserved.
        </p>
      </div>
    </div>
  );
}
