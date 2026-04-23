/**
 * Reusable skeleton card component for loading states
 * Variants: card, row, text, circle
 */

const SkeletonCard = ({ variant = 'card', count = 1 }) => {
  const baseClasses = 'bg-slate-200 animate-pulse rounded-lg';

  const variants = {
    card: 'h-64 w-full rounded-2xl',
    row: 'h-16 w-full rounded-xl',
    text: 'h-4 w-3/4 rounded',
    circle: 'h-12 w-12 rounded-full'
  };

  const skeletonClass = `${baseClasses} ${variants[variant] || variants.card}`;

  if (count === 1) {
    return <div className={skeletonClass} />;
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={skeletonClass} />
      ))}
    </div>
  );
};

export default SkeletonCard;

// Grid variant for dashboard stats
export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-3 h-4 w-20 bg-slate-200 animate-pulse rounded" />
          <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

// Menu grid variant
export function SkeletonMenuGrid({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="h-52 w-full bg-slate-200 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-6 w-2/3 bg-slate-200 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-200 animate-pulse rounded" />
              <div className="h-3 w-5/6 bg-slate-200 animate-pulse rounded" />
            </div>
            <div className="h-10 w-full bg-slate-200 animate-pulse rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table row variant
export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl bg-slate-100 p-4">
          <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
          <div className="flex-1 h-4 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
