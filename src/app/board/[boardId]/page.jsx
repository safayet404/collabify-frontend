'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
    closestCorners, MouseSensor, TouchSensor,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import useBoardStore from '@/store/board.store';
import { getSocket, joinBoard, leaveBoard } from '@/lib/socket';
import { getBoardBackground } from '@/lib/utils';
import api from '@/lib/axios';
import BoardHeader from '@/components/board/BoardHeader';
import BoardColumn from '@/components/board/BoardColumn';
import CardItem from '@/components/card/CardItem';
import AddListButton from '@/components/board/AddListButton';
import CardDetailModal from '@/components/card/CardDetailModal';

export default function BoardPage() {
    const { boardId } = useParams();
    const { currentBoard, fetchBoard, moveCardBetweenLists, updateCard, setLists } = useBoardStore();

    const [activeCard, setActiveCard] = useState(null);
    const [activeList, setActiveList] = useState(null);
    const [openCardId, setOpenCardId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    );

    // ── Fetch board ──────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                await fetchBoard(boardId);
            } catch {
                toast.error('Failed to load board');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [boardId]);

    // ── Socket events ────────────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        joinBoard(boardId);

        socket.on('list:created', (data) => useBoardStore.getState().addList(data.list));
        socket.on('list:updated', (data) => useBoardStore.getState().updateList(data.list._id, data.list));
        socket.on('list:deleted', (data) => useBoardStore.getState().removeList(data.listId));
        socket.on('list:reordered', (data) => useBoardStore.getState().setLists(data.lists));
        socket.on('card:created', (data) => useBoardStore.getState().addCard(data.listId, data.card));
        socket.on('card:updated', (data) => useBoardStore.getState().updateCard(data.card._id, data.card));
        socket.on('card:deleted', (data) => useBoardStore.getState().removeCard(data.cardId, data.listId));
        socket.on('card:moved', (data) => {
            const { card, fromListId, toListId } = data;
            useBoardStore.getState().moveCardBetweenLists(card._id, fromListId, toListId, card.position);
        });

        return () => {
            leaveBoard(boardId);
            ['list:created', 'list:updated', 'list:deleted', 'list:reordered',
                'card:created', 'card:updated', 'card:deleted', 'card:moved'].forEach(e => socket.off(e));
        };
    }, [boardId]);

    // ── Open card from URL ?card=xxx ─────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const cardId = params.get('card');
            if (cardId) setOpenCardId(cardId);
        }
    }, []);

    // ── DnD handlers ─────────────────────────────────────────────
    const findCardList = useCallback((cardId) => {
        if (!currentBoard) return null;
        return currentBoard.lists.find(l => l.cards?.some(c => c._id === cardId));
    }, [currentBoard]);

    const handleDragStart = ({ active }) => {
        if (active.data.current?.type === 'card') {
            setActiveCard(active.data.current.card);
        } else if (active.data.current?.type === 'list') {
            setActiveList(active.data.current.list);
        }
    };

    const handleDragOver = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        if (active.data.current?.type !== 'card') return;

        const cardId = active.id;
        const overId = over.id;
        const fromList = findCardList(cardId);
        if (!fromList) return;

        // Dropped over another list
        const toList = currentBoard.lists.find(l => l._id === overId);
        if (toList && fromList._id !== toList._id) {
            moveCardBetweenLists(cardId, fromList._id, toList._id, toList.cards?.length || 0);
        }

        // Dropped over a card in another list
        const overList = findCardList(overId);
        if (overList && fromList._id !== overList._id) {
            const toIndex = overList.cards.findIndex(c => c._id === overId);
            moveCardBetweenLists(cardId, fromList._id, overList._id, Math.max(0, toIndex));
        }
    };

    const handleDragEnd = async ({ active, over }) => {
        setActiveCard(null);
        setActiveList(null);
        if (!over || active.id === over.id) return;

        const type = active.data.current?.type;

        if (type === 'card') {
            const cardId = active.id;
            const fromList = findCardList(cardId);
            const toList = findCardList(over.id) || currentBoard.lists.find(l => l._id === over.id);
            if (!fromList || !toList) return;

            const toIndex = toList.cards.findIndex(c => c._id === over.id);
            const position = toIndex >= 0 ? toIndex : toList.cards.length - 1;

            try {
                await api.post(`/cards/${cardId}/move`, {
                    listId: toList._id,
                    position: Math.max(0, position),
                });
                // Also persist reorder in same list
                if (fromList._id === toList._id) {
                    const orderedIds = toList.cards.map(c => c._id);
                    await api.patch('/cards/reorder', { listId: toList._id, orderedIds });
                }
            } catch {
                toast.error('Failed to move card');
                fetchBoard(boardId); // re-sync
            }
        }

        if (type === 'list') {
            const lists = currentBoard.lists;
            const fromIndex = lists.findIndex(l => l._id === active.id);
            const toIndex = lists.findIndex(l => l._id === over.id);
            if (fromIndex === toIndex) return;

            const reordered = [...lists];
            const [moved] = reordered.splice(fromIndex, 1);
            reordered.splice(toIndex, 0, moved);
            setLists(reordered);

            try {
                await api.patch('/lists/reorder', {
                    boardId: boardId,
                    orderedIds: reordered.map(l => l._id),
                });
            } catch {
                toast.error('Failed to reorder lists');
                fetchBoard(boardId);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentBoard) {
        return (
            <div className="h-full flex items-center justify-center text-white">
                <p>Board not found</p>
            </div>
        );
    }

    const bg = getBoardBackground(currentBoard.background);

    return (
        <div className="h-full flex flex-col" style={{ ...bg, minHeight: '100%' }}>
            {/* Scrim for readability */}
            <div className="flex flex-col h-full" style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(0px)' }}>

                {/* Board header */}
                <BoardHeader board={currentBoard} />

                {/* Kanban columns */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="board-scroll flex-1">
                        <SortableContext
                            items={currentBoard.lists.map(l => l._id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {currentBoard.lists.map(list => (
                                <BoardColumn
                                    key={list._id}
                                    list={list}
                                    boardId={boardId}
                                    onCardClick={setOpenCardId}
                                />
                            ))}
                        </SortableContext>

                        {/* Add list */}
                        <AddListButton boardId={boardId} />
                    </div>

                    {/* Drag overlay */}
                    <DragOverlay>
                        {activeCard && (
                            <div className="drag-overlay">
                                <CardItem card={activeCard} isDragging />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Card detail modal */}
            {openCardId && (
                <CardDetailModal
                    cardId={openCardId}
                    board={currentBoard}
                    onClose={() => setOpenCardId(null)}
                />
            )}
        </div>
    );
}