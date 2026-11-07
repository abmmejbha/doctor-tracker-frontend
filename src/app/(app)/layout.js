'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className="font-semibold text-slate-800">Doctor Tracker</span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}