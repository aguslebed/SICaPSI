import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserContext } from '../../context/UserContext';
import { getStudents, getEnrolledStudents, uploadTrainingFile, deleteTrainingFile, getAllUsers, replaceTrainingFile } from '../../API/Request';
import TrainingPreview from './CreateTrainingModal/TrainingPreview';
import PresentationForm from './CreateTrainingModal/PresentationForm';
import { getPlainTextFromRichText, normalizeRichTextValue } from './CreateTrainingModal/RichTextInput';
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
  
  // Estados para inscripción de Alumnos
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

  // Estado para la bibliografía seleccionada (edición desde la vista previa)
  const [editingBibliographyIndex, setEditingBibliographyIndex] = useState(null);

  // Cuando se abre el modal (crear o editar), asegurar que el punto de inicio sea "Capacitación"
  // y limpiar subsecciones/selecciones para evitar abrir en la última modificación.
  useEffect(() => {
    if (open) {
      setActiveSection('presentacion');
      setExpandedSubsection(null);
      setSelectedLevel(0);
      setSelectedScene(null);
      setSelectedOption(null);
      setEditingBibliographyIndex(null);
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
  const handleBibliographyTempChange = useCallback((tempData) => {
    setBibliographyTempData(tempData);
  }, []);

  // Estado para archivos subidos
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Estado para archivos pendientes de subir (solo se suben al guardar)
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingLevelFiles, setPendingLevelFiles] = useState({});
  // Estructura: { 'training-0': File, 'test-0': File, 'scene-0-1': File, 'bib-0-2': File }

  // Estado para trackear archivos originales (para eliminarlos solo al guardar si fueron reemplazados)
  const [originalFiles, setOriginalFiles] = useState({
    image: '',
    levels: []
  });

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
    const descriptionText = getPlainTextFromRichText(description);
    if (!descriptionText || !descriptionText.trim()) {
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

    // Validar fechas para habilitación
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorar horario
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (start > today) {
        errors.push('No se puede habilitar la capacitación antes de la fecha de inicio.');
      }
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (end < today) {
        errors.push('No se puede habilitar la capacitación después de la fecha de fin. La fecha de finalización ya pasó.');
      }
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
          const bibliographyDescriptionText = getPlainTextFromRichText(bibItem.description);
          if (!bibliographyDescriptionText || !bibliographyDescriptionText.trim()) {
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
        // Indica si el nivel tiene al menos una escena final (permite que opciones queden sin `next`)
        const levelHasAnyFinal = Array.isArray(level.test?.scenes) && level.test.scenes.some((s, i) => s?.isFinal === true || i === (level.test.scenes.length - 1));
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
              // Requerir next sólo si la escena NO es final, la opción no es lastOne, y el nivel no tiene finales
              const isFinalScene = Array.isArray(level.test?.scenes) && (scene.isFinal === true || sceneIdx === (level.test.scenes.length - 1));
              const requireNext = !isFinalScene && (!option.lastOne || option.lastOne !== true) && !levelHasAnyFinal;
              if (requireNext) {
                if (option.next === undefined || option.next === null || option.next === '') {
                  errors.push(`Nivel ${levelNum}, Escena ${sceneNum}, Botón ${optIdx + 1}: Falta la próxima escena`);
                }
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
      // Validar fechas primero
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (start > today) {
          setWarningMessage('No se puede habilitar la capacitación antes de la fecha de inicio.');
          setShowWarningModal(true);
          return;
        }
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (end < today) {
          setWarningMessage('No se puede habilitar la capacitación después de la fecha de fin. La fecha de finalización ya pasó.');
          setShowWarningModal(true);
          return;
        }
      }
      
      // Validar antes de activar (logs removed)
      const validation = validateTrainingForActivation();

      if (!validation.isValid) {
        // Mostrar modal de errores
        setErrorMessages(validation.errors);
        setErrorModalTitle('No se puede habilitar la capacitación');
        setErrorModalMessageText('Complete los siguientes requisitos antes de habilitar:');
        setShowErrorModal(true);
        // No activar
        return;
      }
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
      level.bibliography.every(item => {
        const plainDescription = getPlainTextFromRichText(item.description);
        return item.title?.trim() && plainDescription.trim() && item.url?.trim();
      });

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

  // Función para almacenar archivo pendiente (NO subirlo todavía)
  const handleFileUpload = async (file, levelIndex, fileType, subIndex = null) => {
    // fileType: 'training', 'test', 'scene', 'bib'
    // subIndex: para escenas y bibliografía
    
    const fileKey = subIndex !== null 
      ? `${fileType}-${levelIndex}-${subIndex}`
      : `${fileType}-${levelIndex}`;
    
    // Validar tamaño (100MB max para videos, 5MB para imágenes)
    const maxSize = (fileType === 'training' || fileType === 'scene') 
      ? 100 * 1024 * 1024  // 100MB para videos
      : 5 * 1024 * 1024;    // 5MB para imágenes y otros
    
    const maxSizeText = (fileType === 'training' || fileType === 'scene') ? '100 MB' : '5 MB';
    if (file.size > maxSize) {
      throw new Error(`El archivo excede el tamaño máximo de ${maxSizeText}`);
    }
    
    // Guardar el archivo en estado pendiente (tanto para crear como para editar)
    // Los archivos se subirán cuando se presione "Guardar" o "Actualizar"
    setPendingLevelFiles(prev => ({ ...prev, [fileKey]: file }));
    
    // Crear data URL para preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve({ filePath: event.target.result, isPending: true });
      };
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsDataURL(file);
    });
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
      // Cargando datos de capacitación para edición
      // Cargar datos del training
    setTitle(editingTraining.title || '');
    setSubtitle(editingTraining.subtitle || '');
    setDescription(normalizeRichTextValue(editingTraining.description || ''));
      setImage(editingTraining.image || '');
      setIsActive(editingTraining.isActive === true); // Solo true si está explícitamente en true, sino false
      setAssignedTeacher(editingTraining.assignedTeacher || '');
      setStartDate(editingTraining.startDate ? editingTraining.startDate.split('T')[0] : '');
      setEndDate(editingTraining.endDate ? editingTraining.endDate.split('T')[0] : '');
      setPendingImageFile(null); // Limpiar archivo pendiente al cargar para edición
      setPendingLevelFiles({}); // Limpiar archivos pendientes de niveles
      
      // Guardar archivos originales para comparar al guardar
      const originalLevels = editingTraining.levels?.map(level => ({
        trainingUrl: level.training?.url || level.training?.videoUrl || '',
        testImageUrl: level.test?.imageUrl || '',
        testScenes: level.test?.scenes?.map(scene => scene.videoUrl || '') || [],
        bibliography: level.bibliography?.map(bib => bib.url || bib.videoUrl || '') || []
      })) || [];
      
      setOriginalFiles({
        image: editingTraining.image || '',
        levels: originalLevels
      });
      
      // Cargar niveles si existen
      if (editingTraining.levels && editingTraining.levels.length > 0) {
        // Cargar y normalizar niveles
        setLevels(editingTraining.levels.map((level, idx) => {
          const bibliographyData = level.bibliography ? level.bibliography.map(bibItem => ({
            title: bibItem.title || '',
            description: normalizeRichTextValue(bibItem.description || ''),
            // Compatibilidad con datos legacy que podrían tener videoUrl en lugar de url
            url: bibItem.url || bibItem.videoUrl || ''
          })) : [];
          
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
      
      // Cargar Alumnos inscritos si existe el ID del training
      if (editingTraining._id) {
        loadEnrolledStudents(editingTraining._id);
      }
      setEditingBibliographyIndex(null);
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
      setPendingImageFile(null); // Limpiar archivo pendiente
      setPendingLevelFiles({}); // Limpiar archivos pendientes de niveles
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
      setSelectedStudents([]); // Limpiar Alumnos seleccionados para nuevo training
      setEditingBibliographyIndex(null);
      setOriginalFiles({ image: '', levels: [] }); // Limpiar archivos originales
    }
  }, [editingTraining, open]);

  // Efecto para cargar Alumnos cuando se abre el modal
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
      console.error('❌ Error cargando Alumnos:', error);
      setWarningMessage('Error al cargar la lista de Alumnos');
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
      console.error('Error cargando Alumnos inscritos:', error);
      // No mostrar alert aquí para no interrumpir la carga del modal
    }
  };

  const handleSelectLevel = (levelIndex, options = {}) => {
    setSelectedLevel(levelIndex);
    setSelectedScene(null);
    setSelectedOption(null);
    if (!options.preserveEditing) {
      setEditingBibliographyIndex(null);
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
    handleSelectLevel(levels.length);
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
      handleSelectLevel(Math.max(0, selectedLevel - 1));
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

  // Funciones para manejar selección de Alumnos
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

  const handleSave = async () => {
    const pendingUploads = {
      presentationFile: null,
      levelFiles: {}
    };
    // Ya no necesitamos rastrear archivos a eliminar, replaceTrainingFile lo hace automáticamente
    let finalImagePath = typeof image === 'string' ? image.trim() : image;
    const workingLevels = JSON.parse(JSON.stringify(levels));

    if (isEditing) {
      if (pendingImageFile) {
        try {
          setUploadingFiles(prev => ({ ...prev, 'presentation-image': true }));
          // Usar replaceTrainingFile para reemplazar automáticamente el archivo antiguo
          const response = await replaceTrainingFile(pendingImageFile, editingTraining?._id, originalFiles.image);
          const uploadedPath = typeof response === 'string' ? response : response?.filePath;
          if (!uploadedPath) throw new Error('No se recibió la ruta del archivo subido');
          // Ya no necesitamos marcar el archivo antiguo para eliminar, replaceTrainingFile lo hace automáticamente
          finalImagePath = uploadedPath;
          setImage(uploadedPath);
          // Actualizar originalFiles para futuros reemplazos
          setOriginalFiles(prev => ({ ...prev, image: uploadedPath }));
          setPendingImageFile(null);
        } catch (err) {
          console.error('Error subiendo imagen:', err);
          setErrorMessages([`Error al subir la imagen: ${err.message || 'Error desconocido'}`]);
          setErrorModalTitle('Error al subir archivo');
          setErrorModalMessageText('No se pudo subir la imagen:');
          setShowErrorModal(true);
          return;
        } finally {
          setUploadingFiles(prev => ({ ...prev, 'presentation-image': false }));
        }
      }

      for (const [fileKey, file] of Object.entries(pendingLevelFiles)) {
        try {
          setUploadingFiles(prev => ({ ...prev, [fileKey]: true }));
          const [fileType, levelIdx, subIdx] = fileKey.split('-');
          const levelIndex = Number(levelIdx);
          if (!Number.isFinite(levelIndex) || !workingLevels[levelIndex]) continue;

          // Obtener el archivo antiguo según el tipo DESDE originalFiles para no perder la referencia
          let previousPath = null;
          if (fileType === 'training') {
            previousPath = originalFiles.levels?.[levelIndex]?.trainingUrl || null;
          } else if (fileType === 'test') {
            previousPath = originalFiles.levels?.[levelIndex]?.testImageUrl || null;
          } else if (fileType === 'scene') {
            const sceneIndex = Number(subIdx);
            previousPath = originalFiles.levels?.[levelIndex]?.testScenes?.[sceneIndex] || null;
          } else if (fileType === 'bib') {
            const bibIndex = Number(subIdx);
            previousPath = originalFiles.levels?.[levelIndex]?.bibliography?.[bibIndex] || null;
          }

          // Usar replaceTrainingFile para reemplazar automáticamente
          const response = await replaceTrainingFile(file, editingTraining?._id, previousPath);
          const uploadedPath = typeof response === 'string' ? response : response?.filePath;
          if (!uploadedPath) throw new Error(`No se recibió la ruta del archivo ${fileKey}`);

          // Actualizar la ruta en workingLevels Y en originalFiles para futuros reemplazos
          if (fileType === 'training') {
            workingLevels[levelIndex].training = workingLevels[levelIndex].training || {};
            workingLevels[levelIndex].training.url = uploadedPath;
            // Actualizar originalFiles para que el próximo reemplazo tenga la ruta correcta
            if (originalFiles.levels?.[levelIndex]) {
              originalFiles.levels[levelIndex].trainingUrl = uploadedPath;
            }
          } else if (fileType === 'test') {
            workingLevels[levelIndex].test = workingLevels[levelIndex].test || {};
            workingLevels[levelIndex].test.imageUrl = uploadedPath;
            if (originalFiles.levels?.[levelIndex]) {
              originalFiles.levels[levelIndex].testImageUrl = uploadedPath;
            }
          } else if (fileType === 'scene') {
            const sceneIndex = Number(subIdx);
            if (Number.isFinite(sceneIndex) && workingLevels[levelIndex].test?.scenes?.[sceneIndex]) {
              workingLevels[levelIndex].test.scenes[sceneIndex].videoUrl = uploadedPath;
              if (originalFiles.levels?.[levelIndex]?.testScenes?.[sceneIndex] !== undefined) {
                originalFiles.levels[levelIndex].testScenes[sceneIndex] = uploadedPath;
              }
            }
          } else if (fileType === 'bib') {
            const bibIndex = Number(subIdx);
            if (Number.isFinite(bibIndex) && workingLevels[levelIndex].bibliography?.[bibIndex]) {
              workingLevels[levelIndex].bibliography[bibIndex].url = uploadedPath;
              if (originalFiles.levels?.[levelIndex]?.bibliography?.[bibIndex] !== undefined) {
                originalFiles.levels[levelIndex].bibliography[bibIndex] = uploadedPath;
              }
            }
          }

        } catch (err) {
          console.error(`Error subiendo archivo ${fileKey}:`, err);
          setErrorMessages([`Error al subir archivo: ${err.message || 'Error desconocido'}`]);
          setErrorModalTitle('Error al subir archivo');
          setErrorModalMessageText('No se pudo subir uno de los archivos:');
          setShowErrorModal(true);
          return;
        } finally {
          setUploadingFiles(prev => ({ ...prev, [fileKey]: false }));
        }
      }

      if (Object.keys(pendingLevelFiles).length > 0) {
        setLevels(workingLevels);
        setPendingLevelFiles({});
      }
    } else {
      if (pendingImageFile) {
        pendingUploads.presentationFile = pendingImageFile;
      }
      for (const [fileKey, file] of Object.entries(pendingLevelFiles)) {
        pendingUploads.levelFiles[fileKey] = file;
      }
    }

    // Si estamos creando y hay archivo pendiente, usar placeholder que se resolverá después
    if (!isEditing && pendingUploads.presentationFile) {
      finalImagePath = '__UPLOAD__::presentation-image';
    }

    const basicErrors = [];
    const titlePlain = getPlainTextFromRichText(title).trim();
    const subtitlePlain = getPlainTextFromRichText(subtitle).trim();
    const descriptionPlain = getPlainTextFromRichText(description).trim();
    const hasPresentationImage = finalImagePath || (!isEditing && pendingUploads.presentationFile);

    if (!titlePlain) basicErrors.push('Falta el título de la capacitación');
    if (!subtitlePlain) basicErrors.push('Falta el subtítulo de la capacitación');
    if (!descriptionPlain) basicErrors.push('Falta la descripción de la capacitación');
    if (!hasPresentationImage) basicErrors.push('Falta la imagen de la capacitación');
    if (!startDate) basicErrors.push('Falta la fecha de inicio de la capacitación');
    if (!endDate) basicErrors.push('Falta la fecha de fin de la capacitación');

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

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setErrorMessages(['La fecha de fin debe ser posterior a la fecha de inicio']);
      setErrorModalTitle('No se puede guardar la capacitación');
      setErrorModalMessageText('Complete los siguientes requisitos antes de Guardar:');
      setShowErrorModal(true);
      return;
    }

    // Simplemente enviar los niveles tal como están, sin validaciones complejas
    const sanitizedLevels = workingLevels.map((level, idx) => ({
      ...level,
      levelNumber: level.levelNumber || idx + 1,
      trainingId: editingTraining?._id
    }));

    if (isActive) {
      const activationErrors = [];
      
      // Validar fechas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start > today || end < today) {
        activationErrors.push('La fecha actual debe estar dentro del rango de inicio y fin.');
      }
      
      // Validar profesor asignado
      if (!assignedTeacher || !assignedTeacher.trim()) {
        activationErrors.push('Debe tener un profesor asignado.');
      }
      
      // Validar estudiantes inscritos
      if (!selectedStudents || selectedStudents.length === 0) {
        activationErrors.push('Debe tener al menos un estudiante inscrito.');
      }
      
      // Validar que haya al menos un nivel completo
      if (sanitizedLevels.length === 0) {
        activationErrors.push('Debe tener al menos un nivel creado.');
      } else {
        // Validar que cada nivel tenga los datos mínimos
        const sanitizePlain = value => getPlainTextFromRichText(value || '').trim();
        
        sanitizedLevels.forEach((level, idx) => {
          const levelNumber = level.levelNumber || idx + 1;
          // Indica si el nivel tiene al menos una escena final (permite que opciones queden sin `next`)
          const levelHasAnyFinal = Array.isArray(level.test?.scenes) && level.test.scenes.some((s, i) => s?.isFinal === true || i === (level.test.scenes.length - 1));
          
          // Validar título del nivel
          if (!sanitizePlain(level.title)) {
            activationErrors.push(`El Nivel ${levelNumber} no tiene título.`);
          }
          
          // Validar bibliografía
          if (!level.bibliography || level.bibliography.length === 0) {
            activationErrors.push(`El Nivel ${levelNumber} no tiene bibliografía.`);
          } else {
            let hasCompleteBib = false;
            level.bibliography.forEach((bib, bibIdx) => {
              if (sanitizePlain(bib.title) && sanitizePlain(bib.description) && bib.url) {
                hasCompleteBib = true;
              }
            });
            if (!hasCompleteBib) {
              activationErrors.push(`El Nivel ${levelNumber} no tiene ninguna bibliografía completa (título, descripción y URL).`);
            }
          }
          
          // Validar clase magistral
          if (!level.training) {
            activationErrors.push(`El Nivel ${levelNumber} no tiene clase magistral.`);
          } else {
            if (!sanitizePlain(level.training.title)) {
              activationErrors.push(`El Nivel ${levelNumber} - Clase magistral: falta título.`);
            }
            if (!sanitizePlain(level.training.description)) {
              activationErrors.push(`El Nivel ${levelNumber} - Clase magistral: falta descripción.`);
            }
            if (!level.training.url || !level.training.url.trim()) {
              activationErrors.push(`El Nivel ${levelNumber} - Clase magistral: falta video/URL.`);
            }
            if (!level.training.duration || level.training.duration <= 0) {
              activationErrors.push(`El Nivel ${levelNumber} - Clase magistral: falta duración.`);
            }
          }
          
          // Validar evaluación/test
          if (!level.test) {
            activationErrors.push(`El Nivel ${levelNumber} no tiene evaluación.`);
          } else {
            if (!sanitizePlain(level.test.title)) {
              activationErrors.push(`El Nivel ${levelNumber} - Evaluación: falta título.`);
            }
            if (!sanitizePlain(level.test.description)) {
              activationErrors.push(`El Nivel ${levelNumber} - Evaluación: falta descripción.`);
            }
            if (!level.test.imageUrl || !level.test.imageUrl.trim()) {
              activationErrors.push(`El Nivel ${levelNumber} - Evaluación: falta imagen.`);
            }
            
            // Validar escenas
            if (!level.test.scenes || level.test.scenes.length === 0) {
              activationErrors.push(`El Nivel ${levelNumber} - Evaluación: no tiene escenas.`);
            } else {
              level.test.scenes.forEach((scene, sceneIdx) => {
                if (!scene.idScene && scene.idScene !== 0) {
                  activationErrors.push(`El Nivel ${levelNumber} - Escena ${sceneIdx + 1}: falta ID.`);
                }
                if (!scene.videoUrl || !scene.videoUrl.trim()) {
                  activationErrors.push(`El Nivel ${levelNumber} - Escena ${sceneIdx + 1}: falta video.`);
                }
                if (!sanitizePlain(scene.description)) {
                  activationErrors.push(`El Nivel ${levelNumber} - Escena ${sceneIdx + 1}: falta descripción.`);
                }
                
                // Validar opciones
      
                if (!scene.options || scene.options.length < 2) {
                  activationErrors.push(`El Nivel ${levelNumber} - Escena ${sceneIdx + 1}: necesita al menos 2 opciones.`);
                } else {
                  scene.options.forEach((option, optIdx) => {
                    if (!option.description || !option.description.trim()) {
                      activationErrors.push(`El Nivel ${levelNumber} - Escena ${sceneIdx + 1} - Opción ${optIdx + 1}: falta descripción.`);
                    }
                    if (option.points === undefined || option.points === null) {
                      activationErrors.push(`El Nivel ${levelNumber} - Escena ${sceneIdx + 1} - Opción ${optIdx + 1}: falta puntos.`);
                    }
                        const isFinalScene = Array.isArray(level.test?.scenes) && (scene.isFinal === true || sceneIdx === (level.test.scenes.length - 1));
                        // Requerir `next` sólo si:
                        // - la escena NO es final,
                        // - la opción NO está marcada como lastOne,
                        // - Y el nivel NO tiene al menos una escena final (nivel sin final requiere rutas completas).
                        const requireNext = !isFinalScene && (!option.lastOne || option.lastOne !== true) && !levelHasAnyFinal;
                        if (requireNext) {
                          if (option.next === undefined || option.next === null || option.next === '') {
                            activationErrors.push(`El Nivel ${levelNumber} - Escena ${sceneIdx + 1} - Opción ${optIdx + 1}: falta próxima escena.`);
                          }
                        }
                  });
                }
              });
            }
          }
        });
      }
      
      if (activationErrors.length > 0) {
        setErrorMessages(activationErrors);
        setErrorModalTitle('No se puede habilitar la capacitación');
        setErrorModalMessageText('Complete los siguientes requisitos antes de habilitar:');
        setShowErrorModal(true);
        return;
      }
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      image: finalImagePath,
      isActive,
      report,
      totalLevels: sanitizedLevels.length,
      progressPercentage: 0,
      assignedTeacher: assignedTeacher.trim(),
      startDate,
      endDate
    };

    if (!isEditing) {
      const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;
      if (userId) {
        payload.createdBy = userId;
      } else {
        try {
          const storedUser = JSON.parse(localStorage.getItem('userData'));
          payload.createdBy = storedUser?._id || storedUser?.id || storedUser?.user?._id || storedUser?.user?.id;
        } catch (e) {
          console.error('Error parseando userData del localStorage:', e);
        }
      }
    }

    const additionalData = {
      selectedStudents,
      isEditing,
      trainingId: editingTraining?._id,
      pendingUploads: isEditing ? null : pendingUploads
      // Ya no necesitamos pasar filesToDeleteFromLevels ni oldImageToDelete
    };

    if (onSave) {
      try {
        await onSave(payload, sanitizedLevels, additionalData);

        if (isEditing) {
          setLevels(sanitizedLevels);
        }

        setPendingImageFile(null);
        setPendingLevelFiles({});

        setShowSuccessModal(true);
      } catch (err) {
        console.warn('CreateTrainingModal: onSave falló:', err);
      }
    }
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
                <div style={{ minWidth: 0 }}>
                  <h2
                    className="text-sm md:text-base font-bold truncate"
                    title={title || (isEditing ? 'Editar capacitación' : 'Capacitación nueva')}
                    style={{ maxWidth: '15rem' }}
                    dangerouslySetInnerHTML={{ __html: title || (isEditing ? 'Editar capacitación' : 'Capacitación nueva') }}
                  />
                  <p
                    className="text-[10px] md:text-xs text-green-100 truncate"
                    title={subtitle || (isEditing ? 'Modificar datos' : 'Descripción breve')}
                    style={{ maxWidth: '20rem' }}
                    dangerouslySetInnerHTML={{ __html: subtitle || (isEditing ? 'Modificar datos' : 'Descripción breve') }}
                  />
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
                  <span>Alumnos</span>
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
              pendingImageFile={pendingImageFile}
              setPendingImageFile={setPendingImageFile}
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
              setSelectedLevel={handleSelectLevel}
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
              editingBibliographyIndex={editingBibliographyIndex}
              setEditingBibliographyIndex={setEditingBibliographyIndex}
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
            editingBibliographyIndex={editingBibliographyIndex}
            onLevelClick={(levelIndex) => {
              handleSelectLevel(levelIndex);
              setActiveSection('niveles');
            }}
            onBibliografiaClick={(levelIndex) => {
              handleSelectLevel(levelIndex);
              setExpandedSubsection('bibliografia');
              setActiveSection('bibliografia');
            }}
            onTrainingClick={(levelIndex) => {
              handleSelectLevel(levelIndex);
              setExpandedSubsection('training');
              setActiveSection('training');
            }}
            onTestClick={(levelIndex) => {
              handleSelectLevel(levelIndex);
              setExpandedSubsection('test');
              setActiveSection('test');
            }}
            onBibliographyItemSelect={(levelIndex, itemIndex) => {
              handleSelectLevel(levelIndex, { preserveEditing: true });
              setExpandedSubsection('bibliografia');
              setActiveSection('bibliografia');
              setEditingBibliographyIndex(itemIndex);
              const selectedItem = levels[levelIndex]?.bibliography?.[itemIndex];
              if (selectedItem) {
                setBibliographyTempData({
                  title: selectedItem.title || '',
                  description: selectedItem.description || '',
                  url: selectedItem.url || ''
                });
              } else {
                setBibliographyTempData({ title: '', description: '', url: '' });
              }
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
