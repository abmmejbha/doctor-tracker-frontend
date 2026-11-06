'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Stethoscope, Users, LogOut, Menu, X, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Spinner, cx } from '@/components/ui';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
];

export default function AppShell({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 text-lg font-semibold text-slate-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white"><Activity className="h-5 w-5" /></span>
        Doctor Tracker
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                active ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className="h-5 w-5" /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
        <p className="mb-3 truncate text-xs text-slate-500">{user.email}</p>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2 font-semibold text-slate-900"><Activity className="h-5 w-5 text-teal-700" /> Doctor Tracker</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded p-1 hover:bg-slate-100"><Menu className="h-6 w-6" /></button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50" />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
