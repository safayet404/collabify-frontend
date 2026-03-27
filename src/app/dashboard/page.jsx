'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, Star, Clock, Users, Layout, ArrowRight, Zap } from 'lucide-react';
import useAuthStore from '@/store/auth.store';
import useWorkspaceStore from '@/store/workspace.store';
import useBoardStore from '@/store/board.store';
import { getBoardBackground, timeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { workspaces } = useWorkspaceStore();
  const { boards, fetchBoards, isLoading } = useBoardStore();

  useEffect(() => {
    workspaces.forEach(ws => fetchBoards(ws._id));
  }, [workspaces]);

  if (isLoading) return <DashboardSkeleton />;

  const starredBoards = boards.filter(b => b.isStarred);
  const recentBoards = [...boards].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Here&apos;s what&apos;s happening across your workspaces.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Workspaces', value: workspaces.length, icon: <Users size={18} />, color: '#4F46E5' },
          { label: 'Boards', value: boards.length, icon: <Layout size={18} />, color: '#7C3AED' },
          { label: 'Starred', value: starredBoards.length, icon: <Star size={18} />, color: '#F59E0B' },
          { label: 'Active', value: boards.filter(b => !b.isArchived).length, icon: <Zap size={18} />, color: '#10B981' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Starred boards */}
      {starredBoards.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Starred Boards</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredBoards.map(board => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        </section>
      )}

      {/* Recent boards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Boards</h2>
          </div>
        </div>
        {recentBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBoards.map(board => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        ) : (
          <EmptyBoards />
        )}
      </section>

      {/* Workspaces overview */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Your Workspaces</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(ws => (
            <WorkspaceCard key={ws._id} workspace={ws} />
          ))}
        </div>
      </section>
    </div>
  );
}

function BoardCard({ board }) {
  const bg = getBoardBackground(board.background);
  return (
    <Link href={`/board/${board._id}`}
      className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      {/* Background preview */}
      <div className="h-24 relative" style={bg}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        {board.isStarred && (
          <Star size={14} className="absolute top-2 right-2 text-yellow-300 fill-yellow-300" />
        )}
      </div>
      {/* Info */}
      <div className="p-3 bg-white dark:bg-gray-900">
        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{board.title}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400 truncate">{board.workspace?.name}</p>
          <p className="text-xs text-gray-400">{timeAgo(board.updatedAt)}</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">{board.listCount || 0} lists</span>
          <span className="text-xs text-gray-400">{board.cardCount || 0} cards</span>
          <span className="text-xs text-gray-400">{board.members?.length || 0} members</span>
        </div>
      </div>
    </Link>
  );
}

function WorkspaceCard({ workspace }) {
  return (
    <Link href={`/workspace/${workspace._id}`}
      className="group flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ background: workspace.color || '#4F46E5' }}>
        {workspace.name?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{workspace.name}</p>
        <p className="text-xs text-gray-400">{workspace.memberCount} members · {workspace.boardCount} boards</p>
      </div>
      <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
    </Link>
  );
}

function EmptyBoards() {
  return (
    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
      <Layout size={40} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No boards yet</p>
      <p className="text-sm text-gray-400 mt-1">Create a board to get started</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
