'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Stethoscope, Users, Activity, CalendarDays } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';

const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#84cc16', '#ec4899'];
const RANGES = [7, 30, 90];

const buildTimeline = (days, patients, doctors) => {
  const pMap = Object.fromEntries(patients.map((d) => [d.date, d.count]));
  const dMap = Object.fromEntries(doctors.map((d) => [d.date, d.count]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toLocaleDateString('en-CA');
    return { date: key.slice(5), patients: pMap[key] || 0, doctors: dMap[key] || 0 };
  });
};

export default function DashboardPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', days],
    queryFn: async () => (await api.get('/dashboard/stats', { params: { days } })).data,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        {error?.message || 'Failed to load dashboard data.'}
      </p>
    );
  }

  const { totals, patientsPerDoctor, conditions, patientsByDate, doctorsByDate } = data;
  const timeline = buildTimeline(days, patientsByDate, doctorsByDate);
  const newInPeriod = patientsByDate.reduce((sum, d) => sum + d.count, 0);
  const avg = totals.doctors ? (totals.patients / totals.doctors).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of doctors and patients</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                days === r ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total doctors" value={totals.doctors} icon={Stethoscope} tone="bg-teal-100 text-teal-700" />
        <StatCard label="Total patients" value={totals.patients} icon={Users} tone="bg-indigo-100 text-indigo-700" />
        <StatCard label="Avg patients / doctor" value={avg} icon={Activity} tone="bg-amber-100 text-amber-700" />
        <StatCard label={`New patients (${days}d)`} value={newInPeriod} icon={CalendarDays} tone="bg-rose-100 text-rose-700" />
      </div>

      <ChartCard title="Growth over time" subtitle={`New doctors and patients, last ${days} days`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="patients" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            <Area type="monotone" dataKey="doctors" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Patients per doctor" subtitle="Top 10 doctors by patient count">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patientsPerDoctor} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Patients" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient conditions" subtitle="Most common conditions">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={conditions} dataKey="count" nameKey="condition" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {conditions.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}