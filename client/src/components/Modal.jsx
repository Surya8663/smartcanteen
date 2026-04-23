const Modal = ({ isOpen, title, onClose, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm">
      <div className={`w-full rounded-2xl bg-white shadow-2xl ${maxWidth}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-xl font-black text-navy">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            Close
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
      <button aria-label="Close modal" className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default Modal;
