import React, { useState } from 'react';
import ErrorListModal from '../Components/Modals/ErrorListModal';
import SuccessModal from '../Components/Modals/SuccessModal';
import WarningModal from '../Components/Modals/WarningModal';
import ConfirmActionModal from '../Components/Modals/ConfirmActionModal';
import ValidationErrorModal from '../Components/Modals/ValidationErrorModal';
import ErrorModal from '../Components/Modals/ErrorModal';
import ImageCropModal from '../Components/Modals/ImageCropModal';
import RegisterModal from '../Components/Modals/RegisterModal';
import SucessModal from '../Components/Modals/SucessModal';
import AuthErrorModal from '../Components/Modals/AuthErrorModal';

/**
 * Página de demostración de todos los modales del sistema
 * Útil para visualizar el diseño y comportamiento de cada modal
 */
export default function ModalShowcase() {
  // Estados para controlar la visibilidad de cada modal
  const [showErrorList, setShowErrorList] = useState(false);
  const [showSuccessActive, setShowSuccessActive] = useState(false);
  const [showSuccessDraft, setShowSuccessDraft] = useState(false);
  const [showSuccessNew, setShowSuccessNew] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [showRegisterError, setShowRegisterError] = useState(false);
  const [showSucessModal, setShowSucessModal] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);

  // Imagen de ejemplo para el crop
  const [cropImage, setCropImage] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400');

  // Datos de ejemplo para los modales
  const sampleErrors = [
    'Falta el título de la capacitación',
    'Falta la descripción de la capacitación',
    'Nivel 1: Falta el título de la clase magistral',
    'Nivel 1: No hay elementos bibliográficos agregados',
    'Nivel 1, Escena 1: Falta el video',
    'Nivel 2: La evaluación debe estar activa',
    'Debe asignar un profesor a la capacitación',
    'Debe inscribir al menos 1 estudiante'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Galería de Modales</h1>
              <p className="text-gray-600 mt-1">Visualiza todos los modales del sistema SICaPSI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Introducción */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Acerca de esta página</h2>
              <p className="text-gray-600 leading-relaxed">
                Esta página de demostración te permite visualizar todos los modales disponibles en el sistema. 
                Haz clic en cualquier botón para ver el diseño, los colores y el comportamiento de cada modal. 
                Es útil para mantener la consistencia visual y probar los componentes de UI.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de modales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* ErrorListModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-100 hover:border-red-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">ErrorListModal</h3>
                  <p className="text-xs text-gray-500 font-mono">ErrorListModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal rojo para mostrar una lista de errores de validación.
                Muestra una lista scrolleable y un único botón para cerrar.
              </p>
              <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-200">
                <p className="text-xs text-red-800 font-medium">🎨 Color: Rojo (#EF4444)</p>
                <p className="text-xs text-red-800 mt-1">📋 Lista scrolleable de errores</p>

                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Components/Modals/CreateTrainingModal.jsx</code></li>
                    <li><code>Front/src/Pages/AdminPanel/GestionCapacitacion.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>show</strong> (boolean) — controla visibilidad</li>
                    <li><strong>onClose</strong> (function) — callback al cerrar</li>
                    <li><strong>errors</strong> (string[]) — lista de mensajes</li>
                    <li><strong>title</strong> (string, opcional) — título del modal</li>
                    <li><strong>messageText</strong> (string, opcional) — texto descriptivo principal</li>
                  </ul>
                  <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<ErrorListModal show={open} errors={errors} title="Mi título" messageText="Mi mensaje" />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowErrorList(true)}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>ErrorListModal.jsx</span>
              </button>
            </div>
          </div>

          {/* SuccessModal - Activa */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-100 hover:border-green-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">SuccessModal</h3>
                  <p className="text-xs text-gray-500 font-mono">SuccessModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal verde de éxito. Confirma que la capacitación fue guardada y/o habilitada.
                Se usa tanto para confirmaciones de creación, edición y activación.
              </p>
              <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                <p className="text-xs text-green-800 font-medium">🎨 Color: Verde (#10B981)</p>
                <p className="text-xs text-green-800 mt-1">✅ Estado: Éxito / Habilitada</p>

                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Components/Modals/CreateTrainingModal.jsx</code></li>
                    <li><code>Front/src/Pages/AdminPanel/GestionCapacitacion.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>show</strong> (boolean)</li>
                    <li><strong>onClose</strong> (function)</li>
                    <li><strong>message</strong> (string, opcional) — mensaje personalizado</li>
                    <li><strong>isEditing</strong> (boolean, opcional) — altera el texto</li>
                    <li><strong>isActive</strong> (boolean, opcional) — muestra badge de HABILITADA</li>
                  </ul>
                <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<SuccessModal show={open} isEditing={false} isActive={true} message="Guardado" />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessActive(true)}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>SuccessModal.jsx (Activa)</span>
              </button>
            </div>
          </div>

          {/* WarningModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-100 hover:border-yellow-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">WarningModal</h3>
                  <p className="text-xs text-gray-500 font-mono">WarningModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal amarillo para advertencias. Usado para validaciones de archivos, tamaños, formatos, etc.
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
                <p className="text-xs text-yellow-800 font-medium">🎨 Color: Amarillo (#F59E0B)</p>
                <p className="text-xs text-yellow-800 mt-1">⚠️ Advertencias no críticas</p>

                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Components/Modals/CreateTrainingModal.jsx</code></li>
                    <li><code>Front/src/Pages/AdminPanel/GestionCapacitacion.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>show</strong> (boolean)</li>
                    <li><strong>onClose</strong> (function)</li>
                    <li><strong>message</strong> (string)</li>
                    <li><strong>title</strong> (string, opcional)</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowWarning(true)}
                className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>WarningModal.jsx</span>
              </button>
            </div>
          </div>

          {/* ConfirmActionModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">ConfirmActionModal</h3>
                  <p className="text-xs text-gray-500 font-mono">ConfirmActionModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal de confirmación para acciones destructivas. Tiene botones de Confirmar y Cancelar.
              </p>
              <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
                <p className="text-xs text-orange-800 font-medium">🎨 Color: Rojo/Gris</p>
                <p className="text-xs text-orange-800 mt-1">❓ Confirmación de acción</p>

                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Pages/AdminPanel/GestionCapacitacion.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEnviados.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEntrada.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEliminados.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>open</strong> (boolean)</li>
                    <li><strong>title</strong> (string) — título del modal</li>
                    <li><strong>message</strong> (string) — descripción</li>
                    <li><strong>confirmLabel</strong> (string)</li>
                    <li><strong>cancelLabel</strong> (string)</li>
                    <li><strong>onConfirm</strong> (function)</li>
                    <li><strong>onClose</strong> (function)</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver modal</span>
              </button>
            </div>
          </div>

          {/* ValidationErrorModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-pink-100 hover:border-pink-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">ValidationErrorModal</h3>
                  <p className="text-xs text-gray-500 font-mono">ValidationErrorModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal para errores de validación de formularios. Usado en registro y actualización de usuarios.
              </p>
              <div className="bg-pink-50 rounded-lg p-3 mb-4 border border-pink-200">
                <p className="text-xs text-pink-800 font-medium">🎨 Color: Rosa/Rojo</p>
                <p className="text-xs text-pink-800 mt-1">📋 Validación de formularios</p>

                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Pages/Register/Register.jsx</code></li>
                    <li><code>Front/src/Pages/Register/ActualizarUsuario.jsx</code></li>
                    <li><code>Front/src/Pages/Login/Login.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>mensaje</strong> (string) — texto a mostrar</li>
                    <li><strong>onClose</strong> (function)</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowValidationError(true)}
                className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver modal</span>
              </button>
            </div>
          </div>

          {/* ErrorModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-100 hover:border-red-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">ErrorModal</h3>
                  <p className="text-xs text-gray-500 font-mono">ErrorModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal simple para errores generales. Muestra un mensaje de error con un ícono X rojo.
              </p>
              <div className="bg-red-50 rounded-lg p-2.5 mb-4 border border-red-200">
                <p className="text-xs text-red-800 font-medium">🎨 Color: Rojo (#EF4444)</p>
                <p className="text-xs text-red-800 mt-1">❌ Error genérico</p>
                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Components/Mensajeria/BuzonSalida.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEnviados.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEntrada.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEliminados.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>mensaje</strong> (string) — texto a mostrar</li>
                    <li><strong>onClose</strong> (function) — callback al cerrar</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<ErrorModal mensaje="Ocurrió un error" onClose={() => setError(null)} />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowError(true)}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver modal</span>
              </button>
            </div>
          </div>

          {/* ImageCropModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-sky-100 hover:border-sky-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">ImageCropModal</h3>
                  <p className="text-xs text-gray-500 font-mono">ImageCropModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal para recortar y centrar imágenes de perfil. Permite zoom y ajuste de posición.
              </p>
              <div className="bg-sky-50 rounded-lg p-2.5 mb-4 border border-sky-200">
                <p className="text-xs text-sky-800 font-medium">🎨 Color: Azul cielo</p>
                <p className="text-xs text-sky-800 mt-1">✂️ Editor de imágenes</p>
                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Components/Modals/ProfilePreferencesModal.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>open</strong> (boolean)</li>
                    <li><strong>onClose</strong> (function)</li>
                    <li><strong>imageSrc</strong> (string) — URL o base64 de la imagen</li>
                    <li><strong>onCropComplete</strong> (function) — recibe blob o dataURL</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<ImageCropModal open={open} imageSrc={url} onCropComplete={(blob) => {}} onClose={() => setOpen(false)} />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowImageCrop(true)}
                className="w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver modal</span>
              </button>
            </div>
          </div>

          {/* RegisterModal - Éxito */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">RegisterModal</h3>
                  <p className="text-xs text-gray-500 font-mono">RegisterModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal usado en registro de usuarios. Muestra éxito o error según el código de respuesta.
              </p>
              <div className="bg-emerald-50 rounded-lg p-2.5 mb-4 border border-emerald-200">
                <p className="text-xs text-emerald-800 font-medium">🎨 Color: Verde/Rojo</p>
                <p className="text-xs text-emerald-800 mt-1">👤 Registro exitoso</p>
                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Pages/Register/Register.jsx</code></li>
                    <li><code>Front/src/Pages/Register/ActualizarUsuario.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>codigo</strong> (number) — código HTTP o indicador</li>
                    <li><strong>mensaje</strong> (string) — texto a mostrar</li>
                    <li><strong>onClose</strong> (function)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<RegisterModal codigo={201} mensaje="Registro exitoso" onClose={() => setShow(false)} />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterSuccess(true)}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver éxito</span>
              </button>
            </div>
          </div>

          {/* RegisterModal - Error */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-rose-100 hover:border-rose-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">RegisterModal</h3>
                  <p className="text-xs text-gray-500 font-mono">RegisterModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal usado en registro de usuarios. Variante de error cuando el código es 400+.
              </p>
              <div className="bg-rose-50 rounded-lg p-2.5 mb-4 border border-rose-200">
                <p className="text-xs text-rose-800 font-medium">🎨 Color: Rojo</p>
                <p className="text-xs text-rose-800 mt-1">👤 Error de registro</p>
                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Pages/Register/Register.jsx</code></li>
                    <li><code>Front/src/Pages/Register/ActualizarUsuario.jsx</code></li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>codigo</strong> (number)</li>
                    <li><strong>mensaje</strong> (string)</li>
                    <li><strong>onClose</strong> (function)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<RegisterModal codigo={400} mensaje="Email ya registrado" onClose={() => setShow(false)} />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterError(true)}
                className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver error</span>
              </button>
            </div>
          </div>

          {/* SucessModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">SucessModal</h3>
                  <p className="text-xs text-gray-500 font-mono">SucessModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal de éxito para mensajería. Confirma que un mensaje fue enviado correctamente.
              </p>
              <div className="bg-teal-50 rounded-lg p-2.5 mb-4 border border-teal-200">
                <p className="text-xs text-teal-800 font-medium">🎨 Color: Verde</p>
                <p className="text-xs text-teal-800 mt-1">✉️ Mensaje enviado</p>
                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Pages/UserPanel/Student/Mensajeria.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEnviados.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonEntrada.jsx</code></li>
                    <li><code>Front/src/Components/Mensajeria/BuzonSalida.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>titulo</strong> (string) — título a mostrar</li>
                    <li><strong>mensaje</strong> (string) — texto descriptivo</li>
                    <li><strong>onClose</strong> (function)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<SucessModal titulo="Mensaje enviado" mensaje="Tu mensaje se envió correctamente" onClose={() => setShow(false)} />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowSucessModal(true)}
                className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver modal</span>
              </button>
            </div>
          </div>

          {/* AuthErrorModal */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-100 hover:border-red-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">AuthErrorModal</h3>
                  <p className="text-xs text-gray-500 font-mono">AuthErrorModal.jsx</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Modal para errores de autenticación. Muestra un círculo rojo con exclamación y botón verde.
              </p>
              <div className="bg-red-50 rounded-lg p-2.5 mb-4 border border-red-200">
                <p className="text-xs text-red-800 font-medium">🎨 Color: Rojo/Verde</p>
                <p className="text-xs text-red-800 mt-1">🔒 Error de autenticación</p>
                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-gray-700">Usado en:</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><code>Front/src/Pages/Login/Login.jsx</code></li>
                    <li><code>Front/src/Pages/ModalShowcase.jsx</code> (demo)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Props</p>
                  <ul className="text-xs text-gray-600 ml-4 list-disc">
                    <li><strong>mensaje</strong> (string)</li>
                    <li><strong>onClose</strong> (function)</li>
                  </ul>

                  <p className="text-xs font-semibold text-gray-700 mt-2">Cómo usar</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`<AuthErrorModal mensaje="Credenciales inválidas" onClose={() => setShow(false)} />`}</code></pre>
                </div>
              </div>
              <button
                onClick={() => setShowAuthError(true)}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver modal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-xl font-bold mb-2">Tips de Diseño</h3>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Rojo:</strong> Errores críticos, validaciones fallidas, acciones destructivas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Amarillo:</strong> Advertencias, validaciones de formato, límites de tamaño</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Verde:</strong> Confirmaciones de éxito, acciones completadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Azul:</strong> Información, estados intermedios (borradores)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Render de todos los modales */}
      {/* Ejemplo de uso: ErrorListModal */}
      <ErrorListModal
        show={showErrorList}
        onClose={() => setShowErrorList(false)}
        errors={sampleErrors}
        title={"No se puede completar la acción"}
        messageText={"Revise los siguientes requisitos:"}
      />

      {/* Ejemplo de uso: SuccessModal */}
      <SuccessModal
        show={showSuccessActive}
        onClose={() => setShowSuccessActive(false)}
        isEditing={true}
        isActive={true}
        message={"La capacitación fue guardada y habilitada correctamente."}
      />

      <SuccessModal
        show={showSuccessDraft}
        onClose={() => setShowSuccessDraft(false)}
        isEditing={true}
        isActive={false}
        message={"La capacitación se guardó como borrador."}
      />

      <SuccessModal
        show={showSuccessNew}
        onClose={() => setShowSuccessNew(false)}
        isEditing={false}
        isActive={true}
        message={"Nueva capacitación creada y habilitada."}
      />

      {/* Ejemplo de uso: WarningModal */}
      <WarningModal
        show={showWarning}
        onClose={() => setShowWarning(false)}
        message="El archivo excede el tamaño máximo permitido de 50MB. Por favor, selecciona un archivo más pequeño."
        title="Archivo demasiado grande"
      />

      {/* Ejemplo de uso: ConfirmActionModal */}
      <ConfirmActionModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="¿Eliminar capacitación?"
        message="Esta acción eliminará permanentemente la capacitación y todos sus niveles asociados."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setShowConfirm(false);
        }}
      />

      {showValidationError && (
        <ValidationErrorModal
          mensaje="Por favor, completa todos los campos obligatorios antes de continuar."
          onClose={() => setShowValidationError(false)}
        />
      )}

      {showError && (
        <ErrorModal
          mensaje="Ha ocurrido un error inesperado. Por favor, intenta nuevamente."
          onClose={() => setShowError(false)}
        />
      )}

      {showImageCrop && (
        <ImageCropModal
          open={showImageCrop}
          onClose={() => setShowImageCrop(false)}
          imageSrc={cropImage}
          onCropComplete={(blob) => {
            // handled in demo: image cropped
            setShowImageCrop(false);
          }}
        />
      )}

      {showRegisterSuccess && (
        <RegisterModal
          codigo={201}
          mensaje="¡Registro exitoso! Tu cuenta ha sido creada correctamente."
          onClose={() => setShowRegisterSuccess(false)}
        />
      )}

      {showRegisterError && (
        <RegisterModal
          codigo={400}
          mensaje="El email ya está registrado. Por favor, usa otro email."
          onClose={() => setShowRegisterError(false)}
        />
      )}

      {showSucessModal && (
        <SucessModal
          titulo="Mensaje enviado"
          mensaje="Tu mensaje se envió correctamente."
          onClose={() => setShowSucessModal(false)}
        />
      )}

      {showAuthError && (
        <AuthErrorModal
          mensaje="Usuario o contraseña incorrectos. Por favor, verifica tus credenciales."
          onClose={() => setShowAuthError(false)}
        />
      )}
    </div>
  );
}
