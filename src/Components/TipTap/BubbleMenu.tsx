import { BubbleMenu } from "@tiptap/react";
import React from "react";
import { Editor } from "@tiptap/react";

const BubbleMenuComponent: React.FC<{ editor: Editor }> = ({ editor }) => {
  if (!editor) return null;

  // Function to handle click events and prevent bubble up
  const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
    e.stopPropagation();
  };

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <div className="flex flex-wrap justify-start gap-1 w-full px-2">
        {/* Text Size */}
        <select
          onClick={handleSelectClick}
          onChange={(e) =>
            editor.chain().focus().setFontSize(e.target.value).run()
          }
          className="p-1 rounded-md bg-gray-200 cursor-pointer text-xs"
          title="Text Size"
        >
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
        </select>

        {/* Font Family */}
        <select
          onClick={handleSelectClick}
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
          className="p-1 rounded-md bg-gray-200 cursor-pointer text-xs"
          title="Font Family"
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Text Alignment */}
        <select
          onClick={handleSelectClick}
          onChange={(e) =>
            editor.chain().focus().setTextAlign(e.target.value).run()
          }
          className="p-1 rounded-md bg-gray-200 cursor-pointer text-xs"
          title="Text Alignment"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>

        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded-md text-xs ${
            editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          title="Bold"
        >
          Bold
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded-md text-xs ${
            editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          title="Italic"
        >
          Italic
        </button>

        {/* Strike */}
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 rounded-md text-xs ${
            editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          title="Strike"
        >
          Strike
        </button>

        {/* Code Block */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1 rounded-md text-xs ${
            editor.isActive("codeBlock")
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          title="Code Block"
        >
          Code Block
        </button>

        {/* Blockquote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1 rounded-md text-xs ${
            editor.isActive("blockquote")
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          title="Blockquote"
        >
          Blockquote
        </button>

        {/* Bullet List */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded-md text-xs ${
            editor.isActive("bulletList")
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          title="Bullet List"
        >
          Bullet List
        </button>

        {/* Numbered List */}
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded-md text-xs ${
            editor.isActive("orderedList")
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          title="Numbered List"
        >
          Numbered List
        </button>

        {/* Text Color */}
        <input
          type="color"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          className="bg-gray-200 p-1 rounded-md text-xs color-input-circle"
          title="Text Color"
        />
      </div>
    </BubbleMenu>
  );
};

export default BubbleMenuComponent;
