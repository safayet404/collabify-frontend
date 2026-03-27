'use client';

import { Paperclip, Trash2, Download, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { formatFileSize, formatDate } from '@/lib/utils';

export default function CardAttachments({ card, onRefresh }) {
  const remove = async (attachmentId) => {
    if (!confirm('Remove this attachment?')) return;
    try {
      await api.delete(`/cards/${card._id}/attachments/${attachmentId}`);
      onRefresh();
      toast.success('Attachment removed');
    } catch { toast.error('Failed to remove'); }
  };

  const isImage = (mime) => mime?.startsWith('image/');

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Paperclip size={16} className="text-gray-500" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attachments</p>
        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
          {card.attachments.length}
        </span>
      </div>
      <div className="space-y-2">
        {card.attachments.map(att => (
          <div key={att._id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group">
            {/* Icon or thumbnail */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
              {isImage(att.mimeType)
                ? <img src={`${process.env.NEXT_PUBLIC_SOCKET_URL}${att.url}`} alt={att.name} className="w-full h-full object-cover" />
                : <FileText size={18} className="text-gray-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{att.name}</p>
              <p className="text-xs text-gray-400">
                {formatFileSize(att.size)} · Added {formatDate(att.uploadedAt)}
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <a href={`${process.env.NEXT_PUBLIC_SOCKET_URL}${att.url}`} target="_blank" download
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Download size={14} />
              </a>
              <button onClick={() => remove(att._id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
