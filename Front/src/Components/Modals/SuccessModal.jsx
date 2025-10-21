import ModalWrapper from "./ModalWrapper";

/**
 * Modal para mostrar el éxito al guardar una capacitación
 * Props:
 * - show (boolean): Controla la visibilidad del modal
 * - onClose (function): Callback cuando se cierra el modal (también cierra el modal de edición)
 * - message (string): Mensaje personalizado (opcional)
 * - isEditing (boolean): Indica si se está editando o creando
 * - isActive (boolean): Indica si la capacitación está habilitada
 */
const SuccessModal = ({ show, onClose, message, isEditing = false, isActive = false }) => {
  if (!show) return null;

  // Si hay un mensaje personalizado, usar modo simple
  if (message) {
    return (
      <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-md">
        <div className="text-center space-y-4 p-6" style={{ zIndex: 100 }}>
          {/* Header verde con ícono de check */}
          <div className="bg-green-500 -mx-6 -mt-6 px-6 py-4 flex items-center justify-center gap-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-bold text-white">¡Éxito!</h3>
          </div>

          {/* Cuerpo con mensaje */}
          <div className="space-y-3 pt-2">
            <p className="text-gray-700">{message}</p>
          </div>

          {/* Footer con botón */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded cursor-pointer transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-md">
      <div className="text-center space-y-4 p-6" style={{ zIndex: 100 }}>
        {/* Header verde con ícono de check */}
        <div className="bg-green-500 -mx-6 -mt-6 px-6 py-4 flex items-center justify-center gap-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-white">¡Capacitación guardada exitosamente!</h3>
        </div>

        {/* Cuerpo con mensaje */}
        <div className="space-y-4 pt-2">
          <p className="text-gray-700">
            {isEditing 
              ? 'Los cambios han sido actualizados correctamente' 
              : 'La capacitación ha sido creada correctamente'}
          </p>
          
          {/* Badge de estado */}
          {isActive ? (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center justify-center gap-2 text-green-700 font-semibold mb-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>La capacitación está HABILITADA</span>
              </div> 
            </div>
          ) : null}
        </div>

        {/* Footer con botón */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded cursor-pointer transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default SuccessModal;
