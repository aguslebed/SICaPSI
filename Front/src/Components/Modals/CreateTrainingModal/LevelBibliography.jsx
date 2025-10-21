import React, { useState } from 'react';

export default function LevelBibliography({ bibliography, updateLevelField, levelIndex, uploadingFiles, handleFileUpload, handleFileDelete }) {
  const [tempBibTitle, setTempBibTitle] = useState('');
  const [tempBibDescription, setTempBibDescription] = useState('');
  const [tempBibUrl, setTempBibUrl] = useState('');

  const addBib = () => {
    if (!tempBibTitle && !tempBibUrl) return;
    const newBibliography = [...(bibliography || [])];
    newBibliography.push({
      title: tempBibTitle,
      description: tempBibDescription,
      url: tempBibUrl
    });
    updateLevelField(newBibliography);
    setTempBibTitle('');
    setTempBibDescription('');
    setTempBibUrl('');
  };

  return (
    <div className="border border-gray-300 rounded-sm p-2 bg-white">
      {/* Formulario para agregar nuevo elemento */}
      <table className="w-full border-collapse text-sm mb-3">
        <thead>
          <tr>
            <th colSpan="2" className="bg-gray-500 text-white px-2 py-1.5 text-sm font-semibold text-left border border-gray-400">
              Agregar material bibliográfico
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
              Título
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <input
                type="text"
                value={tempBibTitle}
                onChange={(e) => setTempBibTitle(e.target.value)}
                placeholder="Ingrese el título del material"
                className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
              />
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Descripción
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <textarea
                value={tempBibDescription}
                onChange={(e) => setTempBibDescription(e.target.value)}
                placeholder="Ingrese una descripción breve (opcional)"
                rows="2"
                className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent resize-none"
              />
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Archivo o enlace
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={tempBibUrl}
                  onChange={(e) => setTempBibUrl(e.target.value)}
                  placeholder="https://ejemplo.com/documento.pdf"
                  className="flex-1 border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                />
                {tempBibUrl && tempBibUrl.startsWith('/uploads/') && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (tempBibUrl && typeof tempBibUrl === 'string' && tempBibUrl.startsWith('/uploads/')) {
                        try {
                          await handleFileDelete(tempBibUrl, levelIndex);
                        } catch (error) {
                          console.error('Error eliminando archivo:', error);
                        }
                      }
                      setTempBibUrl('');
                    }}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded-md cursor-pointer"
                  >
                    ✕
                  </button>
                )}
                <label className="bg-gray-500 border border-gray-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-600">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.size > 10 * 1024 * 1024) {
                        alert('El archivo es demasiado grande. Máximo 10 MB.');
                        e.target.value = '';
                        return;
                      }

                      try {
                        // Si ya hay un archivo subido, eliminarlo primero
                        if (tempBibUrl && tempBibUrl.startsWith('/uploads/')) {
                          try {
                            await handleFileDelete(tempBibUrl, levelIndex);
                          } catch (error) {
                            console.error('Error eliminando archivo anterior:', error);
                          }
                        }

                        const response = await handleFileUpload(file, levelIndex);
                        setTempBibUrl(response.filePath);
                      } catch (error) {
                        console.error('Error subiendo archivo:', error);
                        alert(`Error subiendo archivo: ${error.message}`);
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                {uploadingFiles && uploadingFiles[`level-${levelIndex}-training`] && (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-200 border-t-green-600 rounded-full" />
                )}
              </div>
              <p className="text-xs text-indigo-600 mt-1 text-right">Menor a 10 Mb - Formatos: PDF, DOC, DOCX</p>
            </td>
          </tr>
          <tr>
            <td colSpan="2" className="px-2 py-1.5 border border-gray-300 text-right">
              <button
                type="button"
                onClick={addBib}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-sm text-sm font-medium cursor-pointer"
              >
                + Agregar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Lista de elementos agregados */}
      {bibliography && bibliography.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-gray-500 text-white px-2 py-1.5 text-sm font-semibold text-left border border-gray-400">
                Bibliografía agregada ({bibliography.length})
              </th>
            </tr>
          </thead>
          <tbody>
            {bibliography.map((item, index) => (
              <tr key={index}>
                <td className="px-2 py-2 border border-gray-300">
                  <div className="border border-gray-200 rounded-sm p-2 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.url && item.url.startsWith('http') ? '🔗' : '📄'} Material #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          // Si el item tiene un archivo local, eliminarlo del servidor
                          if (item.url && item.url.startsWith('/uploads/')) {
                            try {
                              await handleFileDelete(item.url, levelIndex);
                            } catch (error) {
                              console.error('Error eliminando archivo:', error);
                            }
                          }
                          // Eliminar el item del array
                          const newBibliography = [...bibliography];
                          newBibliography.splice(index, 1);
                          updateLevelField(newBibliography);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded-md cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>

                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        <tr>
                          <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
                            Título
                          </td>
                          <td className="px-2 py-1.5 border border-gray-300">
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => {
                                const newBibliography = [...bibliography];
                                newBibliography[index] = { ...newBibliography[index], title: e.target.value };
                                updateLevelField(newBibliography);
                              }}
                              placeholder="Título del material"
                              className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
                            Descripción
                          </td>
                          <td className="px-2 py-1.5 border border-gray-300">
                            <textarea
                              value={item.description || ''}
                              onChange={(e) => {
                                const newBibliography = [...bibliography];
                                newBibliography[index] = { ...newBibliography[index], description: e.target.value };
                                updateLevelField(newBibliography);
                              }}
                              placeholder="Descripción breve"
                              rows="2"
                              className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent resize-none"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
                            Archivo o enlace
                          </td>
                          <td className="px-2 py-1.5 border border-gray-300">
                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                value={item.url || ''}
                                onChange={(e) => {
                                  const newBibliography = [...bibliography];
                                  newBibliography[index] = { ...newBibliography[index], url: e.target.value };
                                  updateLevelField(newBibliography);
                                }}
                                placeholder="URL del recurso"
                                className="flex-1 border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                              />
                              {item.url && item.url.startsWith('/uploads/') && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const currentUrl = item.url;
                                    if (currentUrl && currentUrl.startsWith('/uploads/')) {
                                      try {
                                        await handleFileDelete(currentUrl, levelIndex);
                                      } catch (error) {
                                        console.error('Error eliminando archivo:', error);
                                      }
                                    }
                                    const newBibliography = [...bibliography];
                                    newBibliography[index] = { ...newBibliography[index], url: '' };
                                    updateLevelField(newBibliography);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded-md cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                              <label className="bg-gray-500 border border-gray-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-600">
                                Choose File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (file.size > 10 * 1024 * 1024) {
                                      alert('El archivo es demasiado grande. Máximo 10 MB.');
                                      e.target.value = '';
                                      return;
                                    }

                                    try {
                                      // Si ya hay un archivo subido, eliminarlo primero
                                      const currentUrl = item.url;
                                      if (currentUrl && currentUrl.startsWith('/uploads/')) {
                                        try {
                                          await handleFileDelete(currentUrl, levelIndex);
                                        } catch (error) {
                                          console.error('Error eliminando archivo anterior:', error);
                                        }
                                      }

                                      const response = await handleFileUpload(file, levelIndex);
                                      const newBibliography = [...bibliography];
                                      newBibliography[index] = { ...newBibliography[index], url: response.filePath };
                                      updateLevelField(newBibliography);
                                    } catch (error) {
                                      console.error('Error subiendo archivo:', error);
                                      alert(`Error subiendo archivo: ${error.message}`);
                                    } finally {
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </label>
                              {uploadingFiles && uploadingFiles[`level-${levelIndex}-training`] && (
                                <div className="animate-spin h-4 w-4 border-2 border-gray-200 border-t-green-600 rounded-full" />
                              )}
                            </div>
                            {item.url && (
                              <p className="text-xs text-indigo-600 mt-1 text-right truncate" title={item.url}>
                                {item.url.startsWith('/uploads/') ? '📄' : '🔗'} {item.url}
                              </p>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(!bibliography || bibliography.length === 0) && (
        <div className="text-center py-6 px-2 border border-gray-300 rounded-sm bg-gray-50">
          <p className="text-sm text-gray-500">📚 No hay elementos en la bibliografía</p>
          <p className="text-xs text-gray-400 mt-1">Agregue materiales usando el formulario de arriba</p>
        </div>
      )}
    </div>
  );
}
