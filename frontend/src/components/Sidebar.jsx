import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Activity, BookOpen, Music, LayoutDashboard, Phone } from "lucide-react";

const navItems = [
  {
    to: "/home",
    label: "Home",
    Icon: Home,
    accent: "from-cyan-400 via-sky-400 to-blue-600",
    glow: "shadow-[0_12px_30px_rgba(56,189,248,0.45)]",
  },
  {
    to: "/tracker",
    label: "Tracker",
    Icon: Activity,
    accent: "from-emerald-400 via-green-400 to-teal-600",
    glow: "shadow-[0_12px_30px_rgba(16,185,129,0.45)]",
  },
  {
    to: "/stories",
    label: "Stories",
    Icon: BookOpen,
    accent: "from-amber-400 via-orange-400 to-rose-500",
    glow: "shadow-[0_12px_30px_rgba(251,146,60,0.45)]",
  },
  {
    to: "/music",
    label: "Music",
    Icon: Music,
    accent: "from-fuchsia-400 via-pink-500 to-rose-500",
    glow: "shadow-[0_12px_30px_rgba(244,114,182,0.45)]",
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    accent: "from-violet-400 via-indigo-500 to-blue-600",
    glow: "shadow-[0_12px_30px_rgba(99,102,241,0.45)]",
  },
  {
    to: "/helpline",
    label: "Helpline",
    Icon: Phone,
    accent: "from-rose-400 via-red-500 to-orange-500",
    glow: "shadow-[0_12px_30px_rgba(248,113,113,0.45)]",
  },
];

function Sidebar() {
  return (
    <div
      className="w-70 min-h-screen bg-gradient-to-b from-[#0b112d] via-[#112e6a] to-[#0b112d] text-white p-5 shadow-[0_30px_60px_rgba(8,12,35,0.6)] border-r border-white/10"
    >
      {/* Menu */}
      <ul className="flex flex-col gap-6">
        {navItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            label={item.label}
            Icon={item.Icon}
            accent={item.accent}
            glow={item.glow}
          />
        ))}
      </ul>
    </div>
  );
}

function SidebarItem({ to, Icon, label, accent, glow }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 backdrop-blur-sm
          ${isActive
            ? "bg-white/15 text-white shadow-[0_12px_32px_rgba(8,15,40,0.5)]"
            : "text-slate-200 hover:bg-white/10 hover:text-white"}`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`relative grid place-items-center h-11 w-11 rounded-2xl bg-gradient-to-br ${accent} ${glow} ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-[1.03]`}
            >
              <Icon
                size={22}
                strokeWidth={1.7}
                className="text-white drop-shadow-[0_3px_7px_rgba(0,0,0,0.45)]"
              />
            </span>
            <span className="text-[15px] font-semibold tracking-[0.02em]">
              {label}
            </span>
            <span
              className={`ml-auto h-2 w-2 rounded-full bg-white/80 transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
              }`}
            />
          </>
        )}
      </NavLink>
    </li>
  );
}

export default Sidebar;