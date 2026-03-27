'use client';

import { useState, useRef } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus, Archive, Copy, Trash2, GripVertical, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useBoardStore from '@/store/board.store';
import { cn } from '@/lib/utils';
import CardItem from '@/components/card/CardItem';

export default function BoardColumn({ list, boardId, onCardClick }) {
  const { addCard, updateList, removeList } = useBoardStore();

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addInputRef = useRef(null);

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: list._id,
    data: { type: 'list', list },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ── Add card ──────────────────────────────────────────────
  const handleAddCard = async () => {
    if (!newCardTitle.trim()) { setIsAddingCard(false); return; }
    setIsAdding(true);
    try {
      const res = await api.post('/cards', { listId: list._id, title: newCardTitle.trim() });
      addCard(list._id, res.data.card);
      setNewCardTitle('');
      setIsAddingCard(false);
      setTimeout(() => addInputRef.current?.focus(), 100);
    } catch { toast.error('Failed to add card'); }
    finally { setIsAdding(false); }
  };

  // ── Update title ──────────────────────────────────────────
  const handleTitleSave = async () => {
    if (!listTitle.trim()) { setListTitle(list.title); setIsEditingTitle(false); return; }
    if (listTitle === list.title) { setIsEditingTitle(false); return; }
    try {
      await api.patch(`/lists/${list._id}`, { title: listTitle });
      updateList(list._id, { title: listTitle });
    } catch { toast.error('Failed to rename list'); setListTitle(list.title); }
    setIsEditingTitle(false);
  };

  // ── Archive list ──────────────────────────────────────────
  const handleArchive = async () => {
    try {
      await api.patch(`/lists/${list._id}/archive`);
      removeList(list._id);
      toast.success('List archived');
    } catch { toast.error('Failed to archive'); }
    setShowMenu(false);
  };

  // ── Copy list ─────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      const res = await api.post(`/lists/${list._id}/copy`, { title: `${list.title} (copy)` });
      useBoardStore.getState().addList(res.data.list);
      toast.success('List copied');
    } catch { toast.error('Failed to copy'); }
    setShowMenu(false);
  };

  // ── Delete list ───────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm(`Delete "${list.title}" and all its cards?`)) return;
    try {
      await api.delete(`/lists/${list._id}`);
      removeList(list._id);
      toast.success('List deleted');
    } catch { toast.error('Failed to delete'); }
    setShowMenu(false);
  };

  const cards = list.cards || [];

  return (
    <div ref={setNodeRef} style={style} className="board-column shrink-0">

      {/* Column header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0">
        {/* Drag handle */}
        <button {...attributes} {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-0.5 rounded">
          <GripVertical size={14} />
        </button>

        {/* Title */}
        {isEditingTitle ? (
          <input
            value={listTitle}
            onChange={e => setListTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setListTitle(list.title); setIsEditingTitle(false); } }}
            className="flex-1 text-sm font-semibold bg-white dark:bg-gray-700 border border-indigo-400 rounded px-2 py-0.5 outline-none text-gray-900 dark:text-white"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 text-left text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-gray-900 truncate"
          >
            {list.title}
          </button>
        )}

        {/* Card count badge */}
        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full shrink-0">
          {cards.length}
          {list.cardLimit ? `/${list.cardLimit}` : ''}
        </span>

        {/* Menu */}
        <div className="relative shrink-0">
          <button onClick={() => setShowMenu(s => !s)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
            <MoreHorizontal size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button onClick={handleCopy} className="menu-item"><Copy size={13} />Copy list</button>
              <button onClick={handleArchive} className="menu-item"><Archive size={13} />Archive list</button>
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
              <button onClick={handleDelete} className="menu-item text-red-600 hover:bg-red-50"><Trash2 size={13} />Delete list</button>
            </div>
          )}
        </div>
      </div>

      {/* WIP limit warning */}
      {list.cardLimit && cards.length >= list.cardLimit && (
        <div className="mx-3 mb-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">⚠ WIP limit reached</p>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 scrollbar-thin min-h-1">
        <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <CardItem key={card._id} card={card} onClick={() => onCardClick(card._id)} />
          ))}
        </SortableContext>

        {/* Empty drop zone */}
        {cards.length === 0 && (
          <div className="h-8 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600" />
        )}
      </div>

      {/* Add card */}
      <div className="px-2 pb-2 shrink-0">
        {isAddingCard ? (
          <div className="bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-600 space-y-2">
            <textarea
              ref={addInputRef}
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); } if (e.key === 'Escape') setIsAddingCard(false); }}
              placeholder="Card title..."
              rows={2}
              className="w-full text-sm bg-transparent outline-none resize-none text-gray-900 dark:text-white placeholder:text-gray-400"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleAddCard} disabled={isAdding}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                <Check size={12} /> Add
              </button>
              <button onClick={() => { setIsAddingCard(false); setNewCardTitle(''); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add a card
          </button>
        )}
      </div>

      <style jsx>{`
        .menu-item {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 12px; font-size: 13px;
          color: #374151; transition: background 0.1s;
        }
        .menu-item:hover { background: #f3f4f6; }
      `}</style>
    </div>
  );
}
