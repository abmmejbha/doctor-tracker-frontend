'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useList } from '@/lib/useList';
import { useToast } from '@/components/Toast';
import PatientForm from '@/components/PatientForm';
import {
  Button, Modal, ConfirmDialog, Pagination, Spinner, Empty, ErrorBox, PageHeader, inputCls, useDebounce, fmtDate,
} from '@/components/ui';

const EMPTY = { search: '', condition: '', doctor: '', gender: '', from: '', to: '', sort: 'newest' };

export default function PatientsPage() {
  const toast = useToast();
  const [f, setF] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [conditions, setConditions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const search = useDebounce(f.search);
  const { data, pagination, loading, error, reload } = useList('/patients', { ...f, search, page, limit: 10 });

  const loadConditions = () => api.get('/patients/filters').then((r) => setConditions(r.data.conditions)).catch(() => {});
  useEffect(() => {
    loadConditions();
    api.get('/doctors?limit=50&sort=name').then((r) => setDoctors(r.data)).catch(() => {});
  }, []);

  const change = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };

  async function save(body) {
    await api.put(`/patients/${edit._id}`, body);
    toast('Patient updated');
    setEdit(null); reload(); loadConditions();
  }

  async function remove() {
    setDelBusy(true);
    try {
      await api.del(`/patients/${del._id}`);
      toast('Patient deleted');
      setDel(null);
      if (data.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (e) { toast(e.message, 'error'); }
    finally { setDelBusy(false); }
  }

  const DoctorLink = ({ p }) =>
    p.doctor ? <Link href={`/doctors/${p.doctor._id}`} className="text-teal-700 hover:underline">{p.doctor.name}</Link> : <span className="text-slate-400">—</span>;

  return (
    <>
      <PageHeader title="Patients" subtitle="All patients across doctors (add patients from a doctor's page)" />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input aria-label="Search" placeholder="Search name, phone, condition…" className={inputCls + ' pl-9'} value={f.search} onChange={change('search')} />
        </div>
        <select aria-label="Condition" className={inputCls} value={f.condition} onChange={change('condition')}>
          <option value="">All conditions</option>
          {conditions.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Doctor" className={inputCls} value={f.doctor} onChange={change('doctor')}>
          <option value="">All doctors</option>
          {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select aria-label="Gender" className={inputCls} value={f.gender} onChange={change('gender')}>
          <option value="">Any gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
        </select>
        <label className="text-xs text-slate-500">Added from<input type="date" className={inputCls} value={f.from} onChange={change('from')} /></label>
        <label className="text-xs text-slate-500">Added to<input type="date" className={inputCls} value={f.to} onChange={change('to')} /></label>
        <label className="text-xs text-slate-500">Sort
          <select className={inputCls} value={f.sort} onChange={change('sort')}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option>
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
          <Button variant="secondary" onClick={() => { setF(EMPTY); setPage(1); }}>Reset filters</Button>
        </div>
      </div>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data.length && <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>}
      {!loading && !error && !data.length && <Empty>No patients found</Empty>}

      {data.length > 0 && (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Age / Gender</th><th className="px-4 py-3">Condition</th><th className="px-4 py-3">Doctor</th><th className="px-4 py-3">Added</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><p className="font-medium">{p.name}</p><p className="text-xs text-slate-500">{p.phone}</p></td>
                    <td className="px-4 py-3 capitalize">{p.age} · {p.gender}</td>
                    <td className="px-4 py-3">{p.condition}</td>
                    <td className="px-4 py-3"><DoctorLink p={p} /></td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button aria-label="Edit" onClick={() => setEdit(p)} className="rounded p-2 text-slate-600 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                        <button aria-label="Delete" onClick={() => setDel(p)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {data.map((p) => (
              <div key={p._id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm capitalize text-slate-600">{p.age} · {p.gender} · {p.condition}</p>
                <p className="text-sm text-slate-500">{p.phone}</p>
                <p className="mt-1 text-sm">Doctor: <DoctorLink p={p} /></p>
                <p className="text-xs text-slate-400">Added {fmtDate(p.createdAt)}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setEdit(p)}><Pencil className="h-4 w-4" /> Edit</Button>
                  <Button variant="secondary" className="text-red-600" onClick={() => setDel(p)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPage={setPage} />
        </div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit patient">
        {edit && <PatientForm initial={edit} doctors={doctors} onSubmit={save} onCancel={() => setEdit(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} loading={delBusy} onCancel={() => setDel(null)} onConfirm={remove} title="Delete patient?" message={`${del?.name} will be permanently deleted.`} />
    </>
  );
}
