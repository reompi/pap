// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchUsers();
    fetchNotes();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://apiptpgapi.azure-api.net/api/Users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Ocp-Apim-Subscription-Key":
              process.env.REACT_APP_APIM_SUBSCRIPTION_KEY,
          },
        }
      );
      setUsers(response.data); // Assuming your API returns a list of users
    } catch (error) {
      setError("Failed to fetch users.");
      console.error(error);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5045/api/Notes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check the structure of the response
      console.log(response.data);

      // Access the notes array from the response object
      const notesData = response.data.notes.map((note: any) => ({
        id: note.id,
        heading: note.heading,
        userId: note.userId, // Ensure that note.user is defined
        createdAt: note.createdAt,
      }));

      setNotes(notesData);
    } catch (error) {
      setError("Error fetching notes.");
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5045/api/Users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user.id !== userId)); // Remove deleted user from state
    } catch (error) {
      setError("Failed to delete user.");
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5045/api/Notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(notes.filter((note) => note.id !== noteId)); // Remove deleted note from state
    } catch (error) {
      setError("Failed to delete note.");
      console.error(error);
    }
  };

  // Filter out admin users
  const filteredUsers = users.filter((user) => user.role !== "admin");

  return (
    <div className="container mx-auto p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {error && (
        <p className="bg-red-100 text-red-600 p-2 mb-4 rounded border border-red-300">
          {error}
        </p>
      )}
      <Link to="/" className="text-blue-600 hover:underline mb-4 block">
        Voltar
      </Link>

      <h2 className="text-xl font-semibold mb-2">Gestão de utilizador</h2>
      <table className="min-w-full bg-white border border-gray-300 mb-8">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Cargo</th>
            <th className="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:underline"
                >
                  Apagar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Gestão de anotações</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Titulo</th>
            <th className="border px-4 py-2">User ID</th>
            <th className="border px-4 py-2">Criado a</th>
            <th className="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note.id}>
              <td className="border px-4 py-2">{note.id}</td>
              <td className="border px-4 py-2">{note.heading}</td>
              <td className="border px-4 py-2">{note.userId}</td>
              <td className="border px-4 py-2">
                {new Date(note.createdAt).toLocaleString()}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:underline"
                >
                  Apagar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
