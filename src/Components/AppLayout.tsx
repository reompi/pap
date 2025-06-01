import React, { useEffect, useState, useRef } from "react";
import { FaHome, FaFolderOpen, FaSignOutAlt, FaUserTie } from "react-icons/fa";
import { Link } from "react-router-dom";
import FileTree from "./FileTree";

interface SidebarProps {
  isFileTreeOpen: boolean;
  toggleFileTree: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isFileTreeOpen,
  toggleFileTree,
}) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const homeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Check if user is admin (assuming token has role info or fetch user info)
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // If your token is a JWT and contains the role, decode it here
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.Role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);
  const handleLogout = () => {
    const isConfirmed = window.confirm("Tem a certeza que quer sair da conta?");

    if (isConfirmed) {
      // Clear the token from localStorage or cookie
      localStorage.removeItem("token");

      window.location.href = "http://localhost:5173";
    }
  };
  return (
    <div className="flex h-full">
      <div
        id="sidebar-mini"
        className="top-0 start-0 bottom-0 z-[60] w-20 border-e border-gray-200 flex-shrink-0"
      >
        <div className="mt-5 flex flex-col justify-center items-center gap-y-2 py-4">
          <div className="hs-tooltip [--placement:right] inline-block ">
            <Link
              ref={homeRef}
              to="/feed"
              className="hover:bg-[#88C0D0] hs-tooltip-toggle w-[2.375rem] h-[2.375rem] inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover:text-[#88C0D0]"
            >
              <FaHome size={17} color="#4C566A" /> {/* Darker color */}
              <span
                className="hover:text-[#88C0D0] hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 inline-block absolute invisible z-20 py-1.5 px-2.5 text-xs text-white rounded-lg whitespace-nowrap"
                role="tooltip"
              >
                Home
              </span>
            </Link>
          </div>

          <div className="hs-tooltip [--placement:right] inline-block">
            <div
              onClick={toggleFileTree}
              className={`cursor-pointer hs-tooltip-toggle w-[2.375rem] h-[2.375rem] inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 ${
                isFileTreeOpen ? "bg-[#a1e3f6]" : "hover:bg-[#88C0D0]"
              }`}
            >
              <FaFolderOpen size={17} color="#4C566A" /> {/* Darker color */}
              <span
                className={`hover:text-[#88C0D0] hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 inline-block absolute z-20 py-1.5 px-2.5 text-xs text-white rounded-lg whitespace-nowrap bg-gray-900`}
                role="tooltip"
              >
                File Tree
              </span>
            </div>
          </div>
          {/* Admin Notes Button */}
          {isAdmin && (
            <div className="hs-tooltip [--placement:right] inline-block">
              <Link
                to="/admin/utilizadores"
                className="hover:bg-[#88C0D0] hs-tooltip-toggle w-[2.375rem] h-[2.375rem] inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover:text-[#88C0D0]"
              >
                <FaUserTie size={17} color="#4C566A" /> {/* Darker color */}
                <span
                className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 inline-block absolute z-20 py-1.5 px-2.5 text-xs text-white rounded-lg whitespace-nowrap bg-gray-900"
                role="tooltip"
                >
                  Anotações Admin
                </span>
              </Link>
            </div>
          )}
        </div>
        {/* Logout Icon at the bottom of the sidebar */}
        <div className="mb-5 flex justify-center">
          <div className="hs-tooltip [--placement:right] inline-block">
            <button
              onClick={handleLogout}
              className="hs-tooltip-toggle w-[2.375rem] h-[2.375rem] inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover:bg-[#FF5F56]"
            >
              <FaSignOutAlt size={17} color="#D08770" /> {/* Logout icon */}
              <span
                className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 inline-block absolute z-20 py-1.5 px-2.5 text-xs text-white rounded-lg whitespace-nowrap bg-gray-900"
                role="tooltip"
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* File Tree Sidebar */}
      {isFileTreeOpen && (
        <div
          id="file-tree-sidebar"
          className={`top-0 bottom-0 z-[60] w-60 border-e border-gray-200 transition-transform transform translate-x-0 `}
        >
          <FileTree />
        </div>
      )}
    </div>
  );
};
