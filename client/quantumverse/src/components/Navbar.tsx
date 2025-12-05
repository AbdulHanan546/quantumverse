import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  // Generate initials for avatar
  const initials = user?.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U";

  return (
    <nav className="w-full bg-gray-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-green-400">
        Quantum Verse
      </Link>

      {user && (
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-black font-bold">
            {initials}
          </div>
          {/* User Name/Email */}
          <span className="text-gray-200 text-sm font-medium">{user.email}</span>
        </div>
      )}
    </nav>
  );
}
