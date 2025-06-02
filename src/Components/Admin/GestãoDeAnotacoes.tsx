import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const GestaoDeAnotacoes: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://localhost:7187/api/Notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prevNotes) => [...prevNotes, ...response.data.notes]);
    } catch (error) {
      setError("Erro ao buscar anotações.");
    }
  };
  const handleDeleteNote = async (noteId: number) => {
    const confirmed = window.confirm(
      "Tem a certeza que quer apagar esta anotação?"
    );
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://localhost:7187/api/Notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(notes.filter((note) => note.id !== noteId)); // Remove deleted note from state
    } catch (error) {
      setError("Falha ao apagar.");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {error && (
        <p className="bg-red-100 text-red-600 p-2 mb-4 rounded border border-red-300">
          {error}
        </p>
      )}
      {/* Menu */}
      <div className="mb-4">
        <nav className="flex space-x-4">
          <Link to="/" className="text-blue-600 hover:underline">
            Voltar
          </Link>
          <Link
            to="/admin/utilizadores"
            className="text-blue-600 hover:underline"
          >
            Utilizadores
          </Link>
          <Link to="/admin/anotacoes" className="text-blue-900 hover:underline">
            Anotações
          </Link>
          <Link to="/feed" className="text-blue-600 hover:underline">
            App
          </Link>
        </nav>
      </div>
      <h2 className="text-xl font-semibold mb-2">Gestão de anotações</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Título</th>
            <th className="border px-4 py-2">User ID</th>
            <th className="border px-4 py-2">Criado em</th>
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
                  className="text-red-600 underline hover:text-red-800"
                >
                  Apagar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-10"></div>
    </div>
  );
};

export default GestaoDeAnotacoes;
