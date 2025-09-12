const ModalWrapper = ({ children, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose?.();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          type="button"
          aria-label="Cerrar"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <span aria-hidden>×</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
