'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Star, Bell, Settings, ChevronDown,
  ChevronRight, Plus, LogOut, User, Moon, Sun,
  Layers, Hash, Search, Menu, X, Users
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import useAuthStore from '@/store/auth.store';
import useWorkspaceStore from '@/store/workspace.store';
import useBoardStore from '@/store/board.store';
import useNotificationStore from '@/store/notification.store';
import { useRequireAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import NotificationDropdown from '@/components/common/NotificationDropdown';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';
import CreateBoardModal from '@/components/board/CreateBoardModal';
import SearchModal from '@/components/common/SearchModal';

export default function AppLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout }    = useAuthStore();
  const { workspaces, fetchWorkspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { boards, fetchBoards } = useBoardStore();
  const { unreadCount }         = useNotificationStore();
  const { isLoading }           = useRequireAuth();

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [expandedWs,    setExpandedWs]    = useState({});
  const [showCreateWs,  setShowCreateWs]  = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [showNotifs,    setShowNotifs]    = useState(false);
  const [showUserMenu,  setShowUserMenu]  = useState(false);
  const [wsForBoard,    setWsForBoard]    = useState(null);

  useEffect(() => {
    if (!isLoading) fetchWorkspaces();
  }, [isLoading]);

  // Expand first workspace by default
  useEffect(() => {
    if (workspaces.length > 0 && Object.keys(expandedWs).length === 0) {
      setExpandedWs({ [workspaces[0]._id]: true });
      setCurrentWorkspace(workspaces[0]);
      fetchBoards(workspaces[0]._id);
    }
  }, [workspaces]);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleWorkspace = async (ws) => {
    const isOpen = expandedWs[ws._id];
    setExpandedWs(prev => ({ ...prev, [ws._id]: !isOpen }));
    if (!isOpen) {
      setCurrentWorkspace(ws);
      await fetchBoards(ws._id);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const starredBoards = boards.filter(b => b.isStarred);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">

      {/* ── Sidebar ────────────────────────────────────────── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>

          {/* Logo */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">Collabify</span>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Search size={14} />
              <span>Search...</span>
              <kbd className="ml-auto text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">

            {/* Main links */}
            <div className="space-y-0.5 mb-4">
              <SidebarLink href="/dashboard"   icon={<LayoutDashboard size={16} />} label="Dashboard"    active={pathname === '/dashboard'} />
              <SidebarLink href="/starred"     icon={<Star size={16} />}            label="Starred"      active={pathname === '/starred'} badge={starredBoards.length || null} />
              <SidebarLink href="/settings"    icon={<Settings size={16} />}        label="Settings"     active={pathname === '/settings'} />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 mb-3" />

            {/* Workspaces */}
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Workspaces</span>
              <button
                onClick={() => setShowCreateWs(true)}
                className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded p-0.5 transition-colors"
                title="New workspace"
              >
                <Plus size={14} />
              </button>
            </div>

            {workspaces.map(ws => (
              <div key={ws._id}>
                {/* Workspace row */}
                <button
                  onClick={() => toggleWorkspace(ws)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors group',
                    currentWorkspace?._id === ws._id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: ws.color || '#4F46E5' }}
                  >
                    {getInitials(ws.name)}
                  </div>
                  <span className="flex-1 text-left font-medium truncate text-xs">{ws.name}</span>
                  {expandedWs[ws._id]
                    ? <ChevronDown size={12} className="text-gray-400 shrink-0" />
                    : <ChevronRight size={12} className="text-gray-400 shrink-0" />
                  }
                </button>

                {/* Boards under workspace */}
                {expandedWs[ws._id] && (
                  <div className="ml-3 pl-3 border-l border-gray-200 dark:border-gray-700 mt-0.5 mb-1 space-y-0.5">
                    {boards
                      .filter(b => b.workspace?._id === ws._id || b.workspace === ws._id)
                      .map(board => (
                        <Link
                          key={board._id}
                          href={`/board/${board._id}`}
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                            pathname === `/board/${board._id}`
                              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700'
                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700'
                          )}
                        >
                          <div
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ background: board.background?.value || '#4F46E5' }}
                          />
                          <span className="truncate">{board.title}</span>
                          {board.isStarred && <Star size={10} className="text-yellow-400 shrink-0 ml-auto" />}
                        </Link>
                      ))
                    }
                    {/* Add board */}
                    <button
                      onClick={() => { setWsForBoard(ws); setShowCreateBoard(true); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add board</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {workspaces.length === 0 && (
              <div className="px-2 py-4 text-center">
                <p className="text-xs text-gray-400 mb-2">No workspaces yet</p>
                <button onClick={() => setShowCreateWs(true)} className="text-xs text-indigo-600 hover:underline">
                  Create your first workspace
                </button>
              </div>
            )}
          </nav>

          {/* User footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(s => !s)}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 shrink-0" />
              </button>

              {/* User menu */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                  <Link href="/profile" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <User size={14} /> Profile
                  </Link>
                  <button
                    onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </>

      {/* ── Main content ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">

        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 shrink-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(s => !s)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <NotificationDropdown onClose={() => setShowNotifs(false)} />
              )}
            </div>

            {/* Avatar */}
            <Link href="/profile">
              <UserAvatar user={user} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      {showCreateWs && (
        <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} />
      )}
      {showCreateBoard && (
        <CreateBoardModal
          workspace={wsForBoard}
          onClose={() => { setShowCreateBoard(false); setWsForBoard(null); }}
        />
      )}
      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────
function SidebarLink({ href, icon, label, active, badge }) {
  return (
    <Link href={href} className={cn(
      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      active
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900'
    )}>
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function UserAvatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  if (user?.avatar) {
    return (
      <img
        src={`${process.env.NEXT_PUBLIC_SOCKET_URL}${user.avatar}`}
        alt={user.name}
        className={cn('rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shrink-0', sizes[size])}
      />
    );
  }
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white dark:ring-gray-800 shrink-0', sizes[size])}
      style={{ background: user?.color || '#4F46E5' }}
    >
      {user?.initials || getInitials(user?.name || '?')}
    </div>
  );
}
