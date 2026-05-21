'use client';
// RichTextEditor — Tiptap v3, StarterKit-only (no separate Link/Underline imports)
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import OrderedList from '@tiptap/extension-ordered-list';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  Image as ImageIcon, List, ListOrdered, X,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  changed?: boolean;
}

// ── Toolbar button helper ─────────────────────────────────────────────────────
function ToolBtn({
  active, onClick, title, children,
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
        active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  );
}

// ── Read a File object as a base64 data-URL ───────────────────────────────────
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function RichTextEditor({ value, onChange, placeholder, changed }: RichTextEditorProps) {
  const [linkPopover, setLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl]     = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable built-in orderedList — we register an extended version below
        orderedList: false,
        bulletList: { HTMLAttributes: { class: 'list-disc pl-5 my-1' } },
        // Configure link and underline (already included in StarterKit v3)
        link: {
          openOnClick: false,
          HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' },
        },
        underline: {},
      }),
      // Extended OrderedList with data-list-type attribute for decimal vs lower-alpha
      OrderedList.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            'data-list-type': {
              default: 'decimal',
              parseHTML: el => el.getAttribute('data-list-type') ?? 'decimal',
              renderHTML: attrs => ({ 'data-list-type': attrs['data-list-type'] }),
            },
          };
        },
      }).configure({
        HTMLAttributes: { class: 'pl-5 my-1' },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: 'max-w-full rounded my-2' },
      }),
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

  // Sync external value changes (e.g. when modal re-opens with existing data)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ── Insert image from File object ────────────────────────────────────────
  const insertImageFile = useCallback(async (file: File) => {
    if (!editor || !file.type.startsWith('image/')) return;
    const dataUrl = await readFileAsDataURL(file);
    editor.chain().focus().setImage({ src: dataUrl }).run();
  }, [editor]);

  // ── File input change handler ────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) insertImageFile(file);
    // Reset so the same file can be picked again
    e.target.value = '';
  };

  // ── Drag-and-drop onto the editor wrapper ────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDragging(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!editorWrapRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await insertImageFile(file);
  };

  // ── Link insert ──────────────────────────────────────────────────────────
  const insertLink = () => {
    if (!editor || !linkUrl.trim()) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkUrl('');
    setLinkPopover(false);
  };

  if (!editor) return null;

  return (
    <div
      ref={editorWrapRef}
      className={`rounded-lg border transition-all ${
        isDragging
          ? 'ring-2 ring-blue-400 border-blue-400 bg-blue-50/30'
          : changed
            ? 'ring-1 ring-amber-400 border-amber-300'
            : 'border-gray-300'
      } bg-white overflow-hidden`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for image picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
        <ToolBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista de pontos"
        >
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('orderedList') && !editor.isActive('orderedList', { 'data-list-type': 'alpha' })}
          onClick={() => {
            if (editor.isActive('orderedList', { 'data-list-type': 'alpha' })) {
              // Switch from alpha back to decimal
              editor.chain().focus().updateAttributes('orderedList', { 'data-list-type': 'decimal' }).run();
            } else {
              editor.chain().focus().toggleOrderedList().run();
            }
          }}
          title="Lista numerada (1. 2. 3.)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('orderedList', { 'data-list-type': 'alpha' })}
          onClick={() => {
            const isAlphaActive = editor.isActive('orderedList', { 'data-list-type': 'alpha' });
            if (isAlphaActive) {
              // Toggle off — remove the ordered list entirely
              editor.chain().focus().toggleOrderedList().run();
            } else if (editor.isActive('orderedList')) {
              // Already a numbered list — switch to alpha
              editor.chain().focus().updateAttributes('orderedList', { 'data-list-type': 'alpha' }).run();
            } else {
              // Not a list — create one and set alpha
              editor.chain().focus().toggleOrderedList().updateAttributes('orderedList', { 'data-list-type': 'alpha' }).run();
            }
          }}
          title="Lista em letras (a. b. c.)"
        >
          <span className="text-[11px] font-bold leading-none select-none">a.</span>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Link */}
        <div className="relative">
          <ToolBtn
            active={editor.isActive('link') || linkPopover}
            onClick={() => {
              setLinkPopover(v => !v);
              if (!linkPopover) setTimeout(() => linkInputRef.current?.focus(), 50);
            }}
            title="Inserir link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          {linkPopover && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1.5 min-w-[220px]">
              <input
                ref={linkInputRef}
                type="text"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') insertLink();
                  if (e.key === 'Escape') setLinkPopover(false);
                }}
                placeholder="https://..."
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={insertLink}
                className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                OK
              </button>
              <button
                onClick={() => setLinkPopover(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Remove link — shown only when cursor is inside a link */}
        {editor.isActive('link') && (
          <ToolBtn
            active={false}
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remover link"
          >
            <span className="text-[10px] font-bold leading-none text-red-500 select-none">unlink</span>
          </ToolBtn>
        )}

        {/* Image — opens file picker */}
        <ToolBtn
          active={false}
          onClick={() => fileInputRef.current?.click()}
          title="Inserir imagem do computador"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div className="relative">
        {!editor.getText() && placeholder && (
          <p className="absolute top-2.5 left-3 text-xs text-gray-400 pointer-events-none select-none">
            {isDragging ? 'Solte a imagem aqui...' : placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/60 rounded-b-lg pointer-events-none">
            <span className="text-xs font-semibold text-blue-600">Solte para inserir imagem</span>
          </div>
        )}
      </div>
    </div>
  );
}
