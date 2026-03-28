import { create } from 'zustand';
import { api } from './api';
import { supabase } from './supabase';
import type {
  User,
  ServiceCategory,
  EquipmentCategory,
  TimeSlotType,
  AddonCatalog,
  LookupsResponse,
} from '@/types';

interface AppState {
  // Auth
  user: User | null;
  session: any | null;
  isLoading: boolean;

  // Lookups
  serviceCategories: ServiceCategory[];
  equipmentCategories: EquipmentCategory[];
  timeSlots: TimeSlotType[];
  addons: AddonCatalog[];
  lookupsLoaded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  fetchLookups: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'HOST' | 'BOOKER') => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,

  serviceCategories: [],
  equipmentCategories: [],
  timeSlots: [],
  addons: [],
  lookupsLoaded: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),

  fetchLookups: async () => {
    if (get().lookupsLoaded) return;
    try {
      const data = await api.get<LookupsResponse>('/lookups/all');
      set({
        serviceCategories: data.serviceCategories,
        equipmentCategories: data.equipmentCategories,
        timeSlots: data.timeSlots,
        addons: data.addons,
        lookupsLoaded: true,
      });
    } catch (err) {
      console.error('Failed to fetch lookups:', err);
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ session: data.session });

    // Fetch user profile from our API
    // For now we'll use the auth user data
    const authUser = data.user;
    if (authUser) {
      try {
        // Try to get user from backend
        const users = await api.get<User[]>(`/workshops?lat=0&lng=0`); // placeholder
        set({ user: { id: authUser.id, email: authUser.email!, full_name: authUser.user_metadata?.full_name || email } as User });
      } catch {
        set({ user: { id: authUser.id, email: authUser.email!, full_name: authUser.user_metadata?.full_name || email } as User });
      }
    }
  },

  signUp: async (email, password, fullName, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;
    set({ session: data.session });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          session,
          user: {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.email!,
          } as User,
        });
      }
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
