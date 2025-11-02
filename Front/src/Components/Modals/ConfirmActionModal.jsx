import ModalWrapper from './ModalWrapper';

export default function ConfirmActionModal({ open, title = 'Confirmar acción', message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onClose }) {
  if (!open) return null;

  // Clean, centered and responsive confirm modal
  return (
    <ModalWrapper onClose={onClose} panelClassName="w-[92vw] sm:w-auto max-w-[560px]" showCloseButton={false}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.68-1.36 3.445 0l5.518 9.8c.75 1.333-.213 3.001-1.723 3.001H4.462c-1.51 0-2.473-1.668-1.723-3.001l5.518-9.8zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L8.8 8.5a1 1 0 001.993.234L11 5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex-1 text-left">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p
              className="mt-2 text-sm text-gray-600 leading-relaxed"
              // Expect message HTML to be sanitized upstream when provided as string
              {...(typeof message === 'string'
                ? { dangerouslySetInnerHTML: { __html: message } }
                : {})}
            >
              {typeof message === 'string' ? null : message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm && onConfirm(); }}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
