const styles = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700'
};

const StatusBadge = ({ status = 'Confirmed' }) => {
  const normalized = status.toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[normalized] || styles.confirmed}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
