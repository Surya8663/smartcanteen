import { usePortal } from '../context/PortalContext';

const toastStyles = {
  info: 'border-slate-200 bg-white text-navy',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  points: 'border-brand/20 bg-brand/10 text-navy'
};

const ToastContainer = () => {
  const { toasts } = usePortal();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur transition-all duration-300 ${toastStyles[toast.type]}`}
        >
          <div className="text-sm font-semibold">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
