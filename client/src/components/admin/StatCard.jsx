const StatCard = ({ icon, label, value, change = '+12% vs yesterday' }) => {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-md transition hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-navy">{value}</h3>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-xl text-brand">{icon}</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-emerald-600">{change}</p>
    </article>
  );
};

export default StatCard;
