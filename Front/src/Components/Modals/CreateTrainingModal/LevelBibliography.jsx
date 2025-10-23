import React, { useState } from 'react';
import RichTextInput, { getPlainTextFromRichText } from './RichTextInput';

export default function LevelBibliography({
  bibliography,
  updateLevelField,
  levelIndex,
  uploadingFiles,
  handleFileUpload,
  handleFileDelete,
  showWarningModal,
  onTempValuesChange,
  editingIndex,
  setEditingIndex
}) {
  const [tempBibTitle, setTempBibTitle] = useState('');
  const [tempBibDescription, setTempBibDescription] = useState('');
  const [tempBibDescriptionLength, setTempBibDescriptionLength] = useState(0);
  const [tempBibUrl, setTempBibUrl] = useState('');
  const isEditing = typeof editingIndex === 'number' && editingIndex >= 0;

  // Log para debug de bibliografía recibida
  React.useEffect(() => {
    // removed debug logs; kept effect placeholder for future instrumentation if needed
  }, [bibliography, levelIndex]);

  React.useEffect(() => {
    if (!isEditing) return;
    const item = bibliography?.[editingIndex];
    if (!item) {
      if (setEditingIndex) {
        setEditingIndex(null);
      }
      setTempBibTitle('');
      setTempBibDescription('');
      setTempBibDescriptionLength(0);
      setTempBibUrl('');
      return;
    }
    setTempBibTitle(item.title || '');
    setTempBibDescription(item.description || '');
    setTempBibUrl(item.url || '');
  }, [isEditing, editingIndex, bibliography, setEditingIndex]);

  // Notificar cambios al padre
  React.useEffect(() => {
    if (onTempValuesChange) {
      onTempValuesChange({
        title: tempBibTitle,
        description: tempBibDescription,
        url: tempBibUrl
      });
    }
  }, [tempBibTitle, tempBibDescription, tempBibUrl, onTempValuesChange]);

  const resetForm = () => {
    if (setEditingIndex) {
      setEditingIndex(null);
    }
    setTempBibTitle('');
    setTempBibDescription('');
    setTempBibDescriptionLength(0);
    setTempBibUrl('');
  };

  const saveBibliographyItem = () => {
    const hasTitle = Boolean(tempBibTitle?.trim());
    const hasUrl = Boolean(tempBibUrl?.trim());
    if (!hasTitle && !hasUrl) {
      return;
    }

    const nextItem = {
      title: tempBibTitle,
      description: tempBibDescription,
      url: tempBibUrl
    };

    if (isEditing) {
      if (!bibliography || !bibliography[editingIndex]) {
        return;
      }
      const updatedList = [...bibliography];
      updatedList[editingIndex] = nextItem;
      updateLevelField(updatedList);
      resetForm(); // Resetear formulario después de guardar cambios
    } else {
      const newBibliography = [...(bibliography || [])];
      newBibliography.push(nextItem);
      updateLevelField(newBibliography);
      resetForm();
    }
  };

  React.useEffect(() => {
    const currentLength = Math.min(getPlainTextFromRichText(tempBibDescription).length, 250);
    setTempBibDescriptionLength((prev) => (prev !== currentLength ? currentLength : prev));
  }, [tempBibDescription]);

  return (
    <div className="border border-gray-300 rounded-sm p-1.5 bg-white">
      {/* Formulario para agregar nuevo elemento */}
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
          {isEditing && (
            <tr>
              <td colSpan="2" className="px-1.5 py-1 border border-gray-300 bg-yellow-50 text-xs text-yellow-700">
                Editando bibliografía #{(editingIndex ?? 0) + 1}. Guardá los cambios o cancela la edición para volver a agregar nuevos materiales.
              </td>
            </tr>
          )}
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
              Título
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <RichTextInput
                value={tempBibTitle}
                onChange={(html) => setTempBibTitle(html)}
                maxLength={100}
                placeholder="Ingrese el título de la bibliografía (Max caracteres: 100)"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{getPlainTextFromRichText(tempBibTitle).length}/100 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Descripción
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <RichTextInput
                value={tempBibDescription}
                onChange={(html, plainLength) => {
                  setTempBibDescription(html);
                  setTempBibDescriptionLength(Math.min(plainLength, 250));
                }}
                maxLength={250}
                placeholder="Ingrese la descripción de la bibliografía (Max caracteres: 250)"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{tempBibDescriptionLength}/250 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Url o Archivo
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={tempBibUrl}
                  onChange={(e) => setTempBibUrl(e.target.value)}
                  placeholder="https://ejemplo.com/documento.pdf"
                  className="flex-1 border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent"
                />
                {tempBibUrl && tempBibUrl.startsWith('/uploads/') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempBibUrl('');
                    }}
                    className="text-red-600 hover:text-red-800 text-xs px-1.5 py-0.5 border border-red-200 rounded-md cursor-pointer"
                  >
                    ✕
                  </button>
                )}
                <label className="bg-gray-500 border border-gray-500 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-600">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.size > 50 * 1024 * 1024) {
                        if (showWarningModal) {
                          showWarningModal('El archivo es demasiado grande. Máximo 50 MB.');
                        }
                        e.target.value = '';
                        return;
                      }

                      try {
                        // Si ya hay un archivo subido, simplemente lo reemplazamos (no eliminar hasta guardar)
                        // Usar el índice correcto: si está editando, usar editingIndex, sino usar bibliography.length (nuevo item)
                        const bibIndex = isEditing ? editingIndex : (bibliography?.length || 0);
                        const response = await handleFileUpload(file, levelIndex, 'bib', bibIndex);
                        const filePath = typeof response === 'string' ? response : response?.filePath;
                        if (!filePath) {
                          throw new Error('No se recibió la ruta del archivo');
                        }
                        setTempBibUrl(filePath);
                      } catch (error) {
                        console.error('Error preparando archivo:', error);
                        if (showWarningModal) {
                          showWarningModal(`Error: ${error.message || 'Error desconocido'}`);
                        }
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                {uploadingFiles && uploadingFiles[`level-${levelIndex}-training`] && (
                  <div className="animate-spin h-3 w-3 border-2 border-gray-200 border-t-green-600 rounded-full" />
                )}
              </div>
              <p className="text-[10px] text-indigo-600 mt-0.5 text-right">Menor a 50 Mb - Música, Video o Documento</p>
            </td>
          </tr>
          <tr>
            <td colSpan="2" className="px-1.5 py-1 border border-gray-300">
              <div className={`flex items-center ${isEditing ? 'justify-between' : 'justify-end'} gap-2`}>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 px-3 py-1.5 rounded-sm text-xs font-medium cursor-pointer"
                  >
                    Cancelar edición
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveBibliographyItem}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-green-600 px-3 py-1.5 rounded-sm text-xs font-medium cursor-pointer"
                >
                  {isEditing ? 'Guardar cambios' : '+ Agregar'}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
