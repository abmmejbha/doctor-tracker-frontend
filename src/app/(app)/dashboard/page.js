'use client';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <button onClick={logout} className="mt-4 rounded bg-slate-800 px-4 py-2 text-white">
        Logout
      </button>
    </div>
  );
}