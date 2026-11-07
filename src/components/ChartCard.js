export default function ChartCard({ title, subtitle, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h2 className="font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-72">{children}</div>
    </section>
  );
}