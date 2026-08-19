'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = searchParams.get('role');
  const initialRole = urlRole === 'delivery' || urlRole === 'agent' ? 'agent' : urlRole === 'seller' ? 'seller' : 'buyer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!['buyer', 'seller'].includes(role)) {
      setError('Staff accounts are created internally by administrators.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    // Supabase auth signup
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('rate limit')) {
        setError('Email rate limit exceeded. Please use the Quick Login test accounts or try again later.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      if (!data.session && data.user.identities?.length === 0) {
         setError('This email is already registered. Please sign in instead.');
         setLoading(false);
         return;
      }
      // Insert into public.users table
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: name,
        role: role,
        created_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase.from('users').insert(userData);

      if (insertError) {
        setError(insertError.message);
      } else {
        if (!data.session) {
          // Email confirmation is required
          setSuccess(true);
          setError("Account created! Please check your email to confirm your account before logging in.");
          setTimeout(() => {
            router.push('/');
          }, 5000);
        } else {
          // Manually update the global auth state to prevent race conditions with AuthProvider
          useAuthStore.getState().setSession(data.user, role, userData);
          
          setSuccess(true);
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      }
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-emerald-600">Registration Successful!</h2>
          <p className="text-slate-600">
            {error ? error : "Welcome to Euphoria Nexus. Redirecting you to the homepage..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Join Euphoria Nexus today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-sm text-red-600 font-medium text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller (requires admin approval)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Delivery, support, and admin accounts are created internally by administrators.
                </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70"
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/" className="font-bold text-primary hover:text-primary-dark transition-colors">
              Go to Home & Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
