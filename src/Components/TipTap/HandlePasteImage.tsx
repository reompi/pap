import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

const HandleImagePaste = Extension.create({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const items = event.clipboardData?.items;

            if (items) {
              for (const item of items) {
                if (item.type.indexOf("image") !== -1) {
                  const file = item.getAsFile();
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (readerEvent) => {
                      const node = view.state.schema.nodes.image.create({
                        src: readerEvent.target?.result,
                      });
                      const transaction =
                        view.state.tr.replaceSelectionWith(node);
                      view.dispatch(transaction);
                    };
                    reader.readAsDataURL(file);
                    return true; // Prevent default paste behavior
                  }
                }
              }
            }
            return false; // Proceed with default behavior if not an image
          },
        },
      }),
    ];
  },
});

export default HandleImagePaste;
