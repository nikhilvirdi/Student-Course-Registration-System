'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, AlertCircle, ArrowRight, User, GraduationCap, Building2, Hash } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Hardcoded fallback — UUIDs match the backend seed file so registration works even if API is slow
const FALLBACK_DEPARTMENTS = [
  { department_id: '10000001-0000-4000-a000-000000000001', department_name: 'Aerospace Engineering' },
  { department_id: '10000002-0000-4000-a000-000000000002', department_name: 'Architecture' },
  { department_id: '10000003-0000-4000-a000-000000000003', department_name: 'Artificial Intelligence & Data Science' },
  { department_id: '10000004-0000-4000-a000-000000000004', department_name: 'Artificial Intelligence & Machine Learning' },
  { department_id: '10000005-0000-4000-a000-000000000005', department_name: 'Biotechnology' },
  { department_id: '10000006-0000-4000-a000-000000000006', department_name: 'Chemical Engineering' },
  { department_id: '10000007-0000-4000-a000-000000000007', department_name: 'Civil Engineering' },
  { department_id: '10000008-0000-4000-a000-000000000008', department_name: 'Computer Science & Engineering' },
  { department_id: '10000009-0000-4000-a000-000000000009', department_name: 'Computer Science & Engineering (AI & ML)' },
  { department_id: '10000010-0000-4000-a000-000000000010', department_name: 'Computer Science & Engineering (Cyber Security)' },
  { department_id: '10000011-0000-4000-a000-000000000011', department_name: 'Electrical & Electronics Engineering' },
  { department_id: '10000012-0000-4000-a000-000000000012', department_name: 'Electronics & Communication Engineering' },
  { department_id: '10000013-0000-4000-a000-000000000013', department_name: 'Electronics & Instrumentation Engineering' },
  { department_id: '10000014-0000-4000-a000-000000000014', department_name: 'Electronics & Telecommunication Engineering' },
  { department_id: '10000015-0000-4000-a000-000000000015', department_name: 'Humanities' },
  { department_id: '10000016-0000-4000-a000-000000000016', department_name: 'Industrial Engineering & Management' },
  { department_id: '10000017-0000-4000-a000-000000000017', department_name: 'Information Science & Engineering' },
  { department_id: '10000018-0000-4000-a000-000000000018', department_name: 'Management Studies (MBA)' },
  { department_id: '10000019-0000-4000-a000-000000000019', department_name: 'Master of Computer Applications (MCA)' },
  { department_id: '10000020-0000-4000-a000-000000000020', department_name: 'Mathematics' },
  { department_id: '10000021-0000-4000-a000-000000000021', department_name: 'Mechanical Engineering' },
  { department_id: '10000022-0000-4000-a000-000000000022', department_name: 'Medical Electronics Engineering' },
];

export default function RegisterPage() {
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useApp();
  const router = useRouter();

  // Pre-select first department
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department_id: FALLBACK_DEPARTMENTS[0].department_id,
    semester: '1',
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/departments');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setDepartments(data);
            setFormData(prev => ({ ...prev, department_id: data[0].department_id }));
          }
          // else: keep FALLBACK_DEPARTMENTS already in state
        }
      } catch (err) {
        // API unreachable — fallback list already set, no action needed
        console.warn('Departments API unavailable, using fallback list.');
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        department_id: formData.department_id,
        semester: formData.semester
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl z-10">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-lg shadow-primary/5">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Join SCRS</h1>
          <p className="text-sidebar-fg mt-2 font-medium">Create your academic profile to get started.</p>
        </div>

        {/* Register Card */}
        <div className="bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-card/80">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1" htmlFor="firstName">
                    First Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Alex"
                      className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-sidebar-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-sidebar-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-sidebar-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1" htmlFor="semester">
                    Semester
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                      <Hash className="w-5 h-5" />
                    </div>
                    <select
                      id="semester"
                      className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3 pl-12 pr-4 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1" htmlFor="department_id">
                  Department
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <select
                    id="department_id"
                    className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3 pl-12 pr-4 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                    value={formData.department_id}
                    onChange={handleChange}
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-sidebar-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sidebar-fg group-focus-within:text-primary transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-sidebar-accent border-card-border border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-sidebar-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-sidebar-fg/30"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <GraduationCap className="w-6 h-6 text-primary flex-shrink-0" />
                <p className="text-xs text-sidebar-fg">
                  By registering, you agree to our <span className="font-bold text-foreground hover:underline cursor-pointer">Terms of Service</span> and acknowledge you are an active student.
                </p>
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
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 bg-sidebar-accent/50 border-t border-card-border text-center">
            <p className="text-sm text-sidebar-fg font-medium">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline underline-offset-4 font-bold">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-sidebar-fg/60 text-xs mt-8 font-medium">
          &copy; 2026 Student Course Registration System (SCRS). Secure Academic Portal.
        </p>
      </div>
    </div>
  );
}
