import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';
import { initSocket, disconnectSocket } from '@/lib/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,
      isHydrated:   false,

      setHydrated: () => set({ isHydrated: true }),

      // ── Login ───────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data;

          localStorage.setItem('accessToken',  accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({ user, accessToken, refreshToken, isLoading: false });

          // Init socket
          initSocket(accessToken);

          return user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ── Register ────────────────────────────────────────────
      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', { name, email, password });
          const { user, accessToken, refreshToken } = res.data;

          localStorage.setItem('accessToken',  accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({ user, accessToken, refreshToken, isLoading: false });
          initSocket(accessToken);
          return user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ── Logout ──────────────────────────────────────────────
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        disconnectSocket();
        set({ user: null, accessToken: null, refreshToken: null });
      },

      // ── Update user ─────────────────────────────────────────
      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      // ── Fetch current user ───────────────────────────────────
      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user });
          return res.data.user;
        } catch {
          get().logout();
        }
      },

      // ── Getters ─────────────────────────────────────────────
      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name:      'collabify-auth',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        // Re-init socket on page refresh
        if (state?.accessToken) {
          initSocket(state.accessToken);
        }
      },
    }
  )
);

export default useAuthStore;
