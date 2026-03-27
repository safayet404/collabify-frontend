'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Users, MoreHorizontal, Archive, Trash2, Settings, Eye } from 'lucide-react';
import { toast } from 'sonner';
import useBoardStore from '@/store/board.store';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/app/dashboard/layout';

export default function BoardHeader({ board }) {
  const router = useRouter();
  const { starBoard, archiveBoard, deleteBoard } = useBoardStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const handleStar = async () => {
    try {
      await starBoard(board._id, !board.isStarred);
      toast.success(board.isStarred ? 'Removed from starred' : 'Added to starred');
    } catch { toast.error('Failed to update'); }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this board?')) return;
    try {
      await archiveBoard(board._id, true);
      toast.success('Board archived');
      router.back();
    } catch { toast.error('Failed to archive'); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${board.title}"? This cannot be undone.`)) return;
    try {
      await deleteBoard(board._id);
      toast.success('Board deleted');
      router.push('/dashboard');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <header className="flex items-center gap-3 px-4 py-2.5 shrink-0"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>

      {/* Title */}
      <h1 className="text-white font-bold text-lg truncate max-w-xs">{board.title}</h1>

      {/* Star */}
      <button onClick={handleStar}
        className={cn('p-1.5 rounded-lg transition-colors hover:bg-white/20',
          board.isStarred ? 'text-yellow-300' : 'text-white/70'
        )}>
        <Star size={16} className={board.isStarred ? 'fill-yellow-300' : ''} />
      </button>

      <div className="flex-1" />

      {/* Members avatars */}
      <div className="relative">
        <button
          onClick={() => setShowMembers(s => !s)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
        >
          <div className="flex -space-x-2">
            {board.members?.slice(0, 4).map(m => (
              <UserAvatar key={m.user._id || m.user} user={m.user} size="sm" />
            ))}
          </div>
          <span className="text-xs font-medium">{board.members?.length}</span>
        </button>

        {/* Members dropdown */}
        {showMembers && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">Members</p>
            {board.members?.map(m => (
              <div key={m.user._id || m.user} className="flex items-center gap-2.5 px-3 py-2">
                <UserAvatar user={m.user} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Board menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(s => !s)}
          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50">
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700 mb-1">
              Board Actions
            </p>
            <MenuItem icon={<Archive size={14} />}  label="Archive Board" onClick={() => { setShowMenu(false); handleArchive(); }} />
            <MenuItem icon={<Trash2 size={14} />}   label="Delete Board"  onClick={() => { setShowMenu(false); handleDelete(); }} danger />
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
        danger
          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}>
      {icon}{label}
    </button>
  );
}
