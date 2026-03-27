'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import useNotificationStore from '@/store/notification.store';
import { timeAgo, cn } from '@/lib/utils';

const TYPE_ICONS = {
  'card.assigned': '👤',
  'card.comment':  '💬',
  'card.mention':  '@',
  'card.due_soon': '⏰',
  'card.overdue':  '🔴',
  'board.invited': '📋',
  'workspace.invited': '🏢',
  'board.activity':    '⚡',
};

export default function NotificationDropdown({ onClose }) {
  const ref = useRef(null);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-gray-50 dark:divide-gray-800">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n._id}
              className={cn(
                'flex gap-3 px-4 py-3 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                !n.isRead && 'bg-indigo-50/50 dark:bg-indigo-900/10'
              )}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm shrink-0 mt-0.5">
                {TYPE_ICONS[n.type] || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0" onClick={() => !n.isRead && markAsRead(n._id)}>
                <p className={cn('text-xs font-medium text-gray-900 dark:text-white line-clamp-1', !n.isRead && 'font-semibold')}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!n.isRead && (
                  <button onClick={() => markAsRead(n._id)}
                    className="p-1 text-gray-400 hover:text-green-600 rounded" title="Mark read">
                    <Check size={12} />
                  </button>
                )}
                <button onClick={() => deleteNotification(n._id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Unread dot */}
              {!n.isRead && (
                <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <Link href="/notifications" onClick={onClose}
          className="flex items-center justify-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
          View all notifications <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}
