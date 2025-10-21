import React from 'react';

export default function LevelTestEditor({ level, levelIndex, updateLevelField, selectedScene, setSelectedScene, selectedOption, setSelectedOption, handleFileUpload, handleFileDelete }) {
  return (
    <div className="border border-gray-300 rounded-sm p-2 bg-white space-y-3">
      {/* Información general del test */}
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
              Título del test
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <input 
                value={level.test.title} 
                onChange={(e) => updateLevelField(levelIndex, 'test.title', e.target.value)} 
                onFocus={() => { setSelectedScene(null); }}
                className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent" 
                placeholder="Título del test" 
              />
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Descripción
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <textarea 
                value={level.test.description} 
                onChange={(e) => updateLevelField(levelIndex, 'test.description', e.target.value)} 
                onFocus={() => { setSelectedScene(null); }}
                className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent resize-none" 
                rows={2} 
                placeholder="Descripción del test" 
              />
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Imagen
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <div>
                <div className="flex items-center gap-3">
                  <input
                    value={level.test.imageUrl || ''}
                    onChange={(e) => updateLevelField(levelIndex, 'test.imageUrl', e.target.value)}
                    onFocus={() => { setSelectedScene(null); }}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm placeholder:text-sm font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent"
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
                          alert('El archivo es demasiado grande. Máximo 5 MB.');
                          e.target.value = '';
                          return;
                        }

                        if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
                          alert('Formato no válido. Solo JPG, PNG, GIF, WebP.');
                          e.target.value = '';
                          return;
                        }

                        try {
                          const currentImageUrl = level.test.imageUrl;
                          if (currentImageUrl && typeof currentImageUrl === 'string' && currentImageUrl.startsWith('/uploads/')) {
                            try { await handleFileDelete(currentImageUrl, levelIndex); } catch (err) { console.error(err); }
                          }

                          const response = await handleFileUpload(file, levelIndex);
                          const filePath = typeof response === 'string' ? response : response.filePath;
                          updateLevelField(levelIndex, 'test.imageUrl', filePath);
                          e.target.value = '';
                        } catch (error) {
                          console.error('Error subiendo imagen del test:', error);
                          alert(`Error subiendo imagen: ${error.message}`);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                    <span className="inline-block px-4 py-2 bg-gray-500 border border-gray-500 rounded-lg text-sm text-white cursor-pointer hover:bg-gray-600">Choose File</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {level.test.imageUrl && (
                      <button
                        type="button"
                        onClick={async () => {
                          const currentImageUrl = level.test.imageUrl;
                          if (currentImageUrl && typeof currentImageUrl === 'string' && currentImageUrl.startsWith('/uploads/')) {
                            try {
                              await handleFileDelete(currentImageUrl, levelIndex);
                            } catch (error) {
                              console.error('Error eliminando imagen del test:', error);
                            }
                          }
                          updateLevelField(levelIndex, 'test.imageUrl', '');
                        }}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded-md cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-xs text-indigo-600 text-right">Menor a 5 Mb - Formatos: JPG, PNG, GIF, WebP</div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Estado
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id={`test-active-${levelIndex}`} 
                  checked={level.test.isActive} 
                  onChange={(e) => updateLevelField(levelIndex, 'test.isActive', e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor={`test-active-${levelIndex}`} className="text-sm cursor-pointer">Test activo</label>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Gestión de escenas */}
      <div className="border-t border-gray-300 pt-3">
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-gray-100 border border-gray-300 rounded-sm">
          {level.test.scenes && level.test.scenes.length > 0 && (
            <select
              value={selectedScene !== null ? selectedScene : ''}
              onChange={(e) => setSelectedScene(e.target.value === '' ? null : parseInt(e.target.value))}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-sm text-sm cursor-pointer bg-white"
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
                idScene: newSceneId,
                videoUrl: '',
                description: `Situación de emergencia ${newSceneId}`,
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
            className="px-2 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-sm cursor-pointer whitespace-nowrap"
          >
            + Nueva escena
          </button>
        </div>

        {selectedScene !== null && level.test.scenes && level.test.scenes[selectedScene] && (
          <div className="border border-gray-300 rounded-sm p-2 mb-2 bg-white">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
              <h6 className="text-sm font-medium text-gray-700">Editando: Escena {selectedScene + 1}</h6>
              <button
                type="button"
                onClick={() => {
                  const newScenes = [...(level.test.scenes || [])];
                  newScenes.splice(selectedScene, 1);
                  updateLevelField(levelIndex, 'test.scenes', newScenes);
                  setSelectedScene(null);
                }}
                className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
              >
                Eliminar escena
              </button>
            </div>

            <table className="w-full border-collapse text-sm mb-2">
              <tbody>
                <tr>
                  <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
                    ID de escena
                  </td>
                  <td className="px-2 py-1.5 border border-gray-300">
                    <input
                      type="number"
                      value={level.test.scenes[selectedScene].idScene || ''}
                      onChange={(e) => {
                        const newScenes = [...(level.test.scenes || [])];
                        newScenes[selectedScene] = { ...newScenes[selectedScene], idScene: parseInt(e.target.value) || 0 };
                        updateLevelField(levelIndex, 'test.scenes', newScenes);
                      }}
                      className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                      placeholder="ID numérico único de la escena"
                      min="1"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
                    Descripción
                  </td>
                  <td className="px-2 py-1.5 border border-gray-300">
                    <textarea
                      value={level.test.scenes[selectedScene].description || ''}
                      onChange={(e) => {
                        const newScenes = [...(level.test.scenes || [])];
                        newScenes[selectedScene] = { ...newScenes[selectedScene], description: e.target.value };
                        updateLevelField(levelIndex, 'test.scenes', newScenes);
                      }}
                      className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent resize-none"
                      rows="2"
                      placeholder="Descripción de la escena"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
                    Video
                  </td>
                  <td className="px-2 py-1.5 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={level.test.scenes[selectedScene].videoUrl || ''}
                        onChange={(e) => {
                          const newScenes = [...(level.test.scenes || [])];
                          newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: e.target.value };
                          updateLevelField(levelIndex, 'test.scenes', newScenes);
                        }}
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm placeholder:text-sm font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent"
                        placeholder="URL del video o deja vacío para subir archivo"
                      />
                      {level.test.scenes[selectedScene].videoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const currentVideoUrl = level.test.scenes[selectedScene].videoUrl;
                            if (currentVideoUrl && typeof currentVideoUrl === 'string' && currentVideoUrl.startsWith('/uploads/')) {
                              try { await handleFileDelete(currentVideoUrl, levelIndex); } catch (error) { console.error('Error eliminando video de escena:', error); }
                            }
                            const newScenes = [...(level.test.scenes || [])];
                            newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: '' };
                            updateLevelField(levelIndex, 'test.scenes', newScenes);
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
                          accept="video/mp4,video/webm,video/ogg"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (file.size > 50 * 1024 * 1024) {
                              alert('El archivo es demasiado grande. Máximo 50 MB.');
                              e.target.value = '';
                              return;
                            }

                            if (!file.type.match(/^video\/(mp4|webm|ogg)$/)) {
                              alert('Formato no válido. Solo MP4, WebM, OGG.');
                              e.target.value = '';
                              return;
                            }

                            try {
                              const currentVideoUrl = level.test.scenes[selectedScene].videoUrl;
                              if (currentVideoUrl && typeof currentVideoUrl === 'string' && currentVideoUrl.startsWith('/uploads/')) {
                                try { await handleFileDelete(currentVideoUrl, levelIndex); } catch (error) { console.error('Error eliminando video anterior:', error); }
                              }

                              const response = await handleFileUpload(file, levelIndex);
                              const newScenes = [...(level.test.scenes || [])];
                              newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: response.filePath };
                              updateLevelField(levelIndex, 'test.scenes', newScenes);
                            } catch (error) {
                              console.error('Error subiendo video:', error);
                              alert(`Error subiendo video: ${error.message}`);
                            } finally {
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="text-xs text-indigo-600 mt-1 text-right">Menor a 50 Mb - Formatos: MP4, WebM, OGG</div>
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
                    Configuración
                  </td>
                  <td className="px-2 py-1.5 border border-gray-300">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={level.test.scenes[selectedScene].lastOne || false}
                          onChange={(e) => {
                            const newScenes = [...(level.test.scenes || [])];
                            newScenes[selectedScene] = { ...newScenes[selectedScene], lastOne: e.target.checked };
                            updateLevelField(levelIndex, 'test.scenes', newScenes);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <span>Última escena</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">Bonus:</label>
                        <input
                          type="number"
                          value={level.test.scenes[selectedScene].bonus || 0}
                          onChange={(e) => {
                            const newScenes = [...(level.test.scenes || [])];
                            newScenes[selectedScene] = { ...newScenes[selectedScene], bonus: parseInt(e.target.value) || 0 };
                            updateLevelField(levelIndex, 'test.scenes', newScenes);
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-sm text-sm"
                          min="0"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Gestión de botones/opciones */}
            <div className="mt-2">
              <div className="flex items-center justify-end mb-2 px-2 py-1 bg-gray-100 border border-gray-300 rounded-sm">
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
                    className="px-2 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-sm cursor-pointer"
                  >
                    + Agregar botón
                  </button>
                )}
              </div>

              {level.test.scenes[selectedScene].options && level.test.scenes[selectedScene].options.length > 0 && (
                <div className="mb-2">
                  <select
                    value={selectedOption !== null ? selectedOption : ''}
                    onChange={(e) => setSelectedOption(e.target.value === '' ? null : parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-sm text-sm cursor-pointer bg-white"
                  >
                    <option value="">-- Seleccionar botón para editar --</option>
                    {level.test.scenes[selectedScene].options.map((opt, idx) => (
                      <option key={idx} value={idx}>
                        Botón {idx + 1} {opt.description ? `- ${opt.description}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedOption !== null && level.test.scenes[selectedScene].options && level.test.scenes[selectedScene].options[selectedOption] && (
                <div className="border border-gray-300 rounded-sm p-2 bg-gray-50">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                    <h6 className="text-sm font-medium text-gray-700">Editando: Botón {selectedOption + 1}</h6>
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
                      className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                    >
                      Eliminar botón
                    </button>
                  </div>

                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      <tr>
                        <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '35%' }}>
                          Texto del botón
                        </td>
                        <td className="px-2 py-1.5 border border-gray-300">
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
                            className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                            placeholder="Texto del botón (ej: Acercarse y abrir la puerta)"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
                          Puntos
                        </td>
                        <td className="px-2 py-1.5 border border-gray-300">
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
                            className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                            min="0"
                            placeholder="Puntos que otorga esta opción"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
                          Siguiente escena (ID)
                        </td>
                        <td className="px-2 py-1.5 border border-gray-300">
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
                            className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
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
