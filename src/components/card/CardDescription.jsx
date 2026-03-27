'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { AlignLeft, Bold, Italic, List, Code, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CardDescription({ card, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [original,  setOriginal]  = useState(card.description || '');

  const editor = useEditor({ immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Add a description...' }),
    ],
    content:    card.description || '',
    editable:   isEditing,
    editorProps: {
      attributes: { class: 'tiptap' },
    },
  });

  const startEdit = () => {
    setOriginal(editor?.getHTML() || '');
    editor?.setEditable(true);
    setIsEditing(true);
    setTimeout(() => editor?.commands.focus('end'), 50);
  };

  const save = async () => {
    const html = editor?.getHTML() || '';
    await onUpdate({ description: html });
    editor?.setEditable(false);
    setIsEditing(false);
  };

  const cancel = () => {
    editor?.commands.setContent(original);
    editor?.setEditable(false);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <AlignLeft size={16} className="text-gray-500" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</p>
      </div>

      {isEditing && (
        <div className="flex gap-1 mb-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {[
            { icon: <Bold size={13} />,   action: () => editor?.chain().focus().toggleBold().run(),         active: editor?.isActive('bold') },
            { icon: <Italic size={13} />, action: () => editor?.chain().focus().toggleItalic().run(),       active: editor?.isActive('italic') },
            { icon: <List size={13} />,   action: () => editor?.chain().focus().toggleBulletList().run(),   active: editor?.isActive('bulletList') },
            { icon: <Code size={13} />,   action: () => editor?.chain().focus().toggleCode().run(),         active: editor?.isActive('code') },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action}
              className={cn('p-1.5 rounded text-sm transition-colors',
                btn.active ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-700'
              )}>
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      <div
        onClick={!isEditing ? startEdit : undefined}
        className={cn(
          'min-h-[60px] rounded-lg p-3 text-sm transition-colors',
          isEditing
            ? 'bg-white dark:bg-gray-800 border border-indigo-400 ring-1 ring-indigo-200'
            : 'bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer'
        )}
      >
        <EditorContent editor={editor} />
      </div>

      {isEditing && (
        <div className="flex gap-2 mt-2">
          <button onClick={save}   className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            <Check size={12} /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={12} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}
