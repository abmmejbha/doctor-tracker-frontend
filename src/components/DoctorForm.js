'use client';
import { useState } from 'react';
import { Button, Field, inputCls, fieldErrors } from '@/components/ui';

export default function DoctorForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState({
    name: initial?.name || '',
    specialization: initial?.specialization || '',
    hospital: initial?.hospital || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
  });
  const [errs, setErrs] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setErrs({});
    try { await onSubmit(f); }
    catch (err) { setError(err.message); setErrs(fieldErrors(err)); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Field label="Name" error={errs.name}><input required className={inputCls} value={f.name} onChange={set('name')} /></Field>
      <Field label="Specialization" error={errs.specialization}><input required className={inputCls} value={f.specialization} onChange={set('specialization')} /></Field>
      <Field label="Hospital" error={errs.hospital}><input required className={inputCls} value={f.hospital} onChange={set('hospital')} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone" error={errs.phone}><input required className={inputCls} value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Email" error={errs.email}><input required type="email" className={inputCls} value={f.email} onChange={set('email')} /></Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={busy}>Save</Button>
      </div>
    </form>
  );
}
