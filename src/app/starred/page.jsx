'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Star, Layout, Clock } from 'lucide-react';
import useBoardStore from '@/store/board.store';
import useWorkspaceStore from '@/store/workspace.store';
import AppLayout from '@/app/dashboard/layout';
import { getBoardBackground, timeAgo, cn } from '@/lib/utils';

export default function StarredPage() {
  const { boards, fetchBoards, starBoard } = useBoardStore();
  const { workspaces } = useWorkspaceStore();

  useEffect(() => {
    workspaces.forEach(ws => fetchBoards(ws._id));
  }, [workspaces]);

  const starred = boards.filter(b => b.isStarred && !b.isArchived);

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star size={22} className="text-yellow-400 fill-yellow-400" /> Starred Boards
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your favourite boards in one place
          </p>
        </div>

        {starred.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Star size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">No starred boards yet</p>
            <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
              Click the ★ icon on any board to add it here for quick access
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 mt-5 btn-primary text-sm">
              Browse Boards
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {starred.map(board => (
              <StarredBoardCard
                key={board._id}
                board={board}
                onUnstar={() => starBoard(board._id, false)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StarredBoardCard({ board, onUnstar }) {
  const bg = getBoardBackground(board.background);
  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      {/* Background preview */}
      <div className="h-28 relative" style={bg}>
        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
        {/* Unstar button */}
        <button
          onClick={(e) => { e.preventDefault(); onUnstar(); }}
          className="absolute top-2 right-2 p-1.5 bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
          title="Remove from starred"
        >
          <Star size={14} className="text-yellow-300 fill-yellow-300" />
        </button>
        {/* Board name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-linear-to-t from-black/60 to-transparent">
          <p className="text-white font-bold text-sm truncate">{board.title}</p>
        </div>
      </div>

      {/* Info */}
      <Link href={`/board/${board._id}`} className="block p-4 bg-white dark:bg-gray-900">
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
          {board.workspace?.name}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Layout size={11} /> {board.listCount || 0} lists
          </span>
          <span>{board.cardCount || 0} cards</span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={11} /> {timeAgo(board.updatedAt)}
          </span>
        </div>
      </Link>
    </div>
  );
}
