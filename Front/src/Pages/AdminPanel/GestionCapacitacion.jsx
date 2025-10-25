import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import NavBar from '../../Components/Student/NavBar';
import CreateTrainingModal from '../../Components/Modals/CreateTrainingModal';
import SuccessModal from '../../Components/Modals/SuccessModal';
import ErrorListModal from '../../Components/Modals/ErrorListModal';
import WarningModal from '../../Components/Modals/WarningModal';
import ConfirmActionModal from '../../Components/Modals/ConfirmActionModal';
import { useState, useEffect, useRef } from 'react';
import { getAllActiveTrainings, getAllTrainings, createTraining, updateTraining, addLevelsToTraining, updateLevelsInTraining, deleteTraining, getTrainingById, enrollStudentsToTraining, enrollTrainerToTraining, deleteTrainingFile, uploadTrainingFile, moveTempFiles, replaceTrainingFile, getTrainerByTrainingId } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './AdminPanel.css';

const BUSINESS_STATE = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  ACTIVA: 'Activa',
  RECHAZADA: 'Rechazada',
  FINALIZADA: 'Finalizada'
};

const resolveBusinessState = (training) => {
  if (!training) return BUSINESS_STATE.BORRADOR;

  const pendingApproval = Boolean(training.pendingApproval);
  const rejected = Boolean(training.rejectedBy);
  const isActive = Boolean(training.isActive);
  const isExpired = training.endDate && new Date(training.endDate) < new Date();

  if (pendingApproval && !rejected) {
    return BUSINESS_STATE.PENDIENTE;
  }

  if (rejected) {
    return BUSINESS_STATE.RECHAZADA;
  }

  if (isActive) {
    return BUSINESS_STATE.ACTIVA;
  }

  if (!pendingApproval && !rejected && !isActive && isExpired) {
    return BUSINESS_STATE.FINALIZADA;
  }

  return BUSINESS_STATE.BORRADOR;
};

const BUSINESS_STATE_COLORS = {
  [BUSINESS_STATE.BORRADOR]: '#6b7280',
  [BUSINESS_STATE.PENDIENTE]: '#f59e0b',
  [BUSINESS_STATE.ACTIVA]: '#10b981',
  [BUSINESS_STATE.RECHAZADA]: '#ef4444',
  [BUSINESS_STATE.FINALIZADA]: '#8b5cf6'
};

const EDIT_STATE_TOOLTIPS = {
  [BUSINESS_STATE.ACTIVA]: 'Editás una capacitación activa. "Actualizar" guarda tus cambios y quedarán pendientes hasta la aprobación directiva.',
  [BUSINESS_STATE.PENDIENTE]: 'Esta capacitación ya está pendiente. "Actualizar" reemplaza la revisión enviada.',
  [BUSINESS_STATE.RECHAZADA]: 'Corregí la capacitación rechazada y volvé a enviarla a aprobación.',
  [BUSINESS_STATE.FINALIZADA]: 'Estás editando una capacitación finalizada. Los cambios generarán una nueva revisión a aprobar.',
  [BUSINESS_STATE.BORRADOR]: 'Editá el borrador y enviá a aprobar cuando esté listo.'
};

