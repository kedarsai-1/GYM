import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaUsers, FaUserPlus, FaDumbbell, FaFileExport } from "react-icons/fa";
import { GiMeal } from "react-icons/gi";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function Sidebar() {
  const location = useLocation();
  const menu = [
    { name: "Dashboard", icon: <MdDashboard />, path: "/" },
    { name: "Members", icon: <FaUsers />, path: "/members" },
    { name: "Add Member", icon: <FaUserPlus />, path: "/add-member" },
    { name: "Diet Plan", icon: <GiMeal />, path: "/diet" },
    { name: "Workout", icon: <FaDumbbell />, path: "/workout" },
    { name: "Export", icon: <FaFileExport />, path: "/export" },
  ];

  return (
    <div className="sticky top-0 min-h-screen w-64 self-start border-r border-orange-500/20 bg-gradient-to-b from-zinc-950 via-slate-900 to-zinc-900 p-6 text-white">
      <h2 className="mb-2 text-2xl font-bold">United Gym</h2>
      <p className="mb-10 text-xs uppercase tracking-[0.18em] text-orange-300">Iron Mode</p>

      {menu.map((item, index) => (
        <motion.div whileHover={{ scale: 1.05 }} key={index}>
          <Link
            to={item.path}
            className={`mb-1 flex items-center gap-3 rounded-lg p-3 transition ${
              location.pathname === item.path
                ? "bg-orange-500/20 text-orange-200"
                : "text-slate-200 hover:bg-white/10 hover:text-orange-100"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default Sidebar;