const StatCard = ({ icon, label, value, change = '+0% vs yesterday' }) => {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-md transition hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-navy">{value}</h3>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-2xl text-brand">{icon}</div>
      </div>
      <p className="mt-4 text-sm font-semibold text-emerald-600">{change}</p>
    </article>
  );
};

export default StatCard;
