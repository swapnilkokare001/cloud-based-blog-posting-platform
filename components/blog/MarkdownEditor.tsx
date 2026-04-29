'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bold, Italic, Link, Code, Quote, List, ListOrdered,
  Heading2, Heading3, Image, Eye, EyeOff
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
}

type ToolbarAction = {
  icon: React.ElementType;
  label: string;
  action: (text: string, sel: [number, number]) => { text: string; cursor: [number, number] };
};

const toolbarActions: ToolbarAction[] = [
  {
    icon: Bold, label: 'Bold',
    action: (text, [s, e]) => {
      const selected = text.slice(s, e) || 'bold text';
      const newText = text.slice(0, s) + `**${selected}**` + text.slice(e);
      return { text: newText, cursor: [s + 2, s + 2 + selected.length] };
    },
  },
  {
    icon: Italic, label: 'Italic',
    action: (text, [s, e]) => {
      const selected = text.slice(s, e) || 'italic text';
      const newText = text.slice(0, s) + `*${selected}*` + text.slice(e);
      return { text: newText, cursor: [s + 1, s + 1 + selected.length] };
    },
  },
  {
    icon: Heading2, label: 'H2',
    action: (text, [s]) => {
      const lineStart = text.lastIndexOf('\n', s - 1) + 1;
      const newText = text.slice(0, lineStart) + '## ' + text.slice(lineStart);
      return { text: newText, cursor: [s + 3, s + 3] };
    },
  },
  {
    icon: Heading3, label: 'H3',
    action: (text, [s]) => {
      const lineStart = text.lastIndexOf('\n', s - 1) + 1;
      const newText = text.slice(0, lineStart) + '### ' + text.slice(lineStart);
      return { text: newText, cursor: [s + 4, s + 4] };
    },
  },
  {
    icon: Link, label: 'Link',
    action: (text, [s, e]) => {
      const selected = text.slice(s, e) || 'link text';
      const insertion = `[${selected}](url)`;
      const newText = text.slice(0, s) + insertion + text.slice(e);
      return { text: newText, cursor: [s + selected.length + 3, s + selected.length + 6] };
    },
  },
  {
    icon: Code, label: 'Code',
    action: (text, [s, e]) => {
      const selected = text.slice(s, e) || 'code';
      const newText = text.slice(0, s) + '`' + selected + '`' + text.slice(e);
      return { text: newText, cursor: [s + 1, s + 1 + selected.length] };
    },
  },
  {
    icon: Quote, label: 'Blockquote',
    action: (text, [s]) => {
      const lineStart = text.lastIndexOf('\n', s - 1) + 1;
      const newText = text.slice(0, lineStart) + '> ' + text.slice(lineStart);
      return { text: newText, cursor: [s + 2, s + 2] };
    },
  },
  {
    icon: List, label: 'Bullet List',
    action: (text, [s]) => {
      const lineStart = text.lastIndexOf('\n', s - 1) + 1;
      const newText = text.slice(0, lineStart) + '- ' + text.slice(lineStart);
      return { text: newText, cursor: [s + 2, s + 2] };
    },
  },
];

export default function MarkdownEditor({ value, onChange, preview = false }: Props) {
  const [showPreview, setShowPreview] = useState(preview);

  const handleToolbarAction = (action: ToolbarAction['action']) => {
    const textarea = document.querySelector('textarea[data-md-editor]') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const { text: newText, cursor } = action(value, [start, end]);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor[0], cursor[1]);
    }, 0);
  };

  return (
    <div className="border border-input rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/40 flex-wrap">
        {toolbarActions.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => handleToolbarAction(action)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            showPreview ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? 'Editor' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="min-h-[400px] p-6 blog-content prose-sm max-w-none overflow-auto">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview yet...</p>
          )}
        </div>
      ) : (
        <textarea
          data-md-editor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Start writing your post in Markdown...\n\n# Heading 1\n## Heading 2\n\n**Bold**, *italic*, \`code\`\n\n> Blockquote\n\n- List item\n- Another item`}
          className="w-full min-h-[400px] p-5 bg-transparent text-sm font-mono text-foreground resize-y focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed"
        />
      )}

      {/* Footer: word count */}
      <div className="border-t border-border px-4 py-1.5 text-xs text-muted-foreground flex justify-between">
        <span>{value.trim().split(/\s+/).filter(Boolean).length} words</span>
        <span>~{Math.max(1, Math.ceil(value.split(/\s+/).length / 200))} min read</span>
      </div>
    </div>
  );
}