export default function GestionCapacitacion() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para cachear profesores por trainingId
  const [trainersMap, setTrainersMap] = useState({});
  
  // Estados para modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  // Estados para personalizar título y texto del modal de errores en este page
  const [errorModalTitle, setErrorModalTitle] = useState('No se ha podido completar la operación');
  const [errorModalMessageText, setErrorModalMessageText] = useState('Ocurrió un error. Revise los siguientes detalles:');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Estados para los dropdowns
  const [nivelMenu, setNivelMenu] = useState(false);
  const [estadoMenu, setEstadoMenu] = useState(false);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState([]);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
  
  // Estado para filtrar capacitaciones activas/inactivas
  const [mostrarInactivas, setMostrarInactivas] = useState(true);
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para filtros aplicados (separados de los seleccionados)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedNiveles, setAppliedNiveles] = useState([]);
  const [appliedEstados, setAppliedEstados] = useState([]);
  const [appliedMostrarInactivas, setAppliedMostrarInactivas] = useState(true);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Referencias para los dropdowns
  const nivelMenuRef = useRef(null);
  const estadoMenuRef = useRef(null);

  // Helper: obtiene el profesor para cada capacitación que no tenga `trainer` poblado
  const fetchAndAttachTrainers = async (trainingsList) => {
    if (!Array.isArray(trainingsList) || trainingsList.length === 0) return trainingsList;

    const mapUpdates = {};

    const jobs = trainingsList.map(async (t) => {
      try {
        // Skip si ya está cacheado
        if (trainersMap[t._id]) return;

        const trainer = await getTrainerByTrainingId(t._id);
        
        if (trainer) mapUpdates[t._id] = trainer;
      } catch (err) {
        console.warn('fetchAndAttachTrainers: no se pudo cargar trainer para', t._id, err?.message || err);
      }
    });

    await Promise.all(jobs);

    if (Object.keys(mapUpdates).length > 0) {
      setTrainersMap(prev => ({ ...prev, ...mapUpdates }));
    }

    return trainingsList;
  };

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (nivelMenuRef.current && !nivelMenuRef.current.contains(event.target)) {
        setNivelMenu(false);
      }
      if (estadoMenuRef.current && !estadoMenuRef.current.contains(event.target)) {
        setEstadoMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const niveles = [
    { label: 'Nivel 1', value: 'nivel1' },
    { label: 'Nivel 2', value: 'nivel2' },
    { label: 'Nivel 3', value: 'nivel3' },
  ];

  const estadosOpciones = [
    { label: 'Borrador', value: 'borrador' },
    { label: 'Pendiente de Aprobación', value: 'pendiente' },
    { label: 'Activa', value: 'activa' },
    { label: 'Rechazada', value: 'rechazada' },
    { label: 'Finalizada', value: 'finalizada' },
    { label: 'Asignado', value: 'asignado' },
    { label: 'Sin asignar', value: 'sin_asignar' },
  ];

  // Funciones para manejar cambios en los checkboxes
  const handleNivelChange = (nivelValue) => {
    setNivelesSeleccionados(prev => {
      if (prev.includes(nivelValue)) {
        return prev.filter(n => n !== nivelValue);
      } else {
        return [...prev, nivelValue];
      }
    });
  };

  const handleEstadoChange = (estadoValue) => {
    setEstadosSeleccionados(prev => {
      if (prev.includes(estadoValue)) {
        return prev.filter(e => e !== estadoValue);
      } else {
        return [...prev, estadoValue];
      }
    });
  };

  // sample profesores placeholder (could come from API later)
  const sampleProfesores = [
    { _id: 'p1', displayName: 'Juan Perez (Disponible)' },
    { _id: 'p2', displayName: 'Pedro Pascal' },
  ];

  useEffect(() => {
    let mounted = true;
    const fetchTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllTrainings(); // Cambiar a getAllTrainings para obtener todas
        // backend may return an array or { items: [] }
        const items = Array.isArray(data) ? data : (data?.items || []);
        if (mounted) {
          const enriched = await fetchAndAttachTrainers(items);
          setTrainings(enriched);
        }
      } catch (err) {
        console.error('Error fetching trainings', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTrainings();
    return () => { mounted = false; };
  }, []);
  const [openCreateTraining, setOpenCreateTraining] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);

  // Función para refrescar las capacitaciones
  const refreshTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTrainings(); // Cambiar a getAllTrainings para obtener todas
      const items = Array.isArray(data) ? data : (data?.items || []);
  const enriched = await fetchAndAttachTrainers(items);
  setTrainings(enriched);
    } catch (err) {
      console.error('Error fetching trainings', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la creación/actualización de capacitaciones
  const handleCreateTraining = async (trainingData, levels, additionalData = {}) => {
    const {
      selectedStudents = [],
      isEditing = false,
      trainingId,
      pendingUploads = null,
      omissionMessages = []
    } = additionalData;
    // Ya no necesitamos filesToDeleteFromLevels ni oldImageToDelete

    let submissionSummary = {
      pendingApproval: Boolean(trainingData?.pendingApproval),
      businessState: resolveBusinessState(trainingData)
    };

    setLoading(true);
    try {

      let finalTrainingId = trainingId;
      const sanitizedLevels = Array.isArray(levels) ? levels : [];

      if (isEditing) {
        const updatedTraining = await updateTraining(trainingId, trainingData);
        const revisionCreated = Boolean(updatedTraining?.revisionCreated);
        finalTrainingId = revisionCreated ? (updatedTraining?.trainingId || trainingId) : (updatedTraining?._id || trainingId);

        const levelsWithTrainingId = sanitizedLevels.map(level => ({
          ...level,
          trainingId: finalTrainingId
        }));
        await updateLevelsInTraining(finalTrainingId, levelsWithTrainingId);

        const resultingState = revisionCreated
          ? BUSINESS_STATE.PENDIENTE
          : resolveBusinessState(updatedTraining);
        const resultingPending = revisionCreated
          ? true
          : Boolean(updatedTraining?.pendingApproval);

        submissionSummary = {
          pendingApproval: resultingPending,
          businessState: resultingState
        };

        trainingData.pendingApproval = submissionSummary.pendingApproval;

        // Ya no necesitamos eliminar archivos manualmente porque replaceTrainingFile lo hace automáticamente
      } else {
        const uploadResults = {};
        const tempFilePaths = []; // Recolectar rutas temporales

        // Subir imagen a carpeta temporal
        if (pendingUploads?.presentationFile) {
          const response = await uploadTrainingFile(pendingUploads.presentationFile);
          const uploadedPath = typeof response === 'string' ? response : response?.filePath;
          if (!uploadedPath) {
            throw new Error('No se recibió la ruta del archivo de imagen');
          }
          uploadResults['presentation-image'] = uploadedPath;
          tempFilePaths.push(uploadedPath);
          trainingData.image = uploadedPath; // Guardar ruta temporal por ahora
        } else {
          trainingData.image = '__PENDING_UPLOAD__';
        }

        // Crear training en MongoDB (obtiene ID)
        const createdTraining = await createTraining(trainingData);
        finalTrainingId = createdTraining._id;

        submissionSummary = {
          pendingApproval: Boolean(createdTraining?.pendingApproval),
          businessState: resolveBusinessState(createdTraining)
        };

        trainingData.pendingApproval = submissionSummary.pendingApproval;

        // Subir archivos de niveles a temporal
        if (pendingUploads?.levelFiles) {
          for (const [fileKey, file] of Object.entries(pendingUploads.levelFiles)) {
            const response = await uploadTrainingFile(file);
            const uploadedPath = typeof response === 'string' ? response : response?.filePath;
            if (!uploadedPath) {
              throw new Error(`No se recibió la ruta del archivo ${fileKey}`);
            }
            uploadResults[fileKey] = uploadedPath;
            tempFilePaths.push(uploadedPath);
          }
        }

        // Mover todos los archivos de temp a carpeta definitiva
        if (tempFilePaths.length > 0) {
          const moveResult = await moveTempFiles(finalTrainingId, tempFilePaths);
          
          // Actualizar rutas en uploadResults
          if (moveResult.movedFiles && moveResult.movedFiles.length > 0) {
            for (const moved of moveResult.movedFiles) {
              // Actualizar uploadResults con nuevas rutas
              for (const [key, oldPath] of Object.entries(uploadResults)) {
                if (oldPath === moved.oldPath) {
                  uploadResults[key] = moved.newPath;
                }
              }
              
              // Si es la imagen principal, actualizar en el training
              if (moved.oldPath === trainingData.image) {
                await updateTraining(finalTrainingId, { image: moved.newPath });
              }
            }
          }
        }

        // Resolver placeholders en niveles con las rutas actualizadas
        const resolvePlaceholder = (value) => {
          if (typeof value === 'string' && value.startsWith('__UPLOAD__::')) {
            const key = value.substring('__UPLOAD__::'.length);
            const resolved = uploadResults[key];
            if (!resolved) {
              throw new Error(`No se pudo resolver el archivo pendiente "${key}"`);
            }
            return resolved;
          }
          return value;
        };

        const resolvedLevels = sanitizedLevels.map(level => {
          const resolvedLevel = { ...level, trainingId: finalTrainingId };
          
          if (resolvedLevel.training) {
            resolvedLevel.training.url = resolvePlaceholder(resolvedLevel.training.url);
          }
          
          if (resolvedLevel.test) {
            resolvedLevel.test.imageUrl = resolvePlaceholder(resolvedLevel.test.imageUrl);
            if (resolvedLevel.test.scenes) {
              resolvedLevel.test.scenes = resolvedLevel.test.scenes.map(scene => ({
                ...scene,
                videoUrl: resolvePlaceholder(scene.videoUrl)
              }));
            }
          }
          
          if (resolvedLevel.bibliography) {
            resolvedLevel.bibliography = resolvedLevel.bibliography.map(item => ({
              ...item,
              url: resolvePlaceholder(item.url)
            }));
          }
          
          return resolvedLevel;
        });

        if (resolvedLevels.length > 0) {
          await addLevelsToTraining(finalTrainingId, resolvedLevels);
        }
      }

      if (selectedStudents && selectedStudents.length > 0) {
        try {
          await enrollStudentsToTraining(finalTrainingId, selectedStudents);
        } catch (enrollError) {
          console.warn('Error inscribiendo guardias:', enrollError);
          setWarningMessage(`Capacitación guardada, pero hubo un problema inscribiendo guardias: ${enrollError.message}`);
          setShowWarningModal(true);
        }
      }

      // Inscribir profesor si está asignado
      if (trainingData.assignedTeacher && trainingData.assignedTeacher.trim()) {
        try {
          await enrollTrainerToTraining(finalTrainingId, trainingData.assignedTeacher);
        } catch (enrollError) {
          console.warn('Error inscribiendo profesor:', enrollError);
          setWarningMessage(`Capacitación guardada, pero hubo un problema inscribiendo al profesor: ${enrollError.message}`);
          setShowWarningModal(true);
        }
      }

      await refreshTrainings();

      if (!isEditing && finalTrainingId) {
        const createdTraining = await getTrainingById(finalTrainingId);
        const decoratedTraining = { ...createdTraining, businessState: resolveBusinessState(createdTraining) };
        submissionSummary = {
          pendingApproval: Boolean(decoratedTraining.pendingApproval),
          businessState: decoratedTraining.businessState
        };
        setEditingTraining(decoratedTraining);
      }
    } catch (error) {
      console.error('Error procesando capacitación:', error);
      const messages = [`Error al ${isEditing ? 'actualizar' : 'crear'} capacitación: ${error.message}`];
      if (Array.isArray(error.details) && error.details.length > 0) {
        error.details.forEach((detail) => {
          if (detail?.message) {
            messages.push(detail.message);
          }
        });
      }
      setErrorMessages(messages);
      setErrorModalTitle(isEditing ? 'No se puede actualizar la capacitación' : 'No se puede crear la capacitación');
      setErrorModalMessageText('Revise los siguientes detalles e intente nuevamente:');
      setShowErrorModal(true);
      throw error;
    } finally {
      setLoading(false);
    }

    return submissionSummary;
  };

  // Estado para el modal de confirmación de eliminación
  const [deleteConfirmData, setDeleteConfirmData] = useState(null);

  // Función para manejar la eliminación de capacitaciones
  const handleDeleteTraining = (trainingId, trainingTitle) => {
    // Guardar los datos para la eliminación y mostrar modal de confirmación
    setDeleteConfirmData({ trainingId, trainingTitle });
  };

  // Función para confirmar la eliminación
  const confirmDeleteTraining = async () => {
    if (!deleteConfirmData) return;
    
    const { trainingId } = deleteConfirmData;
    setDeleteConfirmData(null); // Cerrar modal de confirmación
    
    setLoading(true);
    try {
      // 1. Primero obtener la capacitación completa para conocer todos sus archivos
      const trainingData = await getTrainingById(trainingId);
      
      // 2. Recopilar todos los archivos que deben eliminarse
      const filesToDelete = [];
      
      // 2.1 Imagen de presentación
      if (trainingData.image && trainingData.image.startsWith('/uploads/')) {
        filesToDelete.push(trainingData.image);
      }
      
      // 2.2 Archivos en niveles
      if (trainingData.levels && trainingData.levels.length > 0) {
        trainingData.levels.forEach(level => {
          // Video de capacitación
          if (level.training?.url && level.training.url.startsWith('/uploads/')) {
            filesToDelete.push(level.training.url);
          }
          
          // Imagen del test
          if (level.test?.imageUrl && level.test.imageUrl.startsWith('/uploads/')) {
            filesToDelete.push(level.test.imageUrl);
          }
          
          // Videos de escenas del test
          if (level.test?.scenes && level.test.scenes.length > 0) {
            level.test.scenes.forEach(scene => {
              if (scene.videoUrl && scene.videoUrl.startsWith('/uploads/')) {
                filesToDelete.push(scene.videoUrl);
              }
            });
          }
          
          // Archivos de bibliografía
          if (level.bibliography && level.bibliography.length > 0) {
            level.bibliography.forEach(bib => {
              if (bib.url && bib.url.startsWith('/uploads/')) {
                filesToDelete.push(bib.url);
              }
            });
          }
        });
      }
      
      // 3. Eliminar archivos del servidor
      if (filesToDelete.length > 0) {
        console.log('Eliminando archivos asociados:', filesToDelete);
        for (const filePath of filesToDelete) {
          try {
            await deleteTrainingFile(filePath);
          } catch (error) {
            console.warn(`No se pudo eliminar el archivo ${filePath}:`, error);
            // Continuar con los demás archivos aunque falle alguno
          }
        }
      }
      
      // 4. Eliminar la capacitación de la base de datos
      await deleteTraining(trainingId);
      await refreshTrainings();
      setSuccessMessage('Capacitación eliminada exitosamente');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error eliminando capacitación:', error);
      setErrorMessages([`Error al eliminar capacitación: ${error.message}`]);
      setErrorModalTitle('No se puede eliminar la capacitación');
      setErrorModalMessageText('Ocurrió un error al intentar eliminar. Revise los siguientes detalles:');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la edición de capacitaciones
  const handleEditTraining = async (trainingId) => {
    setLoading(true);
    try {
      // Limpiar estado anterior primero
      setEditingTraining(null);
      
      // Obtener datos frescos del backend
      const trainingData = await getTrainingById(trainingId);
      
      const estadoActual = resolveBusinessState(trainingData);
      const trainingForModal = { ...trainingData, businessState: estadoActual };

      setEditingTraining(trainingForModal);
      setOpenCreateTraining(true);
    } catch (error) {
      console.error('Error obteniendo capacitación:', error);
      setErrorMessages([`Error al cargar capacitación: ${error.message}`]);
      setErrorModalTitle('No se puede cargar la capacitación');
      setErrorModalMessageText('Ocurrió un error al cargar los datos. Revise los siguientes detalles:');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el modal y limpiar el estado de edición
  const handleCloseModal = () => {
    setOpenCreateTraining(false);
    setEditingTraining(null);
  };

  // Función para aplicar búsqueda (botón lupa)
  const handleSearch = () => {
    setAppliedSearch(searchTerm);
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    setAppliedSearch(searchTerm);
    setAppliedNiveles([...nivelesSeleccionados]);
    setAppliedEstados([...estadosSeleccionados]);
    setAppliedMostrarInactivas(mostrarInactivas);
    setCurrentPage(1); // Resetear a página 1 al aplicar filtros
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    // Limpiar filtros seleccionados
    setNivelesSeleccionados([]);
    setEstadosSeleccionados([]);
    setSearchTerm('');
    setMostrarInactivas(true);
    
    // Limpiar filtros aplicados
    setAppliedSearch('');
    setAppliedNiveles([]);
    setAppliedEstados([]);
    setAppliedMostrarInactivas(true);
    setCurrentPage(1); // Resetear a página 1 al limpiar filtros
  };

  // Función para obtener capacitaciones paginadas
  const getPaginatedTrainings = () => {
    const filtered = getFilteredTrainings();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalPages,
      totalItems: filtered.length
    };
  };

  // Función para filtrar capacitaciones (usa filtros aplicados)
  const getFilteredTrainings = () => {
    if (!trainings) return [];
    
    let filtered = trainings;

    // Filtro por término de búsqueda aplicado
    if (appliedSearch.trim()) {
      const term = appliedSearch.toLowerCase().trim();
      filtered = filtered.filter(training => 
        training.title?.toLowerCase().includes(term) ||
        training.subtitle?.toLowerCase().includes(term) ||
        training.description?.toLowerCase().includes(term)
      );
    }
    
    // Filtro por estados aplicados
    if (appliedEstados.length > 0) {
      filtered = filtered.filter(training => {
        const businessState = resolveBusinessState(training);

        const matchesBorrador = appliedEstados.includes('borrador') && businessState === BUSINESS_STATE.BORRADOR;
        const matchesPendiente = appliedEstados.includes('pendiente') && businessState === BUSINESS_STATE.PENDIENTE;
        const matchesActiva = appliedEstados.includes('activa') && businessState === BUSINESS_STATE.ACTIVA;
        const matchesRechazada = appliedEstados.includes('rechazada') && businessState === BUSINESS_STATE.RECHAZADA;
        const matchesFinalizada = appliedEstados.includes('finalizada') && businessState === BUSINESS_STATE.FINALIZADA;
        const hasAsignado = appliedEstados.includes('asignado') && training.createdBy;
        const hasSinAsignar = appliedEstados.includes('sin_asignar') && !training.createdBy;
        return matchesBorrador || matchesPendiente || matchesActiva || matchesRechazada || matchesFinalizada || hasAsignado || hasSinAsignar;
      });
    }
    
    // Filtro por mostrar inactivas aplicado (ahora filtra borradores, pendientes y finalizadas)
    if (!appliedMostrarInactivas) {
      // Si no mostrar inactivas, solo mostrar activas
      filtered = filtered.filter(training => resolveBusinessState(training) === BUSINESS_STATE.ACTIVA);
    }
    
    return filtered;
  };

  return (
    <>
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h1 className="admin-title">Gestión de cursos</h1>
          <hr className="admin-divider" />

          <section className="admin-card">
            <div className="admin-filters" style={{ alignItems: 'flex-start' }}>
            {/* Búsqueda y Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 'fit-content' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Buscar curso"
                  className="admin-search-input"
                  style={{ flex: 1, minWidth: 0 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <button 
                  className="admin-search-btn cursor-pointer" 
                  title="Buscar"
                  onClick={handleSearch}
                >
                  🔎
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="admin-btn admin-btn-primary admin-btn-sm cursor-pointer" 
                  style={{ flex: 1 }}
                  onClick={applyFilters}
                >
                  Aplicar Filtros
                </button>
                <button 
                  className="admin-btn admin-btn-primary admin-btn-sm cursor-pointer" 
                  style={{ flex: 1 }}
                  onClick={clearFilters}
                >
                  Limpiar Filtros
                </button>
              </div>

            </div>

            {/* Filtros */}
            <div className="admin-filter-group admin-dropdown" ref={nivelMenuRef}>
              <button onClick={() => setNivelMenu(!nivelMenu)} className="admin-dropdown-btn cursor-pointer">
                Nivel
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {nivelMenu && (
                <div className="admin-dropdown-menu">
                  {niveles.map((n) => (
                    <label 
                      key={n.value} 
                      className="admin-dropdown-item"
                      onClick={() => handleNivelChange(n.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          background: '#fff',
                          border: '1px solid #bdbdbd'
                        }}
                      >
                        {nivelesSeleccionados.includes(n.value) && (
                          <span style={{ fontSize: 12, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </span>
                      {n.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-filter-group admin-dropdown" ref={estadoMenuRef}>
              <button onClick={() => setEstadoMenu(!estadoMenu)} className="admin-dropdown-btn cursor-pointer">
                Estado
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {estadoMenu && (
                <div className="admin-dropdown-menu">
                  {estadosOpciones.map((est) => (
                    <label 
                      key={est.value} 
                      className="admin-dropdown-item"
                      onClick={() => handleEstadoChange(est.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          background: '#fff',
                          border: '1px solid #bdbdbd'
                        }}
                      >
                        {estadosSeleccionados.includes(est.value) && (
                          <span style={{ fontSize: 12, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </span>
                      {est.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones - Botones a la derecha */}
            <div className="admin-filter-group" style={{ marginLeft: 'auto' }}>
              <div className="admin-actions">
                <button onClick={() => setOpenCreateTraining(true)} className="admin-btn admin-btn-success cursor-pointer" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>
                  Crear Capacitación
                </button>
              </div>
            </div>
          </div>

          <section style={{ marginTop: '1.5rem' }}>
            <div className="admin-table-wrapper">
            {loading && <LoadingOverlay label="Cargando capacitaciones..." />}
            <table className="admin-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Capacitación</th>
                  <th style={{ width: '15%' }}>Niveles</th>
                  <th style={{ width: '20%' }}>Profesor Asignado</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Estado</th>
                  <th style={{ width: '15%' }}>Creado</th>
                  <th style={{ width: '15%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(!trainings || trainings.length === 0) && !loading ? (
                  <tr>
                    <td className="admin-empty" colSpan={6}>
                      No hay capacitaciones para mostrar.
                    </td>
                  </tr>
                ) : getPaginatedTrainings().items.length === 0 && !loading ? (
                  <tr>
                    <td className="admin-empty" colSpan={6}>
                      {appliedMostrarInactivas 
                        ? 'No se encontraron capacitaciones con los filtros aplicados.' 
                        : 'No hay capacitaciones aprobadas. Active "Mostrar todas las capacitaciones" para ver borradores y pendientes.'}
                    </td>
                  </tr>
                ) : (
                  getPaginatedTrainings().items.map((t) => {
                    // Niveles info
                    const nivelesCount = t.levels?.length || t.totalLevels || 0;
                    const nivelesLabel = nivelesCount > 0 ? `${nivelesCount} nivel${nivelesCount > 1 ? 'es' : ''}` : 'Sin niveles';

                    // Profesor info - usar trainersMap primero, luego fallback a createdBy
                    const trainerFromMap = trainersMap[t._id];
                   
                    const profesor = trainerFromMap 
                      ? `${trainerFromMap.firstName || ''} ${trainerFromMap.lastName || ''}`.trim()
                      : "No hay profesor asignado";
                    const estado = trainerFromMap || t.createdBy ? 'Asignado' : 'Sin asignar';
                    
                    const estadoAprobacion = resolveBusinessState(t);
                    const estadoColor = BUSINESS_STATE_COLORS[estadoAprobacion] || '#6b7280';
                    
                    return (
                      <tr key={t._id}>
                        <td data-label="Capacitación">
                          <div style={{ fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: t.title || '' }} />
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: t.subtitle || '' }} />
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Progreso: {t.progressPercentage || 0}%
                          </div>
                        </td>
                        <td data-label="Niveles">{nivelesLabel}</td>
                        <td data-label="Profesor">{profesor || 'Sin asignar'}</td>
                        <td data-label="Estado" style={{ textAlign: 'center' }}>
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium text-center"
                            style={{ 
                              display: 'inline-block',
                              width: '120px',
                              textAlign: 'center',
                              backgroundColor: estadoColor
                            }}
                          >
                            {estadoAprobacion}
                          </span>
                        </td>
                        <td data-label="Creado">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-AR') : '-'}
                        </td>
                        <td data-label="Acciones">
                          <div className="admin-actions">
                            {(() => {
                              const editTitle = EDIT_STATE_TOOLTIPS[estadoAprobacion] || 'Editar capacitación';

                              return (
                                <button 
                                  className="admin-action-btn" 
                                  title={editTitle}
                                  onClick={() => handleEditTraining(t._id)}
                                  disabled={loading}
                                >
                                  📝
                                </button>
                              );
                            })()}
                            <button 
                              className="admin-action-btn"
                              title="Eliminar capacitación"
                              onClick={() => handleDeleteTraining(t._id, t.title)}
                              disabled={loading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04-.39.08-.74.28-1.01.55-.18.18-.33.4-.43.64-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78.1.23.25.45.43.64.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM19 19H5V5h14v14z"/>
                                <circle cx="17" cy="17" r="5" fill="black"/>
                                <path d="M14.5 14.5l5 5M19.5 14.5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {getPaginatedTrainings().totalPages > 1 && (
            <div className="admin-pagination">
              <button 
                className="admin-pagination-text cursor-pointer"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Anterior
              </button>
              
              {(() => {
                const totalPages = getPaginatedTrainings().totalPages;
                const pages = [];
                
                if (totalPages <= 5) {
                  // Mostrar todas las páginas si son 5 o menos
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`admin-page-btn ${currentPage === i ? 'active' : ''} cursor-pointer`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  // Lógica para muchas páginas: mostrar 1 ... actual ... último
                  pages.push(
                    <button
                      key={1}
                      className={`admin-page-btn ${currentPage === 1 ? 'active' : ''} cursor-pointer`}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                  );
                  
                  if (currentPage > 3) {
                    pages.push(<span key="dots1" className="admin-pagination-text">...</span>);
                  }
                  
                  // Páginas cercanas a la actual
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  
                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`admin-page-btn ${currentPage === i ? 'active' : ''} cursor-pointer`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  if (currentPage < totalPages - 2) {
                    pages.push(<span key="dots2" className="admin-pagination-text">...</span>);
                  }
                  
                  pages.push(
                    <button
                      key={totalPages}
                      className={`admin-page-btn ${currentPage === totalPages ? 'active' : ''} cursor-pointer`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
              
              <button 
                className="admin-pagination-text cursor-pointer"
                onClick={() => setCurrentPage(prev => Math.min(getPaginatedTrainings().totalPages, prev + 1))}
                disabled={currentPage === getPaginatedTrainings().totalPages}
                style={{ opacity: currentPage === getPaginatedTrainings().totalPages ? 0.5 : 1, cursor: currentPage === getPaginatedTrainings().totalPages ? 'not-allowed' : 'pointer' }}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </section>

        <Outlet />
        </div>
      </main>
      <CreateTrainingModal
        open={openCreateTraining}
        onClose={handleCloseModal}
        onSave={handleCreateTraining}
        editingTraining={editingTraining}
      />

      {/* Modales de éxito, error y advertencia */}
      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />
      )}

      {showErrorModal && (
        <ErrorListModal
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          errors={errorMessages}
          title={errorModalTitle}
          messageText={errorModalMessageText}
        />
      )}

      {showWarningModal && (
        <WarningModal
          show={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          message={warningMessage}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmData && (
        <ConfirmActionModal
          open={true}
          title="Confirmar eliminación"
          message={`¿Estás seguro de que deseas eliminar la capacitación "${deleteConfirmData.trainingTitle}"? Esta acción eliminará también todos los niveles asociados y no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={confirmDeleteTraining}
          onClose={() => setDeleteConfirmData(null)}
        />
      )}
    </>
  );
}

