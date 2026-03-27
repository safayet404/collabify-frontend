import { create } from 'zustand';
import api from '@/lib/axios';

const useBoardStore = create((set, get) => ({
  boards:       [],
  currentBoard: null,
  isLoading:    false,
  activeUsers:  [], // users currently viewing the board

  // ── Fetch boards for workspace ────────────────────────────
  fetchBoards: async (workspaceId, includeArchived = false) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/boards/workspace/${workspaceId}`, {
        params: { archived: includeArchived },
      });
      set({ boards: res.data.boards, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // ── Fetch single board (full detail) ─────────────────────
  fetchBoard: async (boardId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/boards/${boardId}`);
      set({ currentBoard: res.data.board, isLoading: false });
      return res.data.board;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // ── Create board ──────────────────────────────────────────
  createBoard: async (data) => {
    const res = await api.post('/boards', data);
    set((state) => ({ boards: [res.data.board, ...state.boards] }));
    return res.data.board;
  },

  // ── Update board ──────────────────────────────────────────
  updateBoard: async (boardId, data) => {
    const res = await api.patch(`/boards/${boardId}`, data);
    set((state) => ({
      boards: state.boards.map(b => b._id === boardId ? { ...b, ...res.data.board } : b),
      currentBoard: state.currentBoard?._id === boardId ? { ...state.currentBoard, ...res.data.board } : state.currentBoard,
    }));
    return res.data.board;
  },

  // ── Delete board ──────────────────────────────────────────
  deleteBoard: async (boardId) => {
    await api.delete(`/boards/${boardId}`);
    set((state) => ({
      boards: state.boards.filter(b => b._id !== boardId),
      currentBoard: state.currentBoard?._id === boardId ? null : state.currentBoard,
    }));
  },

  // ── Star board ────────────────────────────────────────────
  starBoard: async (boardId, star) => {
    await api.patch(`/boards/${boardId}/${star ? 'star' : 'unstar'}`);
    set((state) => ({
      boards: state.boards.map(b => b._id === boardId ? { ...b, isStarred: star } : b),
      currentBoard: state.currentBoard?._id === boardId ? { ...state.currentBoard, isStarred: star } : state.currentBoard,
    }));
  },

  // ── Archive board ─────────────────────────────────────────
  archiveBoard: async (boardId, archive) => {
    await api.patch(`/boards/${boardId}/${archive ? 'archive' : 'unarchive'}`);
    set((state) => ({
      boards: state.boards.filter(b => b._id !== boardId),
    }));
  },

  // ── List operations ───────────────────────────────────────
  addList: (list) => {
    set((state) => {
      if (!state.currentBoard) return {};
      const exists = state.currentBoard.lists?.some(l => l._id === list._id);
      if (exists) return {};
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: [...state.currentBoard.lists, { ...list, cards: [] }],
        },
      };
    });
  },

  updateList: (listId, updates) => {
    set((state) => {
      if (!state.currentBoard) return {};
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(l => l._id === listId ? { ...l, ...updates } : l),
        },
      };
    });
  },

  removeList: (listId) => {
    set((state) => {
      if (!state.currentBoard) return {};
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.filter(l => l._id !== listId),
        },
      };
    });
  },

  setLists: (lists) => {
    set((state) => {
      if (!state.currentBoard) return {};
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: lists.map(list => ({
            ...list,
            cards: state.currentBoard.lists.find(l => l._id === list._id)?.cards || [],
          })),
        },
      };
    });
  },

  // ── Card operations ───────────────────────────────────────
  addCard: (listId, card) => {
    set((state) => {
      if (!state.currentBoard) return {};
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(l =>
            l._id !== listId ? l : (l.cards?.some(c => c._id === card._id) ? l : { ...l, cards: [...(l.cards || []), card] })
          ),
        },
      };
    });
  },

  updateCard: (cardId, updates) => {
    set((state) => {
      if (!state.currentBoard) return {};
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(l => ({
            ...l,
            cards: l.cards.map(c => c._id === cardId ? { ...c, ...updates } : c),
          })),
        },
      };
    });
  },

  removeCard: (cardId, listId) => {
    set((state) => {
      if (!state.currentBoard) return {};
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(l =>
            l._id === listId
              ? { ...l, cards: l.cards.filter(c => c._id !== cardId) }
              : l
          ),
        },
      };
    });
  },

  moveCardBetweenLists: (cardId, fromListId, toListId, toIndex) => {
    set((state) => {
      if (!state.currentBoard) return {};
      const lists = [...state.currentBoard.lists];
      const fromList = lists.find(l => l._id === fromListId);
      const toList   = lists.find(l => l._id === toListId);
      if (!fromList || !toList) return {};

      const cardIndex = fromList.cards.findIndex(c => c._id === cardId);
      if (cardIndex === -1) return {};

      const [card] = fromList.cards.splice(cardIndex, 1);
      toList.cards.splice(toIndex, 0, card);

      return {
        currentBoard: { ...state.currentBoard, lists },
      };
    });
  },

  // ── Active users (live presence) ──────────────────────────
  addActiveUser: (user) => {
    set((state) => {
      const exists = state.activeUsers.find(u => u.userId === user.userId);
      if (exists) return {};
      return { activeUsers: [...state.activeUsers, user] };
    });
  },

  removeActiveUser: (userId) => {
    set((state) => ({
      activeUsers: state.activeUsers.filter(u => u.userId !== userId),
    }));
  },

  setCurrentBoard: (board) => set({ currentBoard: board }),
  clearBoard: () => set({ currentBoard: null, activeUsers: [] }),
}));

export default useBoardStore;
