"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const BUTTONS: { label: string; name: string; command: (editor: NonNullable<ReturnType<typeof useEditor>>) => void; isActive: (editor: NonNullable<ReturnType<typeof useEditor>>) => boolean }[] = [
  { label: "B", name: "Bold", command: (e) => e.chain().focus().toggleBold().run(), isActive: (e) => e.isActive("bold") },
  { label: "I", name: "Italic", command: (e) => e.chain().focus().toggleItalic().run(), isActive: (e) => e.isActive("italic") },
  { label: "H2", name: "Heading 2", command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (e) => e.isActive("heading", { level: 2 }) },
  { label: "H3", name: "Heading 3", command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (e) => e.isActive("heading", { level: 3 }) },
  { label: "•", name: "Bullet list", command: (e) => e.chain().focus().toggleBulletList().run(), isActive: (e) => e.isActive("bulletList") },
  { label: "1.", name: "Numbered list", command: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive("orderedList") },
  { label: "❝", name: "Block quote", command: (e) => e.chain().focus().toggleBlockquote().run(), isActive: (e) => e.isActive("blockquote") },
];

export function RichTextEditor({
  value,
  onSave,
  placeholder,
  id,
  ariaLabel,
}: {
  value: string;
  onSave: (html: string) => void;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: placeholder || "Write something…" })],
    content: value,
    immediatelyRender: false,
    onBlur: ({ editor: e }) => onSave(e.getHTML()),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        "aria-label": ariaLabel || placeholder || "Rich text editor",
        class:
          "min-h-[6rem] rounded-lg border px-3 py-2 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border" style={{ borderColor: "var(--line-strong)" }}>
      <div className="flex gap-1 border-b p-1.5" style={{ borderColor: "var(--line)" }}>
        {BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            aria-label={btn.name}
            aria-pressed={btn.isActive(editor)}
            title={btn.name}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => btn.command(editor)}
            className="flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium"
            style={{
              background: btn.isActive(editor) ? "var(--fg)" : "transparent",
              color: btn.isActive(editor) ? "var(--bg)" : "var(--fg)",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} style={{ borderColor: "var(--line-strong)" }} />
    </div>
  );
}
