import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasMore = useRef(true); // Keep track of whether there are more users to load

  const fetchUsers = useCallback(async () => {
    if (!hasMore.current || loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5045/api/Users?page=${page}&pageSize=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.length === 0) {
        hasMore.current = false; // No more users to load
      } else {
        setUsers((prevUsers) => [...prevUsers, ...response.data]); // Append new users
        setPage((prevPage) => prevPage + 1); // Increment page
      }
    } catch (error) {
      setError("Failed to fetch users.");
      console.error(error);
    }
    setLoading(false);
  }, [page, loading]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore.current) {
          fetchUsers();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, fetchUsers]
  );

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5045/api/Users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      setError("Failed to delete user.");
      console.error(error);
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
          {users.map((user, index) => (
            <tr
              key={user.id}
              ref={index === users.length - 1 ? lastUserRef : null}
            >
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

      {loading && <p className="text-center">Carregando...</p>}
    </div>
  );
};

export default AdminPage;
