'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  X, Tag, Users, Clock, CheckSquare, Paperclip, Eye,
  Archive, Copy, Trash2, AlignLeft, Loader2, Plus,
  MoreHorizontal, Move, Flag, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useBoardStore from '@/store/board.store';
import { cn, formatDate, formatDueDate, PRIORITY_CONFIG, formatFileSize, timeAgo } from '@/lib/utils';
import { UserAvatar } from '@/app/dashboard/layout';
import CardDescription   from './CardDescription';
import CardChecklist     from './CardChecklist';
import CardComments      from './CardComments';
import CardActivity      from './CardActivity';
import CardLabels        from './CardLabels';
import CardMembers       from './CardMembers';
import CardDueDate       from './CardDueDate';
import CardCover         from './CardCover';
import CardAttachments   from './CardAttachments';
import CardMoveModal     from './CardMoveModal';
import { CardDetailSkeleton } from '@/components/common/Skeleton';

export default function CardDetailModal({ cardId, board, onClose }) {
  const { updateCard, removeCard } = useBoardStore();
  const [card,       setCard]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('activity'); // activity | comments
  const [showMove,   setShowMove]   = useState(false);

  const fetchCard = useCallback(async () => {
    try {
      const res = await api.get(`/cards/${cardId}`);
      setCard(res.data.card);
    } catch { toast.error('Failed to load card'); onClose(); }
    finally { setLoading(false); }
  }, [cardId]);

  useEffect(() => {
    fetchCard();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fetchCard]);

  // ── Card actions ───────────────────────────────────────────
  const handleUpdate = async (updates) => {
    try {
      const res = await api.patch(`/cards/${cardId}`, updates);
      setCard(res.data.card);
      updateCard(cardId, res.data.card);
    } catch { toast.error('Failed to update card'); }
  };

  const handleArchive = async () => {
    try {
      await api.patch(`/cards/${cardId}/archive`);
      const listId = card.list;
      removeCard(cardId, typeof listId === 'object' ? listId._id : listId);
      toast.success('Card archived');
      onClose();
    } catch { toast.error('Failed to archive'); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${card?.title}"?`)) return;
    try {
      await api.delete(`/cards/${cardId}`);
      const listId = card.list;
      removeCard(cardId, typeof listId === 'object' ? listId._id : listId);
      toast.success('Card deleted');
      onClose();
    } catch { toast.error('Failed to delete'); }
  };

  const handleCopy = async () => {
    try {
      const res = await api.post(`/cards/${cardId}/copy`, { title: `${card.title} (copy)` });
      useBoardStore.getState().addCard(
        typeof card.list === 'object' ? card.list._id : card.list,
        res.data.card
      );
      toast.success('Card copied');
    } catch { toast.error('Failed to copy'); }
  };

  const handleWatch = async () => {
    try {
      const isWatching = card.watchers?.some(w =>
        (w._id || w) === useBoardStore.getState().currentBoard?.myUserId
      );
      if (isWatching) {
        await api.delete(`/cards/${cardId}/watch`);
        toast.success('Stopped watching');
      } else {
        await api.post(`/cards/${cardId}/watch`);
        toast.success('Now watching this card');
      }
      fetchCard();
    } catch { toast.error('Failed to update watch'); }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl">
          <CardDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!card) return null;

  const dueInfo = card.dueDate ? formatDueDate(card.dueDate) : null;
  const priority = card.priority && card.priority !== 'none' ? PRIORITY_CONFIG[card.priority] : null;
  const checkTotal = card.checklists?.reduce((s, cl) => s + cl.items.length, 0) || 0;
  const checkDone  = card.checklists?.reduce((s, cl) => s + cl.items.filter(i => i.isCompleted).length, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
      onClick={onClose}>
      <div
        className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        {card.cover?.value && (
          <div className="h-32 rounded-t-2xl relative overflow-hidden"
            style={card.cover.type === 'color'
              ? { background: card.cover.value }
              : { backgroundImage: `url(${card.cover.value})`, backgroundSize: 'cover' }
            }>
            <button onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <Hash size={20} className="text-gray-400 shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <input
                className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none pb-1 transition-colors"
                defaultValue={card.title}
                onBlur={e => { if (e.target.value !== card.title) handleUpdate({ title: e.target.value }); }}
                onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
              />
              <p className="text-xs text-gray-400 mt-1">
                Card #{card.cardNumber} · in <span className="font-medium">{typeof card.list === 'object' ? card.list.title : 'list'}</span>
              </p>
            </div>
            {!card.cover?.value && (
              <button onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg shrink-0">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex gap-6">
            {/* ── Left column ────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Labels */}
              {card.labels?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Labels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.labels.map((l, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                        style={{ background: l.color }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignees + Due + Priority row */}
              <div className="flex flex-wrap gap-4">
                {card.assignees?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Members</p>
                    <div className="flex -space-x-2">
                      {card.assignees.map(u => <UserAvatar key={u._id} user={u} size="md" />)}
                    </div>
                  </div>
                )}
                {dueInfo && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Due Date</p>
                    <span className={cn(
                      'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg',
                      dueInfo.status === 'overdue'  && 'bg-red-100 text-red-700',
                      dueInfo.status === 'warning'  && 'bg-amber-100 text-amber-700',
                      dueInfo.status === 'normal'   && 'bg-gray-100 text-gray-600',
                    )}>
                      <Clock size={12} />
                      {formatDate(card.dueDate, 'MMM d, yyyy')}
                      {card.isCompleted && ' ✓'}
                    </span>
                  </div>
                )}
                {priority && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Priority</p>
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                      style={{ background: priority.bg, color: priority.color }}>
                      <Flag size={12} /> {priority.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <CardDescription card={card} onUpdate={handleUpdate} />

              {/* Checklists */}
              {card.checklists?.map(cl => (
                <CardChecklist
                  key={cl._id}
                  checklist={cl}
                  cardId={cardId}
                  onRefresh={fetchCard} key={card._id}
                />
              ))}

              {/* Attachments */}
              {card.attachments?.length > 0 && (
                <CardAttachments card={card} onRefresh={fetchCard} key={card._id} />
              )}

              {/* Comments + Activity tabs */}
              <div>
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                  {['activity', 'comments'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={cn(
                        'pb-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                        activeTab === tab
                          ? 'text-indigo-600 border-indigo-600'
                          : 'text-gray-400 border-transparent hover:text-gray-600'
                      )}>
                      {tab}
                    </button>
                  ))}
                </div>
                {activeTab === 'comments'
                  ? <CardComments cardId={cardId} board={board} />
                  : <CardActivity cardId={cardId} boardId={card.board?._id || card.board} />
                }
              </div>
            </div>

            {/* ── Right sidebar ───────────────────────────── */}
            <div className="w-44 shrink-0 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Actions</p>

              <SidebarAction icon={<Users size={14} />}    label="Members"     onClick={() => document.dispatchEvent(new CustomEvent('card:open-members', { detail: { cardId, card, board, onRefresh: fetchCard } }))} />
              <SidebarAction icon={<Tag size={14} />}      label="Labels"      onClick={() => document.dispatchEvent(new CustomEvent('card:open-labels',  { detail: { cardId, card, board, onRefresh: fetchCard } }))} />
              <SidebarAction icon={<CheckSquare size={14}/>}label="Checklist"  onClick={async () => {
                const title = prompt('Checklist title:');
                if (!title) return;
                try {
                  await api.post(`/cards/${cardId}/checklists`, { title });
                  fetchCard();
                } catch { toast.error('Failed'); }
              }} />
              <SidebarAction icon={<Clock size={14} />}    label="Due Date"    onClick={() => document.dispatchEvent(new CustomEvent('card:open-duedate',  { detail: { cardId, card, onRefresh: fetchCard } }))} />
              <SidebarAction icon={<Paperclip size={14}/>} label="Attachment"  onClick={() => document.getElementById('card-attachment-input')?.click()} />

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

              <SidebarAction icon={<Move size={14} />}     label="Move"        onClick={() => setShowMove(true)} />
              <SidebarAction icon={<Copy size={14} />}     label="Copy"        onClick={handleCopy} />
              <SidebarAction icon={<Eye size={14} />}      label="Watch"       onClick={handleWatch} />
              <SidebarAction icon={<Archive size={14} />}  label="Archive"     onClick={handleArchive} />
              <SidebarAction icon={<Trash2 size={14} />}   label="Delete"      onClick={handleDelete} danger />

              {/* Hidden file input for attachments */}
              <input
                id="card-attachment-input"
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append('file', file);
                  try {
                    await api.post(`/cards/${cardId}/attachments`, form, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    fetchCard();
                    toast.success('Attachment added');
                  } catch { toast.error('Failed to upload'); }
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals via custom events */}
      <CardLabelsListener  board={board} />
      <CardMembersListener board={board} />
      <CardDueDateListener />

      {showMove && (
        <CardMoveModal
          card={card}
          board={board}
          onClose={() => setShowMove(false)}
          onMoved={() => { setShowMove(false); fetchCard(); }}
        />
      )}
    </div>
  );
}

function SidebarAction({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
        danger
          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      )}>
      {icon}{label}
    </button>
  );
}

// ── Popup listeners via custom events ─────────────────────────
function CardLabelsListener({ board }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const h = (e) => setData(e.detail);
    document.addEventListener('card:open-labels', h);
    return () => document.removeEventListener('card:open-labels', h);
  }, []);
  if (!data) return null;
  return <CardLabels {...data} onClose={() => setData(null)} />;
}

function CardMembersListener({ board }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const h = (e) => setData(e.detail);
    document.addEventListener('card:open-members', h);
    return () => document.removeEventListener('card:open-members', h);
  }, []);
  if (!data) return null;
  return <CardMembers {...data} onClose={() => setData(null)} />;
}

function CardDueDateListener() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const h = (e) => setData(e.detail);
    document.addEventListener('card:open-duedate', h);
    return () => document.removeEventListener('card:open-duedate', h);
  }, []);
  if (!data) return null;
  return <CardDueDate {...data} onClose={() => setData(null)} />;
}
