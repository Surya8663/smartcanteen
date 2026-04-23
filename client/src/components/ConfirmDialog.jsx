import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure?',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel} maxWidth="max-w-md">
      <p className="text-sm leading-7 text-slate-600">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105"
        >
          {confirmText}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:scale-105"
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
