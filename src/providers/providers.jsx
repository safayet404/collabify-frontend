'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import { getSocket } from '@/lib/socket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   1000 * 60 * 5, // 5 minutes
      retry:       1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Socket event listener ─────────────────────────────────────
function SocketProvider({ children }) {
  const { isHydrated, accessToken } = useAuthStore();
  const addNotification = useNotificationStore(s => s.addNotification);
  const fetchUnreadCount = useNotificationStore(s => s.fetchUnreadCount);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isHydrated || !accessToken || initialized.current) return;
    initialized.current = true;

    const socket = getSocket();
    if (!socket) return;

    // Listen for new notifications
    socket.on('notification:new', (notification) => {
      addNotification(notification);
    });

    // Fetch initial unread count
    fetchUnreadCount();

    return () => {
      socket.off('notification:new');
    };
  }, [isHydrated, accessToken]);

  return children;
}

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <SocketProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{ duration: 3000 }}
          />
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
