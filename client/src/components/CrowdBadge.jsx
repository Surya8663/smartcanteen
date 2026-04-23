const styles = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700'
};

const dots = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-400',
  high: 'bg-red-500'
};

const CrowdBadge = ({ level = 'low' }) => {
  const normalized = String(level).toLowerCase();
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[normalized] || styles.low}`}>
      <span className={`h-2 w-2 rounded-full ${dots[normalized] || dots.low}`} />
      {normalized}
    </span>
  );
};

export default CrowdBadge;
