import React from "react";
import { useNavigate } from "react-router-dom";
import { FaDumbbell } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-10 border-b border-orange-500/20 bg-zinc-950/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-orange-500/20 p-2 text-orange-300">
            <FaDumbbell />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-orange-300">United Gym</p>
            <h2 className="text-xl font-semibold text-white">United Gym Management</h2>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500"
        >
        Logout
      </button>
      </div>
    </div>
  );
}

export default Navbar;