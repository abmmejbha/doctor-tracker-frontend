'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Plus, Search, Users, FilterX } from 'lucide-react';
import api from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import DoctorForm from '@/components/DoctorForm';
import DoctorPatientsModal from '@/components/DoctorPatientsModal';
import { inputClass, btnPrimary, btnGhost, errMsg } from '@/lib/ui';

const emptyFilters = { search: '', specialization: '', from: '', to: '' };

export default function DoctorsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const search = useDebounce(filters.search);

  const updateFilter = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const hasFilters = Object.values(filters).some(Boolean);

  const params = {
    page,
    limit: 10,
    search: search || undefined,
    specialization: filters.specialization || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['doctors', params],
    queryFn: async () => (await api.get('/doctors', { params })).data,
    placeholderData: keepPreviousData,
  });

  const { data: specializations = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: async () => (await api.get('/doctors/specializations')).data,
  });

  const createMutation = useMutation({
    mutationFn: (values) => api.post('/doctors', values),
    onSuccess: () => {
      ['doctors', 'specializations', 'dashboard'].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k] })
      );
      setAddOpen(false);
    },
  });

  const doctors = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
          <p className="text-sm text-slate-500">Manage doctors and their patients</p>
        </div>
        <div className="flex gap-2">
          {hasFilters && (
            <button
              className={btnGhost}
              onClick={() => {
                setFilters(emptyFilters);
                setPage(1);
              }}
            >
              <FilterX size={14} className="mr-1 inline" /> Clear filters
            </button>
          )}
          <button
            className={btnPrimary}
            onClick={() => {
              createMutation.reset();
              setAddOpen(true);
            }}
          >
            <Plus size={16} /> Add doctor
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search name, hospital, email..."
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
          />
        </div>
        <select
          className={inputClass}
          value={filters.specialization}
          onChange={(e) => updateFilter({ specialization: e.target.value })}
        >
          <option value="">All specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          title="Added from"
          className={inputClass}
          value={filters.from}
          onChange={(e) => updateFilter({ from: e.target.value })}
        />
        <input
          type="date"
          title="Added to"
          className={inputClass}
          value={filters.to}
          onChange={(e) => updateFilter({ to: e.target.value })}
        />
      </div>

      {isError && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{errMsg(error)}</p>
      )}

      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${isFetching ? 'opacity-70' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading doctors...</td></tr>
              )}
              {!isLoading && doctors.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No doctors found.</td></tr>
              )}
              {doctors.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      {d.specialization}
                    </span>
                  </td>
                  <td className="px-4 py-3">{d.hospital}</td>
                  <td className="px-4 py-3">{d.phone}</td>
                  <td className="px-4 py-3">{d.email}</td>
                  <td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(d)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-100"
                    >
                      <Users size={14} /> Patients
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={data?.pagination} onPage={setPage} />
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add doctor">
        <DoctorForm
          onSubmit={(values) => createMutation.mutate(values)}
          submitting={createMutation.isPending}
          error={createMutation.isError ? errMsg(createMutation.error) : ''}
        />
      </Modal>

      {selected && <DoctorPatientsModal doctor={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}