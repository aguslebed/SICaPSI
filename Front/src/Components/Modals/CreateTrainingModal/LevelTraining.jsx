import React, { useState } from 'react';
import RichTextInput, { getPlainTextFromRichText } from './RichTextInput';
import ConfirmActionModal from '../ConfirmActionModal';

export default function LevelTraining({ level, levelIndex, updateLevelField, uploadingFiles, handleFileUpload, handleFileDelete, showWarningModal }) {
  const [showConfirmDeleteFile, setShowConfirmDeleteFile] = useState(false);
  return (
    <>
      <div className="border border-gray-300 rounded-sm p-1.5 bg-white">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 text-xs font-semibold border border-gray-400" style={{ width: '25%' }}>
              Campo
            </th>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 text-xs font-semibold border border-gray-400">
              Datos
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
              Título
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <RichTextInput
                value={level.training.title}
                onChange={(html) => updateLevelField(levelIndex, 'training.title', html)}
                maxLength={100}
                placeholder="Ingrese el título de la Clase Magistral (Max caracteres: 100)"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{getPlainTextFromRichText(level.training.title).length}/100 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Descripción
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <RichTextInput
                value={level.training.description}
                onChange={(html) => updateLevelField(levelIndex, 'training.description', html)}
                maxLength={1000}
                placeholder="Ingrese la descripción de la Clase Magistral (Max caracteres: 1000)"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{getPlainTextFromRichText(level.training.description).length}/1000 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">Url o Archivo</td>
            <td className="px-1.5 py-1 border border-gray-300">
              <div>
                <div className="flex items-center">
                  <input
                    value={level.training.url}
                    onChange={async (e) => {
                      const newValue = e.target.value;
                      const currentValue = level.training.url;

                      if (currentValue && currentValue.startsWith('/uploads/') && currentValue !== newValue) {
                        try {
                          await handleFileDelete(currentValue, levelIndex);
                        } catch (error) {
                          console.error('Error eliminando archivo anterior:', error);
                        }
                      }

                      updateLevelField(levelIndex, 'training.url', newValue);
                    }}
                    className="flex-1 border border-gray-200 rounded-sm px-2 py-1.5 text-xs placeholder:text-xs font-normal focus:ring-2 focus:ring-green-50 focus:border-green-300 bg-white"
                    placeholder="URL del video"
                  />

                  <div className="flex items-center gap-2 ml-2">
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".mp4,.webm,.ogv,.pdf,.ppt,.pptx"
                        onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const response = await handleFileUpload(file, levelIndex, 'training');
                          const filePath = typeof response === 'string' ? response : response?.filePath;
                          if (!filePath) {
                            throw new Error('No se recibió la ruta del archivo');
                          }
                          updateLevelField(levelIndex, 'training.url', filePath);
                        } catch (err) {
                          console.error('Error preparando archivo:', err);
                          if (showWarningModal) {
                            showWarningModal(`Error: ${err.message || 'Error desconocido'}`);
                          }
                        } finally {
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                        disabled={uploadingFiles && uploadingFiles[`training-${levelIndex}`]}
                      />
                      <span className="inline-block bg-gray-500 border border-gray-500 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-600">Choose File</span>
                    </label>

                    {uploadingFiles && uploadingFiles[`level-${levelIndex}-training`] && <div className="animate-spin h-3 w-3 border-2 border-gray-200 border-t-green-600 rounded-full" />}
                    {level.training.url && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmDeleteFile(true)}
                        className="text-red-600 hover:text-red-800 text-xs px-1.5 py-0.5 border border-red-200 rounded-md cursor-pointer"
                        title="Eliminar archivo/URL"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-indigo-600 mt-0.5 text-right">Menor a 100 Mb - formatos permitido: MP4, WebM, OGV</p>
              </div>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Duración (min)
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <input
                type="text"
                value={level.training.duration}
                onChange={(e) => {
                  const value = e.target.value;
                  // Solo permite números enteros positivos
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    updateLevelField(levelIndex, 'training.duration', value === '' ? 0 : parseInt(value));
                  }
                }}
                className="w-full border border-gray-200 rounded-sm px-2 py-1.5 text-xs placeholder:text-xs font-normal focus:ring-2 focus:ring-green-50 focus:border-green-300 bg-white"
                placeholder="45"
              />
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <ConfirmActionModal
        open={showConfirmDeleteFile}
        onClose={() => setShowConfirmDeleteFile(false)}
        title="Eliminar archivo"
        message="¿Confirma que desea eliminar este archivo/URL de la clase magistral?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          try {
            const currentValue = level.training?.url;
            if (currentValue && typeof currentValue === 'string' && currentValue.startsWith('/uploads/')) {
              try {
                await handleFileDelete(currentValue, levelIndex);
              } catch (err) {
                console.error('Error eliminando archivo en servidor:', err);
                if (showWarningModal) showWarningModal(`Error eliminando archivo: ${err.message}`);
              }
            }
          } finally {
            updateLevelField(levelIndex, 'training.url', '');
            setShowConfirmDeleteFile(false);
          }
        }}
      />
    </>
  );
}

