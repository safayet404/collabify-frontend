'use client';

import { useState, useRef } from 'react';
import { Plus, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useBoardStore from '@/store/board.store';

export default function AddListButton({ boardId }) {
  const { addList } = useBoardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) { setIsOpen(false); return; }
    setLoading(true);
    try {
      const res = await api.post('/lists', { boardId, title: title.trim() });
      addList(res.data.list);
      setTitle('');
      setIsOpen(false);
      toast.success(`List "${res.data.list.title}" created`);
    } catch { toast.error('Failed to create list'); }
    finally { setLoading(false); }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 flex items-center gap-2 px-4 py-3 min-w-50 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors text-sm font-medium backdrop-blur-sm"
      >
        <Plus size={16} /> Add another list
      </button>
    );
  }

  return (
    <div className="shrink-0 min-w-60 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setIsOpen(false); setTitle(''); } }}
        placeholder="List title..."
        className="input-base mb-2"
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button onClick={handleAdd} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Add list
        </button>
        <button onClick={() => { setIsOpen(false); setTitle(''); }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
