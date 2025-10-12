import ModalWrapper from "./ModalWrapper";

const AuthErrorModal = ({ mensaje, onClose }) => {
  return (
    <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-md">
      <div className="text-center p-8 space-y-6">
        {/* Ícono de error rojo - círculo con exclamación */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-9a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
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

export default AuthErrorModal;