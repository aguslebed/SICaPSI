import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { getStudents, getEnrolledStudents, uploadTrainingFile, deleteTrainingFile, getAllUsers } from '../../API/Request';
import TrainingPreview from './TrainingPreview';
import PresentationForm from './CreateTrainingModal/PresentationForm';
import LevelsEditor from './CreateTrainingModal/LevelsEditor';
import AssignTeacher from './CreateTrainingModal/AssignTeacher';
import EnrollStudents from './CreateTrainingModal/EnrollStudents';
import ErrorListModal from './ErrorListModal';
import SuccessModal from './SuccessModal';
import WarningModal from './WarningModal';

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
  const [activeSection, setActiveSection] = useState('training');
  
  // Levels - manejaremos la creación después
  const [levels, setLevels] = useState([{ 
    levelNumber: 1, 
    title: '', 
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

  // Cuando se abre el modal (crear o editar), asegurar que el punto de inicio sea "Capacitación"
  // y limpiar subsecciones/selecciones para evitar abrir en la última modificación.
  useEffect(() => {
    if (open) {
      setActiveSection('presentacion');
      setExpandedSubsection(null);
      setSelectedLevel(0);
      setSelectedScene(null);
      setSelectedOption(null);
    }
    // sólo cuando cambia 'open'
  }, [open]);

  // Estados para controlar qué subsección está expandida
  const [expandedSubsection, setExpandedSubsection] = useState(null); // 'training', 'bibliografia', 'test', null

  // Estado temporal para bibliografía en edición (live preview)
  const [bibliographyTempData, setBibliographyTempData] = useState({
    title: '',
    description: '',
    url: ''
  });

  // Handler para recibir cambios temporales de bibliografía
  const handleBibliographyTempChange = (tempData) => {
    setBibliographyTempData(tempData);
  };

  // Estado para archivos subidos
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Estados para modales de error y éxito
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  // Estados para personalizar título y texto del modal de errores
  const [errorModalTitle, setErrorModalTitle] = useState('No se ha podido guardar la capacitación');
  const [errorModalMessageText, setErrorModalMessageText] = useState('Complete los siguientes requisitos antes de Guardar:');
  
  // Estados para modal de advertencias
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Función de validación central para activación de capacitación
  const validateTrainingForActivation = () => {
    const errors = [];

    // Validar datos básicos de capacitación
    const imageValue = typeof image === 'string' ? image.trim() : image;
    if (!title || !title.trim()) {
      errors.push('Falta el título de la capacitación');
    }
    if (!subtitle || !subtitle.trim()) {
      errors.push('Falta el subtítulo de la capacitación');
    }
    if (!description || !description.trim()) {
      errors.push('Falta la descripción de la capacitación');
    }
    if (!imageValue) {
      errors.push('Falta la imagen de la capacitación');
    }
    if (!startDate) {
      errors.push('Falta la fecha de inicio');
    }
    if (!endDate) {
      errors.push('Falta la fecha de fin');
    }

    // Validar que fecha fin sea posterior a fecha inicio
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validar que exista al menos 1 nivel
    if (!levels || levels.length === 0) {
      errors.push('Debe crear al menos 1 nivel');
    }

    // Validar cada nivel
    levels.forEach((level, idx) => {
      const levelNum = idx + 1;

      // Validar training
      if (!level.training?.title || !level.training.title.trim()) {
        errors.push(`Nivel ${levelNum}: Falta el título de la clase magistral`);
      }
      if (!level.training?.description || !level.training.description.trim()) {
        errors.push(`Nivel ${levelNum}: Falta la descripción de la clase magistral`);
      }
      if (!level.training?.url || !level.training.url.trim()) {
        errors.push(`Nivel ${levelNum}: Falta el video de la clase magistral`);
      }
      if (!level.training?.duration || level.training.duration <= 0) {
        errors.push(`Nivel ${levelNum}: La duración de la clase magistral debe ser mayor a 0`);
      }

      // Validar bibliography
      if (!level.bibliography || level.bibliography.length === 0) {
        errors.push(`Nivel ${levelNum}: No hay elementos bibliográficos agregados`);
      } else {
        level.bibliography.forEach((bibItem, bibIdx) => {
          if (!bibItem.title || !bibItem.title.trim()) {
            errors.push(`Nivel ${levelNum}, Bibliografía ${bibIdx + 1}: Falta el título`);
          }
          if (!bibItem.description || !bibItem.description.trim()) {
            errors.push(`Nivel ${levelNum}, Bibliografía ${bibIdx + 1}: Falta la descripción`);
          }
          if (!bibItem.url || !bibItem.url.trim()) {
            errors.push(`Nivel ${levelNum}, Bibliografía ${bibIdx + 1}: Falta el archivo o enlace`);
          }
        });
      }

      // Validar test
      if (!level.test?.title || !level.test.title.trim()) {
        errors.push(`Nivel ${levelNum}: Falta el título de la evaluación`);
      }
      if (!level.test?.description || !level.test.description.trim()) {
        errors.push(`Nivel ${levelNum}: Falta la descripción de la evaluación`);
      }
      if (!level.test?.imageUrl || !level.test.imageUrl.trim()) {
        errors.push(`Nivel ${levelNum}: Falta la imagen de la evaluación`);
      }
      if (level.test?.isActive !== true) {
        errors.push(`Nivel ${levelNum}: La evaluación debe estar activa`);
      }

      // Validar escenas del test
      if (!level.test?.scenes || level.test.scenes.length === 0) {
        errors.push(`Nivel ${levelNum}: Debe crear al menos 1 escena en la evaluación`);
      } else {
        level.test.scenes.forEach((scene, sceneIdx) => {
          const sceneNum = sceneIdx + 1;
          if (!scene.description || !scene.description.trim()) {
            errors.push(`Nivel ${levelNum}, Escena ${sceneNum}: Falta la descripción`);
          }
          if (!scene.videoUrl || !scene.videoUrl.trim()) {
            errors.push(`Nivel ${levelNum}, Escena ${sceneNum}: Falta el video`);
          }

          // Validar opciones/botones de la escena
          if (!scene.options || scene.options.length < 2) {
            errors.push(`Nivel ${levelNum}, Escena ${sceneNum}: Debe tener al menos 2 botones de navegación`);
          } else {
            scene.options.forEach((option, optIdx) => {
              if (!option.description || !option.description.trim()) {
                errors.push(`Nivel ${levelNum}, Escena ${sceneNum}, Botón ${optIdx + 1}: Falta el texto del botón`);
              }
            });
          }
        });
      }
    });

    // Validar profesor asignado
    if (!assignedTeacher || !assignedTeacher.trim()) {
      errors.push('Debe asignar un profesor a la capacitación');
    }

    // Validar estudiantes inscritos
    if (!selectedStudents || selectedStudents.length === 0) {
      errors.push('Debe inscribir al menos 1 estudiante');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Handler para validar antes de activar
  const handleIsActiveChange = (checked) => {
    // Si está intentando activar (checked === true)
    if (checked) {
      // Debug: Ver estructura de datos antes de validar
      console.log('🔍 Validando capacitación...');
      console.log('📊 Estructura completa de levels:', JSON.stringify(levels, null, 2));
      
      const validation = validateTrainingForActivation();
      
      if (!validation.isValid) {
        console.log('❌ Errores encontrados:', validation.errors);
        // Mostrar modal de errores
        setErrorMessages(validation.errors);
        setErrorModalTitle('No se puede habilitar la capacitación');
        setErrorModalMessageText('Complete los siguientes requisitos antes de habilitar:');
        setShowErrorModal(true);
        // No activar
        return;
      }
      
      console.log('✅ Validación exitosa - activando capacitación');
    }
    
    // Si la validación pasa o está desactivando, actualizar el estado
    setIsActive(checked);
  };

  // Función auxiliar para verificar si un nivel está completo
  const isLevelComplete = (levelIndex) => {
    if (!levels || !levels[levelIndex]) return false;

    const level = levels[levelIndex];

    // Validar training
    const hasTraining = 
      level.training?.title?.trim() &&
      level.training?.description?.trim() &&
      level.training?.url?.trim() &&
      level.training?.duration > 0;

    // Validar bibliography
    const hasBibliography = 
      level.bibliography &&
      level.bibliography.length > 0 &&
      level.bibliography.every(item => 
        item.title?.trim() && 
        item.description?.trim() && 
        item.url?.trim()
      );

    // Validar test
    const hasTest = 
      level.test?.title?.trim() &&
      level.test?.description?.trim() &&
      level.test?.imageUrl?.trim() &&
      level.test?.isActive === true &&
      level.test?.scenes &&
      level.test.scenes.length > 0 &&
      level.test.scenes.every(scene => 
        scene.description?.trim() &&
        scene.videoUrl?.trim() &&
        scene.options &&
        scene.options.length >= 2 &&
        scene.options.every(opt => opt.description?.trim())
      );

    return hasTraining && hasBibliography && hasTest;
  };

  // Función para subir archivo de training
  const handleFileUpload = async (file, levelIndex) => {
    const fileKey = `level-${levelIndex}-training`;
    
    try {
      setUploadingFiles(prev => ({ ...prev, [fileKey]: true }));
      
      const response = await uploadTrainingFile(file);
      
      // Retornar la respuesta para que los componentes hijos la manejen
      return response;
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      throw error; // Re-lanzar el error para que lo maneje el componente hijo
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
      setWarningMessage(`Error eliminando archivo: ${error.message}`);
      setShowWarningModal(true);
    }
  };

  // Efecto para cargar datos cuando está editando
  useEffect(() => {
    if (editingTraining && open) {
      console.log('📝 Cargando datos de capacitación para edición:', editingTraining);
      
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
        console.log('📚 Cargando niveles:', editingTraining.levels.length);
        console.log('📦 Datos completos de niveles:', JSON.stringify(editingTraining.levels, null, 2));
        setLevels(editingTraining.levels.map((level, idx) => {
          console.log(`📖 Nivel ${idx + 1} - Bibliografía RAW:`, level.bibliography);
          console.log(`📖 Nivel ${idx + 1} - Level completo:`, level);
          
          const bibliographyData = level.bibliography ? level.bibliography.map(bibItem => {
            console.log('📄 Item de bibliografía:', bibItem);
            return {
              title: bibItem.title || '',
              description: bibItem.description || '',
              // Compatibilidad con datos legacy que podrían tener videoUrl en lugar de url
              url: bibItem.url || bibItem.videoUrl || ''
            };
          }) : [];
          
          console.log(`✅ Bibliografía procesada para nivel ${idx + 1}:`, bibliographyData);
          
          return {
            levelNumber: level.levelNumber,
            title: level.title,
            bibliography: bibliographyData,
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
        title: '', 
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
      setWarningMessage('Error al cargar la lista de guardias');
      setShowWarningModal(true);
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
      title: '', 
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
    // 1. Validar datos básicos SIEMPRE (requeridos para guardar)
    const imageValue = typeof image === 'string' ? image.trim() : image;
    const basicErrors = [];

    if (!title || !title.trim()) basicErrors.push('Falta el título de la capacitación');
    if (!subtitle || !subtitle.trim()) basicErrors.push('Falta el subtítulo de la capacitación');
    if (!description || !description.trim()) basicErrors.push('Falta la descripción de la capacitación');
    if (!imageValue) basicErrors.push('Falta la imagen de la capacitación');
    
    // Validar usuario logueado para crear capacitación
    if (!isEditing) {
      const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;
      let userIdFromStorage = null;
      
      if (!userId) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('userData'));
          userIdFromStorage = storedUser?._id || storedUser?.id || storedUser?.user?._id || storedUser?.user?.id;
        } catch (e) {
          console.error('Error obteniendo usuario del localStorage:', e);
        }
      }
      
      if (!userId && !userIdFromStorage) {
        basicErrors.push('No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
      }
    }

    if (basicErrors.length > 0) {
      setErrorMessages(basicErrors);
      setErrorModalTitle('No se puede guardar la capacitación');
      setErrorModalMessageText('Complete los siguientes requisitos antes de Guardar:');
      setShowErrorModal(true);
      return;
    }

    // 2. Validar fechas solo si ambas están presentes
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setErrorMessages(['La fecha de fin debe ser posterior a la fecha de inicio']);
      setErrorModalTitle('No se puede guardar la capacitación');
      setErrorModalMessageText('Complete los siguientes requisitos antes de Guardar:');
      setShowErrorModal(true);
      return;
    }

    // 3. Si isActive está marcado, validar requisitos completos
    if (isActive) {
      const validation = validateTrainingForActivation();
      if (!validation.isValid) {
        setErrorMessages(validation.errors);
        setErrorModalTitle('No se puede habilitar la capacitación');
        setErrorModalMessageText('Complete los siguientes requisitos antes de habilitar:');
        setShowErrorModal(true);
        return;
      }
    }

    // 4. Si pasa todas las validaciones, proceder con el guardado
    const payload = { 
      title: title.trim(),
      subtitle: subtitle.trim(), 
      description: description.trim(),
      image: imageValue,
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
      // El usuario puede estar en user._id o en user.user._id (según la estructura del login)
      const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;
      
      if (!userId) {
        // Intentar obtener del localStorage como respaldo
        try {
          const storedUser = JSON.parse(localStorage.getItem('userData'));
          payload.createdBy = storedUser?._id || storedUser?.id || storedUser?.user?._id || storedUser?.user?.id;
        } catch (e) {
          console.error('Error parseando userData del localStorage:', e);
        }
      } else {
        payload.createdBy = userId;
      }
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
    
    // Mostrar modal de éxito
    setShowSuccessModal(true);
  };

  return (
    <>
      {/* Backdrop oscuro */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      
      {/* Modal de edición - full width en mobile, split en desktop */}
      <div className="fixed left-0 top-0 z-50 w-full md:w-[48%] h-screen flex flex-col bg-white shadow-2xl" style={{ zIndex: 51 }}>
    {/* Header green - optimized for 14" screens */}
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 md:px-6 pt-2 md:pt-3 pb-3 md:pb-5 shadow-lg flex-shrink-0" style={{ minHeight: '68px', position: 'relative' }}>
      <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <h2 className="text-sm md:text-base font-bold">{title || (isEditing ? 'Editar capacitación' : 'Capacitación nueva')}</h2>
                  <p className="text-[10px] md:text-xs text-green-100">{subtitle || (isEditing ? 'Modificar datos' : 'Descripción breve')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 bg-white/20 rounded-lg">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-[11px] md:text-xs font-bold">{levels.length}</span>
                  <span className="text-[11px] md:text-xs font-medium text-white/90">Nivel{levels.length !== 1 ? 'es' : ''}</span>
                </div>
              </div>
            </div>
            {/* Progress bar moved inside header to keep headers same height (absolutely positioned) */}
            <div className="absolute inset-x-4 md:inset-x-6 bottom-0.5 md:bottom-1 text-white text-center text-[10px] md:text-xs py-1 md:py-1.5 font-semibold rounded-sm">
              <div className="flex items-center justify-center gap-1 md:gap-1.5">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Progreso: 0%</span>
              </div>
            </div>
          </div>

          {/* Content area with scroll */}
          <div className="flex-1 overflow-y-scroll bg-gray-50 text-sm">
          
          {/* Navegación por botones fijos */}
          <div className="bg-white border-b border-gray-300 sticky top-0 z-10">
            <div className="flex items-center justify-center px-4 md:px-6 pt-1.5 md:pt-2">
              <button
                type="button"
                onClick={() => setActiveSection('presentacion')}
                className={`relative px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === 'presentacion'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ marginBottom: '-1px' }}
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Capacitación</span>
                </div>
                {activeSection === 'presentacion' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setActiveSection('niveles');
                  setExpandedSubsection(null);
                }}
                className={`relative px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === 'niveles' || activeSection === 'training' || activeSection === 'bibliografia' || activeSection === 'test'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ marginBottom: '-1px' }}
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Niveles</span>
                  <span className="inline-flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 md:px-1.5 bg-green-600 text-white rounded-full text-[10px] md:text-xs font-semibold">
                    {levels.length}
                  </span>
                </div>
                {(activeSection === 'niveles' || activeSection === 'training' || activeSection === 'bibliografia' || activeSection === 'test') && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setActiveSection('profesor')}
                className={`relative px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === 'profesor'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ marginBottom: '-1px' }}
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profesor</span>
                  {assignedTeacher && assignedTeacher.trim() && (
                    <span className="inline-flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 md:px-1.5 bg-green-600 text-white rounded-full text-[10px] md:text-xs font-semibold">
                      ✓
                    </span>
                  )}
                </div>
                {activeSection === 'profesor' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setActiveSection('inscripcion')}
                className={`relative px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === 'inscripcion'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ marginBottom: '-1px' }}
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Guardias</span>
                  <span className="inline-flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 md:px-1.5 bg-green-600 text-white rounded-full text-[10px] md:text-xs font-semibold">
                    {selectedStudents.length}
                  </span>
                </div>
                {activeSection === 'inscripcion' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Presentation */}
          {activeSection === 'presentacion' && (
            <PresentationForm
              title={title}
              subtitle={subtitle}
              description={description}
              image={image}
              startDate={startDate}
              endDate={endDate}
              isActive={isActive}
              setTitle={setTitle}
              setSubtitle={setSubtitle}
              setDescription={setDescription}
              setImage={setImage}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setIsActive={handleIsActiveChange}
              uploadingFiles={uploadingFiles}
              uploadTrainingFile={uploadTrainingFile}
              deleteTrainingFile={deleteTrainingFile}
              showWarningModal={(message) => {
                setWarningMessage(message);
                setShowWarningModal(true);
              }}
            />
          )}

          {/* Levels */}
          {(activeSection === 'niveles' || activeSection === 'training' || activeSection === 'bibliografia' || activeSection === 'test') && (
            <LevelsEditor
              levels={levels}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              addLevel={addLevel}
              removeLevel={removeLevel}
              expandedSubsection={expandedSubsection}
              setExpandedSubsection={setExpandedSubsection}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              updateLevelField={updateLevelField}
              uploadingFiles={uploadingFiles}
              handleFileUpload={handleFileUpload}
              handleFileDelete={handleFileDelete}
              selectedScene={selectedScene}
              setSelectedScene={setSelectedScene}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              isLevelComplete={isLevelComplete}
              showWarningModal={(message) => {
                setWarningMessage(message);
                setShowWarningModal(true);
              }}
              onBibliographyTempChange={handleBibliographyTempChange}
            />
          )}
          {/* Asignar Profesor */}
          {activeSection === 'profesor' && (
            <AssignTeacher
              teachers={teachers}
              loadingTeachers={loadingTeachers}
              assignedTeacher={assignedTeacher}
              setAssignedTeacher={setAssignedTeacher}
            />
          )}
          
          {/* Enroll students */}
          {activeSection === 'inscripcion' && (
            <EnrollStudents
              loadingStudents={loadingStudents}
              students={students}
              searchStudent={searchStudent}
              setSearchStudent={setSearchStudent}
              handleSearch={handleSearch}
              handleClearSearch={handleClearSearch}
              selectedStudents={selectedStudents}
              handleStudentSelection={handleStudentSelection}
              selectAllStudents={selectAllStudents}
              deselectAllStudents={deselectAllStudents}
              getFilteredStudents={getFilteredStudents}
            />
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

      {/* Panel de Vista Previa - Oculto en mobile, visible en desktop */}
      <div className="hidden md:flex fixed top-0 right-0 z-50 w-[52%] h-screen bg-white shadow-2xl border-l-4 border-blue-500 flex-col">
        {/* Header de la vista previa */}
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 pt-2 md:pt-3 pb-3 md:pb-4 shadow-lg" style={{ minHeight: '68px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div>
                <h3 className="text-sm md:text-lg font-bold">Vista Previa en Tiempo Real</h3>
                <p className="text-[10px] md:text-xs text-blue-100">Así verán los estudiantes la capacitación</p>
              </div>
            </div>
            <div className="px-2 md:px-3 py-0.5 md:py-1 bg-white/20 rounded-full text-[10px] md:text-xs font-semibold">
              Live Preview
            </div>
          </div>
        </div>

        {/* Contenido del preview con scroll */}
        <div className="flex-1 overflow-y-scroll bg-gray-100">
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
            updateLevelField={updateLevelField}
            handleFileDelete={handleFileDelete}
            bibliographyTempData={bibliographyTempData}
            onLevelClick={(levelIndex) => {
              setSelectedLevel(levelIndex);
              setActiveSection('niveles');
            }}
            onBibliografiaClick={(levelIndex) => {
              setSelectedLevel(levelIndex);
              setExpandedSubsection('bibliografia');
              setActiveSection('bibliografia');
            }}
            onTrainingClick={(levelIndex) => {
              setSelectedLevel(levelIndex);
              setExpandedSubsection('training');
              setActiveSection('training');
            }}
            onTestClick={(levelIndex) => {
              setSelectedLevel(levelIndex);
              setExpandedSubsection('test');
              setActiveSection('test');
            }}
          />
        </div>

        {/* Footer de la vista previa eliminado por petición del usuario */}
      </div>

      {/* Modales de Error y Éxito */}
      {showErrorModal && (
        <ErrorListModal
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          errors={errorMessages}
          title={errorModalTitle}
          messageText={errorModalMessageText}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            // NO cerrar el modal de edición - permitir que el usuario siga trabajando
          }}
          isEditing={isEditing}
          isActive={isActive}
        />
      )}

      {/* Modal de Advertencias */}
      {showWarningModal && (
        <WarningModal
          show={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          message={warningMessage}
        />
      )}
    </>
  );
}
