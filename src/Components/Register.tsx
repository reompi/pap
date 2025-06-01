import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password || !email) {
      setError("All fields are required.");
      return;
    }

    try {
      await axios.post("https://localhost:7187/api/users", {
        Username: username,
        Password: password,
        Email: email,
        Bio: "",
        FullName: "",
        ProfilePictureData: "",
      });
      setSuccess("Utilizador registado com successo!");
    } catch (error) {
      console.log("Error registering user:", error);
      setError(
        "Falha ao registar utilizador, nome de utilizador ou email já em uso."
      );
    }
  };

  return (
    <section className="flex items-center justify-center h-screen overflow-auto bg-gray-200 bg-gradient-to-r from-gray-200 to-transparent via-[1px] bg-[size:6rem_4rem]">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <Link
          to="/"
          className="absolute top-6 right-6 text-gray-600 hover:text-gray-900"
        >
          <IoReturnUpBackOutline size={24} />
        </Link>
        <h2 className="text-2xl mb-6 text-center font-bold text-gray-900">
          Registar
        </h2>
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
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="username">
            Nome de utilizador
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={50}
            required
            className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-800"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={100}
            required
            className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-800"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Palavra passe
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={255}
            required
            className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-800"
          />
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 accent-gray-700 rounded cursor-pointer"
            />
            <span className="ml-2 text-sm text-gray-700">
              Mostrar palavra passe
            </span>
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 w-full py-2 bg-[#FF6F61] text-white font-semibold rounded hover:bg-[#e55a50]"
        >
          Registar
        </button>
        <Link
          to="/login"
          className="block text-sm font-medium mt-3 text-left text-gray-600 hover:text-gray-900"
        >
          Já tem conta? Inicie sessão.
        </Link>
      </form>
    </section>
  );
};

export default RegisterForm;
