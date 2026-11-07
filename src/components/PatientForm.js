'use client';
import { useState } from 'react';
import Field from '@/components/Field';
import { inputClass, btnPrimary } from '@/lib/ui';

export default function PatientForm({ initial, onSubmit, submitting, error, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    age: initial?.age ?? '',
    phone: initial?.phone || '',
    condition: initial?.condition || '',
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, age: Number(form.age) });
      }}
      className="space-y-3"
    >
      <Field label="Full name">
        <input required className={inputClass} value={form.name} onChange={set('name')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
          <input required type="number" min="0" max="150" className={inputClass} value={form.age} onChange={set('age')} />
        </Field>
        <Field label="Phone">
          <input required className={inputClass} value={form.phone} onChange={set('phone')} />
        </Field>
      </div>
      <Field label="Condition">
        <input required className={inputClass} value={form.condition} onChange={set('condition')} />
      </Field>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}