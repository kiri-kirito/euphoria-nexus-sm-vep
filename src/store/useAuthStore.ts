import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: string | null;
  profile: any | null;
  isLoggedIn: boolean;
  setSession: (user: User | null, role: string | null, profile: any | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  profile: null,
  isLoggedIn: false,
  setSession: (user, role, profile) => set({ user, role, profile, isLoggedIn: !!user }),
  clearSession: () => set({ user: null, role: null, profile: null, isLoggedIn: false }),
}));
