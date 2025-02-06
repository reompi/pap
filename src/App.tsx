import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Components/Login";
import RegisterForm from "./Components/Register";
import Hero from "./Components/Hero";
import Feed from "./Components/Feed";
import { Sidebar } from "./Components/AppLayout";
import Editor from "./Components/TipTap/TipTap";
import "./assets/index.css";
import AdminPage from "./Components/Admin/AdminPage";

const App: React.FC = () => {
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);

  const toggleFileTree = () => {
    setIsFileTreeOpen(!isFileTreeOpen);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/note/:id"
          element={
            <div className="flex h-screen bg-gray-100">
              <Sidebar
                isFileTreeOpen={isFileTreeOpen}
                toggleFileTree={toggleFileTree}
              />
              <div className="container mx-auto p-4 overflow-x-auto max-w-full">
                <Editor />
              </div>
            </div>
          }
        />
        <Route
          path="/adminpage"
          element={
            <div className="flex h-screen container mx-auto p-4 overflow-x-auto max-w-full bg-gray-100">
              <AdminPage />
            </div>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<Hero />} />
        <Route
          path="/feed"
          element={
            <div className="flex h-screen bg-gray-100">
              <Sidebar
                isFileTreeOpen={isFileTreeOpen}
                toggleFileTree={toggleFileTree}
              />
              <div className="container mx-auto p-4 overflow-x-auto max-w-full bg-gray-100">
                <Feed />
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
