'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export function useSocket(event, handler) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(event, handler);
    return () => { socket.off(event, handler); };
  }, [event, handler]);
}

export function useSocketEvents(events) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    events.forEach(({ event, handler }) => {
      socket.on(event, handler);
    });

    return () => {
      events.forEach(({ event, handler }) => {
        socket.off(event, handler);
      });
    };
  }, []);
}
