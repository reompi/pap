// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://localhost:7187/api/Users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data); // Assuming your API returns a list of users
    } catch (error) {
      setError("Failed to fetch users.");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmed = window.confirm(
      "Tem a certeza que quer apagar esta anotação?"
    );
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://localhost:7187/api/Users/${userId}`, {
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
const handleUserAdmin = async (userId: number) => {
  const confirmed = window.confirm(
    "Tem a certeza que quer tornar este utilizador administrador?"
  );
  if (!confirmed) return;
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `https://localhost:7187/api/Users/${userId}/makeAdmin`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Optionally, you can refetch users or update the state to reflect the change
    fetchUsers();
  } catch (error) {
    setError("Failed to make user an admin.");
    console.error(error);
  }}

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
       {/* Menu */}
      <nav className="mb-4 flex space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">
          Voltar
        </Link>
        <Link
          to="/admin/utilizadores"
          className="text-blue-900 hover:underline"
        >
          Utilizadores
        </Link>
        <Link to="/admin/anotacoes" className="text-blue-600 hover:underline">
          Anotações
        </Link>
      </nav>
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
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                {user.role === "admin" ? (
                  <span className="font-semibold text-green-700">{user.role}</span>
                ) : (
                  <button
                    onClick={() => handleUserAdmin(user.id)}
                    className="text-black-600 underline hover:text-blue-800"
                  >
                    {user.role}
                  </button>
                )}
              </td>
              <td className="border px-4 py-2">
                {user.role !== "admin" && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 underline hover:text-red-800"
                  >
                    Apagar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;