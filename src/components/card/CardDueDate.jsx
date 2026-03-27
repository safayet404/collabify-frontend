'use client';

import { useState } from 'react';
import { X, Clock, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function CardDueDate({ cardId, card, onRefresh, onClose }) {
  const [date,    setDate]    = useState(card.dueDate ? new Date(card.dueDate).toISOString().slice(0,16) : '');
  const [reminder,setReminder]= useState(card.dueDateReminder || 'none');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api.patch(`/cards/${cardId}`, {
        dueDate:         date ? new Date(date).toISOString() : null,
        dueDateReminder: reminder,
      });
      onRefresh();
      onClose();
      toast.success('Due date updated');
    } catch { toast.error('Failed to update due date'); }
    finally { setLoading(false); }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await api.patch(`/cards/${cardId}`, { dueDate: null, dueDateReminder: 'none' });
      onRefresh();
      onClose();
      toast.success('Due date removed');
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={15} /> Due Date
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date & Time</label>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
              className="input-base text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Reminder</label>
            <select value={reminder} onChange={e => setReminder(e.target.value)}
              className="input-base text-sm">
              <option value="none">No reminder</option>
              <option value="1day">1 day before</option>
              <option value="2days">2 days before</option>
              <option value="1week">1 week before</option>
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors">
              <Check size={14} /> Save
            </button>
            {card.dueDate && (
              <button onClick={remove} disabled={loading}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
