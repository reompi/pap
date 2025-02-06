import { Extension } from "@tiptap/core";
import { MarkType } from "prosemirror-model";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size of the selected text.
       */
      setFontSize: (size: string) => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
            parseHTML: (element) => ({
              fontSize: element.style.fontSize,
            }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain, editor }) => {
          const { schema } = editor;
          const markType = schema.marks.textStyle as MarkType;
          return chain().setMark(markType, { fontSize: size }).run();
        },
    };
  },
});

export default FontSize;
