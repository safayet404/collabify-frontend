'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Layout, Hash, Users, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { timeAgo, cn } from '@/lib/utils';

export default function SearchModal({ onClose }) {
  const router    = useRouter();
  const inputRef  = useRef(null);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const search = useCallback(async (q) => {
    if (!q.trim() || q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q } });
      setResults(res.data.results);
    } catch {} finally { setLoading(false); }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const navigate = (url) => { router.push(url); onClose(); };

  const hasResults = results && (
    (results.cards?.total > 0) ||
    (results.boards?.total > 0) ||
    (results.workspaces?.total > 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            placeholder="Search cards, boards, workspaces..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {loading && <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {!query && (
            <div className="py-8 text-center text-sm text-gray-400">
              Type to search across all your content
            </div>
          )}

          {query && !loading && !hasResults && (
            <div className="py-8 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {/* Cards */}
              {results.cards?.total > 0 && (
                <Section title="Cards" icon={<Hash size={13} />}>
                  {results.cards.items.map(card => (
                    <ResultItem key={card._id}
                      icon={<Hash size={14} className="text-indigo-500" />}
                      title={card.title}
                      subtitle={card.board?.title}
                      onClick={() => navigate(`/board/${card.board?._id || card.board}?card=${card._id}`)}
                    />
                  ))}
                </Section>
              )}

              {/* Boards */}
              {results.boards?.total > 0 && (
                <Section title="Boards" icon={<Layout size={13} />}>
                  {results.boards.items.map(board => (
                    <ResultItem key={board._id}
                      icon={
                        <div className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ background: board.background?.value || '#4F46E5' }}>
                          <Layout size={11} className="text-white" />
                        </div>
                      }
                      title={board.title}
                      subtitle={board.workspace?.name}
                      onClick={() => navigate(`/board/${board._id}`)}
                    />
                  ))}
                </Section>
              )}

              {/* Workspaces */}
              {results.workspaces?.total > 0 && (
                <Section title="Workspaces" icon={<Users size={13} />}>
                  {results.workspaces.items.map(ws => (
                    <ResultItem key={ws._id}
                      icon={
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ background: ws.color || '#4F46E5' }}>
                          {ws.name?.slice(0,2).toUpperCase()}
                        </div>
                      }
                      title={ws.name}
                      subtitle={`${ws.memberCount} members`}
                      onClick={() => navigate(`/workspace/${ws._id}`)}
                    />
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400">Press ESC to close</span>
          <span className="text-xs text-gray-400">Enter to navigate</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-4 py-1.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ResultItem({ icon, title, subtitle, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
      </div>
    </button>
  );
}
