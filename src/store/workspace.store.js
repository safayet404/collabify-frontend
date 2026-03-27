import { create } from 'zustand';
import api from '@/lib/axios';

const useWorkspaceStore = create((set, get) => ({
  workspaces:       [],
  currentWorkspace: null,
  isLoading:        false,

  // ── Fetch all workspaces ──────────────────────────────────
  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/workspaces');
      set({ workspaces: res.data.workspaces, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // ── Set current workspace ─────────────────────────────────
  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
  },

  // ── Fetch single workspace ────────────────────────────────
  fetchWorkspace: async (id) => {
    try {
      const res = await api.get(`/workspaces/${id}`);
      set({ currentWorkspace: res.data.workspace });
      return res.data.workspace;
    } catch (err) {
      throw err;
    }
  },

  // ── Create workspace ──────────────────────────────────────
  createWorkspace: async (data) => {
    const res = await api.post('/workspaces', data);
    set((state) => ({
      workspaces: [res.data.workspace, ...state.workspaces],
    }));
    return res.data.workspace;
  },

  // ── Update workspace ──────────────────────────────────────
  updateWorkspace: async (id, data) => {
    const res = await api.patch(`/workspaces/${id}`, data);
    set((state) => ({
      workspaces: state.workspaces.map(w => w._id === id ? res.data.workspace : w),
      currentWorkspace: state.currentWorkspace?._id === id ? res.data.workspace : state.currentWorkspace,
    }));
    return res.data.workspace;
  },

  // ── Delete workspace ──────────────────────────────────────
  deleteWorkspace: async (id) => {
    await api.delete(`/workspaces/${id}`);
    set((state) => ({
      workspaces: state.workspaces.filter(w => w._id !== id),
      currentWorkspace: state.currentWorkspace?._id === id ? null : state.currentWorkspace,
    }));
  },

  // ── Invite member ─────────────────────────────────────────
  inviteMember: async (workspaceId, email, role) => {
    return api.post(`/workspaces/${workspaceId}/invite`, { email, role });
  },

  // ── Remove member ─────────────────────────────────────────
  removeMember: async (workspaceId, userId) => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    set((state) => {
      if (state.currentWorkspace?._id === workspaceId) {
        return {
          currentWorkspace: {
            ...state.currentWorkspace,
            members: state.currentWorkspace.members.filter(m => m.user._id !== userId),
          },
        };
      }
      return {};
    });
  },

  // ── Update member role ────────────────────────────────────
  updateMemberRole: async (workspaceId, userId, role) => {
    return api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
  },

  // ── Socket events ─────────────────────────────────────────
  handleMemberJoined: (workspaceId, data) => {
    set((state) => {
      if (state.currentWorkspace?._id === workspaceId) {
        return {
          currentWorkspace: {
            ...state.currentWorkspace,
            members: [...state.currentWorkspace.members, data],
          },
        };
      }
      return {};
    });
  },

  handleMemberRemoved: (workspaceId, userId) => {
    set((state) => {
      if (state.currentWorkspace?._id === workspaceId) {
        return {
          currentWorkspace: {
            ...state.currentWorkspace,
            members: state.currentWorkspace.members.filter(m => m.user._id !== userId),
          },
        };
      }
      return {};
    });
  },
}));

export default useWorkspaceStore;
