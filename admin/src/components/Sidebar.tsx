import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  HardHat,
  Tags,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/providers", label: "Providers", icon: HardHat },
  { to: "/users", label: "Customers", icon: Users },
  { to: "/categories", label: "Work Types & Prices", icon: Tags },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className='glass-panel fixed inset-y-0 left-0 z-20 flex w-64 flex-col rounded-r-3xl border-l-0 p-5'>
      <div className='mb-8 flex items-center gap-2.5 px-1'>
        <div className='animate-glow flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-lg shadow-violet-500/30'>
          <Sparkles size={18} className='text-white' />
        </div>
        <div>
          <p className='text-base-100 text-sm leading-tight font-semibold'>
            Hulu Service
          </p>
          <p className='text-base-400 text-[11px] leading-tight'>
            Admin Console
          </p>
        </div>
      </div>

      <nav className='flex-1 space-y-1'>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-base-100"
                  : "text-base-300 hover:text-base-100 hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId='active-nav-pill'
                    className='absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/25 to-fuchsia-500/15 ring-1 ring-violet-400/30'
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={17} className='relative shrink-0' />
                <span className='relative'>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className='border-base-700/60 mt-4 border-t pt-4'>
        <div className='mb-3 flex items-center gap-2.5 px-1'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-semibold text-white'>
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className='min-w-0'>
            <p className='text-base-100 truncate text-xs font-medium'>
              {user?.fullName || "Admin"}
            </p>
            <p className='text-base-400 truncate text-[11px]'>
              {user?.phone}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className='text-base-300 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-rose-300'
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
