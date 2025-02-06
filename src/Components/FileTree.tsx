import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
interface NotesApiResponse {
  notes: Note[]; // Adjusting to reflect the response structure
}

interface Note {
  id: number;
  heading: string;
  folderId?: number;
  private: boolean;
}

interface Folder {
  folderId: number;
  name: string;
  parentFolderId?: number | null;
  notes?: Note[];
  childFolders?: Folder[];
}

interface ApiResponse {
  folders: Folder[];
  noFolderNotes: Note[];
}

const FileTree: React.FC = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [noFolderNotes, setNoFolderNotes] = useState<Note[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<Note | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [error, setError] = useState<string>("");

  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean>(false);

  const [newNoteHeading, setNewNoteHeading] = useState<string>("");
  const [showNewNoteInput, setShowNewNoteInput] = useState<boolean>(false);

  const componentRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");
  if (!token) {
    setError("User not authenticated. Please log in.");
    return;
  }
  // Function to fetch folders and notes (reusable)
  const fetchFoldersAndNotes = async () => {
    try {
      const folderResponse = await axios.get<ApiResponse>(
        "http://localhost:5045/api/folders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("folderResponse :", folderResponse.data); // Log the response

      // Accessing the notes array from the response object
      const notesResponse = await axios.get<NotesApiResponse>(
        "http://localhost:5045/api/notes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Notes Response:", notesResponse.data); // Log the response

      const nestedFolders = nestFolders(
        folderResponse.data.folders || [],
        notesResponse.data.notes || [] // Accessing the notes array here
      );

      setFolders(nestedFolders);
      setNoFolderNotes(
        notesResponse.data.notes.filter((note) => !note.folderId)
      );
      setError("");
    } catch (err) {
      setError("Failed to load folders and notes");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoldersAndNotes();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        setSelectedItem(null);
        setSelectedFolder(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleFolder = (folderId: number) => {
    const folder = findFolderById(folders, folderId); // Helper function to find the folder in the hierarchy
    if (!folder) return;

    const getAllDescendantFolderIds = (folder: Folder): number[] => {
      let folderIds: number[] = [folder.folderId]; // Include the current folder
      if (folder.childFolders && folder.childFolders.length > 0) {
        folder.childFolders.forEach((childFolder) => {
          folderIds = folderIds.concat(getAllDescendantFolderIds(childFolder)); // Recursively add child folder IDs
        });
      }
      return folderIds;
    };

    const descendantFolderIds = getAllDescendantFolderIds(folder);

    setExpandedFolders((prevExpanded) => {
      const isExpanded = prevExpanded.includes(folderId);
      if (isExpanded) {
        // Collapse the folder and all its descendants
        return prevExpanded.filter((id) => !descendantFolderIds.includes(id));
      } else {
        // Expand the folder and all its descendants
        return [...prevExpanded, ...descendantFolderIds];
      }
    });
  };

  const nestFolders = (folders: Folder[], notes: Note[]): Folder[] => {
    const folderMap: { [key: number]: Folder } = {};
    const nestedFolders: Folder[] = [];

    folders.forEach((folder) => {
      folderMap[folder.folderId] = { ...folder, childFolders: [], notes: [] };
    });

    notes.forEach((note) => {
      if (note.folderId !== undefined && folderMap[note.folderId]) {
        folderMap[note.folderId].notes?.push(note);
      }
    });

    folders.forEach((folder) => {
      if (folder.parentFolderId) {
        if (folderMap[folder.parentFolderId]) {
          folderMap[folder.parentFolderId].childFolders?.push(
            folderMap[folder.folderId]
          );
        }
      } else {
        nestedFolders.push(folderMap[folder.folderId]);
      }
    });

    return nestedFolders;
  };

  const handleSelectItem = (item: Note | Folder, isFolder = false) => {
    if (isFolder) {
      setSelectedFolder(item as Folder); // Cast item to Folder
      setSelectedItem(null);
    } else {
      setSelectedItem(item as Note); // Cast item to Note
      setSelectedFolder(null);
    }
  };

  const handleCreateNote = async () => {
    if (newNoteHeading.trim() === "") return;

    try {
      let folderId: number | null = null;
      if (selectedFolder !== null) {
        folderId = selectedFolder.folderId;
      } else if (selectedItem !== null) {
        const containingFolder = folders.find((folder) =>
          folder.notes?.some((note) => note === selectedItem)
        );
        if (containingFolder) folderId = containingFolder.folderId;
      }

      const payload = {
        heading: newNoteHeading,
        body: {},
        folderId: folderId,
      };

      const response = await axios.post(
        "http://localhost:5045/api/notes",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewNoteHeading("");
      setShowNewNoteInput(false);

      // Refetch folders and notes after creating a note
      await fetchFoldersAndNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      setError("Failed to create the note.");
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim() === "") return;

    let parentFolderId: number | null = null;

    if (selectedFolder !== null) {
      parentFolderId = selectedFolder.folderId;
    } else if (selectedItem !== null) {
      const containingFolder = folders.find((folder) =>
        folder.notes?.some((note) => note === selectedItem)
      );
      if (containingFolder) {
        parentFolderId = containingFolder.folderId;
      }
    }

    try {
      await axios.post(
        "http://localhost:5045/api/folders",
        {
          name: newFolderName,
          parentFolderId: parentFolderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );

      setNewFolderName("");
      setShowNewFolderInput(false);

      // Refetch folders and notes after creating a folder
      await fetchFoldersAndNotes();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteItem = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    try {
      if (selectedFolder !== null) {
        await axios.delete(
          `http://localhost:5045/api/folders/${selectedFolder.folderId}`
        );
        setSelectedFolder(null);
      } else if (selectedItem !== null) {
        await axios.delete(
          `http://localhost:5045/api/notes/${selectedItem.id}`
        );
        setSelectedItem(null);
      }

      // Refetch folders and notes after deleting an item
      await fetchFoldersAndNotes();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleNoteDoubleClick = (note: Note) => {
    const noteId = note.id;
    const noteUrl = `/note/n${noteId}`;

    navigate(noteUrl);
  };

  const handleDragStart = (e: React.DragEvent, item: Note | Folder) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Prevent default to allow drop
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetFolder: Folder | null
  ) => {
    e.preventDefault();
    const draggedItem = JSON.parse(e.dataTransfer.getData("item"));
    if (!draggedItem) return; // Make sure there's a dragged item

    if ("parentFolderId" in draggedItem) {
      // If the dragged item is a folder
      if (
        draggedItem.folderId &&
        targetFolder &&
        (draggedItem.folderId === targetFolder.folderId ||
          isDescendant(draggedItem.folderId, targetFolder, folders))
      ) {
        alert("Cannot move a folder into itself or its own hierarchy.");
        return;
      } else {
        // Safely handle the case where `targetFolder` is null
        const targetFolderId = targetFolder ? targetFolder.folderId : null;
        await updateFolderParent(draggedItem.folderId, targetFolderId);
      }
    } else {
      // The dragged item is a note
      const targetFolderId = targetFolder ? targetFolder.folderId : null;

      // Check if the note is already in the target folder
      if (draggedItem.folderId === targetFolderId) {
        alert("Cannot move a note into the same folder.");
        return;
      }

      await updateNoteFolder(draggedItem.id, targetFolderId);
    }

    // Refetch or update state as needed after drop
    await fetchFoldersAndNotes();
  };

  const isDescendant = (
    folderId: number,
    targetFolder: Folder,
    allFolders: Folder[]
  ): boolean => {
    // Base case: If the targetFolder has no parent, it's not a descendant of any folder
    if (!targetFolder.parentFolderId) {
      return false;
    }

    // If the parentFolderId of the targetFolder matches the folderId being dragged, return true
    if (targetFolder.parentFolderId === folderId) {
      return true;
    }

    // Find the parent folder of the targetFolder
    const parentFolder = allFolders.find(
      (f) => f.folderId === targetFolder.parentFolderId
    );

    // If there's no parent folder, return false (shouldn't normally happen if hierarchy is valid)
    if (!parentFolder) {
      return false;
    }

    // Recursively check if the parentFolder is a descendant of the folder being dragged
    return isDescendant(folderId, parentFolder, allFolders);
  };

  // Function to find a folder by ID in the nested folders
  const findFolderById = (
    folderList: Folder[],
    folderId: number
  ): Folder | undefined => {
    for (const folder of folderList) {
      if (folder.folderId === folderId) {
        return folder;
      }
      const foundChild = findFolderById(folder.childFolders || [], folderId);
      if (foundChild) {
        return foundChild;
      }
    }
    return undefined;
  };
  const updateFolderParent = async (
    folderId: number,
    parentFolderId: number | null
  ) => {
    try {
      await axios.put(
        `http://localhost:5045/api/folders/${folderId}`,
        {
          parentFolderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating folder parent:", error);
    }
  };

  const updateNoteFolder = async (noteId: number, folderId: number | null) => {
    try {
      await axios.put(
        `http://localhost:5045/api/notes/f${noteId}`,
        {
          folderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating note folder:", error);
    }
  };

  const getAllFolderIds = (folderList: Folder[]): number[] => {
    let folderIds: number[] = [];
    folderList.forEach((folder) => {
      folderIds.push(folder.folderId); // Add current folder ID
      if (folder.childFolders && folder.childFolders.length > 0) {
        folderIds = folderIds.concat(getAllFolderIds(folder.childFolders)); // Recursively gather child folder IDs
      }
    });
    return folderIds;
  };

  // UseEffect to set expandedFolders when the component mounts
  useEffect(() => {
    const folderIds = getAllFolderIds(folders); // Assuming `folders` is your folder structure array
    setExpandedFolders(folderIds); // Set the state to include all folder IDs
  }, [folders]);

  const renderFolders = (folderList: Folder[]) => {
    return folderList.map((folder) => (
      <div key={folder.folderId} className="ml-4">
        <div
          className={`cursor-pointer flex items-center p-2 ${
            selectedFolder === folder
              ? "bg-blue-100 border border-blue-300"
              : "hover:bg-gray-100"
          }`}
          onClick={() => handleSelectItem(folder, true)}
          draggable
          onDragStart={(e) => handleDragStart(e, folder)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, folder)}
        >
          {folder.childFolders && folder.childFolders.length > 0 && (
            <button
              className="mr-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.folderId);
              }}
            >
              {expandedFolders.includes(folder.folderId) ? "➖" : "➕"}
            </button>
          )}
          <span>{expandedFolders.includes(folder.folderId) ? "📂" : "📁"}</span>
          <span className="ml-2">{folder.name}</span>
        </div>
        {expandedFolders.includes(folder.folderId) && (
          <div className="ml-4">
            {folder.notes &&
              folder.notes.map((note) => (
                <div
                  key={note.id}
                  className={`cursor-pointer flex items-center p-2 ${
                    selectedItem === note
                      ? "bg-blue-100 border border-blue-300"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectItem(note)}
                  onDoubleClick={() => handleNoteDoubleClick(note)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, note)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, folder)}
                >
                  <span>📝</span>
                  <span className="ml-2">{note.heading}</span>
                </div>
              ))}
            {renderFolders(folder.childFolders || [])}
          </div>
        )}
      </div>
    ));
  };
  const handlePrivacy = async (note: Note) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log("Updating privacy status for note:", note.id);
      const response = await axios.put(
        `http://localhost:5045/api/notes/${note.id}/privacy`,
        {},
        config
      );
      // You may want to update the note's privacy state locally here, if necessary
      note.private = response.data.private; // Assuming the response includes the updated privacy status
      await fetchFoldersAndNotes();
    } catch (error) {
      console.error("Error updating privacy status", error);
    }
  };

  return (
    <div
      ref={componentRef}
      className="p-4 h-full w-full overflow-y-scroll relative"
    >
      <div className="flex justify-between items-center mb-4">
        <button
          className={`py-2 px-4 rounded flex items-center ${
            selectedItem ? "visible" : "invisible"
          } ${
            selectedItem?.private // Use optional chaining here
              ? "bg-red-400 text-white"
              : "bg-blue-900 text-white"
          }`}
          onClick={() => {
            if (selectedItem) {
              console.log("Toggling privacy for note:", selectedItem.id);
              handlePrivacy(selectedItem);
            }
          }}
        >
          {selectedItem
            ? selectedItem.private
              ? "Privado"
              : "Publico"
            : "Privado"}
          {/* Change button text based on privacy status */}
        </button>

        <button
          className={`bg-red-500 text-white py-2 px-4 rounded flex items-center ${
            selectedFolder || selectedItem ? "visible" : "invisible"
          }`}
          onClick={handleDeleteItem}
        >
          <FaTrashAlt />
        </button>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* Top bar with buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => setShowNewFolderInput((prev) => !prev)}
          >
            {showNewFolderInput ? "Fechar Drawer da Pasta" : "Criar Pasta"}
          </button>

          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => setShowNewNoteInput((prev) => !prev)}
          >
            {showNewNoteInput ? "Fechar Drawer da anotação" : "Criar Anotação"}
          </button>
        </div>
      </div>

      {/* New Folder Drawer */}
      {showNewFolderInput && (
        <div className="mb-4 border p-4 rounded bg-gray-100">
          <input
            type="text"
            placeholder="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={handleCreateFolder}
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            Criar Pasta
          </button>
        </div>
      )}

      {/* New Note Drawer */}
      {showNewNoteInput && (
        <div className="mb-4 border p-4 rounded bg-gray-100">
          <input
            type="text"
            placeholder="Note Heading"
            value={newNoteHeading}
            onChange={(e) => setNewNoteHeading(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={handleCreateNote}
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            Criar Anotação
          </button>
        </div>
      )}

      {/* Folders and Notes */}
      <div>
        <h2 className="font-bold mb-4">Pastas</h2>
        {folders.length > 0 ? (
          renderFolders(folders)
        ) : (
          <div>Nenhuma pasta disponivel</div>
        )}

        <h3 className="font-bold mt-6 mb-4">Anotações sem pasta</h3>
        {noFolderNotes.length > 0 ? (
          noFolderNotes.map((note) => (
            <div
              key={note.id}
              className={`cursor-pointer flex items-center p-2 ${
                selectedItem === note
                  ? "bg-blue-100 border border-blue-300"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelectItem(note)}
              onDoubleClick={() => handleNoteDoubleClick(note)}
              draggable
              onDragStart={(e) => handleDragStart(e, note)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, null)} // Passing `null` here for "no folder"
            >
              <span>📝</span>
              <span className="ml-2">{note.heading}</span>
            </div>
          ))
        ) : (
          // Allow drop even when no notes are available
          <div
            className="p-4 border-dashed border-2 border-gray-300 text-gray-500"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)} // Allow drop into "no folder"
          ></div>
        )}
      </div>
    </div>
  );
};

export default FileTree;
