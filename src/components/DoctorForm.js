'use client';
import { useState } from 'react';
import Field from '@/components/Field';
import { inputClass, btnPrimary } from '@/lib/ui';

export default function DoctorForm({ onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-3"
    >
      <Field label="Full name">
        <input required className={inputClass} value={form.name} onChange={set('name')} />
      </Field>
      <Field label="Specialization">
        <input required className={inputClass} value={form.specialization} onChange={set('specialization')} />
      </Field>
      <Field label="Hospital">
        <input required className={inputClass} value={form.hospital} onChange={set('hospital')} />
      </Field>
      <Field label="Phone">
        <input required className={inputClass} value={form.phone} onChange={set('phone')} />
      </Field>
      <Field label="Email">
        <input required type="email" className={inputClass} value={form.email} onChange={set('email')} />
      </Field>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
        {submitting ? 'Saving...' : 'Add doctor'}
      </button>
    </form>
  );
}