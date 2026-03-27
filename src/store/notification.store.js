import { create } from 'zustand';
import api from '@/lib/axios';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,
  isLoading:     false,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications', { params: { unread: unreadOnly, limit: 20 } });
      set({
        notifications: res.data,
        unreadCount:   res.unreadCount || 0,
        isLoading:     false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data.count });
    } catch {}
  },

  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
      unreadCount:   Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await api.patch('/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount:   0,
    }));
  },

  deleteNotification: async (id) => {
    await api.delete(`/notifications/${id}`);
    set((state) => {
      const notif = state.notifications.find(n => n._id === id);
      return {
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount:   notif && !notif.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  // Called by socket when new notification arrives
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 20),
      unreadCount:   state.unreadCount + 1,
    }));
  },
}));

export default useNotificationStore;
