'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Search, Trash2, Hospital, Phone, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useList } from '@/lib/useList';
import { useToast } from '@/components/Toast';
import PatientForm from '@/components/PatientForm';
import {
  Button, Modal, ConfirmDialog, Pagination, Spinner, Empty, ErrorBox, inputCls, useDebounce, fmtDate,
} from '@/components/ui';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [doctor, setDoctor] = useState(null);
  const [docError, setDocError] = useState('');
  const [f, setF] = useState({ search: '', condition: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [conditions, setConditions] = useState([]);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const search = useDebounce(f.search);
  const { data, pagination, loading, error, reload } = useList(`/doctors/${id}/patients`, { ...f, search, page, limit: 10 });

  const loadDoctor = useCallback(() => {
    api.get(`/doctors/${id}`).then((r) => setDoctor(r.data)).catch((e) => setDocError(e.message));
  }, [id]);
  const loadConditions = () => api.get('/patients/filters').then((r) => setConditions(r.data.conditions)).catch(() => {});
  useEffect(() => { loadDoctor(); loadConditions(); }, [loadDoctor]);

  const change = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };

  async function add(body) {
    await api.post(`/doctors/${id}/patients`, body);
    toast('Patient added');
    setAdding(false); reload(); loadDoctor(); loadConditions();
  }

  async function remove() {
    setDelBusy(true);
    try {
      await api.del(`/doctors/${id}/patients/${del._id}`);
      toast('Patient removed');
      setDel(null);
      if (data.length === 1 && page > 1) setPage(page - 1); else reload();
      loadDoctor();
    } catch (e) { toast(e.message, 'error'); }
    finally { setDelBusy(false); }
  }

  if (docError) return <><Link href="/doctors" className="text-sm text-teal-700">← Back</Link><div className="mt-3"><ErrorBox message={docError} /></div></>;
  if (!doctor) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <>
      <Link href="/doctors" className="mb-3 inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"><ArrowLeft className="h-4 w-4" /> All doctors</Link>

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{doctor.name}</h1>
            <p className="text-teal-700">{doctor.specialization}</p>
          </div>
          <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">{doctor.patientCount} patients</span>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <span className="flex items-center gap-2"><Hospital className="h-4 w-4" />{doctor.hospital}</span>
          <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{doctor.phone}</span>
          <span className="flex items-center gap-2 break-all"><Mail className="h-4 w-4" />{doctor.email}</span>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Patients</h2>
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add patient</Button>
      </div>

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input aria-label="Search" placeholder="Search name, phone…" className={inputCls + ' pl-9'} value={f.search} onChange={change('search')} />
        </div>
        <select aria-label="Condition" className={inputCls} value={f.condition} onChange={change('condition')}>
          <option value="">All conditions</option>
          {conditions.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input aria-label="From date" type="date" className={inputCls} value={f.from} onChange={change('from')} />
        <input aria-label="To date" type="date" className={inputCls} value={f.to} onChange={change('to')} />
      </div>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data.length && <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>}
      {!loading && !error && !data.length && <Empty>No patients found</Empty>}

      {data.length > 0 && (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Age / Gender</th><th className="px-4 py-3">Condition</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Added</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 capitalize">{p.age} · {p.gender}</td>
                    <td className="px-4 py-3">{p.condition}</td>
                    <td className="px-4 py-3">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-right"><button aria-label="Remove patient" onClick={() => setDel(p)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {data.map((p) => (
              <div key={p._id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm capitalize text-slate-600">{p.age} · {p.gender} · {p.condition}</p>
                  <p className="text-sm text-slate-500">{p.phone}</p>
                  <p className="text-xs text-slate-400">Added {fmtDate(p.createdAt)}</p>
                </div>
                <button aria-label="Remove patient" onClick={() => setDel(p)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPage={setPage} />
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title={`Add patient to ${doctor.name}`}>
        {adding && <PatientForm onSubmit={add} onCancel={() => setAdding(false)} />}
      </Modal>
      <ConfirmDialog open={!!del} loading={delBusy} onCancel={() => setDel(null)} onConfirm={remove} title="Remove patient?" message={`${del?.name} will be permanently deleted.`} />
    </>
  );
}
