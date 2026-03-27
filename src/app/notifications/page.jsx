'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Filter, Loader2, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useNotificationStore from '@/store/notification.store';
import AppLayout from '@/app/dashboard/layout';
import { timeAgo, cn } from '@/lib/utils';

const TYPE_CONFIG = {
  'card.assigned':      { icon: '👤', label: 'Assigned',    color: 'bg-blue-100 text-blue-700'   },
  'card.comment':       { icon: '💬', label: 'Comment',     color: 'bg-green-100 text-green-700' },
  'card.mention':       { icon: '@',  label: 'Mention',     color: 'bg-purple-100 text-purple-700'},
  'card.due_soon':      { icon: '⏰', label: 'Due Soon',    color: 'bg-amber-100 text-amber-700' },
  'card.overdue':       { icon: '🔴', label: 'Overdue',     color: 'bg-red-100 text-red-700'     },
  'board.invited':      { icon: '📋', label: 'Board',       color: 'bg-indigo-100 text-indigo-700'},
  'workspace.invited':  { icon: '🏢', label: 'Workspace',   color: 'bg-teal-100 text-teal-700'   },
  'board.activity':     { icon: '⚡', label: 'Activity',    color: 'bg-orange-100 text-orange-700'},
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications, unreadCount, isLoading,
    fetchNotifications, markAsRead, markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [filter, setFilter] = useState('all'); // all | unread

  useEffect(() => {
    fetchNotifications(filter === 'unread');
  }, [filter]);

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleClick = async (n) => {
    if (!n.isRead) await markAsRead(n._id);
    if (n.link) router.push(n.link);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={22} /> Notifications
              {unreadCount > 0 && (
                <span className="text-sm font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Stay up to date with your team activity</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-2 btn-secondary text-sm">
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all',    label: 'All',    count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                filter === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              )}>
              {f.label}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-bold',
                filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              )}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={40} className="text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'unread' ? 'No unread notifications' : 'You\'ll see updates here as your team collaborates'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {displayed.map(n => {
                const config = TYPE_CONFIG[n.type] || { icon: '🔔', label: 'Notification', color: 'bg-gray-100 text-gray-600' };
                return (
                  <div key={n._id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'flex items-start gap-4 px-5 py-4 cursor-pointer group transition-colors',
                      !n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}>

                    {/* Icon */}
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5', config.color)}>
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={cn('text-sm text-gray-900 dark:text-white', !n.isRead && 'font-semibold')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', config.color)}>
                              {config.label}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {!n.isRead && (
                            <button onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as read">
                              <Check size={13} />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
