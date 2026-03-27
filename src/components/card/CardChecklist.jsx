'use client';

import { useState } from 'react';
import { CheckSquare, Plus, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function CardChecklist({ checklist, cardId, onRefresh }) {
  const [isAdding,  setIsAdding]  = useState(false);
  const [newItem,   setNewItem]   = useState('');
  const [adding,    setAdding]    = useState(false);

  const total    = checklist.items.length;
  const done     = checklist.items.filter(i => i.isCompleted).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggleItem = async (itemId) => {
    try {
      await api.patch(`/cards/${cardId}/checklists/${checklist._id}/items/${itemId}/toggle`);
      onRefresh();
    } catch { toast.error('Failed to toggle'); }
  };

  const addItem = async () => {
    if (!newItem.trim()) { setIsAdding(false); return; }
    setAdding(true);
    try {
      await api.post(`/cards/${cardId}/checklists/${checklist._id}/items`, { text: newItem.trim() });
      setNewItem('');
      setIsAdding(false);
      onRefresh();
    } catch { toast.error('Failed to add item'); }
    finally { setAdding(false); }
  };

  const deleteChecklist = async () => {
    if (!confirm('Delete this checklist?')) return;
    try {
      await api.delete(`/cards/${cardId}/checklists/${checklist._id}`);
      onRefresh();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare size={16} className="text-gray-500" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">{checklist.title}</p>
        <span className="text-xs text-gray-400">{done}/{total}</span>
        <button onClick={deleteChecklist} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-400 w-8 text-right">{progress}%</span>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', progress === 100 ? 'bg-green-500' : 'bg-indigo-500')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5 ml-1">
        {checklist.items.map(item => (
          <div key={item._id} className="flex items-start gap-2.5 group">
            <button
              onClick={() => toggleItem(item._id)}
              className={cn(
                'w-4 h-4 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors',
                item.isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
              )}
            >
              {item.isCompleted && <Check size={10} />}
            </button>
            <span className={cn(
              'text-sm flex-1',
              item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
            )}>
              {item.text}
            </span>
          </div>
        ))}

        {/* Add item */}
        {isAdding ? (
          <div className="space-y-2 ml-6">
            <input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') { setIsAdding(false); setNewItem(''); } }}
              placeholder="Add an item..."
              className="input-base text-xs"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={addItem} disabled={adding}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                <Check size={11} /> Add
              </button>
              <button onClick={() => { setIsAdding(false); setNewItem(''); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)}
            className="ml-6 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition-colors">
            <Plus size={12} /> Add item
          </button>
        )}
      </div>
    </div>
  );
}
