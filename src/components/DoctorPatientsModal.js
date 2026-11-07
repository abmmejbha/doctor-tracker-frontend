'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import PatientForm from '@/components/PatientForm';
import { btnPrimary, btnGhost, errMsg } from '@/lib/ui';

export default function DoctorPatientsModal({ doctor, onClose }) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-patients', doctor._id, page],
    queryFn: async () =>
      (await api.get(`/doctors/${doctor._id}/patients`, { params: { page, limit: 5 } })).data,
    placeholderData: keepPreviousData,
  });

  const refresh = () => {
    ['doctor-patients', 'patients', 'dashboard'].forEach((k) =>
      qc.invalidateQueries({ queryKey: [k] })
    );
  };

  const addMutation = useMutation({
    mutationFn: (values) => api.post(`/doctors/${doctor._id}/patients`, values),
    onSuccess: () => {
      refresh();
      setAdding(false);
      setPage(1);
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
    <Modal open onClose={onClose} title={`${doctor.name} - Patients`} wide>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {doctor.specialization} · {doctor.hospital}
        </p>
        <button
          className={btnPrimary}
          onClick={() => {
            addMutation.reset();
            setAdding(!adding);
          }}
        >
          <Plus size={16} /> {adding ? 'Cancel' : 'Add patient'}
        </button>
      </div>

      {adding && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <PatientForm
            onSubmit={(values) => addMutation.mutate(values)}
            submitting={addMutation.isPending}
            error={addMutation.isError ? errMsg(addMutation.error) : ''}
            submitLabel="Add patient"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            )}
            {!isLoading && patients.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No patients yet.</td></tr>
            )}
            {patients.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3">{p.age}</td>
                <td className="px-4 py-3">{p.condition}</td>
                <td className="px-4 py-3">{p.phone}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => confirm(`Remove ${p.name}?`) && deleteMutation.mutate(p._id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete patient"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={data?.pagination} onPage={setPage} />
      </div>

      <div className="mt-4 text-right">
        <button className={btnGhost} onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}