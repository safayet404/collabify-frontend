'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useBoardStore from '@/store/board.store';

const BG_COLORS = [
  { label: 'Indigo',  value: '#4F46E5' },
  { label: 'Purple',  value: '#7C3AED' },
  { label: 'Pink',    value: '#DB2777' },
  { label: 'Red',     value: '#DC2626' },
  { label: 'Amber',   value: '#D97706' },
  { label: 'Green',   value: '#059669' },
  { label: 'Teal',    value: '#0D9488' },
  { label: 'Blue',    value: '#2563EB' },
  { label: 'Dark',    value: '#1e293b' },
  { label: 'Slate',   value: '#334155' },
];

const BG_GRADIENTS = [
  { label: 'Ocean',   value: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' },
  { label: 'Sunset',  value: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' },
  { label: 'Forest',  value: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)' },
  { label: 'Fire',    value: 'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)' },
  { label: 'Night',   value: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)' },
  { label: 'Rose',    value: 'linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)' },
];

export default function CreateBoardModal({ workspace, onClose }) {
  const router = useRouter();
  const { createBoard, fetchBoards } = useBoardStore();
  const [form, setForm] = useState({
    title:      '',
    description:'',
    visibility: 'workspace',
    background: { type: 'color', value: '#4F46E5' },
  });
  const [loading, setLoading] = useState(false);
  const [bgTab, setBgTab]   = useState('colors');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Board title is required'); return; }
    setLoading(true);
    try {
      const board = await createBoard({ ...form, workspaceId: workspace._id });
      await fetchBoards(workspace._id);
      toast.success(`Board "${board.title}" created!`);
      onClose();
      router.push(`/board/${board._id}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to create board');
    } finally { setLoading(false); }
  };

  const setBg = (type, value) => setForm(f => ({ ...f, background: { type, value } }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">

        {/* Preview */}
        <div className="h-20 rounded-t-2xl relative overflow-hidden"
          style={form.background.type === 'gradient'
            ? { background: form.background.value }
            : { background: form.background.value }
          }>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white font-bold text-lg drop-shadow">{form.title || 'Board Title'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Create Board</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Board title" className="input-base" autoFocus />
          </div>

          {/* Background picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Background</label>
            <div className="flex gap-2 mb-3">
              {['colors','gradients'].map(tab => (
                <button key={tab} type="button" onClick={() => setBgTab(tab)}
                  className={`px-3 py-1 text-xs rounded-full font-medium capitalize transition-colors ${bgTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {tab}
                </button>
              ))}
            </div>
            {bgTab === 'colors' ? (
              <div className="flex gap-2 flex-wrap">
                {BG_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setBg('color', c.value)}
                    className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                    style={{
                      background: c.value,
                      outline: form.background.value === c.value ? '3px solid #818cf8' : 'none',
                      outlineOffset: '2px',
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {BG_GRADIENTS.map(g => (
                  <button key={g.value} type="button" onClick={() => setBg('gradient', g.value)}
                    className="h-10 rounded-lg transition-transform hover:scale-105"
                    style={{
                      background: g.value,
                      outline: form.background.value === g.value ? '3px solid #818cf8' : 'none',
                      outlineOffset: '2px',
                    }}
                    title={g.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Workspace info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: workspace?.color || '#4F46E5' }}>
              {workspace?.name?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300">{workspace?.name}</span>
            <select value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
              className="ml-auto text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <option value="workspace">Workspace</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
