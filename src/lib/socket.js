import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    auth: { token },
    transports:      ['websocket', 'polling'],
    reconnection:    true,
    reconnectionAttempts: 5,
    reconnectionDelay:    1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ── Board room helpers ────────────────────────────────────────
export const joinBoard = (boardId) => {
  socket?.emit('board:join', boardId);
};

export const leaveBoard = (boardId) => {
  socket?.emit('board:leave', boardId);
};

export const joinWorkspace = (workspaceId) => {
  socket?.emit('workspace:join', workspaceId);
};

export const emitTyping = (cardId, boardId) => {
  socket?.emit('card:typing', { cardId, boardId });
};

export const emitStopTyping = (cardId, boardId) => {
  socket?.emit('card:stop-typing', { cardId, boardId });
};
