import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import EditorRenderer from "./TipTap/EditorRenderer";
import { useNavigate } from "react-router-dom";

interface Note {
  id: number;
  heading: string;
  body: any;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  isLiked: boolean;
  isDisliked: boolean;
  userId: number;
  username?: string;
}

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("mostRecent");
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query state
  const token = localStorage.getItem("token");
  const [overflowingNotes, setOverflowingNotes] = useState<Set<number>>(
    new Set()
  ); // Track notes that overflow

  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({}); // Ref to store content divs

  if (!token) {
    setError("User not authenticated. Please log in.");
    return null;
  }

  const handleNoteDoubleClick = (note: Note) => {
    const noteId = note.id;
    const noteUrl = `/note/n${noteId}`;
    navigate(noteUrl);
  };

  const handleLike = async (
    noteId: number,
    isLiked: boolean,
    isDisliked: boolean
  ) => {
    try {
      await axios.post(
        `https://localhost:7187/api/notes/${noteId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                likesCount: isLiked ? note.likesCount - 1 : note.likesCount + 1,
                dislikesCount: isDisliked
                  ? note.dislikesCount - 1
                  : note.dislikesCount,
                isLiked: !isLiked,
                isDisliked: isDisliked && !isLiked ? false : note.isDisliked,
              }
            : note
        )
      );
    } catch (error) {
      setError("Error updating the like status.");
    }
  };

  const handleDislike = async (
    noteId: number,
    isDisliked: boolean,
    isLiked: boolean
  ) => {
    try {
      await axios.post(
        `https://localhost:7187/api/notes/${noteId}/dislike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                dislikesCount: isDisliked
                  ? note.dislikesCount - 1
                  : note.dislikesCount + 1,
                likesCount: isLiked ? note.likesCount - 1 : note.likesCount,
                isDisliked: !isDisliked,
                isLiked: isLiked && !isDisliked ? false : note.isLiked,
              }
            : note
        )
      );
    } catch (error) {
      setError("Error updating the dislike status.");
    }
  };

  // Fetch notes with an optional search query
  const fetchNotes = async (query = "") => {
    try {
      const response = await axios.get(
        `https://localhost:7187/api/Notes/feed?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Fetch usernames for each note
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        setNotes([]);
        return;
      }
      const notesData = await Promise.all(
        response.data.map(async (note: any) => {
          console.log("Note:", note);
          let userId = note.userId; // Default to 0 
          let username = "";
          try {
            const userRes = await axios.get(
              `https://localhost:7187/api/users/${userId}/username`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            username = userRes.data;
          } catch {
            username = "Desconhecido";
          }
          return {
            id: note.id,
            heading: note.heading,
            body: note.body,
            likesCount: note.likesCount,
            dislikesCount: note.dislikesCount,
            createdAt: note.createdAt,
            isLiked: note.isLiked || false,
            isDisliked: note.isDisliked || false,
            userId: userId, // Garante que userId está sempre presente
            username,
          };
        })
      );
      setNotes(notesData);
    } catch (error) {
      setError("Error fetching notes.");
    }
  };

  // Trigger search when "Search" button is clicked
  const handleSearch = () => {
    fetchNotes(searchQuery); // Fetch notes based on search query
  };

  // Trigger search when "Enter" key is pressed
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(); // Call the search when Enter is pressed
    }
  };

  useEffect(() => {
    fetchNotes(); // Fetch all notes on initial load
  }, []);

  const sortNotes = (notes: Note[]) => {
    switch (sortOption) {
      case "mostLikes":
        return [...notes].sort((a, b) => {
          const netLikesA = a.likesCount - a.dislikesCount;
          const netLikesB = b.likesCount - b.dislikesCount;

          // Compare net likes first
          if (netLikesB !== netLikesA) {
            return netLikesB - netLikesA; // Sort by net likes descending
          }

          // If net likes are the same, sort by likes count descending
          return b.likesCount - a.likesCount;
        });

      case "leastLikes":
        return [...notes].sort((a, b) => {
          const netLikesA = a.likesCount - a.dislikesCount;
          const netLikesB = b.likesCount - b.dislikesCount;

          // Compare net likes first
          if (netLikesA !== netLikesB) {
            return netLikesA - netLikesB; // Sort by net likes ascending
          }

          // If net likes are the same, sort by likes count ascending
          return a.likesCount - b.likesCount;
        });

      case "mostRecent":
        return [...notes].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case "leastRecent":
        return [...notes].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      default:
        return notes;
    }
  };
  const checkOverflow = (noteId: number) => {
    const contentElement = contentRefs.current[noteId];
    if (contentElement) {
      const isOverflowing =
        contentElement.scrollHeight > contentElement.clientHeight;
      setOverflowingNotes((prev) => {
        const updated = new Set(prev);
        if (isOverflowing) {
          updated.add(noteId);
        } else {
          updated.delete(noteId);
        }
        return updated;
      });
    }
  };
  useEffect(() => {
    notes.forEach((note) => {
      checkOverflow(note.id);
    });
  }, [notes]);
  return (
    <div className="container mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4">Feed de Anotações</h1>

      {/* Search Bar */}
      <div className="flex items-center mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress} // Call handleKeyPress when the Enter key is pressed
          placeholder="Pesquise anotações pelo titulo ou corpo..."
          className="px-4 py-2 border rounded w-full"
        />
        <button
          onClick={handleSearch} // Call handleSearch when the button is clicked
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded"
        >
          Pesquisar
        </button>
      </div>

      {/* Sort Dropdown */}
      <div className="mb-6">
        <label className="mr-4 font-bold">Ordenar por:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="mostRecent">Mais Recente</option>
          <option value="leastRecent">Menos Recente</option>
          <option value="mostLikes">Mais Gostos</option>
          <option value="leastLikes">Menos Gostos</option>
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {notes.length > 0 ? (
        sortNotes(notes).map((note) => (
          <div
            key={note.id}
            className="mb-6 p-4 border rounded shadow-sm"
            onDoubleClick={() => handleNoteDoubleClick(note)}
          >
            <h2 className="text-xl font-bold">{note.heading}</h2>
            <p className="text-sm text-gray-500 mb-1">
              Por: {note.username || "Desconhecido"}
            </p>
            <div
              ref={(el) => (contentRefs.current[note.id] = el)} // Set ref for each note
              className="relative overflow-hidden transition-all duration-300 max-h-32"
            >
              <EditorRenderer content={note.body} />
              {overflowingNotes.has(note.id) && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-300 to-transparent flex items-center justify-center pointer-events-none">
                  ...
                </div>
              )}
            </div>

            <div className="flex items-center mt-4">
              <button
                onClick={() =>
                  handleLike(note.id, note.isLiked, note.isDisliked)
                }
                className={`mr-4 text-blue-500 px-6 py-2 rounded-full ${
                  note.isLiked ? "bg-sky-600 text-white" : ""
                }`}
              >
                👍 Gosto {note.likesCount}
              </button>
              <button
                onClick={() =>
                  handleDislike(note.id, note.isDisliked, note.isLiked)
                }
                className={`mr-4 text-blue-500 px-6 py-2 rounded-full ${
                  note.isDisliked ? "bg-red-600 text-white" : ""
                }`}
              >
                👎 Disgosto {note.dislikesCount}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Nenhuma encontrada.</p>
      )}
    </div>
  );
};

export default Feed;
