'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings, Users, Plus, Layout, Star, Archive,
  MoreHorizontal, Trash2, UserMinus, Crown, Shield,
  Eye, ArrowRight, Copy, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import useWorkspaceStore from '@/store/workspace.store';
import useBoardStore from '@/store/board.store';
import useAuthStore from '@/store/auth.store';
import { cn, timeAgo, getBoardBackground } from '@/lib/utils';
import { UserAvatar } from '@/app/dashboard/layout';
import CreateBoardModal from '@/components/board/CreateBoardModal';
import InviteMemberModal from '@/components/workspace/InviteMemberModal';
import { WorkspaceSkeleton } from '@/components/common/Skeleton';
import { WorkspaceSkeleton } from '@/components/common/Skeleton';

const ROLE_ICONS = { owner: <Crown size={12} />, admin: <Shield size={12} />, member: <Users size={12} />, viewer: <Eye size={12} /> };
const ROLE_COLORS = { owner: 'text-yellow-600 bg-yellow-50', admin: 'text-indigo-600 bg-indigo-50', member: 'text-gray-600 bg-gray-100', viewer: 'text-gray-400 bg-gray-50' };

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const router = useRouter();
  const { fetchWorkspace, currentWorkspace, removeMember, updateMemberRole, deleteWorkspace } = useWorkspaceStore();
  const { boards, fetchBoards, starBoard } = useBoardStore();
  const { user } = useAuthStore();

  const [activeTab,      setActiveTab]      = useState('boards');
  const [showCreateBoard,setShowCreateBoard] = useState(false);
  const [showInvite,     setShowInvite]      = useState(false);
  const [loading,        setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchWorkspace(workspaceId), fetchBoards(workspaceId)]);
      } catch { toast.error('Failed to load workspace'); }
      finally { setLoading(false); }
    };
    load();
  }, [workspaceId]);

  const ws = currentWorkspace;
  const myRole = ws?.members?.find(m => (m.user?._id || m.user) === user?._id)?.role;
  const isOwner = myRole === 'owner';
  const isAdmin = myRole === 'admin' || isOwner;
  const wsBoards = boards.filter(b => (b.workspace?._id || b.workspace) === workspaceId);

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await removeMember(workspaceId, memberId);
      toast.success('Member removed');
    } catch { toast.error('Failed'); }
  };

  const handleRoleChange = async (memberId, role) => {
    try {
      await updateMemberRole(workspaceId, memberId, role);
      await fetchWorkspace(workspaceId);
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm(`Delete "${ws?.name}"? All boards and cards will be lost.`)) return;
    try {
      await deleteWorkspace(workspaceId);
      toast.success('Workspace deleted');
      router.push('/dashboard');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <WorkspaceSkeleton />;

  if (!ws) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">Workspace not found</p>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
            style={{ background: ws.color || '#4F46E5' }}>
            {ws.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ws.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{ws.description || 'No description'}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400">{ws.memberCount} members</span>
              <span className="text-xs text-gray-400">{ws.boardCount} boards</span>
              <span className="text-xs text-gray-400 capitalize">{myRole}</span>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowInvite(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Users size={15} /> Invite
            </button>
            <button onClick={() => setShowCreateBoard(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> New Board
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'boards',  label: 'Boards',  count: wsBoards.length },
          { id: 'members', label: 'Members', count: ws.members?.length },
          ...(isAdmin ? [{ id: 'settings', label: 'Settings' }] : []),
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}>
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Boards tab ───────────────────────────────────────── */}
      {activeTab === 'boards' && (
        <div>
          {wsBoards.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <Layout size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No boards yet</p>
              {isAdmin && (
                <button onClick={() => setShowCreateBoard(true)}
                  className="mt-3 btn-primary text-sm">
                  <Plus size={14} /> Create first board
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wsBoards.map(board => (
                <BoardCard key={board._id} board={board} onStar={() => starBoard(board._id, !board.isStarred)} />
              ))}
              {isAdmin && (
                <button onClick={() => setShowCreateBoard(true)}
                  className="h-36 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                  <Plus size={24} />
                  <span className="text-sm font-medium">New Board</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Members tab ──────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {ws.members?.length} Members
            </h3>
            {isAdmin && (
              <button onClick={() => setShowInvite(true)} className="btn-primary text-xs px-3 py-1.5">
                <Plus size={13} /> Invite
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {ws.members?.map(member => {
              const memberId = member.user?._id || member.user;
              const isMe = memberId === user?._id;
              const isMemberOwner = member.role === 'owner';
              return (
                <div key={memberId} className="flex items-center gap-3 px-5 py-3">
                  <UserAvatar user={member.user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {member.user?.name} {isMe && <span className="text-xs text-gray-400">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{member.user?.email}</p>
                  </div>

                  {/* Role badge */}
                  {isOwner && !isMemberOwner && !isMe ? (
                    <select
                      defaultValue={member.role}
                      onChange={e => handleRoleChange(memberId, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      {['admin','member','viewer'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full capitalize', ROLE_COLORS[member.role])}>
                      {ROLE_ICONS[member.role]} {member.role}
                    </span>
                  )}

                  {/* Remove */}
                  {isAdmin && !isMemberOwner && !isMe && (
                    <button onClick={() => handleRemoveMember(memberId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pending invites */}
          {ws.invites?.filter(i => !i.accepted).length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800">
              <p className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Pending Invites</p>
              {ws.invites.filter(i => !i.accepted).map((inv, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs text-gray-400">?</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{inv.email}</p>
                    <p className="text-xs text-gray-400">Invite pending · {inv.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Settings tab ─────────────────────────────────────── */}
      {activeTab === 'settings' && isAdmin && (
        <div className="space-y-4">
          <WorkspaceSettingsForm ws={ws} onSaved={() => fetchWorkspace(workspaceId)} />
          {isOwner && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Danger Zone</h3>
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                Deleting this workspace will permanently remove all boards, lists, and cards.
              </p>
              <button onClick={handleDeleteWorkspace}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white dark:bg-gray-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Delete Workspace
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateBoard && <CreateBoardModal workspace={ws} onClose={() => setShowCreateBoard(false)} />}
      {showInvite && <InviteMemberModal workspaceId={workspaceId} onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function BoardCard({ board, onStar }) {
  const bg = getBoardBackground(board.background);
  return (
    <div className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="h-24 relative" style={bg}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <button onClick={(e) => { e.preventDefault(); onStar(); }}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
          <Star size={13} className={cn('text-white', board.isStarred && 'fill-yellow-300 text-yellow-300')} />
        </button>
      </div>
      <Link href={`/board/${board._id}`} className="block p-3 bg-white dark:bg-gray-900">
        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{board.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{board.listCount} lists · {board.cardCount} cards</p>
      </Link>
    </div>
  );
}

function WorkspaceSettingsForm({ ws, onSaved }) {
  const { updateWorkspace } = useWorkspaceStore();
  const [form, setForm] = useState({ name: ws.name, description: ws.description || '', color: ws.color });
  const [saving, setSaving] = useState(false);

  const COLORS = ['#4F46E5','#7C3AED','#DB2777','#DC2626','#D97706','#059669','#0891B2','#2563EB'];

  const save = async () => {
    setSaving(true);
    try {
      await updateWorkspace(ws._id, form);
      onSaved();
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">General Settings</h3>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Workspace Name</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="input-base" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3} className="input-base resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className="w-8 h-8 rounded-full transition-transform hover:scale-110"
              style={{ background: c, outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }} />
          ))}
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary text-sm">
        {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save Settings'}
      </button>
    </div>
  );
}
