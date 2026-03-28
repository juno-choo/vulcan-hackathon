import { create } from 'zustand';
import { api } from './api';
import * as SecureStore from 'expo-secure-store';
import type {
  User,
  ServiceCategory,
  EquipmentCategory,
  TimeSlotType,
  AddonCatalog,
  LookupsResponse,
} from '@/types';

const USER_ID_KEY = 'vulcan_user_id';

interface AppState {
  // Auth
  user: User | null;
  isLoading: boolean;

  // Lookups
  serviceCategories: ServiceCategory[];
  equipmentCategories: EquipmentCategory[];
  timeSlots: TimeSlotType[];
  addons: AddonCatalog[];
  lookupsLoaded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  fetchLookups: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: true,

  serviceCategories: [],
  equipmentCategories: [],
  timeSlots: [],
  addons: [],
  lookupsLoaded: false,

  setUser: (user) => set({ user }),

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
    const user = await api.post<User>('/auth/login', { email, password });
    await SecureStore.setItemAsync(USER_ID_KEY, user.id);
    set({ user });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    set({ user: null });
  },

  initialize: async () => {
    try {
      const userId = await SecureStore.getItemAsync(USER_ID_KEY);
      if (userId) {
        const user = await api.get<User>(`/auth/me/${userId}`);
        set({ user });
      }
    } catch (err) {
      console.error('Init error:', err);
      await SecureStore.deleteItemAsync(USER_ID_KEY);
    } finally {
      set({ isLoading: false });
    }
  },
}));
