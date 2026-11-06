'use client';
import { useState } from 'react';
import { Button, Field, inputCls, fieldErrors } from '@/components/ui';

// doctors পাস করলে ডাক্তার বদলানোর dropdown দেখায় (Patients পেজে edit-এর সময়)
export default function PatientForm({ initial, doctors, onSubmit, onCancel }) {
  const [f, setF] = useState({
    name: initial?.name || '',
    age: initial?.age ?? '',
    gender: initial?.gender || 'male',
    phone: initial?.phone || '',
    condition: initial?.condition || '',
    doctor: initial?.doctor?._id || initial?.doctor || '',
  });
  const [errs, setErrs] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setErrs({});
    try {
      const body = { name: f.name, age: f.age, gender: f.gender, phone: f.phone, condition: f.condition };
      if (doctors) body.doctor = f.doctor;
      await onSubmit(body);
    } catch (err) {
      setError(err.message); setErrs(fieldErrors(err));
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Field label="Name" error={errs.name}><input required className={inputCls} value={f.name} onChange={set('name')} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" error={errs.age}><input required type="number" min="0" max="150" className={inputCls} value={f.age} onChange={set('age')} /></Field>
        <Field label="Gender" error={errs.gender}>
          <select className={inputCls} value={f.gender} onChange={set('gender')}>
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="Phone" error={errs.phone}><input required className={inputCls} value={f.phone} onChange={set('phone')} /></Field>
      <Field label="Condition" error={errs.condition}><input required className={inputCls} value={f.condition} onChange={set('condition')} /></Field>
      {doctors && (
        <Field label="Doctor" error={errs.doctor}>
          <select required className={inputCls} value={f.doctor} onChange={set('doctor')}>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
          </select>
        </Field>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={busy}>Save</Button>
      </div>
    </form>
  );
}
