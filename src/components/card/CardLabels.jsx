'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function CardLabels({ cardId, card, board, onRefresh, onClose }) {
  const [loading, setLoading] = useState(null);
  const labels = board?.labels || [];

  const isActive = (label) => card.labels?.some(l => l.labelId?.toString() === label._id?.toString());

  const toggle = async (label) => {
    setLoading(label._id);
    try {
      if (isActive(label)) {
        await api.delete(`/cards/${cardId}/labels/${label._id}`);
      } else {
        await api.post(`/cards/${cardId}/labels`, { labelId: label._id, name: label.name, color: label.color });
      }
      onRefresh();
    } catch { toast.error('Failed to update label'); }
    finally { setLoading(null); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Labels</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="space-y-2">
          {labels.map(label => (
            <button key={label._id} onClick={() => toggle(label)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex-1 h-8 rounded-lg flex items-center px-3 text-white text-sm font-medium"
                style={{ background: label.color }}>
                {label.name}
              </div>
              {isActive(label) && <Check size={16} className="text-indigo-600 shrink-0" />}
              {loading === label._id && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
