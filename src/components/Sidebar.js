'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Stethoscope, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 text-white">
            <div className="rounded-lg bg-teal-600 p-1.5">
              <Stethoscope size={20} />
            </div>
            <span className="text-lg font-bold">Doctor Tracker</span>
          </div>
          <button onClick={onClose} className="lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-teal-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="mb-3 truncate text-xs text-slate-400">{user?.email}</p>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}