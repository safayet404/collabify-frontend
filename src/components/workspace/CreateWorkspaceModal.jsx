'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useWorkspaceStore from '@/store/workspace.store';

const COLORS = ['#4F46E5','#7C3AED','#DB2777','#DC2626','#D97706','#059669','#0891B2','#2563EB'];

export default function CreateWorkspaceModal({ onClose }) {
  const { createWorkspace } = useWorkspaceStore();
  const [form, setForm]   = useState({ name: '', description: '', color: COLORS[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Workspace name is required'); return; }
    setLoading(true);
    try {
      await createWorkspace(form);
      toast.success(`Workspace "${form.name}" created!`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to create workspace');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Workspace</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="My Workspace"
              className="input-base"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this workspace for?"
              rows={3}
              className="input-base resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: form.color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
