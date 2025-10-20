import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { getStudents, getEnrolledStudents, uploadTrainingFile, deleteTrainingFile, getAllUsers } from '../../API/Request';
import TrainingPreview from './TrainingPreview';

export default function CreateTrainingModal({ open, onClose, onSave, editingTraining }) {
  const { user } = useContext(UserContext);
  const isEditing = Boolean(editingTraining);
  
  // Campos principales de Training
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [assignedTeacher, setAssignedTeacher] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Report inicial vacío
  const [report, setReport] = useState([]);
  
  // Estado para lista de profesores
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  
  // Estados para inscripción de guardias
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');
  
  // Estado para controlar qué sección está activa en el preview
  const [activeSection, setActiveSection] = useState('presentacion');
  
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
  
  // Estado para la escena seleccionada en el test (similar a selectedLevel)
  const [selectedScene, setSelectedScene] = useState(null);
  
  // Estado para la opción seleccionada en la escena (similar a selectedLevel y selectedScene)
  const [selectedOption, setSelectedOption] = useState(null);

  // Estados para controlar qué subsección está expandida
  const [expandedSubsection, setExpandedSubsection] = useState(null); // 'training', 'bibliografia', 'test', null

  // Estados temporales para bibliografía
  const [tempBibTitle, setTempBibTitle] = useState('');
  const [tempBibDescription, setTempBibDescription] = useState('');
  const [tempBibUrl, setTempBibUrl] = useState('');

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
      setAssignedTeacher(editingTraining.assignedTeacher || '');
      setStartDate(editingTraining.startDate ? editingTraining.startDate.split('T')[0] : '');
      setEndDate(editingTraining.endDate ? editingTraining.endDate.split('T')[0] : '');
      
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
      setIsActive(false);
      setAssignedTeacher('');
      setStartDate('');
      setEndDate('');
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
      loadTeachers();
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

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const data = await getAllUsers();
      
      // Verificar si data tiene la estructura esperada
      if (!data || !data.items) {
        setTeachers([]);
        return;
      }
      
      // Filtrar usuarios con rol "Capacitador" (case insensitive)
      const teachersList = data.items.filter(user => 
        user.role && user.role.toLowerCase() === 'capacitador'
      );
      
      setTeachers(teachersList);
    } catch (error) {
      setTeachers([]); // Establecer array vacío en caso de error
    } finally {
      setLoadingTeachers(false);
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

  const removeLevel = () => {
    if (levels.length > 1) {
      const newLevels = levels.filter((_, idx) => idx !== selectedLevel);
      // Renumerar los niveles
      const renumberedLevels = newLevels.map((level, idx) => ({
        ...level,
        levelNumber: idx + 1,
        title: `Nivel ${idx + 1}`
      }));
      setLevels(renumberedLevels);
      // Ajustar el nivel seleccionado
      setSelectedLevel(Math.max(0, selectedLevel - 1));
    }
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
      progressPercentage: 0,
      assignedTeacher: assignedTeacher.trim(),
      startDate: startDate || null,
      endDate: endDate || null
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
    <>
      {/* Backdrop oscuro */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      
      {/* Modal de edición a la izquierda */}
      <div className="fixed left-0 top-0 z-50 w-[48%] h-screen flex flex-col bg-white shadow-2xl" style={{ zIndex: 51 }}>
    {/* Header green - match right header height */}
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 pt-3 pb-5 shadow-lg flex-shrink-0" style={{ minHeight: '88px', position: 'relative' }}>
      <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <h2 className="text-base font-bold">{title || (isEditing ? 'Editar capacitación' : 'Capacitación nueva')}</h2>
                  <p className="text-xs text-green-100">{subtitle || (isEditing ? 'Modificar datos' : 'Descripción breve')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-xs font-bold">{levels.length}</span>
                  <span className="text-xs font-medium text-white/90">Nivel{levels.length !== 1 ? 'es' : ''}</span>
                </div>
              </div>
            </div>
            {/* Progress bar moved inside header to keep headers same height (absolutely positioned) */}
            <div className="absolute inset-x-6 bottom-1 text-white text-center text-xs py-1.5 font-semibold rounded-sm">
              <div className="flex items-center justify-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Progreso: 0%</span>
              </div>
            </div>
          </div>

          {/* Content area with scroll */}
          <div className="flex-1 overflow-y-auto bg-gray-50 text-sm">
          
          {/* Navegación por botones fijos */}
          <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="flex px-6 pt-3">
              <button
                type="button"
                onClick={() => setActiveSection('presentacion')}
                className={`px-4 py-2 text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSection === 'presentacion'
                    ? 'text-green-600 border-b-3 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 border-b-3 border-transparent hover:border-gray-300'
                }`}
                style={{
                  borderBottomWidth: '3px',
                  marginBottom: '-2px'
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Capacitación</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('niveles');
                  setExpandedSubsection(null);
                }}
                className={`px-4 py-2 text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSection === 'niveles'
                    ? 'text-green-600 border-b-3 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 border-b-3 border-transparent hover:border-gray-300'
                }`}
                style={{
                  borderBottomWidth: '3px',
                  marginBottom: '-2px'
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Niveles</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">{levels.length}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('profesor')}
                className={`px-4 py-2 text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSection === 'profesor'
                    ? 'text-green-600 border-b-3 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 border-b-3 border-transparent hover:border-gray-300'
                }`}
                style={{
                  borderBottomWidth: '3px',
                  marginBottom: '-2px'
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Asignar Profesor</span>
                  {assignedTeacher && (
                    <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">✓</span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('inscripcion')}
                className={`px-4 py-2 text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSection === 'inscripcion'
                    ? 'text-green-600 border-b-3 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 border-b-3 border-transparent hover:border-gray-300'
                }`}
                style={{
                  borderBottomWidth: '3px',
                  marginBottom: '-2px'
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Inscribir guardias</span>
                  {selectedStudents.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{selectedStudents.length}</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Presentation */}
          {activeSection === 'presentacion' && (
            <div className="p-3 bg-white">
              {/* Tabla de presentación */}
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-500 text-white text-left px-2 py-1.5 text-xs font-semibold border border-gray-400" style={{width: '25%'}}>
                      Campo
                    </th>
                    <th className="bg-gray-500 text-white text-left px-2 py-1.5 text-xs font-semibold border border-gray-400">
                      Datos de la capacitación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 border border-gray-300">
                      Título
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                      <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-xs focus:ring-0 focus:outline-none bg-transparent" 
                        placeholder="Ingrese el título de la capacitación" 
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 border border-gray-300">
                      Subtítulo
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                      <input 
                        value={subtitle} 
                        onChange={(e) => setSubtitle(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-xs focus:ring-0 focus:outline-none bg-transparent" 
                        placeholder="Subtítulo de la capacitación" 
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 border border-gray-300">
                      Descripción
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-xs focus:ring-0 focus:outline-none bg-transparent resize-none" 
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
                    <td className="bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 border border-gray-300">
                      Fecha de Inicio
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                      <input 
                        type="date"
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-xs focus:ring-0 focus:outline-none bg-transparent cursor-pointer" 
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 border border-gray-300">
                      Fecha de Fin
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                      <input 
                        type="date"
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="w-full border-0 px-0 py-1 text-xs focus:ring-0 focus:outline-none bg-transparent cursor-pointer" 
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 border border-gray-300">
                      Estado
                    </td>
                    <td className="px-2 py-1.5 border border-gray-300">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="isActive" 
                          checked={isActive} 
                          onChange={(e) => setIsActive(e.target.checked)} 
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-xs cursor-pointer">Capacitación habilitada</label>
                        <span 
                          className="ml-auto inline-block px-3 py-1 rounded-full text-white text-xs font-bold text-center"
                          style={{ 
                            minWidth: '90px', 
                            backgroundColor: isActive ? '#10b981' : '#ef4444'
                          }}
                        >
                          {isActive ? 'HABILITADO' : 'DESHABILITADO'}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Levels */}
          {(activeSection === 'niveles' || activeSection === 'training' || activeSection === 'bibliografia' || activeSection === 'test') && (
            <div className="p-5 bg-white">
              {levels[selectedLevel] && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Título del nivel
                  </label>
                  <input
                    value={levels[selectedLevel].title}
                    onChange={(e) => updateLevelField(selectedLevel, 'title', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Ingrese el título descriptivo del nivel"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-green-500 focus:border-green-500 cursor-pointer bg-white hover:border-gray-400 transition-colors" value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))}>
                    {levels.map((l, idx) => (
                      <option key={idx} value={idx}>{`Nivel ${l.levelNumber}`}</option>
                    ))}
                  </select>
                  <button onClick={addLevel} className="min-w-[96px] bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap">+ Nuevo</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (levels.length > 1) {
                        removeLevel();
                      }
                    }}
                    disabled={levels.length <= 1}
                    className={`min-w-[96px] px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      levels.length > 1
                        ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                        : 'bg-gray-100 text-gray-400 border border-dashed border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    - Eliminar
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full justify-start sm:w-auto sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedSubsection('training');
                      setActiveSection('training');
                    }}
                    className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      expandedSubsection === 'training'
                        ? 'text-blue-600 border-blue-500'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    CLASE MAGISTRAL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedSubsection('bibliografia');
                      setActiveSection('bibliografia');
                    }}
                    className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      expandedSubsection === 'bibliografia'
                        ? 'text-blue-600 border-blue-500'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    BIBLIOGRAFÍA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedSubsection('test');
                      setActiveSection('test');
                    }}
                    className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      expandedSubsection === 'test'
                        ? 'text-blue-600 border-blue-500'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    EVALUACIÓN
                  </button>
                </div>
              </div>
              {/* Contenido del nivel */}
              <div>
                {/* Clase Magistral */}
                {expandedSubsection === 'training' && levels[selectedLevel] && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="bg-gray-500 text-white text-left px-3 py-2 text-sm font-semibold border border-gray-400" style={{ width: '25%' }}>
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

                                    if (currentValue && currentValue.startsWith('/uploads/') && currentValue !== newValue) {
                                      try {
                                        await deleteTrainingFile(currentValue);
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
                                  {levels[selectedLevel].training.url.startsWith('/uploads/') ? '📁 Archivo local subido' : '🌐 URL externa'}
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

                {/* Bibliografía */}
                {expandedSubsection === 'bibliografia' && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    {/* Nueva bibliografía - Sección de agregar */}
                    <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
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
                              value={tempBibUrl}
                              onChange={(e) => setTempBibUrl(e.target.value)}
                              onFocus={() => setActiveSection('bibliografia')}
                              placeholder="Agregar enlace"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={tempBibTitle}
                              onChange={(e) => setTempBibTitle(e.target.value)}
                              onFocus={() => setActiveSection('bibliografia')}
                              placeholder="Título del material"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={tempBibDescription}
                              onChange={(e) => setTempBibDescription(e.target.value)}
                              onFocus={() => setActiveSection('bibliografia')}
                              placeholder="Descripción breve"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newBibliography = [...(levels[selectedLevel]?.bibliography || [])];
                              newBibliography.push({
                                title: tempBibTitle,
                                description: tempBibDescription,
                                url: tempBibUrl
                              });
                              updateLevelField(selectedLevel, 'bibliography', newBibliography);
                              // Limpiar campos temporales
                              setTempBibTitle('');
                              setTempBibDescription('');
                              setTempBibUrl('');
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
                                  onFocus={() => setActiveSection('bibliografia')}
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
                                  onFocus={() => setActiveSection('bibliografia')}
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
                                  onFocus={() => setActiveSection('bibliografia')}
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
                  )}

                {/* Evaluación */}
                {expandedSubsection === 'test' && levels[selectedLevel] && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título del test</label>
                        <input 
                          value={levels[selectedLevel].test.title} 
                          onChange={(e) => updateLevelField(selectedLevel, 'test.title', e.target.value)} 
                          onFocus={() => {
                            setActiveSection('test');
                            setSelectedScene(null); // Mostrar vista general del test
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" 
                          placeholder="Título del test" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción</label>
                        <textarea 
                          value={levels[selectedLevel].test.description} 
                          onChange={(e) => updateLevelField(selectedLevel, 'test.description', e.target.value)} 
                          onFocus={() => {
                            setActiveSection('test');
                            setSelectedScene(null); // Mostrar vista general del test
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none" 
                          rows={2} 
                          placeholder="Descripción del test" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL de imagen</label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input 
                              value={levels[selectedLevel].test.imageUrl || ''} 
                              onChange={(e) => updateLevelField(selectedLevel, 'test.imageUrl', e.target.value)} 
                              onFocus={() => {
                                setActiveSection('test');
                                setSelectedScene(null); // Mostrar vista general del test
                              }}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" 
                              placeholder="URL de imagen o deja vacío para subir archivo" 
                            />
                            {levels[selectedLevel].test.imageUrl && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const currentImageUrl = levels[selectedLevel].test.imageUrl;
                                  // Eliminar archivo local si existe
                                  if (currentImageUrl && typeof currentImageUrl === 'string' && currentImageUrl.startsWith('/uploads/')) {
                                    try {
                                      await deleteTrainingFile(currentImageUrl);
                                    } catch (error) {
                                      console.error('Error eliminando imagen del test:', error);
                                    }
                                  }
                                  updateLevelField(selectedLevel, 'test.imageUrl', '');
                                }}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors cursor-pointer"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            &lt; 5 Mb - Formatos: JPG, PNG, GIF, WebP
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // Validar tamaño
                              if (file.size > 5 * 1024 * 1024) {
                                alert('El archivo es demasiado grande. Máximo 5 MB.');
                                e.target.value = '';
                                return;
                              }

                              // Validar tipo
                              if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
                                alert('Formato no válido. Solo JPG, PNG, GIF, WebP.');
                                e.target.value = '';
                                return;
                              }

                              try {
                                // Eliminar imagen anterior si es local
                                const currentImageUrl = levels[selectedLevel].test.imageUrl;
                                if (currentImageUrl && typeof currentImageUrl === 'string' && currentImageUrl.startsWith('/uploads/')) {
                                  try {
                                    await deleteTrainingFile(currentImageUrl);
                                  } catch (error) {
                                    console.error('Error eliminando imagen anterior:', error);
                                  }
                                }

                                // Subir nueva imagen
                                const response = await uploadTrainingFile(file);
                                const filePath = typeof response === 'string' ? response : response.filePath;
                                
                                updateLevelField(selectedLevel, 'test.imageUrl', filePath);
                                e.target.value = '';
                              } catch (error) {
                                console.error('Error subiendo imagen del test:', error);
                                alert(`Error subiendo imagen: ${error.message}`);
                                e.target.value = '';
                              }
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200 file:cursor-pointer cursor-pointer"
                          />
                        </div>
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
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-semibold text-gray-700">
                            Escenas del test ({levels[selectedLevel].test.scenes?.length || 0})
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                              const newSceneId = newScenes.length > 0 ? Math.max(...newScenes.map(s => s.idScene || 0)) + 1 : 1;
                              newScenes.push({
                                idScene: newSceneId,
                                videoUrl: '',
                                description: `Situación de emergencia ${newSceneId}`,
                                lastOne: false,
                                bonus: 0,
                                options: [
                                  {
                                    description: 'Opción A',
                                    points: 10,
                                    next: null
                                  },
                                  {
                                    description: 'Opción B',
                                    points: 5,
                                    next: null
                                  }
                                ]
                              });
                              updateLevelField(selectedLevel, 'test.scenes', newScenes);
                              setSelectedScene(newScenes.length - 1); // Seleccionar la nueva escena
                            }}
                            className="px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded cursor-pointer"
                          >
                            + Nueva escena
                          </button>
                        </div>
                        
                        {/* Selector de escena */}
                        {levels[selectedLevel].test.scenes && levels[selectedLevel].test.scenes.length > 0 && (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Seleccionar escena para editar</label>
                            <select
                              value={selectedScene !== null ? selectedScene : ''}
                              onChange={(e) => setSelectedScene(e.target.value === '' ? null : parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer"
                              onFocus={() => setActiveSection('test')}
                            >
                              <option value="">-- Ninguna seleccionada --</option>
                              {levels[selectedLevel].test.scenes.map((scene, idx) => (
                                <option key={idx} value={idx}>
                                  Escena {idx + 1} (ID: {scene.idScene || 'Sin ID'})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Formulario de edición de escena seleccionada */}
                        {selectedScene !== null && levels[selectedLevel].test.scenes && levels[selectedLevel].test.scenes[selectedScene] && (
                          <div className="border border-gray-200 rounded p-3 mb-3 space-y-3">
                            <div className="flex justify-between items-start">
                              <h6 className="text-xs font-medium text-gray-700">Editando: Escena {selectedScene + 1}</h6>
                              <button
                                type="button"
                                onClick={() => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  newScenes.splice(selectedScene, 1);
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                  setSelectedScene(null);
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
                                value={levels[selectedLevel].test.scenes[selectedScene].idScene || ''}
                                onChange={(e) => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  newScenes[selectedScene] = { ...newScenes[selectedScene], idScene: parseInt(e.target.value) || 0 };
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                }}
                                onFocus={() => setActiveSection('test')}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                placeholder="ID numérico único de la escena"
                                min="1"
                              />
                            </div>

                            {/* Última escena */}
                            <div className="mb-3">
                              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  id={`scene-lastOne-selected`}
                                  checked={levels[selectedLevel].test.scenes[selectedScene].lastOne || false}
                                  onChange={(e) => {
                                    const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                    newScenes[selectedScene] = { ...newScenes[selectedScene], lastOne: e.target.checked };
                                    updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                  }}
                                  onFocus={() => setActiveSection('test')}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>Última escena</span>
                              </label>
                            </div>

                            {/* Descripción */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                              <textarea
                                value={levels[selectedLevel].test.scenes[selectedScene].description || ''}
                                onChange={(e) => {
                                  const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                  newScenes[selectedScene] = { ...newScenes[selectedScene], description: e.target.value };
                                  updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                }}
                                onFocus={() => setActiveSection('test')}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-y"
                                rows="2"
                                placeholder="Descripción de la escena"
                              />
                            </div>

                            {/* URL del video */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Video de la escena</label>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    value={levels[selectedLevel].test.scenes[selectedScene].videoUrl || ''}
                                    onChange={(e) => {
                                      const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                      newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: e.target.value };
                                      updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                    }}
                                    onFocus={() => setActiveSection('test')}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                    placeholder="URL del video o deja vacío para subir archivo"
                                  />
                                  {levels[selectedLevel].test.scenes[selectedScene].videoUrl && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const currentVideoUrl = levels[selectedLevel].test.scenes[selectedScene].videoUrl;
                                        // Eliminar archivo local si existe
                                        if (currentVideoUrl && typeof currentVideoUrl === 'string' && currentVideoUrl.startsWith('/uploads/')) {
                                          try {
                                            await deleteTrainingFile(currentVideoUrl);
                                          } catch (error) {
                                            console.error('Error eliminando video de escena:', error);
                                          }
                                        }
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: '' };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors cursor-pointer"
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  &lt; 50 Mb - Formatos: MP4, WebM, OGG
                                </div>
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm,video/ogg"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    // Validar tamaño (50 MB)
                                    if (file.size > 50 * 1024 * 1024) {
                                      alert('El archivo es demasiado grande. Máximo 50 MB.');
                                      e.target.value = '';
                                      return;
                                    }

                                    // Validar tipo
                                    if (!file.type.match(/^video\/(mp4|webm|ogg)$/)) {
                                      alert('Formato no válido. Solo MP4, WebM, OGG.');
                                      e.target.value = '';
                                      return;
                                    }

                                    try {
                                      // Eliminar video anterior si es local
                                      const currentVideoUrl = levels[selectedLevel].test.scenes[selectedScene].videoUrl;
                                      if (currentVideoUrl && typeof currentVideoUrl === 'string' && currentVideoUrl.startsWith('/uploads/')) {
                                        try {
                                          await deleteTrainingFile(currentVideoUrl);
                                        } catch (error) {
                                          console.error('Error eliminando video anterior:', error);
                                        }
                                      }

                                      // Subir nuevo video
                                      const response = await uploadTrainingFile(file);
                                      const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                      newScenes[selectedScene] = { ...newScenes[selectedScene], videoUrl: response.filePath };
                                      updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                    } catch (error) {
                                      console.error('Error subiendo video:', error);
                                      alert(`Error subiendo video: ${error.message}`);
                                    } finally {
                                      e.target.value = '';
                                    }
                                  }}
                                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200 file:cursor-pointer cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Campos adicionales */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-700 mb-1">Bonus del video</label>
                                <input
                                  type="number"
                                  value={levels[selectedLevel].test.scenes[selectedScene].bonus || 0}
                                  onChange={(e) => {
                                    const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                    newScenes[selectedScene] = { ...newScenes[selectedScene], bonus: parseInt(e.target.value) || 0 };
                                    updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                  }}
                                  onFocus={() => setActiveSection('test')}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                  min="0"
                                />
                              </div>
                              <div />
                            </div>

                            {/* Opciones/Botones */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="text-xs font-semibold text-gray-700">
                                  Botones ({levels[selectedLevel].test.scenes[selectedScene].options?.length || 0}/2)
                                </h6>
                                {(!levels[selectedLevel].test.scenes[selectedScene].options || levels[selectedLevel].test.scenes[selectedScene].options.length < 2) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                      const currentOptions = newScenes[selectedScene].options || [];
                                      newScenes[selectedScene] = {
                                        ...newScenes[selectedScene],
                                        options: [...currentOptions, { description: '', points: 0, next: null }]
                                      };
                                      updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      setSelectedOption(currentOptions.length); // Seleccionar el nuevo botón
                                    }}
                                    className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer"
                                  >
                                    + Agregar botón
                                  </button>
                                )}
                              </div>
                              
                              {/* Selector de opción */}
                              {levels[selectedLevel].test.scenes[selectedScene].options && levels[selectedLevel].test.scenes[selectedScene].options.length > 0 && (
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Seleccionar botón para editar</label>
                                  <select
                                    value={selectedOption !== null ? selectedOption : ''}
                                    onChange={(e) => setSelectedOption(e.target.value === '' ? null : parseInt(e.target.value))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer"
                                    onFocus={() => setActiveSection('test')}
                                  >
                                    <option value="">-- Ningún botón seleccionado --</option>
                                    {levels[selectedLevel].test.scenes[selectedScene].options.map((opt, idx) => (
                                      <option key={idx} value={idx}>
                                        Botón {idx + 1} {opt.description ? `- ${opt.description}` : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              
                              {/* Formulario de edición de opción seleccionada */}
                              {selectedOption !== null && levels[selectedLevel].test.scenes[selectedScene].options && levels[selectedLevel].test.scenes[selectedScene].options[selectedOption] && (
                                <div className="border border-gray-200 rounded p-3 mb-3 space-y-3 bg-gray-50">
                                  <div className="flex justify-between items-start">
                                    <h6 className="text-xs font-medium text-gray-700">Editando: Botón {selectedOption + 1}</h6>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[selectedScene].options || [])];
                                        newOptions.splice(selectedOption, 1);
                                        newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                        setSelectedOption(null);
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                    >
                                      Eliminar botón
                                    </button>
                                  </div>

                                  {/* Descripción de la opción */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Texto del botón</label>
                                    <input
                                      type="text"
                                      value={levels[selectedLevel].test.scenes[selectedScene].options[selectedOption].description || ''}
                                      onChange={(e) => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[selectedScene].options || [])];
                                        newOptions[selectedOption] = { ...newOptions[selectedOption], description: e.target.value };
                                        newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      onFocus={() => setActiveSection('test')}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="Texto del botón (ej: Acercarse y abrir la puerta)"
                                    />
                                  </div>

                                  {/* Puntos */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Puntos</label>
                                    <input
                                      type="number"
                                      value={levels[selectedLevel].test.scenes[selectedScene].options[selectedOption].points || 0}
                                      onChange={(e) => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[selectedScene].options || [])];
                                        newOptions[selectedOption] = { ...newOptions[selectedOption], points: parseInt(e.target.value) || 0 };
                                        newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      onFocus={() => setActiveSection('test')}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      min="0"
                                      placeholder="Puntos que otorga esta opción"
                                    />
                                  </div>

                                  {/* Siguiente escena */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Siguiente escena (ID)</label>
                                    <input
                                      type="number"
                                      value={levels[selectedLevel].test.scenes[selectedScene].options[selectedOption].next || ''}
                                      onChange={(e) => {
                                        const newScenes = [...(levels[selectedLevel].test.scenes || [])];
                                        const newOptions = [...(newScenes[selectedScene].options || [])];
                                        newOptions[selectedOption] = { ...newOptions[selectedOption], next: e.target.value ? parseInt(e.target.value) : null };
                                        newScenes[selectedScene] = { ...newScenes[selectedScene], options: newOptions };
                                        updateLevelField(selectedLevel, 'test.scenes', newScenes);
                                      }}
                                      onFocus={() => setActiveSection('test')}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="ID de la siguiente escena (vacío = fin del test)"
                                      min="1"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
          
          {/* Asignar Profesor */}
          {activeSection === 'profesor' && (
            <div className="p-3 bg-white">
              {loadingTeachers ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-medium text-gray-600">Cargando profesores...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="text-sm font-bold text-purple-800">Asignar Profesor a la Capacitación</h3>
                    </div>
                    <p className="text-xs text-purple-700 mb-4">
                      Seleccione el profesor que estará a cargo de esta capacitación. El profesor asignado podrá gestionar los niveles y estudiantes.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Profesor Asignado</label>
                        <select
                          value={assignedTeacher} 
                          onChange={(e) => {
                            setAssignedTeacher(e.target.value);
                          }} 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow cursor-pointer bg-white" 
                        >
                          <option value="">-- Seleccione un profesor --</option>
                          {teachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.firstName} {teacher.lastName} - {teacher.email}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {teachers.length === 0 
                            ? 'No hay profesores disponibles en el sistema' 
                            : `${teachers.length} profesor${teachers.length !== 1 ? 'es' : ''} disponible${teachers.length !== 1 ? 's' : ''}`
                          }
                        </p>
                      </div>

                      {assignedTeacher && (
                        <div className="bg-white border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold bg-green-500">
                              ✓ ASIGNADO
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {teachers.find(t => t._id === assignedTeacher)?.firstName} {teachers.find(t => t._id === assignedTeacher)?.lastName}
                            </span>
                          </div>
                        </div>
                      )}

                      {!assignedTeacher && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-yellow-800">Sin profesor asignado</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Enroll students */}
          {activeSection === 'inscripcion' && (
            <div className="p-3 bg-white">
              {loadingStudents ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-medium text-gray-600">Cargando guardias...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Buscador mejorado */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-stretch gap-2">
                      <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Buscar por nombre o DNI..."
                          value={searchStudent}
                          onChange={(e) => setSearchStudent(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSearch();
                            }
                          }}
                          className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Buscar
                      </button>
                      {searchStudent && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Controles de selección */}
                  {students.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          {selectedStudents.length > 0 
                            ? `${selectedStudents.length} seleccionado${selectedStudents.length !== 1 ? 's' : ''}` 
                            : `${getFilteredStudents().length} disponible${getFilteredStudents().length !== 1 ? 's' : ''}`
                          }
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllStudents}  
                            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                          >
                            Seleccionar todos
                          </button>
                          <button
                            type="button"
                            onClick={deselectAllStudents}
                            className="px-4 py-1.5 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors cursor-pointer"
                          >
                            Limpiar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contenedor principal con dos columnas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    
                    {/* Columna izquierda - Lista de alumnos disponibles */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {/* Header */}
                      <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-semibold text-gray-700">
                            Disponibles
                          </h3>
                          <span className="text-xs text-gray-500">
                            {getFilteredStudents().length}
                          </span>
                        </div>
                      </div>
                      
                      {/* Lista de alumnos */}
                      <div className="max-h-80 overflow-y-auto">
                        {getFilteredStudents().length === 0 ? (
                          <div className="p-8 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-xs text-gray-500">
                              {students.length === 0 ? 'No hay guardias disponibles' : 'No se encontraron guardias'}
                            </p>
                          </div>
                        ) : (
                          getFilteredStudents().map((student) => (
                            <div
                              key={student._id}
                              className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                                selectedStudents.includes(student._id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => handleStudentSelection(student._id, !selectedStudents.includes(student._id))}
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student._id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleStudentSelection(student._id, e.target.checked);
                                }}
                                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">
                                  {student.firstName} {student.lastName}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {student.documentNumber}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Columna derecha - Alumnos seleccionados */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {/* Header */}
                      <div className="bg-blue-600 px-3 py-2 border-b border-blue-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-white">
                            Seleccionados
                          </h3>
                          <span className="text-xs text-white/90">
                            {selectedStudents.length}
                          </span>
                        </div>
                      </div>
                      
                      {/* Lista de seleccionados */}
                      <div className="max-h-80 overflow-y-auto">
                        {selectedStudents.length === 0 ? (
                          <div className="p-8 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-gray-500">No hay guardias seleccionados</p>
                          </div>
                        ) : (
                          selectedStudents.map((studentId) => {
                            const student = students.find(s => s._id === studentId);
                            if (!student) return null;
                            
                            return (
                              <div
                                key={studentId}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-900 truncate">
                                    {student.firstName} {student.lastName}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {student.documentNumber}
                                </div>
                                <button
                                  onClick={() => handleStudentSelection(studentId, false)}
                                  className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs cursor-pointer transition-colors flex items-center justify-center"
                                  title="Quitar"
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
          )}
          </div>
        
          {/* Fixed footer with buttons */}
          <div className="bg-white px-6 py-3 flex justify-between items-center border-t-2 border-gray-200 shadow-2xl flex-shrink-0">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span className="font-semibold text-gray-700">Última modificación:</span> Ahora</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancelar</span>
              </button>
              <button 
                onClick={handleSave} 
                className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-xs font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{isEditing ? 'Actualizar Capacitación' : 'Guardar Capacitación'}</span>
              </button>
            </div>
          </div>
        </div>

      {/* Panel de Vista Previa - Separado e independiente a la derecha */}
      <div className="fixed top-0 right-0 z-50 w-[52%] h-screen bg-white shadow-2xl border-l-4 border-blue-500 flex flex-col">
        {/* Header de la vista previa */}
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg" style={{ minHeight: '88px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div>
                <h3 className="text-lg font-bold">Vista Previa en Tiempo Real</h3>
                <p className="text-xs text-blue-100">Así verán los estudiantes la capacitación</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
              Live Preview
            </div>
          </div>
        </div>

        {/* Contenido del preview con scroll */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <TrainingPreview
            activeSection={activeSection}
            title={title}
            subtitle={subtitle}
            description={description}
            image={image}
            levels={levels}
            selectedLevel={selectedLevel}
            selectedScene={selectedScene}
            selectedStudents={selectedStudents}
            students={students}
            onLevelClick={(levelIndex) => {
              setSelectedLevel(levelIndex);
              setActiveSection('training');
            }}
          />
        </div>

        {/* Footer de la vista previa eliminado por petición del usuario */}
      </div>
    </>
  );
}
