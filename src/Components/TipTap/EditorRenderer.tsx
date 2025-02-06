// EditorRenderer.tsx
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "./FontFamily";
import TextStyle from "@tiptap/extension-text-style";
import FontSize from "./FontSize";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import HandlePasteImage from "./HandlePasteImage";

interface EditorRendererProps {
  content: string;
}

const EditorRenderer: React.FC<EditorRendererProps> = ({ content }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontFamily,
      TextStyle,
      FontSize,
      Color.configure({ types: ["textStyle"] }),
      Image,
      HandlePasteImage,
    ],
    content,
    editable: false, // Disable editing
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  return <EditorContent editor={editor} />;
};

export default EditorRenderer;
