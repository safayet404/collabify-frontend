'use client';

import { useState } from 'react';
import { X, Send, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import useWorkspaceStore from '@/store/workspace.store';

export default function InviteMemberModal({ workspaceId, onClose }) {
  const { inviteMember } = useWorkspaceStore();
  const [email,   setEmail]   = useState('');
  const [role,    setRole]    = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await inviteMember(workspaceId, email.trim(), role);
      toast.success(`Invitation sent to ${email}`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to send invitation');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus size={18} /> Invite Member
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="input-base"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Role
            </label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input-base">
              <option value="admin">Admin — can manage boards and members</option>
              <option value="member">Member — can view and edit boards</option>
              <option value="viewer">Viewer — read only access</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || !email} className="btn-primary flex-1">
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                : <><Send size={14} /> Send Invite</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
