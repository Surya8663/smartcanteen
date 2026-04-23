import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'Please confirm this action.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <p className="text-sm leading-7 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:scale-105"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
