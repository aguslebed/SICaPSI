import React from 'react';
import RichTextInput, { getPlainTextFromRichText } from './RichTextInput';

export default function LevelTestEditor({ level, levelIndex, updateLevelField, selectedScene, setSelectedScene, selectedOption, setSelectedOption, handleFileUpload, handleFileDelete, showWarningModal }) {
  return (
    <div className="border border-gray-300 rounded-sm p-1.5 md:p-1.5 lg:p-2 xl:p-2 bg-white space-y-2">
      {/* Información general del test */}
      <table className="w-full border-collapse text-xs md:text-xs lg:text-xs xl:text-sm">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400" style={{ width: '20%' }}>
              Campo
            </th>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400">
              Datos
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '20%' }}>
              Título
            </td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <RichTextInput
                value={level.test.title}
                onChange={(html) => updateLevelField(levelIndex, 'test.title', html)}
                onFocus={() => { setSelectedScene(null); }}
                maxLength={100}
                placeholder="Ingrese el título del test (Max caracteres: 100)"
              />
              <p className="text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-gray-500 mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1 text-right">{getPlainTextFromRichText(level.test.title).length}/100 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">
              Descripción
            </td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <RichTextInput
                value={level.test.description}
                onChange={(html) => updateLevelField(levelIndex, 'test.description', html)}
                onFocus={() => { setSelectedScene(null); }}
                maxLength={250}
                placeholder="Ingrese la descripción de la evaluación (Max caracteres: 250)"
              />
              <p className="text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-gray-500 mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1 text-right">{getPlainTextFromRichText(level.test.description).length}/250 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Url o Imagen
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    value={level.test.imageUrl || ''}
                    onChange={(e) => updateLevelField(levelIndex, 'test.imageUrl', e.target.value)}
                    onFocus={() => { setSelectedScene(null); }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs placeholder:text-xs font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent"
                    placeholder="URL de imagen o deja vacío para subir archivo"
                  />

                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 5 * 1024 * 1024) {
                          if (showWarningModal) {
                            showWarningModal('El archivo es demasiado grande. Máximo 5 MB.');
                          }
                          e.target.value = '';
                          return;
                        }

                        if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
                          if (showWarningModal) {
                            showWarningModal('Formato no válido. Solo JPG, PNG, GIF, WebP.');
                          }
                          e.target.value = '';
                          return;
                        }

                        try {
                          const currentImageUrl = level.test.imageUrl;
                          if (currentImageUrl && typeof currentImageUrl === 'string' && currentImageUrl.startsWith('/uploads/')) {
                            // No eliminar hasta guardar
                          }

                          const response = await handleFileUpload(file, levelIndex, 'test');
                          const filePath = typeof response === 'string' ? response : response?.filePath;
                          if (!filePath) {
                            throw new Error('No se recibió la ruta del archivo');
                          }
                          updateLevelField(levelIndex, 'test.imageUrl', filePath);
                          e.target.value = '';
                        } catch (error) {
                          console.error('Error preparando imagen del test:', error);
                          if (showWarningModal) {
                            showWarningModal(`Error: ${error.message}`);
                          }
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                    <span className="inline-block px-3 py-1.5 bg-gray-500 border border-gray-500 rounded-lg text-xs text-white cursor-pointer hover:bg-gray-600">Choose File</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    {level.test.imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateLevelField(levelIndex, 'test.imageUrl', '');
                        }}
                        className="text-red-600 hover:text-red-800 text-xs px-1.5 py-0.5 border border-red-200 rounded-md cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-0.5 text-[10px] text-indigo-600 text-right">Menor a 5 Mb - Formatos: JPG, PNG, GIF, WebP</div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Estado
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <div className="flex items-center gap-1.5">
                <input 
                  type="checkbox" 
                  id={`test-active-${levelIndex}`} 
                  checked={level.test.isActive} 
                  onChange={(e) => updateLevelField(levelIndex, 'test.isActive', e.target.checked)} 
                  className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor={`test-active-${levelIndex}`} className="text-xs cursor-pointer">Test activo</label>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Gestión de escenas */}
      <div className="border-t border-gray-300 pt-2">
        <div className="flex items-center justify-end gap-1.5 mb-1.5 px-1.5 py-1 bg-gray-100 border border-gray-300 rounded-sm">
          {level.test.scenes && level.test.scenes.length > 0 && (
            <select
              value={selectedScene !== null ? selectedScene : ''}
              onChange={(e) => setSelectedScene(e.target.value === '' ? null : parseInt(e.target.value))}
              className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded-sm text-xs cursor-pointer bg-white"
            >
              <option value="">-- Seleccionar escena para editar --</option>
              {level.test.scenes.map((scene, idx) => (
                <option key={idx} value={idx}>
                  Escena {idx + 1} (ID: {scene.idScene || 'Sin ID'})
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => {
              const newScenes = [...(level.test.scenes || [])];
              const newSceneId = newScenes.length > 0 ? Math.max(...newScenes.map(s => s.idScene || 0)) + 1 : 1;
              newScenes.push({
                idScene: '',
                videoUrl: '',
                description: '',
                lastOne: false,
                bonus: 0,
                options: [
                  { description: 'Opción A', points: 10, next: null },
                  { description: 'Opción B', points: 5, next: null }
                ]
              });
              updateLevelField(levelIndex, 'test.scenes', newScenes);
              setSelectedScene(newScenes.length - 1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-green-600 rounded-sm cursor-pointer whitespace-nowrap"
          >
            + Nueva escena
          </button>
        </div>

        {selectedScene !== null && level.test.scenes && level.test.scenes[selectedScene] && (
          <div className="border border-gray-300 rounded-sm p-1.5 mb-1.5 bg-white">
            <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-gray-200">
              <h6 className="text-xs font-medium text-gray-700">Editando: Escena {selectedScene + 1}</h6>
              <button
                type="button"
                onClick={() => {
                  const newScenes = [...(level.test.scenes || [])];
                  newScenes.splice(selectedScene, 1);
                  updateLevelField(levelIndex, 'test.scenes', newScenes);
                  setSelectedScene(null);
                }}
                className="text-red-600 hover:text-red-800 text-xs cursor-pointer"
              >
                Eliminar escena
              </button>
            </div>

            <table className="w-full border-collapse text-xs md:text-xs lg:text-xs xl:text-sm mb-1.5">
              <thead>
                <tr>
                  <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400" style={{ width: '20%' }}>
                    Campo
                  </th>
                  <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400">
                    Datos
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
                    ID de escena
                  </td>
                  <td className="px-1.5 py-1 border border-gray-300">
                    <input
                      type="number"
                      value={level.test.scenes[selectedScene].idScene || ''}
                      onChange={(e) => {
                        const newScenes = [...(level.test.scenes || [])];
                        newScenes[selectedScene] = { ...newScenes[selectedScene], idScene: parseInt(e.target.value) || 0 };
                        updateLevelField(levelIndex, 'test.scenes', newScenes);
                      }}
                      className="w-full border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent"
                      placeholder="ID numérico único de la escena"
                      min="1"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
                    Descripción
                  </td>
                  <td className="px-1.5 py-1 border border-gray-300">
                      <RichTextInput
                        value={level.test.scenes[selectedScene].description || ''}
                        onChange={(html) => {
                          const newScenes = [...(level.test.scenes || [])];
                          newScenes[selectedScene] = { ...newScenes[selectedScene], description: html };
                          updateLevelField(levelIndex, 'test.scenes', newScenes);
                        }}
                        maxLength={500}
                        placeholder="Ingrese la descripción de la escena (Max caracteres: 500)"
                      />
                    <p className="text-[10px] text-gray-500 mt-0.5 text-right">{getPlainTextFromRichText(level.test.scenes[selectedScene].description || '').length}/500 caracteres</p>
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
                    Video
                  </td>
                  <td className="px-1.5 py-1 border border-gray-300">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={level.test.scenes[selectedScene].videoUrl || ''}
                        onChange={(e) => {
                          const newScenes = [...(level.test.scenes || [])];
                          newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: e.target.value };
                          updateLevelField(levelIndex, 'test.scenes', newScenes);
                        }}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs placeholder:text-xs font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent"
                        placeholder="URL del video o deja vacío para subir archivo"
                      />
                      {level.test.scenes[selectedScene].videoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const newScenes = [...(level.test.scenes || [])];
                            newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: '' };
                            updateLevelField(levelIndex, 'test.scenes', newScenes);
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
                          accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/ogg"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (file.size > 100 * 1024 * 1024) {
                              if (showWarningModal) {
                                showWarningModal('El archivo es demasiado grande. Máximo 100 MB.');
                              }
                              e.target.value = '';
                              return;
                            }

                            if (!file.type.match(/^video\/(mp4|quicktime|x-msvideo|x-matroska|webm|ogg)$/)) {
                              if (showWarningModal) {
                                showWarningModal('Formato no válido. Solo MP4, MOV, AVI, MKV, WebM, OGG.');
                              }
                              e.target.value = '';
                              return;
                            }

                            try {
                              // Reemplazar video (no eliminar archivo anterior hasta guardar)
                              const response = await handleFileUpload(file, levelIndex, 'scene', selectedScene);
                              const filePath = typeof response === 'string' ? response : response?.filePath;
                              if (!filePath) {
                                throw new Error('No se recibió la ruta del archivo');
                              }
                              const newScenes = [...(level.test.scenes || [])];
                              newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: filePath };
                              updateLevelField(levelIndex, 'test.scenes', newScenes);
                            } catch (error) {
                              console.error('Error preparando video:', error);
                              if (showWarningModal) {
                                showWarningModal(`Error: ${error.message}`);
                              }
                            } finally {
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="text-[10px] text-indigo-600 mt-0.5 text-right">Menor a 100 Mb - Formatos: MP4, MOV, AVI, MKV, WebM, OGG</div>
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
                    Configuración
                  </td>
                  <td className="px-1.5 py-1 border border-gray-300">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={level.test.scenes[selectedScene].lastOne || false}
                          onChange={(e) => {
                            const newScenes = [...(level.test.scenes || [])];
                            newScenes[selectedScene] = { ...newScenes[selectedScene], lastOne: e.target.checked };
                            updateLevelField(levelIndex, 'test.scenes', newScenes);
                          }}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <span>Última escena</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs text-gray-700">Bonus:</label>
                        <input
                          type="text"
                          value={level.test.scenes[selectedScene].bonus || 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Solo permite números enteros positivos
                            if (value === '' || /^[0-9]+$/.test(value)) {
                              const newScenes = [...(level.test.scenes || [])];
                              newScenes[selectedScene] = { ...newScenes[selectedScene], bonus: value === '' ? 0 : parseInt(value) };
                              updateLevelField(levelIndex, 'test.scenes', newScenes);
                            }
                          }}
                          className="w-16 px-1.5 py-0.5 border border-gray-300 rounded-sm text-xs"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Gestión de botones/opciones */}
            <div className="mt-1.5">
              <div className="flex items-center justify-end mb-1.5 px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded-sm">
                {(!level.test.scenes[selectedScene].options || level.test.scenes[selectedScene].options.length < 2) && (
                  <button
                    type="button"
                    onClick={() => {
                      const newScenes = [...(level.test.scenes || [])];
                      const currentOptions = newScenes[selectedScene].options || [];
                      newScenes[selectedScene] = {
                        ...newScenes[selectedScene],
                        options: [...currentOptions, { description: '', points: 0, next: null }]
                      };
                      updateLevelField(levelIndex, 'test.scenes', newScenes);
                      setSelectedOption(currentOptions.length);
                    }}
                    className="px-1.5 py-0.5 text-xs text-gray-700 bg-white hover:bg-gray-50 border border-green-600 rounded-sm cursor-pointer"
                  >
                    + Agregar botón
                  </button>
                )}
              </div>

              {level.test.scenes[selectedScene].options && level.test.scenes[selectedScene].options.length > 0 && (
                <div className="mb-1.5">
                  <select
                    value={selectedOption !== null ? selectedOption : ''}
                    onChange={(e) => setSelectedOption(e.target.value === '' ? null : parseInt(e.target.value))}
                    className="w-full px-1.5 py-0.5 border border-gray-300 rounded-sm text-xs cursor-pointer bg-white"
                  >
                    <option value="">-- Seleccionar botón para editar --</option>
                    {level.test.scenes[selectedScene].options.map((opt, idx) => (
                      <option key={idx} value={idx}>
                        {opt.description || `Botón ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedOption !== null && level.test.scenes[selectedScene].options && level.test.scenes[selectedScene].options[selectedOption] && (
                <div className="border border-gray-300 rounded-sm p-1.5 bg-gray-50">
                  <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-gray-200">
                    <h6 className="text-xs font-medium text-gray-700">Editando: {level.test.scenes[selectedScene].options[selectedOption].description || `Botón ${selectedOption + 1}`}</h6>
                    <button
                      type="button"
                      onClick={() => {
                        const newScenes = [...(level.test.scenes || [])];
                        const newOptions = [...(newScenes[selectedScene].options || [])];
                        newOptions.splice(selectedOption, 1);
                        newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                        updateLevelField(levelIndex, 'test.scenes', newScenes);
                        setSelectedOption(null);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs cursor-pointer"
                    >
                      Eliminar botón
                    </button>
                  </div>

                  <table className="w-full border-collapse text-xs md:text-xs lg:text-xs xl:text-sm">
                    <thead>
                      <tr>
                        <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400" style={{ width: '20%' }}>
                          Campo
                        </th>
                        <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400">
                          Datos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300" style={{ width: '35%' }}>
                          Texto del botón
                        </td>
                        <td className="px-1.5 py-1 border border-gray-300">
                          <input
                            type="text"
                            value={level.test.scenes[selectedScene].options[selectedOption].description || ''}
                            onChange={(e) => {
                              const newScenes = [...(level.test.scenes || [])];
                              const newOptions = [...(newScenes[selectedScene].options || [])];
                              newOptions[selectedOption] = { ...newOptions[selectedOption], description: e.target.value };
                              newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                              updateLevelField(levelIndex, 'test.scenes', newScenes);
                            }}
                            maxLength={100}
                            className="w-full border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent"
                            placeholder="Texto del botón (ej: Acercarse y abrir la puerta)"
                          />
                          <p className="text-[10px] text-gray-500 mt-0.5 text-right">{(level.test.scenes[selectedScene].options[selectedOption].description || '').length}/100 caracteres</p>
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
                          Puntos
                        </td>
                        <td className="px-1.5 py-1 border border-gray-300">
                          <input
                            type="number"
                            value={level.test.scenes[selectedScene].options[selectedOption].points || 0}
                            onChange={(e) => {
                              const newScenes = [...(level.test.scenes || [])];
                              const newOptions = [...(newScenes[selectedScene].options || [])];
                              newOptions[selectedOption] = { ...newOptions[selectedOption], points: parseInt(e.target.value) || 0 };
                              newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                              updateLevelField(levelIndex, 'test.scenes', newScenes);
                            }}
                            className="w-full border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent"
                            min="0"
                            placeholder="Puntos que otorga esta opción"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
                          Siguiente escena (ID)
                        </td>
                        <td className="px-1.5 py-1 border border-gray-300">
                          <input
                            type="number"
                            value={level.test.scenes[selectedScene].options[selectedOption].next || ''}
                            onChange={(e) => {
                              const newScenes = [...(level.test.scenes || [])];
                              const newOptions = [...(newScenes[selectedScene].options || [])];
                              newOptions[selectedOption] = { ...newOptions[selectedOption], next: e.target.value ? parseInt(e.target.value) : null };
                              newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                              updateLevelField(levelIndex, 'test.scenes', newScenes);
                            }}
                            className="w-full border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent"
                            placeholder="ID de la siguiente escena (vacío = fin del test)"
                            min="1"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
