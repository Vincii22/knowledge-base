'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Link as LinkIcon,
} from 'lucide-react';

const lowlight = createLowlight(common);

interface ArticleEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function ArticleEditor({ content, onChange }: ArticleEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // ← ADD THIS LINE
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('bold') ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('italic') ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('heading', { level: 1 }) ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('bulletList') ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('orderedList') ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('codeBlock') ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Code Block"
        >
          <Code className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('blockquote') ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('link') ? 'bg-primary-100 text-primary-700' : ''
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-5 h-5" />
        </button>

        <div className="border-l border-gray-300 mx-2"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 transition"
          title="Undo"
        >
          <Undo className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 transition"
          title="Redo"
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}