import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MenuIcon, CloseIcon } from './Icons'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/#surfaces', label: 'Product' },
  { to: '/blog', label: 'Blog' },
  { to: '/download', label: 'Download' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[rgba(8,23,20,0.78)] border-b border-line">
        <div className="wrap flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2.5 font-disp font-bold text-[17px]">
            <img src="/brand/icon.png" alt="" className="w-[34px] h-[34px] rounded-[9px]" />
            <span className="flex flex-col leading-tight">
              Hulu Service
              <small className="font-eth font-medium text-[11px] text-muted">ሁሉ ሰርቪስ</small>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-muted">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => (isActive ? 'text-orange' : 'hover:text-cream transition')}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3.5">
            <a className="btn btn-ghost btn-sm" href="https://github.com/haile-paa" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link className="btn btn-primary btn-sm" to="/download">Get the app</Link>
          </div>

          <button className="md:hidden text-cream" aria-label="Open menu" onClick={() => setOpen(true)}>
            <MenuIcon />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[rgba(6,17,15,0.98)] flex flex-col px-7 py-6"
          >
            <div className="flex items-center justify-between mb-9">
              <span className="flex items-center gap-2.5 font-disp font-bold">
                <img src="/brand/icon.png" alt="" className="w-8 h-8 rounded-lg" /> Hulu Service
              </span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}><CloseIcon /></button>
            </div>
            {links.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block font-disp text-2xl py-3.5 border-b border-line"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <Link to="/download" onClick={() => setOpen(false)} className="btn btn-primary mt-7">
              Get the app
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
