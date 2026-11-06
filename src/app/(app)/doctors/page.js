'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { useList } from '@/lib/useList';
import { useToast } from '@/components/Toast';
import DoctorForm from '@/components/DoctorForm';
import {
  Button, Modal, ConfirmDialog, Pagination, Spinner, Empty, ErrorBox, PageHeader, inputCls, useDebounce, fmtDate,
} from '@/components/ui';

export default function DoctorsPage() {
  const toast = useToast();
  const [f, setF] = useState({ search: '', specialization: '', hospital: '', from: '', to: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState({ specializations: [], hospitals: [] });
  const [form, setForm] = useState(null); // null | {} (new) | doctor (edit)
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const search = useDebounce(f.search);
  const { data, pagination, loading, error, reload } = useList('/doctors', { ...f, search, page, limit: 10 });

  const loadOptions = () => api.get('/doctors/filters').then((r) => setOptions(r.data)).catch(() => {});
  useEffect(() => { loadOptions(); }, []);

  const change = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const reset = () => { setF({ search: '', specialization: '', hospital: '', from: '', to: '', sort: 'newest' }); setPage(1); };

  async function save(body) {
    if (form?._id) await api.put(`/doctors/${form._id}`, body);
    else await api.post('/doctors', body);
    toast(form?._id ? 'Doctor updated' : 'Doctor added');
    setForm(null); reload(); loadOptions();
  }

  async function remove() {
    setDelBusy(true);
    try {
      const r = await api.del(`/doctors/${del._id}`);
      toast(`Doctor deleted${r.deletedPatients ? ` (${r.deletedPatients} patients removed)` : ''}`);
      setDel(null);
      if (data.length === 1 && page > 1) setPage(page - 1); else reload();
      loadOptions();
    } catch (e) { toast(e.message, 'error'); }
    finally { setDelBusy(false); }
  }

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Add, search and manage doctors"
        action={<Button onClick={() => setForm({})}><Plus className="h-4 w-4" /> Add doctor</Button>}
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input aria-label="Search" placeholder="Search name, hospital, email…" className={inputCls + ' pl-9'} value={f.search} onChange={change('search')} />
        </div>
        <select aria-label="Specialization" className={inputCls} value={f.specialization} onChange={change('specialization')}>
          <option value="">All specializations</option>
          {options.specializations.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="Hospital" className={inputCls} value={f.hospital} onChange={change('hospital')}>
          <option value="">All hospitals</option>
          {options.hospitals.map((s) => <option key={s}>{s}</option>)}
        </select>
        <label className="text-xs text-slate-500">Added from<input type="date" className={inputCls} value={f.from} onChange={change('from')} /></label>
        <label className="text-xs text-slate-500">Added to<input type="date" className={inputCls} value={f.to} onChange={change('to')} /></label>
        <label className="text-xs text-slate-500">Sort
          <select className={inputCls} value={f.sort} onChange={change('sort')}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option>
          </select>
        </label>
        <div className="flex items-end"><Button variant="secondary" onClick={reset} className="w-full">Reset filters</Button></div>
      </div>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data.length && <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>}
      {!loading && !error && !data.length && <Empty>No doctors found</Empty>}

      {data.length > 0 && (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Doctor</th><th className="px-4 py-3">Hospital</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Added</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><p className="font-medium">{d.name}</p><p className="text-xs text-teal-700">{d.specialization}</p></td>
                    <td className="px-4 py-3">{d.hospital}</td>
                    <td className="px-4 py-3"><p>{d.phone}</p><p className="text-xs text-slate-500">{d.email}</p></td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(d.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/doctors/${d._id}`} aria-label="View patients" className="rounded p-2 text-slate-600 hover:bg-slate-100"><Eye className="h-4 w-4" /></Link>
                        <button aria-label="Edit" onClick={() => setForm(d)} className="rounded p-2 text-slate-600 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                        <button aria-label="Delete" onClick={() => setDel(d)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {data.map((d) => (
              <div key={d._id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium">{d.name}</p>
                <p className="text-sm text-teal-700">{d.specialization}</p>
                <p className="mt-2 text-sm text-slate-600">{d.hospital}</p>
                <p className="text-sm text-slate-500">{d.phone} · {d.email}</p>
                <p className="text-xs text-slate-400">Added {fmtDate(d.createdAt)}</p>
                <div className="mt-3 flex gap-2">
                  <Link href={`/doctors/${d._id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 py-2 text-sm"><Eye className="h-4 w-4" /> Patients</Link>
                  <Button variant="secondary" onClick={() => setForm(d)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="secondary" onClick={() => setDel(d)} aria-label="Delete" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPage={setPage} />
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit doctor' : 'Add doctor'}>
        {form && <DoctorForm initial={form._id ? form : null} onSubmit={save} onCancel={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog
        open={!!del} loading={delBusy} onCancel={() => setDel(null)} onConfirm={remove}
        title="Delete doctor?" message={`${del?.name} and all of their patients will be permanently deleted.`}
      />
    </>
  );
}
