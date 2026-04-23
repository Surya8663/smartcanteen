const Modal = ({ title, isOpen, onClose, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
