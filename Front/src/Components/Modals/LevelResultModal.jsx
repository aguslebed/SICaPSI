import ModalWrapper from "./ModalWrapper";

/**
 * Modal para mostrar el resultado de la evaluación del nivel
 * Props:
 * - show (boolean): Controla la visibilidad del modal
 * - onClose (function): Callback cuando se cierra el modal
 * - result (object): Objeto con los datos de la evaluación
 *   - approved (boolean): Si aprobó o no
 *   - earnedPoints (number): Puntos obtenidos
 *   - totalPoints (number): Puntos totales posibles
 *   - percentage (number): Porcentaje obtenido
 *   - selectedOptions (array): Opciones seleccionadas (opcional)
 */
const LevelResultModal = ({ show, onClose, result }) => {
  if (!show || !result) return null;

  const { approved, earnedPoints, totalPoints, percentage, selectedOptions } = result.data || result;

  return (
    <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-lg">
      <div className="text-center space-y-6 p-6 sm:p-8">
        {/* Header con color según aprobación */}
        <div className={`${approved ? 'bg-green-500' : 'bg-red-500'} -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 px-6 py-5 flex items-center justify-center gap-3`}>
          {approved ? (
            // Ícono de check
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            // Ícono de X
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {approved ? '¡Nivel Aprobado!' : 'Nivel No Aprobado'}
          </h3>
        </div>

        {/* Cuerpo con resultados */}
        <div className="space-y-5 pt-2">
          {/* Mensaje */}
          <p className="text-gray-700 text-base sm:text-lg">
            {approved 
              ? '¡Felicitaciones! Has completado exitosamente este nivel.'
              : 'No alcanzaste el puntaje mínimo requerido. Podés volver a intentarlo.'}
          </p>

          {/* Tarjeta de puntaje */}
          <div className="bg-gray-50 rounded-lg p-5 space-y-3">
            {/* Porcentaje grande */}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-5xl sm:text-6xl font-bold ${approved ? 'text-green-600' : 'text-red-600'}`}>
                {Math.round(percentage)}%
              </span>
            </div>

            {/* Puntos obtenidos */}
            <div className="text-gray-700 text-lg">
              <span className="font-semibold">Puntos obtenidos:</span>{' '}
              <span className="font-bold text-xl">{earnedPoints}</span>
              <span className="text-gray-500"> / {totalPoints}</span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${approved ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            {/* Nota sobre el puntaje mínimo */}
            <p className="text-sm text-gray-500 mt-2">
              * Se requiere un mínimo de 80% para aprobar
            </p>
          </div>

          {/* Opciones elegidas */}
          {selectedOptions && selectedOptions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Opciones Elegidas
              </h4>
              <div className="space-y-1.5">
                {selectedOptions.map((option, index) => (
                  <div key={index} className="text-left text-sm text-gray-700">
                    <span className="font-medium">Opción {index + 1}:</span>{' '}
                    <span className="text-gray-900">'{option.description}'</span>{' '}
                    <span className={`font-semibold ${option.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({option.points >= 0 ? '+' : ''}{option.points} Puntos)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botón */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className={`px-10 py-3 ${approved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold rounded-lg cursor-pointer transition-colors text-base sm:text-lg`}
          >
            {approved ? 'Continuar' : 'Volver a Intentar'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default LevelResultModal;
