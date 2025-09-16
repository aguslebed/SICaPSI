import ModalWrapper from "./ModalWrapper";

const ValidationErrorModal = ({ mensaje, onClose }) => {
  return (
    <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-md">
      <div className="text-center p-8 space-y-6">
        {/* Ícono de advertencia rojo - triángulo con exclamación */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Mensaje */}
        <h3 className="text-xl font-semibold text-gray-900 px-4">
          {mensaje}
        </h3>
        
        {/* Botón ACEPTAR */}
        <button
          onClick={onClose}
          className="px-12 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors cursor-pointer text-sm"
        >
          ACEPTAR
        </button>
      </div>
    </ModalWrapper>
  );
};

export default ValidationErrorModal;