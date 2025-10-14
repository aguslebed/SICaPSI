const ModalWrapper = ({ children, onClose, overlayClassName = "", panelClassName = "", showCloseButton = true }) => {
  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100] p-3 sm:p-4 ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose?.();
      }}
      onClick={() => onClose?.()}
    >
  <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-auto relative ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header draggable area could go here */}
        {showCloseButton && (
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-700 hover:text-gray-900 bg-white/90 hover:bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-md cursor-pointer transition-all z-10"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {/* Content wrapper: allow inner scroll areas to handle their own scrolling */}
        <div className="w-full h-full overflow-y-visible">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
