'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { cn, formatDueDate, PRIORITY_CONFIG } from '@/lib/utils';
import { UserAvatar } from '@/app/dashboard/layout';

export default function CardItem({ card, onClick, isDragging = false }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging: isSortableDragging,
  } = useSortable({
    id:   card._id,
    data: { type: 'card', card },
  });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isSortableDragging ? 0.4 : 1,
  };

  const dueDate     = card.dueDate ? formatDueDate(card.dueDate) : null;
  const priority    = card.priority !== 'none' ? PRIORITY_CONFIG[card.priority] : null;
  const checkTotal  = card.checklists?.reduce((s, cl) => s + cl.items.length, 0) || 0;
  const checkDone   = card.checklists?.reduce((s, cl) => s + cl.items.filter(i => i.isCompleted).length, 0) || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'card-item group relative select-none',
        isSortableDragging && 'cursor-grabbing',
        isDragging && 'rotate-2 scale-105 shadow-xl'
      )}
    >
      {/* Cover */}
      {card.cover?.value && (
        <div
          className="h-8 -mx-3 -mt-3 mb-2 rounded-t-lg"
          style={card.cover.type === 'color'
            ? { background: card.cover.value }
            : { backgroundImage: `url(${card.cover.value})`, backgroundSize: 'cover' }
          }
        />
      )}

      {/* Labels */}
      {card.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label, i) => (
            <span
              key={i}
              className="h-2 w-8 rounded-full"
              style={{ background: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug mb-2">
        {card.title}
      </p>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5">

        {/* Priority */}
        {priority && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: priority.bg, color: priority.color }}
          >
            <AlertCircle size={9} />
            {priority.label}
          </span>
        )}

        {/* Due date */}
        {dueDate && (
          <span className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full',
            dueDate.status === 'overdue'  && 'bg-red-100 text-red-700',
            dueDate.status === 'warning'  && 'bg-amber-100 text-amber-700',
            dueDate.status === 'normal'   && 'bg-gray-100 text-gray-600',
          )}>
            <Clock size={9} />
            {dueDate.label}
            {card.isCompleted && ' ✓'}
          </span>
        )}

        {/* Checklist progress */}
        {checkTotal > 0 && (
          <span className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full',
            checkDone === checkTotal ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          )}>
            <CheckSquare size={9} />
            {checkDone}/{checkTotal}
          </span>
        )}

        {/* Comments */}
        {card.commentsCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
            <MessageSquare size={9} />
            {card.commentsCount}
          </span>
        )}

        {/* Attachments */}
        {card.attachments?.length > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
            <Paperclip size={9} />
            {card.attachments.length}
          </span>
        )}

        {/* Assignees */}
        {card.assignees?.length > 0 && (
          <div className="flex -space-x-1.5 ml-auto">
            {card.assignees.slice(0, 3).map(user => (
              <UserAvatar key={user._id} user={user} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
