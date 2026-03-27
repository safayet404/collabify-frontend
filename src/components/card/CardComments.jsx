'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useAuthStore from '@/store/auth.store';
import { timeAgo, cn } from '@/lib/utils';
import { UserAvatar } from '@/app/dashboard/layout';
import { getSocket, emitTyping, emitStopTyping } from '@/lib/socket';

const REACTIONS = ['👍','👎','❤️','🔥','🎉','😄','😮','😢'];

export default function CardComments({ cardId, board }) {
  const { user }   = useAuthStore();
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [replyTo,  setReplyTo]  = useState(null);
  const [editingId,setEditingId]= useState(null);
  const [editText, setEditText] = useState('');
  const typingTimeout = useRef(null);

  useEffect(() => {
    fetchComments();
    // Socket: listen for new comments
    const socket = getSocket();
    if (socket) {
      socket.on('comment:created', (data) => {
        if (data.cardId === cardId) setComments(prev => {
          if (prev.some(c => c._id === data.comment._id)) return prev;
          return [...prev, data.comment];
        });
      });
      socket.on('comment:updated', (data) => {
        if (data.cardId === cardId) {
          setComments(prev => prev.map(c => c._id === data.comment._id ? data.comment : c));
        }
      });
      socket.on('comment:deleted', (data) => {
        if (data.cardId === cardId) {
          setComments(prev => prev.map(c => c._id === data.commentId ? { ...c, isDeleted: true, text: '[deleted]' } : c));
        }
      });
      socket.on('comment:reacted', (data) => {
        if (data.cardId === cardId) {
          setComments(prev => prev.map(c => c._id === data.comment._id ? data.comment : c));
        }
      });
    }
    return () => {
      socket?.off('comment:created');
      socket?.off('comment:updated');
      socket?.off('comment:deleted');
      socket?.off('comment:reacted');
    };
  }, [cardId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/comments/card/${cardId}`);
      setComments(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  const handleTyping = () => {
    emitTyping(cardId, board?._id);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitStopTyping(cardId, board?._id), 2000);
  };

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/comments', {
        cardId,
        text:            text.trim(),
        parentCommentId: replyTo?._id,
      });
      if (!replyTo) {
        setComments(prev => {
          if (prev.some(c => c._id === res.data.comment._id)) return prev;
          return [...prev, { ...res.data.comment, replies: [] }];
        });
      } else {
        setComments(prev => prev.map(c =>
          c._id === replyTo._id ? { ...c, replies: [...(c.replies || []), res.data.comment] } : c
        ));
      }
      setText('');
      setReplyTo(null);
    } catch { toast.error('Failed to post comment'); }
    finally { setSending(false); }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments(prev => prev.map(c => c._id === id ? { ...c, isDeleted: true, text: '[deleted]' } : c));
    } catch { toast.error('Failed to delete'); }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const res = await api.patch(`/comments/${id}`, { text: editText });
      setComments(prev => prev.map(c => c._id === id ? res.data.comment : c));
      setEditingId(null);
    } catch { toast.error('Failed to update'); }
  };

  const react = async (commentId, emoji) => {
    try {
      const res = await api.post(`/comments/${commentId}/react`, { emoji });
      setComments(prev => prev.map(c => c._id === commentId ? res.data.comment : c));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      {/* Comment input */}
      <div className="flex gap-3">
        <UserAvatar user={user} size="sm" />
        <div className="flex-1">
          {replyTo && (
            <div className="flex items-center gap-2 mb-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
              Replying to <span className="font-medium text-gray-600">{replyTo.author?.name}</span>
              <button onClick={() => setReplyTo(null)} className="ml-auto hover:text-gray-600">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); handleTyping(); }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
              placeholder={replyTo ? `Reply to ${replyTo.author?.name}...` : 'Write a comment... (Ctrl+Enter to send)'}
              rows={2}
              className="input-base resize-none text-xs flex-1"
            />
            <button onClick={submit} disabled={sending || !text.trim()}
              className="self-end p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40 transition-colors shrink-0">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={user}
              onReply={() => setReplyTo(comment)}
              onDelete={() => deleteComment(comment._id)}
              onEdit={() => { setEditingId(comment._id); setEditText(comment.text); }}
              onSaveEdit={(text) => saveEdit(comment._id)}
              isEditing={editingId === comment._id}
              editText={editText}
              setEditText={setEditText}
              onReact={(emoji) => react(comment._id, emoji)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, currentUser, onReply, onDelete, onEdit, onSaveEdit, isEditing, editText, setEditText, onReact }) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu,      setShowMenu]      = useState(false);
  const isAuthor = comment.author?._id === currentUser?._id;

  if (comment.isDeleted) {
    return (
      <div className="flex gap-2.5 opacity-50">
        <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
        <p className="text-xs italic text-gray-400 mt-1">[deleted]</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 group">
      <UserAvatar user={comment.author} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-900 dark:text-white">{comment.author?.name}</span>
          <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
          {comment.isEdited && <span className="text-[10px] text-gray-400">(edited)</span>}
        </div>

        {isEditing ? (
          <div className="space-y-1.5">
            <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2}
              className="input-base text-xs resize-none" autoFocus />
            <div className="flex gap-2">
              <button onClick={onSaveEdit} className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
              <button onClick={() => setEditText('')} className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed break-words">{comment.text}</p>
        )}

        {/* Reactions */}
        {comment.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {comment.reactions.map(r => (
              <button key={r.emoji} onClick={() => onReact(r.emoji)}
                className="flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 px-1.5 py-0.5 rounded-full transition-colors">
                {r.emoji} <span className="text-gray-500">{r.users?.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setShowReactions(s => !s)}
            className="text-[10px] text-gray-400 hover:text-gray-600">React</button>
          {!comment.parentComment && (
            <button onClick={onReply} className="text-[10px] text-gray-400 hover:text-gray-600">Reply</button>
          )}
          {isAuthor && (
            <>
              <button onClick={onEdit}   className="text-[10px] text-gray-400 hover:text-gray-600">Edit</button>
              <button onClick={onDelete} className="text-[10px] text-red-400 hover:text-red-600">Delete</button>
            </>
          )}
        </div>

        {/* Emoji picker */}
        {showReactions && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={() => { onReact(emoji); setShowReactions(false); }}
                className="text-base hover:scale-125 transition-transform p-0.5">
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} currentUser={currentUser}
                onReply={() => {}} onDelete={() => {}} onEdit={() => {}}
                onSaveEdit={() => {}} isEditing={false} editText="" setEditText={() => {}} onReact={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
