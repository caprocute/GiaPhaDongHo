import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { MediaPickerDialog } from "./MediaPickerDialog";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
}

const TOOLBAR_BTN: React.CSSProperties = {
  padding: "4px 9px",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-sm, 4px)",
  background: "var(--color-surface-card)",
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
  fontWeight: 700,
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Soạn nội dung bài viết…",
  readOnly = false,
  minHeight = 420,
}: RichTextEditorProps) {
  const [mediaOpen, setMediaOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "cms-inline-img" },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        modestBranding: true,
        HTMLAttributes: { class: "cms-yt-embed" },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const cmd = () => editor.chain().focus();

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập đường dẫn liên kết", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function setYoutube() {
    if (!editor) return;
    const url = window.prompt("Dán đường dẫn YouTube (youtube.com hoặc youtu.be)");
    if (!url?.trim()) return;
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  }

  return (
    <div className="rte-shell">
      {!readOnly && (
        <div className="rte-toolbar" role="toolbar" aria-label="Công cụ soạn thảo">
          <button
            type="button"
            title="In đậm"
            style={editor.isActive("bold") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleBold().run()}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            title="In nghiêng"
            style={editor.isActive("italic") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            title="Gạch ngang"
            style={editor.isActive("strike") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleStrike().run()}
          >
            <s>S</s>
          </button>
          <span className="rte-sep" />
          <button
            type="button"
            title="Tiêu đề mục"
            style={editor.isActive("heading", { level: 2 }) ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
          <button
            type="button"
            title="Tiêu đề phụ"
            style={editor.isActive("heading", { level: 3 }) ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleHeading({ level: 3 }).run()}
          >
            H3
          </button>
          <span className="rte-sep" />
          <button
            type="button"
            title="Danh sách"
            style={editor.isActive("bulletList") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleBulletList().run()}
          >
            • —
          </button>
          <button
            type="button"
            title="Danh sách số"
            style={editor.isActive("orderedList") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleOrderedList().run()}
          >
            1.
          </button>
          <button
            type="button"
            title="Trích dẫn"
            style={editor.isActive("blockquote") ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}
            onClick={() => cmd().toggleBlockquote().run()}
          >
            “ ”
          </button>
          <span className="rte-sep" />
          <button type="button" title="Chèn liên kết" style={TOOLBAR_BTN} onClick={setLink}>
            Liên kết
          </button>
          <button
            type="button"
            title="Chèn ảnh từ thư viện"
            style={TOOLBAR_BTN}
            onClick={() => setMediaOpen(true)}
          >
            Ảnh thư viện
          </button>
          <button type="button" title="Chèn video YouTube" style={TOOLBAR_BTN} onClick={setYoutube}>
            Video
          </button>
          <span className="rte-sep" />
          <button
            type="button"
            title="Hoàn tác"
            style={TOOLBAR_BTN}
            onClick={() => cmd().undo().run()}
            disabled={!editor.can().undo()}
          >
            ↩
          </button>
          <button
            type="button"
            title="Làm lại"
            style={TOOLBAR_BTN}
            onClick={() => cmd().redo().run()}
            disabled={!editor.can().redo()}
          >
            ↪
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="rte-body"
        style={{ minHeight }}
      />
      <MediaPickerDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onPick={(url, alt) => {
          editor.chain().focus().setImage({ src: url, alt: alt ?? "" }).run();
        }}
      />
      <style>{`
        .rte-shell {
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
          background: var(--color-surface-card);
        }
        .rte-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px 10px;
          border-bottom: 1px solid var(--color-border-subtle);
          background: var(--color-surface-sunken);
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .rte-sep {
          width: 1px;
          background: var(--color-border-default);
          margin: 2px 4px;
          align-self: stretch;
        }
        .rte-body .ProseMirror {
          outline: none;
          padding: 16px 18px;
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-text-primary);
          min-height: inherit;
        }
        .rte-body .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--color-text-muted);
          pointer-events: none;
          float: left;
          height: 0;
        }
        .rte-body .ProseMirror h2 {
          font-family: var(--font-display);
          font-size: 1.35em;
          margin: 0.85em 0 0.35em;
          color: var(--color-heritage-deep, var(--color-text-primary));
        }
        .rte-body .ProseMirror h3 {
          font-family: var(--font-display);
          font-size: 1.15em;
          margin: 0.7em 0 0.3em;
        }
        .rte-body .ProseMirror ul,
        .rte-body .ProseMirror ol {
          padding-left: 1.4em;
          margin: 0.5em 0;
        }
        .rte-body .ProseMirror blockquote {
          border-left: 3px solid var(--color-heritage-accent);
          padding-left: 12px;
          color: var(--color-text-muted);
          margin: 0.6em 0;
          font-style: italic;
        }
        .rte-body .ProseMirror a {
          color: var(--color-heritage-accent);
          text-decoration: underline;
        }
        .rte-body .ProseMirror img.cms-inline-img,
        .rte-body .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-sm, 4px);
          margin: 0.75em 0;
        }
        .rte-body .ProseMirror div[data-youtube-video],
        .rte-body .ProseMirror .cms-yt-embed {
          margin: 0.85em 0;
          max-width: 100%;
        }
        .rte-body .ProseMirror iframe {
          max-width: 100%;
          border-radius: var(--radius-sm, 4px);
        }
      `}</style>
    </div>
  );
}
