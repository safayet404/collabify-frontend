'use client';

import { useState, useEffect } from 'react';
import { X, Move, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useBoardStore from '@/store/board.store';

export default function CardMoveModal({ card, board, onClose, onMoved }) {
  const { currentBoard } = useBoardStore();
  const [targetList, setTargetList] = useState(typeof card.list === 'object' ? card.list._id : card.list);
  const [position,   setPosition]   = useState(0);
  const [loading,    setLoading]    = useState(false);

  const lists     = currentBoard?.lists || [];
  const targetListObj = lists.find(l => l._id === targetList);
  const maxPos    = (targetListObj?.cards?.length || 0);

  const handleMove = async () => {
    setLoading(true);
    try {
      await api.post(`/cards/${card._id}/move`, { listId: targetList, position: parseInt(position) });
      toast.success('Card moved');
      onMoved();
    } catch { toast.error('Failed to move card'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Move size={15} /> Move Card
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">List</label>
            <select value={targetList} onChange={e => setTargetList(e.target.value)}
              className="input-base text-sm">
              {lists.map(l => (
                <option key={l._id} value={l._id}>{l.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
            <select value={position} onChange={e => setPosition(e.target.value)}
              className="input-base text-sm">
              {Array.from({ length: maxPos + 1 }, (_, i) => (
                <option key={i} value={i}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
            <button onClick={handleMove} disabled={loading}
              className="btn-primary flex-1 py-2 text-sm">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Move</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
