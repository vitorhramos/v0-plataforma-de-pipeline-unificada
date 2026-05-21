'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  Image as ImageIcon, List, ListOrdered, AlignLeft, X,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  changed?: boolean;
}

// ── Toolbar button helper ─────────────────────────────────────────────────────
function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  );
}

// ── Lettered list extension (CSS-driven, uses OrderedList with list-style-type overridden) ──
const BULLET_STYLES = [
  { label: '•', title: 'Bullets', type: 'bullet' as const },
  { label: '1.', title: 'Numerada', type: 'ordered' as const },
  { label: 'a.', title: 'Letras', type: 'alpha' as const },
] as const;

type BulletType = typeof BULLET_STYLES[number]['type'];

export function RichTextEditor({ value, onChange, placeholder, changed }: RichTextEditorProps) {
  const [linkPopover, setLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imagePopover, setImagePopover] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [activeBullet, setActiveBullet] = useState<BulletType | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: false, orderedList: false, listItem: false }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded my-2' } }),
      BulletList.configure({ HTMLAttributes: { class: 'list-disc pl-5 my-1' } }),
      OrderedList.configure({ HTMLAttributes: { class: 'pl-5 my-1' } }),
      ListItem,
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[100px] px-3 py-2.5 text-xs text-gray-900 focus:outline-none leading-relaxed',
      },
    },
  });

  // Sync external value changes (e.g. when modal opens with existing data)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const insertLink = () => {
    if (!editor || !linkUrl) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    // If there's a selection, wrap it. Otherwise insert the URL as text linked.
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkUrl('');
    setLinkPopover(false);
  };

  const insertImage = () => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setImagePopover(false);
  };

  const toggleBullet = (type: BulletType) => {
    if (!editor) return;
    if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run();
      setActiveBullet(editor.isActive('bulletList') ? 'bullet' : null);
    } else if (type === 'ordered') {
      // Remove alpha class if present, use default decimal
      editor.chain().focus().toggleOrderedList().run();
      if (editor.isActive('orderedList')) {
        // Set type attribute to decimal
        setActiveBullet('ordered');
      } else {
        setActiveBullet(null);
      }
    } else {
      // Alpha: use ordered list but set list-style-type via inline style on the ol node
      editor.chain().focus().toggleOrderedList().run();
      setActiveBullet(editor.isActive('orderedList') ? 'alpha' : null);
    }
  };

  if (!editor) return null;

  return (
    <div className={`rounded-lg border transition-all ${changed ? 'ring-1 ring-amber-400 border-amber-300' : 'border-gray-300'} bg-white overflow-hidden`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
        {/* Text formatting */}
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italico (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado (Ctrl+U)">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Lists */}
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => toggleBullet('bullet')} title="Lista de pontos">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => toggleBullet('ordered')} title="Lista numerada">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        {/* Alpha list — custom icon (a.) */}
        <ToolBtn active={activeBullet === 'alpha' && editor.isActive('orderedList')} onClick={() => toggleBullet('alpha')} title="Lista em letras">
          <span className="text-[11px] font-bold leading-none">a.</span>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Link */}
        <div className="relative">
          <ToolBtn active={editor.isActive('link') || linkPopover} onClick={() => { setLinkPopover(v => !v); setImagePopover(false); setTimeout(() => linkInputRef.current?.focus(), 50); }} title="Inserir link">
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          {linkPopover && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1.5 min-w-[220px]">
              <input
                ref={linkInputRef}
                type="text"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setLinkPopover(false); }}
                placeholder="https://..."
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button onClick={insertLink} className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition">OK</button>
              <button onClick={() => setLinkPopover(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolBtn active={imagePopover} onClick={() => { setImagePopover(v => !v); setLinkPopover(false); setTimeout(() => imageInputRef.current?.focus(), 50); }} title="Inserir imagem por URL">
            <ImageIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          {imagePopover && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1.5 min-w-[220px]">
              <input
                ref={imageInputRef}
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') insertImage(); if (e.key === 'Escape') setImagePopover(false); }}
                placeholder="https://..."
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button onClick={insertImage} className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition">OK</button>
              <button onClick={() => setImagePopover(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>

        {/* Remove link */}
        {editor.isActive('link') && (
          <ToolBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Remover link">
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolBtn>
        )}
      </div>

      {/* Editor area */}
      <div className="relative">
        {(!editor.getText() && placeholder) && (
          <p className="absolute top-2.5 left-3 text-xs text-gray-400 pointer-events-none select-none">{placeholder}</p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
