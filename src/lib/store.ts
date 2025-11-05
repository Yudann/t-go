import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Route {
  id: string;
  name: string;
  route_code: string;
  start_point: string;
  end_point: string;
  estimated_time: number;
  fare: number;
  color: string;
}

interface Ticket {
  id: string;
  route_id: string;
  start_point: string;
  end_point: string;
  passenger_count: number;
  total_fare: number;
  qr_code: string;
  status: string;
  travel_date: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

interface AppState {
  selectedRoute: Route | null;
  setSelectedRoute: (route: Route | null) => void;
  bookingData: {
    startPoint: string;
    endPoint: string;
    passengerCount: number;
  } | null;
  setBookingData: (data: any) => void;
  clearBookingData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, user: session?.user ?? null }),
      logout: () => set({ user: null, session: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useAppStore = create<AppState>((set) => ({
  selectedRoute: null,
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  bookingData: null,
  setBookingData: (data) => set({ bookingData: data }),
  clearBookingData: () => set({ bookingData: null }),
}));