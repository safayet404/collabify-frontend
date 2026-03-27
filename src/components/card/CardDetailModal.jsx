'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function CardDetailModal({ cardId, board, onClose }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/cards/${cardId}`);
        setCard(res.data.card);
      } catch {} finally { setLoading(false); }
    };
    load();

    // Close on Escape
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cardId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {loading ? 'Loading...' : card?.title}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {card?.description || <span className="text-gray-400 italic">No description</span>}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Priority</p>
                <p className="text-gray-700 dark:text-gray-300 capitalize">{card?.priority || 'None'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Due Date</p>
                <p className="text-gray-700 dark:text-gray-300">{card?.dueDate ? new Date(card.dueDate).toLocaleDateString() : 'None'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Assignees</p>
                <p className="text-gray-700 dark:text-gray-300">{card?.assignees?.length || 0} assigned</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Comments</p>
                <p className="text-gray-700 dark:text-gray-300">{card?.commentsCount || 0} comments</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center pt-2">
              Full card detail modal coming in Step 13 →
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
