'use client';

import { X, Image } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const COVER_COLORS = [
  '#4F46E5','#7C3AED','#DB2777','#DC2626',
  '#D97706','#059669','#0891B2','#1e293b',
  '#F59E0B','#10B981','#3B82F6','#8B5CF6',
];

export default function CardCover({ cardId, card, onRefresh, onClose }) {
  const setCover = async (type, value) => {
    try {
      await api.patch(`/cards/${cardId}`, { cover: { type, value } });
      onRefresh();
      onClose();
    } catch { toast.error('Failed to set cover'); }
  };

  const removeCover = async () => {
    try {
      await api.patch(`/cards/${cardId}`, { cover: { type: null, value: null } });
      onRefresh();
      onClose();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Image size={15} /> Cover
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Colors</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {COVER_COLORS.map(color => (
            <button key={color} onClick={() => setCover('color', color)}
              className="h-10 rounded-lg transition-transform hover:scale-105"
              style={{
                background:  color,
                outline:     card.cover?.value === color ? '3px solid #818cf8' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>

        {card.cover?.value && (
          <button onClick={removeCover}
            className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Remove cover
          </button>
        )}
      </div>
    </div>
  );
}
