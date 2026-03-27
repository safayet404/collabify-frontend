'use client';

import { useState } from 'react';
import { X, Check, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { UserAvatar } from '@/app/dashboard/layout';

export default function CardMembers({ cardId, card, board, onRefresh, onClose }) {
  const [loading, setLoading] = useState(null);
  const members = board?.members || [];

  const isAssigned = (userId) => card.assignees?.some(a => (a._id || a) === userId);

  const toggle = async (member) => {
    const userId = member.user?._id || member.user;
    setLoading(userId);
    try {
      if (isAssigned(userId)) {
        await api.delete(`/cards/${cardId}/members/${userId}`);
      } else {
        await api.post(`/cards/${cardId}/members`, { userId });
      }
      onRefresh();
    } catch { toast.error('Failed to update member'); }
    finally { setLoading(null); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Members</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="space-y-1">
          {members.map(member => {
            const userId   = member.user?._id || member.user;
            const assigned = isAssigned(userId);
            return (
              <button key={userId} onClick={() => toggle(member)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <UserAvatar user={member.user} size="sm" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                </div>
                {loading === userId
                  ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  : assigned
                    ? <Check size={16} className="text-indigo-600 shrink-0" />
                    : <UserPlus size={14} className="text-gray-300 shrink-0" />
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
