import ModalWrapper from "./ModalWrapper";

/**
 * Modal para mostrar una lista de errores de validación
 * Props:
 * - show (boolean): Controla la visibilidad del modal
 * - onClose (function): Callback cuando se cierra el modal
 * - errors (string[]): Array de mensajes de error para mostrar
 * - title (string): Título del modal (por defecto: 'No se ha podido guardar la capacitación')
 * - messageText (string): Texto descriptivo principal (por defecto: 'Complete los siguientes requisitos antes de Guardar:')
 */
const ErrorListModal = ({ show, onClose, errors = [], title = 'No se ha podido guardar la capacitación', messageText = 'Complete los siguientes requisitos antes de Guardar:' }) => {
  if (!show) return null;

  return (
    <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-md">
      <div className="text-center space-y-4 p-6" style={{ zIndex: 100 }}>
        {/* Header rojo con ícono de alerta */}
        <div className="bg-red-500 -mx-6 -mt-6 px-6 py-4 flex items-center justify-center gap-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        {/* Cuerpo con lista de errores */}
        <div className="space-y-3 pt-2">
          <p className="text-sm text-gray-700 font-medium">{messageText}</p>
          
          {/* Lista scrolleable de errores */}
          <div className="max-h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded p-3 text-left">
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-800">{error}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer con botón */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded cursor-pointer transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ErrorListModal;
