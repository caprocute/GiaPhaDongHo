import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
}

const TOOLBAR_BTN: React.CSSProperties = {
  padding: "2px 8px",
  border: "1px solid var(--color-border-default)",
  borderRadius: 4,
  background: "transparent",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  color: "var(--color-text-primary)",
  lineHeight: 1.4,
};

const TOOLBAR_BTN_ACTIVE: React.CSSProperties = {
  ...TOOLBAR_BTN,
  background: "var(--color-surface-sunken)",
  borderColor: "var(--color-border-strong)",
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung bài viết…",
  readOnly = false,
  minHeight = 240,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !readOnly,
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
  });

  // Sync external value resets (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const cmd = editor.chain().focus();

  return (
    <div
      style={{
        border: "1px solid var(--color-border-default)",
        borderRadius: 6,
        overflow: "hidden",
        fontFamily: "var(--font-body)",
      }}
    >
      {!readOnly && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            padding: "6px 10px",
            borderBottom: "1px solid var(--color-border-default)",
            background: "var(--color-surface-sunken)",
          }}
        >
          <button
            type="button"
            title="In đậm (Ctrl+B)"
            style={editor.isActive("bold") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd.toggleBold().run()}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            title="In nghiêng (Ctrl+I)"
            style={editor.isActive("italic") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd.toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            title="Gạch ngang"
            style={editor.isActive("strike") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd.toggleStrike().run()}
          >
            <s>S</s>
          </button>
          <span style={{ width: 1, background: "var(--color-border-default)", margin: "2px 4px" }} />
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              title={`Tiêu đề ${level}`}
              style={editor.isActive("heading", { level }) ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
              onClick={() => cmd.toggleHeading({ level: level as 1 | 2 | 3 }).run()}
            >
              H{level}
            </button>
          ))}
          <span style={{ width: 1, background: "var(--color-border-default)", margin: "2px 4px" }} />
          <button
            type="button"
            title="Danh sách gạch đầu dòng"
            style={editor.isActive("bulletList") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd.toggleBulletList().run()}
          >
            • —
          </button>
          <button
            type="button"
            title="Danh sách đánh số"
            style={editor.isActive("orderedList") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd.toggleOrderedList().run()}
          >
            1. —
          </button>
          <button
            type="button"
            title="Trích dẫn"
            style={editor.isActive("blockquote") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd.toggleBlockquote().run()}
          >
            " "
          </button>
          <span style={{ width: 1, background: "var(--color-border-default)", margin: "2px 4px" }} />
          <button
            type="button"
            title="Hoàn tác (Ctrl+Z)"
            style={TOOLBAR_BTN}
            onClick={() => cmd.undo().run()}
            disabled={!editor.can().undo()}
          >
            ↩
          </button>
          <button
            type="button"
            title="Làm lại (Ctrl+Shift+Z)"
            style={TOOLBAR_BTN}
            onClick={() => cmd.redo().run()}
            disabled={!editor.can().redo()}
          >
            ↪
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        style={{
          minHeight,
          padding: "12px 14px",
          background: "var(--color-surface-card)",
          outline: "none",
          fontSize: 14,
          lineHeight: 1.65,
          color: "var(--color-text-primary)",
          cursor: readOnly ? "default" : "text",
        }}
        placeholder={placeholder}
      />
      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--color-text-muted);
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror h1 { font-family: var(--font-display); font-size: 1.5em; margin: .75em 0 .35em; }
        .ProseMirror h2 { font-family: var(--font-display); font-size: 1.25em; margin: .65em 0 .3em; }
        .ProseMirror h3 { font-family: var(--font-display); font-size: 1.1em; margin: .55em 0 .25em; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.4em; margin: .5em 0; }
        .ProseMirror blockquote {
          border-left: 3px solid var(--color-heritage-accent);
          padding-left: 12px;
          color: var(--color-text-muted);
          margin: .5em 0;
          font-style: italic;
        }
        .ProseMirror code {
          background: var(--color-surface-sunken);
          border-radius: 3px;
          padding: 1px 4px;
          font-family: monospace;
          font-size: .9em;
        }
      `}</style>
    </div>
  );
}
