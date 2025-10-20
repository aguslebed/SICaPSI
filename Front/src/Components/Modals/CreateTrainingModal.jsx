import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { getStudents, getEnrolledStudents, uploadTrainingFile, deleteTrainingFile } from '../../API/Request';

export default function CreateTrainingModal({ open, onClose, onSave, editingTraining }) {
  const { user } = useContext(UserContext);
  const isEditing = Boolean(editingTraining);
  
  // Campos principales de Training
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Report inicial vacío
  const [report, setReport] = useState([]);
  
  // Estados para inscripción de guardias
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');
  
  // Levels - manejaremos la creación después
  const [levels, setLevels] = useState([{ 
    levelNumber: 1, 
    title: 'Nivel 1', 
    bibliography: [],
    training: {
      title: '',
      description: '',
      videoUrl: '',
      duration: 0
    },
    test: {
      title: '',
      description: '',
      imageUrl: '',
      isActive: true,
      scenes: []
    }
  }]);
  const [selectedLevel, setSelectedLevel] = useState(0);

  // Estado para archivos subidos
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Función para subir archivo de training
  const handleFileUpload = async (file, levelIndex) => {
    const fileKey = `level-${levelIndex}-training`;
    
    try {
      setUploadingFiles(prev => ({ ...prev, [fileKey]: true }));
      
      const response = await uploadTrainingFile(file);
      
      // Actualizar el videoUrl con la ruta del archivo subido
      updateLevelField(levelIndex, 'training.url', response.filePath);
      
      console.log('Archivo subido exitosamente:', response.originalName);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert(`Error subiendo archivo: ${error.message}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fileKey]: false }));
    }
  };

  // Función para eliminar archivos locales
  const handleFileDelete = async (filePath, levelIndex) => {
    try {
      // Solo eliminar si es un archivo local (no URL externa)
      if (filePath && filePath.startsWith('/uploads/')) {
        await deleteTrainingFile(filePath);
        console.log('Archivo eliminado exitosamente:', filePath);
      }
      
      // Limpiar la URL del level
      updateLevelField(levelIndex, 'training.url', '');
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      // Aun así limpiar la URL del frontend
      updateLevelField(levelIndex, 'training.url', '');
      alert(`Error eliminando archivo: ${error.message}`);
    }
  };

  // Efecto para cargar datos cuando está editando
  useEffect(() => {
    if (editingTraining && open) {
      // Cargar datos del training
      setTitle(editingTraining.title || '');
      setSubtitle(editingTraining.subtitle || '');
      setDescription(editingTraining.description || '');
      setImage(editingTraining.image || '');
      setIsActive(editingTraining.isActive ?? true);
      
      // Cargar niveles si existen
      if (editingTraining.levels && editingTraining.levels.length > 0) {
        setLevels(editingTraining.levels.map(level => {
          return {
            levelNumber: level.levelNumber,
            title: level.title,
            bibliography: level.bibliography ? level.bibliography.map(bibItem => {
              return {
                title: bibItem.title || '',
                description: bibItem.description || '',
                // Compatibilidad con datos legacy que podrían tener videoUrl en lugar de url
                url: bibItem.url || bibItem.videoUrl || ''
              };
            }) : [],
            training: level.training ? {
              title: level.training.title || '',
              description: level.training.description || '',
              // Compatibilidad con datos legacy que podrían tener videoUrl en lugar de url
              url: level.training.url || level.training.videoUrl || '',
              duration: level.training.duration || 0
            } : {
              title: '',
              description: '',
              url: '',
              duration: 0
            },
            test: {
              title: level.test?.title || '',
              description: level.test?.description || '',
              imageUrl: level.test?.imageUrl || '',
              isActive: level.test?.isActive !== undefined ? level.test.isActive : true,
              scenes: level.test?.scenes || []
            }
          };
        }));
      }
      
      // Cargar report si existe
      setReport(editingTraining.report || []);
      
      // Cargar guardias inscritos si existe el ID del training
      if (editingTraining._id) {
        loadEnrolledStudents(editingTraining._id);
      }
    } else if (!editingTraining && open) {
      // Limpiar formulario para nuevo training
      setTitle('');
      setSubtitle('');
      setDescription('');
      setImage('');
      setIsActive(true);
      setLevels([{ 
        levelNumber: 1, 
        title: 'Nivel 1', 
        bibliography: [],
        training: {
          title: '',
          description: '',
          url: '',
          duration: 0
        },
        test: {
          title: '',
          description: '',
          imageUrl: '',
          isActive: true,
          scenes: []
        }
      }]);
      setReport([]);
      setSelectedLevel(0);
      setSelectedStudents([]); // Limpiar guardias seleccionados para nuevo training
    }
  }, [editingTraining, open]);

  // Efecto para cargar guardias cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open]);

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {

      const studentsData = await getStudents();

      setStudents(studentsData);
    } catch (error) {
      console.error('❌ Error cargando guardias:', error);
      alert('Error al cargar la lista de guardias');
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadEnrolledStudents = async (trainingId) => {
    try {
      const enrolledStudentsData = await getEnrolledStudents(trainingId);
      const enrolledIds = enrolledStudentsData.map(student => student._id);

      setSelectedStudents(enrolledIds);
    } catch (error) {
      console.error('Error cargando guardias inscritos:', error);
      // No mostrar alert aquí para no interrumpir la carga del modal
    }
  };

  if (!open) return null;

  const addLevel = () => {
    const nextLevelNumber = levels.length + 1;
    const newLevel = { 
      levelNumber: nextLevelNumber, 
      title: `Nivel ${nextLevelNumber}`, 
      bibliography: [],
      training: {
        title: '',
        description: '',
        url: '',
        duration: 0
      },
      test: {
        title: '',
        description: '',
        imageUrl: '',
        isActive: true,
        scenes: []
      }
    };
    setLevels([...levels, newLevel]);
    setSelectedLevel(levels.length);
  };

  const updateLevelField = (levelIndex, field, value) => {
    setLevels(prev => {
      const newLevels = [...prev];
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        newLevels[levelIndex] = {
          ...newLevels[levelIndex],
          [parentField]: {
            ...newLevels[levelIndex][parentField],
            [childField]: value
          }
        };
      } else {
        newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
      }
      return newLevels;
    });
  };

  // Funciones para manejar selección de guardias
  const handleStudentSelection = (studentId, isSelected) => {
    setSelectedStudents(prev => {
      if (isSelected) {
        return [...prev, studentId];
      } else {
        return prev.filter(id => id !== studentId);
      }
    });
  };

  const selectAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    const allIds = filteredStudents.map(s => s._id);
    setSelectedStudents(allIds);
  };

  const deselectAllStudents = () => {
    setSelectedStudents([]);
  };

  const getFilteredStudents = () => {
    if (!appliedFilter.trim()) return students;
    const search = appliedFilter.toLowerCase();
    return students.filter(student => 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.documentNumber.includes(search)
    );
  };

  const handleSearch = () => {
    setAppliedFilter(searchStudent);
  };

  const handleClearSearch = () => {
    setSearchStudent('');
    setAppliedFilter('');
  };

  const handleSave = () => {
    // Validaciones básicas aquí antes de enviar
    const imageValue = typeof image === 'string' ? image.trim() : image;
    if (!title || !subtitle || !description || !imageValue) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const payload = { 
      title: title.trim(),
      subtitle: subtitle.trim(), 
      description: description.trim(),
      image: (typeof image === 'string' ? image.trim() : image) || '',
      isActive,
      report,
      totalLevels: levels.length,
      progressPercentage: 0
    };
    
    // Solo agregar createdBy si estamos creando (no editando)
    if (!isEditing) {
      payload.createdBy = user?._id;
    }
    
    // Agregar información adicional para el manejo
    const additionalData = {
      selectedStudents, // IDs de estudiantes seleccionados
      isEditing,
      trainingId: editingTraining?._id
    };
    
    // Limpiar niveles: filtrar elementos de bibliografía vacíos
    const cleanedLevels = levels.map(level => ({
      ...level,
      bibliography: level.bibliography?.filter(item => 
        item.title?.trim() && (item.url?.trim() || item.description?.trim())
      ) || []
    }));
    
    if (onSave) onSave(payload, cleanedLevels, additionalData); // Enviamos los niveles limpios y datos adicionales por separado
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden h-[90vh]" style={{ zIndex: 51 }}>
        {/* Header green */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-4 relative flex items-center gap-3 shadow-md">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{title || (isEditing ? 'Editar capacitación' : 'Capacitación nueva')}</h2>
            <p className="text-xs mt-1.5 opacity-90">{subtitle || (isEditing ? 'Modificar datos' : 'Descripción breve')}</p>
            <div className="text-xs mt-1 opacity-80">{levels.length} nivel{levels.length !== 1 ? 'es' : ''}</div>
          </div>
          <button className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-colors cursor-pointer" onClick={onClose}>×</button>
        </div>

        {/* Progress bar */}
        <div className="bg-green-700 text-white text-center text-xs py-1 font-medium">0%</div>

        {/* Content area with scroll */}
        <div className="flex-1 p-5 overflow-auto text-sm" style={{ height: 'calc(90vh - 180px)' }}>
          {/* Presentation */}
          <details className="mb-4 overflow-hidden">
            <summary className="font-semibold cursor-pointer text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Presentación de la capacitación</summary>
            <div className="p-3 space-y-0 bg-white">
              {/* Tabla de presentación */}
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-500 text-white text-left px-3 py-2 text-sm font-semibold border border-gray-400" style={{width: '25%'}}>
                      Campo
                    </th>
                    <th className="bg-gray-500 text-white text-left px-3 py-2 text-sm font-semibold border border-gray-400">
                      Datos de la capacitación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                      Título
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent" 
                        placeholder="Ingrese el título de la capacitación" 
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                      Subtítulo
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <input 
                        value={subtitle} 
                        onChange={(e) => setSubtitle(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent" 
                        placeholder="Subtítulo de la capacitación" 
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                      Descripción
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent resize-none" 
                        rows={3} 
                        placeholder="Descripción detallada de la capacitación" 
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                      Imagen
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input 
                            value={image} 
                            onChange={(e) => setImage(e.target.value)} 
                            className="flex-1 border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent" 
                            placeholder="URL de imagen o deja vacío para subir archivo" 
                          />
                          {image && (
                            <button
                              type="button"
                              onClick={async () => {
                                // Si es un archivo local, eliminarlo del servidor
                                if (image && typeof image === 'string' && image.startsWith('/uploads/')) {
                                  try {
                                    await deleteTrainingFile(image);
                                  } catch (error) {
                                    console.error('Error deleting image file:', error);
                                  }
                                }
                                setImage('');
                              }}
                              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-300 rounded cursor-pointer"
                              title="Eliminar imagen"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.webp"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  setUploadingFiles(prev => ({ ...prev, 'training-image': true }));
                                  const response = await uploadTrainingFile(file);
                                  // Extraer solo el filePath del objeto de respuesta
                                  const filePath = typeof response === 'string' ? response : response.filePath;
                                  setImage(filePath);
                                } catch (error) {
                                  console.error('Error uploading image:', error);
                                  alert('Error al subir la imagen');
                                } finally {
                                  setUploadingFiles(prev => ({ ...prev, 'training-image': false }));
                                }
                              }
                            }}
                            className="text-xs cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-2 py-1 transition-colors"
                            disabled={uploadingFiles['training-image']}
                          />
                          {uploadingFiles['training-image'] && (
                            <span className="text-xs text-blue-600">Subiendo...</span>
                          )}
                          <span className="text-xs text-gray-500">&lt; 5 Mb - Formatos: JPG, PNG, GIF, WebP</span>
                        </div>
                        {image && (
                          <div className="text-xs text-gray-600">
                            {(typeof image === 'string' && image.startsWith('/uploads/')) 
                              ? '📁 Imagen local subida' 
                              : '🌐 URL externa'
                            }
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                      Estado
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="isActive" 
                          checked={isActive} 
                          onChange={(e) => setIsActive(e.target.checked)} 
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Capacitación activa</label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>

          {/* Levels */}
          <details className="mb-4 overflow-hidden">
            <summary className="font-semibold cursor-pointer text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Niveles ({levels.length})</summary>
            <div className="p-3 bg-white">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <label className="text-xs font-semibold text-gray-700">Nivel número</label>
                <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer" value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))}>
                  {levels.map((l, idx) => (
                    <option key={idx} value={idx}>{`Nivel ${l.levelNumber}`}</option>
                  ))}
                </select>
                <button onClick={addLevel} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm hover:shadow cursor-pointer">+ Nuevo nivel</button>
              </div>

              {/* Current level details */}
              {levels[selectedLevel] && (
                <div className="space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título del nivel</label>
                    <input 
                      value={levels[selectedLevel].title} 
                      onChange={(e) => updateLevelField(selectedLevel, 'title', e.target.value)} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" 
                      placeholder="Título del nivel" 
                    />
                  </div>
                </div>
              )}

              {/* Contenido del nivel */}
              <div className="space-y-2 mt-3">
                <details className="border border-gray-200 rounded-md overflow-hidden">
                  <summary className="cursor-pointer text-xs font-medium bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Clase / Training</summary>
                  {levels[selectedLevel] && (
                    <div className="p-3 bg-white">
                      {/* Tabla de clase/training */}
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="bg-gray-500 text-white text-left px-3 py-2 text-sm font-semibold border border-gray-400" style={{width: '25%'}}>
                              Campo
                            </th>
                            <th className="bg-gray-500 text-white text-left px-3 py-2 text-sm font-semibold border border-gray-400">
                              Ejemplo / Placeholder
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                              Título
                            </td>
                            <td className="px-3 py-2 border border-gray-300">
                              <input 
                                value={levels[selectedLevel].training.title} 
                                onChange={(e) => updateLevelField(selectedLevel, 'training.title', e.target.value)} 
                                className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent" 
                                placeholder="Control de accesos en eventos" 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                              Descripción de la clase
                            </td>
                            <td className="px-3 py-2 border border-gray-300">
                              <textarea 
                                value={levels[selectedLevel].training.description} 
                                onChange={(e) => updateLevelField(selectedLevel, 'training.description', e.target.value)} 
                                className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent resize-none" 
                                rows={2} 
                                placeholder="Clase introductoria sobre protocolos de seguridad" 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                              Url/Archivo
                            </td>
                            <td className="px-3 py-2 border border-gray-300">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input 
                                    value={levels[selectedLevel].training.url} 
                                    onChange={async (e) => {
                                      const newValue = e.target.value;
                                      const currentValue = levels[selectedLevel].training.url;
                                      
                                      // Si había un archivo local y se está cambiando a otra cosa, eliminarlo
                                      if (currentValue && currentValue.startsWith('/uploads/') && currentValue !== newValue) {
                                        try {
                                          await deleteTrainingFile(currentValue);
                                          console.log('Archivo anterior eliminado:', currentValue);
                                        } catch (error) {
                                          console.error('Error eliminando archivo anterior:', error);
                                        }
                                      }
                                      
                                      updateLevelField(selectedLevel, 'training.url', newValue);
                                    }} 
                                    className="flex-1 border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent" 
                                    placeholder="URL del video de la clase o deja vacío para subir archivo" 
                                  />
                                  {levels[selectedLevel].training.url && (
                                    <button
                                      type="button"
                                      onClick={() => handleFileDelete(levels[selectedLevel].training.url, selectedLevel)}
                                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-300 rounded cursor-pointer"
                                      title="Eliminar archivo/URL"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="file"
                                    accept=".mp4,.pdf,.ppt,.pptx"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        await handleFileUpload(file, selectedLevel);
                                        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
                                        e.target.value = '';
                                      }
                                    }}
                                    className="text-xs cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-2 py-1 transition-colors"
                                    disabled={uploadingFiles[`level-${selectedLevel}-training`]}
                                  />
                                  {uploadingFiles[`level-${selectedLevel}-training`] && (
                                    <span className="text-xs text-blue-600">Subiendo...</span>
                                  )}
                                  <span className="text-xs text-gray-500">&lt; 100 Mb - Formatos: MP4, PDF, PPT.</span>
                                </div>
                                {levels[selectedLevel].training.url && (
                                  <div className="text-xs text-gray-600">
                                    {levels[selectedLevel].training.url.startsWith('/uploads/') 
                                      ? '📁 Archivo local subido' 
                                      : '🌐 URL externa'
                                    }
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                              Duración (min)
                            </td>
                            <td className="px-3 py-2 border border-gray-300">
                              <input 
                                type="number" 
                                min="0" 
                                value={levels[selectedLevel].training.duration} 
                                onChange={(e) => updateLevelField(selectedLevel, 'training.duration', parseInt(e.target.value) || 0)} 
                                className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent" 
                                placeholder="45" 
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </details>

                <details className="border border-gray-200 rounded-md overflow-hidden">
                  <summary className="cursor-pointer text-xs font-medium bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Bibliografía ({levels[selectedLevel]?.bibliography.length || 0})</summary>
                  <div className="p-4 bg-white">
                    
                    {/* Nueva bibliografía - Sección de agregar */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="flex items-center gap-4">
                        {/* Área de drag and drop visual */}
                        <div className="flex-1">
                          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-white text-center">
                            <div className="text-4xl text-gray-400 mb-2">📁</div>
                            <p className="text-sm text-gray-600 mb-1">Arrastra y suelta</p>
                            <p className="text-xs text-gray-500 mb-3">para cargar tus archivos</p>
                            <button
                              type="button"
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm cursor-pointer transition-colors"
                            >
                              Seleccionar archivo
                            </button>
                          </div>
                        </div>
                        
                        {/* Formulario de agregar */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <input
                              type="url"
                              placeholder="Agregar enlace"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Título del enlace"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Subtítulo"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newBibliography = [...(levels[selectedLevel]?.bibliography || [])];
                              newBibliography.push({
                                title: '',
                                description: '',
                                url: ''
                              });
                              updateLevelField(selectedLevel, 'bibliography', newBibliography);
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium cursor-pointer transition-colors"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lista de elementos agregados */}
                    {levels[selectedLevel]?.bibliography && levels[selectedLevel].bibliography.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
                          📋 Bibliografía agregada ({levels[selectedLevel].bibliography.length})
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {levels[selectedLevel].bibliography.map((item, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">
                                    {item.url && item.url.startsWith('http') ? '🔗' : '📄'}
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newBibliography = [...levels[selectedLevel].bibliography];
                                    newBibliography.splice(index, 1);
                                    updateLevelField(selectedLevel, 'bibliography', newBibliography);
                                  }}
                                  className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                                  title="Eliminar elemento"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              <div className="space-y-2">
                                {/* Título */}
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => {
                                    const newBibliography = [...levels[selectedLevel].bibliography];
                                    newBibliography[index] = { ...newBibliography[index], title: e.target.value };
                                    updateLevelField(selectedLevel, 'bibliography', newBibliography);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-medium"
                                  placeholder="Título del material"
                                />
                                
                                {/* Descripción */}
                                <textarea
                                  value={item.description || ''}
                                  onChange={(e) => {
                                    const newBibliography = [...levels[selectedLevel].bibliography];
                                    newBibliography[index] = { ...newBibliography[index], description: e.target.value };
                                    updateLevelField(selectedLevel, 'bibliography', newBibliography);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
                                  rows="2"
                                  placeholder="Descripción breve"
                                />
                                
                                {/* URL */}
                                <input
                                  type="url"
                                  value={item.url || ''}
                                  onChange={(e) => {
                                    const newBibliography = [...levels[selectedLevel].bibliography];
                                    newBibliography[index] = { ...newBibliography[index], url: e.target.value };
                                    updateLevelField(selectedLevel, 'bibliography', newBibliography);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="URL del recurso"
                                />
                                
                                {/* Vista previa del enlace */}
                                {item.url && (
                                  <div className="text-xs text-blue-600 truncate" title={item.url}>
                                    🔗 {item.url}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mensaje cuando no hay elementos */}
                    {(!levels[selectedLevel]?.bibliography || levels[selectedLevel].bibliography.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="text-sm">No hay elementos en la bibliografía</p>
                        <p className="text-xs">Agrega enlaces o archivos usando el formulario de arriba</p>
                      </div>
                    )}
                  </div>
                </details>

                <details className="border border-gray-200 rounded-md overflow-hidden">
                  <summary className="cursor-pointer text-xs font-medium bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Test de evaluación</summary>
                  {levels[selectedLevel] && (
                    <div className="p-3 bg-white space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título del test</label>
                        <input 
                          value={levels[selectedLevel].test.title} 
                          onChange={(e) => updateLevelField(selectedLevel, 'test.title', e.target.value)} 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" 
                          placeholder="Título del test" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción</label>
                        <textarea 
                          value={levels[selectedLevel].test.description} 
                          onChange={(e) => updateLevelField(selectedLevel, 'test.description', e.target.value)} 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none" 
                          rows={2} 
                          placeholder="Descripción del test" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL de imagen</label>
                        <input 
                          value={levels[selectedLevel].test.imageUrl} 
                          onChange={(e) => updateLevelField(selectedLevel, 'test.imageUrl', e.target.value)} 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" 
                          placeholder="URL de imagen del test" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`test-active-${selectedLevel}`}
                          checked={levels[selectedLevel].test.isActive} 
                          onChange={(e) => updateLevelField(selectedLevel, 'test.isActive', e.target.checked)} 
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <label htmlFor={`test-active-${selectedLevel}`} className="text-xs font-semibold text-gray-700 cursor-pointer">Test activo</label>
                      </div>
                      
                      {/* Escenas del test */}
                      <div className="border-t pt-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-3">
                          Escenas del test ({levels[selectedLevel].test.scenes?.length || 0})
                        </h5>
                        
                        {/* Lista de escenas */}
                        {levels[selectedLevel].test.scenes?.map((scene, sceneIndex) => (
                          <div key={sceneIndex} className="border border-gray-200 rounded p-3 mb-3 space-y-3">
                            <div className="flex justify-between items-start">
                              <h6 className="text-xs font-medium text-gray-700">Escena {sceneIndex + 1}</h6>
                              <button
                                type="button"
                                onClick={() => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  newScenes.splice(sceneIndex, 1);
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                              >
                                Eliminar escena
                              </button>
                            </div>

                            {/* ID de escena */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">ID de escena (número)</label>
                              <input
                                type="number"
                                value={scene.idScene || ''}
                                onChange={(e) => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  newScenes[sceneIndex] = { ...newScenes[sceneIndex], idScene: parseInt(e.target.value) || 0 };
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                placeholder="ID numérico único de la escena"
                                min="1"
                              />
                            </div>

                            {/* URL del video */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">URL del video</label>
                              <input
                                type="url"
                                value={scene.videoUrl || ''}
                                onChange={(e) => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  newScenes[sceneIndex] = { ...newScenes[sceneIndex], videoUrl: e.target.value };
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                placeholder="URL del video de la escena"
                              />
                            </div>

                            {/* Descripción */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                              <textarea
                                value={scene.description || ''}
                                onChange={(e) => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  newScenes[sceneIndex] = { ...newScenes[sceneIndex], description: e.target.value };
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-y"
                                rows="2"
                                placeholder="Descripción de la escena"
                              />
                            </div>

                            {/* Campos adicionales */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`scene-lastOne-${sceneIndex}`}
                                  checked={scene.lastOne || false}
                                  onChange={(e) => {
                                    const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                    newScenes[sceneIndex] = { ...newScenes[sceneIndex], lastOne: e.target.checked };
                                    updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                  }}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <label htmlFor={`scene-lastOne-${sceneIndex}`} className="text-xs text-gray-700 cursor-pointer">
                                  Última escena
                                </label>
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-700 mb-1">Bonus</label>
                                <input
                                  type="number"
                                  value={scene.bonus || 0}
                                  onChange={(e) => {
                                    const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                    newScenes[sceneIndex] = { ...newScenes[sceneIndex], bonus: parseInt(e.target.value) || 0 };
                                    updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                  min="0"
                                />
                              </div>
                            </div>

                            {/* Opciones */}
                            <div>
                              <h6 className="text-xs font-medium text-gray-700 mb-2">
                                Opciones ({scene.options?.length || 0})
                              </h6>
                              
                              {scene.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="border border-gray-100 rounded p-2 mb-2 bg-gray-50">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium text-gray-600">Opción {optionIndex + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[sceneIndex].options || [])];
                                        newOptions.splice(optionIndex, 1);
                                        newScenes[sceneIndex] = { ...newScenes[sceneIndex], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  {/* Descripción de la opción */}
                                  <div className="mb-2">
                                    <label className="block text-xs text-gray-600 mb-1">Descripción</label>
                                    <input
                                      type="text"
                                      value={option.description || ''}
                                      onChange={(e) => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[sceneIndex].options || [])];
                                        newOptions[optionIndex] = { ...newOptions[optionIndex], description: e.target.value };
                                        newScenes[sceneIndex] = { ...newScenes[sceneIndex], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="Descripción de la opción"
                                    />
                                  </div>

                                  {/* Puntos */}
                                  <div className="mb-2">
                                    <label className="block text-xs text-gray-600 mb-1">Puntos</label>
                                    <input
                                      type="number"
                                      value={option.points || 0}
                                      onChange={(e) => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[sceneIndex].options || [])];
                                        newOptions[optionIndex] = { ...newOptions[optionIndex], points: parseInt(e.target.value) || 0 };
                                        newScenes[sceneIndex] = { ...newScenes[sceneIndex], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      min="0"
                                    />
                                  </div>

                                  {/* Siguiente escena */}
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Siguiente escena (ID)</label>
                                    <input
                                      type="number"
                                      value={option.next || ''}
                                      onChange={(e) => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[sceneIndex].options || [])];
                                        newOptions[optionIndex] = { ...newOptions[optionIndex], next: e.target.value ? parseInt(e.target.value) : null };
                                        newScenes[sceneIndex] = { ...newScenes[sceneIndex], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="ID de la siguiente escena (vacío = fin)"
                                      min="1"
                                    />
                                  </div>
                                </div>
                              ))}

                              {/* Agregar opción */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  const currentOptions = newScenes[sceneIndex].options || [];
                                  newScenes[sceneIndex] = {
                                    ...newScenes[sceneIndex],
                                    options: [...currentOptions, { description: '', points: 0, next: null }]
                                  };
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                }}
                                className="w-full px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded cursor-pointer"
                              >
                                + Agregar opción
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Agregar nueva escena */}
                        <button
                          type="button"
                          onClick={() => {
                            const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                            newScenes.push({
                              idScene: 1,
                              videoUrl: '',
                              description: '',
                              lastOne: false,
                              bonus: 0,
                              options: []
                            });
                            updateLevelField(selectedLevel, 'test.scenes', newScenes);
                          }}
                          className="w-full px-3 py-2 text-xs text-green-600 hover:text-green-800 border border-green-300 hover:border-green-400 rounded bg-green-50 hover:bg-green-100 cursor-pointer"
                        >
                          + Agregar nueva escena
                        </button>
                      </div>
                    </div>
                  )}
                </details>
              </div>
            </div>
          </details>

          {/* Enroll students */}
          <details className="mb-4 overflow-hidden">
            <summary className="font-semibold cursor-pointer text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">
              Inscribir guardias ({selectedStudents.length} seleccionados)
            </summary>
            <div className="p-4 bg-white">
              {loadingStudents ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Cargando guardias...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Buscador */}
                  <div className="mb-6">
                    {/* Barra de búsqueda moderna */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Escribir nombre o DNI del alumno..."
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSearch();
                              }
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSearch}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                          >
                            Buscar
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-all cursor-pointer"
                          >
                            Limpiar
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Controles de selección */}
                    {students.length > 0 && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">
                            Acciones rápidas:
                          </span>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={selectAllStudents}  
                              className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                              ✓ Seleccionar todos
                            </button>
                            <button
                              type="button"
                              onClick={deselectAllStudents}
                              className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-medium transition-all cursor-pointer"
                            >
                              ✕ Limpiar selección
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contenedor principal con dos columnas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Columna izquierda - Lista de alumnos disponibles */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      {/* Header */}
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-sm text-gray-700">Nombre</h3>
                          <h3 className="font-semibold text-sm text-gray-700">DNI</h3>
                        </div>
                      </div>
                      
                      {/* Lista de alumnos */}
                      <div className="max-h-60 overflow-y-auto">
                        {getFilteredStudents().length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <div className="text-4xl mb-2">👥</div>
                            <p className="text-sm">
                              {students.length === 0 ? 'No hay guardias disponibles' : 'No se encontraron guardias'}
                            </p>
                          </div>
                        ) : (
                          getFilteredStudents().map((student) => (
                            <div
                              key={student._id}
                              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
                              onClick={() => handleStudentSelection(student._id, !selectedStudents.includes(student._id))}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(student._id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleStudentSelection(student._id, e.target.checked);
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  {student.email && (
                                    <div className="text-xs text-gray-500">
                                      {student.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {student.documentNumber}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStudentSelection(student._id, !selectedStudents.includes(student._id));
                                }}
                                className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs cursor-pointer transition-colors flex items-center justify-center"
                                title={selectedStudents.includes(student._id) ? "Quitar" : "Agregar"}
                              >
                                {selectedStudents.includes(student._id) ? '✕' : '+'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Columna derecha - Alumnos seleccionados */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      {/* Header */}
                      <div className="bg-blue-500 text-white px-4 py-3 border-b border-blue-600 rounded-t-lg">
                        <h3 className="font-semibold text-sm text-center">
                          Alumnos Seleccionados
                        </h3>
                      </div>
                      
                      {/* Lista de seleccionados */}
                      <div className="max-h-60 overflow-y-auto">
                        {selectedStudents.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-sm">No hay alumnos seleccionados</p>
                            <p className="text-xs mt-1">Selecciona alumnos de la lista izquierda</p>
                          </div>
                        ) : (
                          selectedStudents.map((studentId) => {
                            const student = students.find(s => s._id === studentId);
                            if (!student) return null;
                            
                            return (
                              <div
                                key={studentId}
                                className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-100 last:border-b-0"
                              >
                                <div>
                                  <div className="text-sm font-medium text-blue-900">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    DNI: {student.documentNumber}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleStudentSelection(studentId, false)}
                                  className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs cursor-pointer transition-colors flex items-center justify-center"
                                  title="Quitar de seleccionados"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>




                </div>
              )}
            </div>
          </details>
        </div>
        
        {/* Fixed footer with buttons */}
        <div className="bg-gray-50 px-5 py-3 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer">
            {isEditing ? 'Actualizar Capacitación' : 'Guardar Capacitación'}
          </button>
        </div>
      </div>
    </div>
  );
}
