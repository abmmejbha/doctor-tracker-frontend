'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Pencil, Trash2, FilterX } from 'lucide-react';
import api from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import PatientForm from '@/components/PatientForm';
import { inputClass, btnGhost, errMsg } from '@/lib/ui';

const emptyFilters = { search: '', condition: '', from: '', to: '' };

export default function PatientsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
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
    condition: filters.condition || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['patients', params],
    queryFn: async () => (await api.get('/patients', { params })).data,
    placeholderData: keepPreviousData,
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => (await api.get('/patients/conditions')).data,
  });

  const refresh = () => {
    ['patients', 'conditions', 'doctor-patients', 'dashboard'].forEach((k) =>
      qc.invalidateQueries({ queryKey: [k] })
    );
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => api.put(`/patients/${id}`, values),
    onSuccess: () => {
      refresh();
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      if (data?.data.length === 1 && page > 1) setPage(page - 1);
      refresh();
    },
  });

  const patients = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-sm text-slate-500">All patients across doctors</p>
        </div>
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
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search name or phone..."
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
          />
        </div>
        <select
          className={inputClass}
          value={filters.condition}
          onChange={(e) => updateFilter({ condition: e.target.value })}
        >
          <option value="">All conditions</option>
          {conditions.map((c) => (
            <option key={c} value={c}>{c}</option>
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
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading patients...</td></tr>
              )}
              {!isLoading && patients.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No patients found.</td></tr>
              )}
              {patients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3">{p.age}</td>
                  <td className="px-4 py-3">{p.phone}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {p.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.doctor?.name || '-'}</td>
                  <td className="px-4 py-3">{new Date(p.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          updateMutation.reset();
                          setEditing(p);
                        }}
                        className="text-slate-500 hover:text-teal-700"
                        aria-label="Edit patient"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => confirm(`Delete ${p.name}?`) && deleteMutation.mutate(p._id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Delete patient"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={data?.pagination} onPage={setPage} />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit patient">
        {editing && (
          <PatientForm
            key={editing._id}
            initial={editing}
            onSubmit={(values) => updateMutation.mutate({ id: editing._id, values })}
            submitting={updateMutation.isPending}
            error={updateMutation.isError ? errMsg(updateMutation.error) : ''}
            submitLabel="Save changes"
          />
        )}
      </Modal>
    </div>
  );
}