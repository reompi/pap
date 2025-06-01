import React, { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Heading from "@tiptap/extension-heading";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontSize from "./FontSize";
import BubbleMenuComponent from "./BubbleMenu";
import SaveBtt from "./SaveBtt";
import FontFamily from "./FontFamily";
import axios from "axios";
import HandlePasteImage from "./HandlePasteImage";
import Image from "@tiptap/extension-image";
import { useParams } from "react-router-dom"; // For dynamic routing

const TiptapEditor: React.FC = () => {
  const extractIds = (rawId: string) => {
    // Extract digits after "n" for the note ID
    const noteIdMatch = rawId.match(/n(\d+)/);

    const noteId = noteIdMatch ? noteIdMatch[1] : null;

    return { noteId };
  };

  const { id } = useParams<{ id: string }>(); // Get the full ID from the route (e.g., "@1n1")

  const { noteId } = id ? extractIds(id) : { noteId: null };

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastFocusedEditor, setLastFocusedEditor] = useState<
    "editorBody" | "editorHeading" | null
  >(null);

  const [isLoaded, setIsLoaded] = useState(false);

  const token = localStorage.getItem("token");
  if (!token) {
    setError("User not authenticated. Please log in.");
    return;
  }

  const editorHeading = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1],
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onFocus: () => setLastFocusedEditor("editorHeading"),
  });

  const editorBody = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontFamily,
      TextStyle,
      FontSize,
      Color.configure({ types: ["textStyle"] }),
      Image as any,
      HandlePasteImage,
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onFocus: () => setLastFocusedEditor("editorBody"),
  });

  // Fetch the existing note when the component mounts
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7187/api/notes/${noteId}`
        );
        const { heading, body } = response.data;

        editorHeading?.commands.setContent(heading);
        editorBody?.commands.setContent(body);
        setIsLoaded(true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Server responded with:", error.response?.data);
        }
      }
    };

    if (noteId) {
      fetchNote();
    }
  }, [noteId, editorHeading, editorBody]);

  const handleRedo = () => {
    if (lastFocusedEditor === "editorBody") {
      editorBody?.chain().focus().redo().run();
    } else if (lastFocusedEditor === "editorHeading") {
      editorHeading?.chain().focus().redo().run();
    }
  };

  const handleSave = async () => {
    try {
      const headingContent = editorHeading?.getText();
      const bodyContent = editorBody?.getJSON();
      const token = localStorage.getItem("token");

      // Check if the user is logged in
      if (!token) {
        setError("You must be logged in to save notes.");
        setTimeout(() => setError(""), 4000);
        return;
      }

      // Prepare POST payload without noteId
      const postPayload = {
        Heading: headingContent || {},
        Body: bodyContent || {},
      };

      // Prepare PUT payload including noteId
      const putPayload = {
        Id: noteId,
        Heading: headingContent || {},
        Body: bodyContent || {},
      };

      // Check if the note belongs to the current user
      let isUserNote = false;
      if (noteId) {
        try {
          await axios.get(
            `https://localhost:7187/api/notes/checkOwnership/${noteId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          isUserNote = true; // If this passes, the note belongs to the user
        } catch (err) {
          console.warn(
            "Note does not belong to the current user, will create a new note.",
            err
          );
          // If error, either note doesn't exist or belongs to another user
          isUserNote = false;
        }
      }

      // If the note does not belong to the user or doesn't exist, POST to create a new note
      if (!isUserNote) {
        await axios.post("https://localhost:7187/api/notes", postPayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Note created successfully!");
      } else {
        // If the note belongs to the user, perform a PUT to update it
        const customId = `n${noteId}`; // Use custom ID format

        await axios.put(
          `https://localhost:7187/api/notes/${customId}`,
          putPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess("Note updated successfully!");
      }

      setError("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (error) {
      console.error("Error saving note:", error);
      setError("Falha ao guardar!");
      setSuccess("");
      setTimeout(() => setError(""), 4000);
    }
  };

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="container p-4 mx-auto mt-6 border rounded-lg">
      <div className="flex justify-between p-4">
        <div className="flex">
          {error && (
            <p className="bg-red-100 text-red-600 p-2 mb-4 rounded border border-red-300">
              {error}
            </p>
          )}
          {success && (
            <p className="bg-green-100 text-green-600 p-2 mb-4 rounded border border-green-300">
              {success}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <div className="mr-5 ml-10 mt-1 flex">
            <button
              className="mr-2"
              onClick={() => {
                if (lastFocusedEditor === "editorBody") {
                  editorBody?.chain().focus().undo().run();
                } else if (lastFocusedEditor === "editorHeading") {
                  editorHeading?.chain().focus().undo().run();
                }
              }}
            >
              <IoIosArrowBack size={22} />
            </button>
            <button onClick={handleRedo}>
              <IoIosArrowForward size={22} />
            </button>
          </div>
          <button onClick={handleSave}>
            <SaveBtt />
          </button>
        </div>
      </div>

      <div
        className="relative p-2 border overflow-hidden mb-3"
        onClick={() => editorHeading?.commands.focus()}
      >
        <EditorContent editor={editorHeading} className="" />
      </div>
      <div
        className="relative p-4 border rounded-lg"
        onClick={() => editorBody?.commands.focus()}
      >
        {editorBody && <BubbleMenuComponent editor={editorBody} />}
        <EditorContent editor={editorBody} className="prose max-w-none" />
      </div>
    </div>
  );
};

export default TiptapEditor;
