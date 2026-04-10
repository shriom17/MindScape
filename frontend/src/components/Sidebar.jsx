import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Activity, BookOpen, Music, LayoutDashboard } from "lucide-react";

function Sidebar() {
  return (
    <div
      className="w-70  min-h-screen bg-gradient-to-br from-[#030d2b] to-[#295ca8] text-white p-5 shadow-lg"
    >


      {/* Menu */}
      <ul className="space-y-12">

        <SidebarItem to="/" icon={<Home size={45} />} label="Home" />
        <SidebarItem to="/tracker" icon={<Activity size={45} />} label="Tracker" />
        <SidebarItem to="/stories" icon={<BookOpen size={45} />} label="Stories" />
        <SidebarItem to="/music" icon={<Music size={45} />} label="Music" />
        <SidebarItem to="/dashboard" icon={<LayoutDashboard size={45} />} label="Dashboard" />

      </ul>
    </div>
  );
}

function SidebarItem({ to, icon, label }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-8 px-4 py-3 rounded-xl transition-all duration-200 
          ${isActive 
            ? "bg-indigo-500 text-white shadow-md" 
            : "text-gray-300 hover:bg-white/10 hover:text-white"}`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

export default Sidebar;