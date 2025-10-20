import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import NavBar from '../../Components/Student/NavBar';
import CreateTrainingModal from '../../Components/Modals/CreateTrainingModal';
import { useState, useEffect, useRef } from 'react';
import { getAllActiveTrainings, getAllTrainings, createTraining, updateTraining, addLevelsToTraining, updateLevelsInTraining, deleteTraining, getTrainingById, enrollStudentsToTraining } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './AdminPanel.css';

export default function GestionCapacitacion() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // Referencias para los dropdowns
  const nivelMenuRef = useRef(null);
  const estadoMenuRef = useRef(null);

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
    { label: 'Habilitado', value: 'activo' },
    { label: 'Deshabilitado', value: 'inactivo' },
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
        if (mounted) setTrainings(items);
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
      setTrainings(items);
    } catch (err) {
      console.error('Error fetching trainings', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la creación de capacitaciones
  const handleCreateTraining = async (trainingData, levels, additionalData = {}) => {
    setLoading(true);
    try {
      const { selectedStudents = [], isEditing = false, trainingId } = additionalData;
      

      
      let finalTrainingId = trainingId;
      
      if (isEditing) {
        // Actualizar capacitación existente

        const updatedTraining = await updateTraining(trainingId, trainingData);

        finalTrainingId = updatedTraining._id;
        
        // Actualizar niveles si existen
        if (levels && levels.length > 0) {

          
          // Preparar niveles con trainingId y descripción por defecto
          const levelsWithTrainingId = levels.map(level => ({
            ...level,
            trainingId: finalTrainingId,
            description: level.description || `Descripción del ${level.title}` // Agregar descripción por defecto
          }));
          
          await updateLevelsInTraining(finalTrainingId, levelsWithTrainingId);

        }
      } else {
        // 1. Crear la capacitación primero
        const newTraining = await createTraining(trainingData);

        finalTrainingId = newTraining._id;
        
        // 2. Si hay niveles, crearlos y asociarlos
        if (levels && levels.length > 0) {

          
          // Preparar niveles con trainingId y descripción por defecto
          const levelsWithTrainingId = levels.map(level => ({
            ...level,
            trainingId: finalTrainingId,
            description: level.description || `Descripción del ${level.title}` // Agregar descripción por defecto
          }));
          
          await addLevelsToTraining(finalTrainingId, levelsWithTrainingId);

        }
      }
      
      // 3. Si hay guardias seleccionados, inscribirlos
      if (selectedStudents && selectedStudents.length > 0) {

        try {
          await enrollStudentsToTraining(finalTrainingId, selectedStudents);

        } catch (enrollError) {
          console.warn('Error inscribiendo guardias:', enrollError);
          // No fallar toda la operación si falla la inscripción
          alert(`Capacitación creada, pero hubo un problema inscribiendo guardias: ${enrollError.message}`);
        }
      }
      
      // 4. Refrescar la lista
      await refreshTrainings();
      
      const successMessage = isEditing 
        ? 'Capacitación actualizada exitosamente'
        : `Capacitación creada exitosamente${selectedStudents.length > 0 ? ` con ${selectedStudents.length} guardia(s) inscrito(s)` : ''}`;
      
      alert(successMessage);
      handleCloseModal(); // Cerrar modal después de operación exitosa
    } catch (error) {
      console.error('Error procesando capacitación:', error);
      const { isEditing = false } = additionalData;
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} capacitación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la eliminación de capacitaciones
  const handleDeleteTraining = async (trainingId, trainingTitle) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la capacitación "${trainingTitle}"?\n\n` +
      `Esta acción eliminará también todos los niveles asociados y no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteTraining(trainingId);
      await refreshTrainings();
      alert('Capacitación eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando capacitación:', error);
      alert(`Error al eliminar capacitación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la edición de capacitaciones
  const handleEditTraining = async (trainingId) => {
    setLoading(true);
    try {
      const trainingData = await getTrainingById(trainingId);
      setEditingTraining(trainingData);
      setOpenCreateTraining(true);
    } catch (error) {
      console.error('Error obteniendo capacitación:', error);
      alert(`Error al cargar capacitación: ${error.message}`);
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
  };

  // Función para filtrar capacitaciones (usa filtros aplicados)
  const getFilteredTrainings = () => {
    if (!trainings) return [];
    
    let filtered = trainings;

    // Helper: una capacitación se considera actualmente activa si está habilitada
    // y la fecha actual está entre startDate y endDate (ambas deben existir)
    const isTrainingActiveNow = (training) => {
      try {
        if (!training || !training.isActive) return false;
        const s = training.startDate;
        const e = training.endDate;
        if (!s || !e) return false;
        const now = new Date();
        const start = new Date(s);
        const end = new Date(e);
        return now >= start && now <= end;
      } catch (err) {
        return false;
      }
    };
    
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
        const isNowActive = isTrainingActiveNow(training);
        const hasActivo = appliedEstados.includes('activo') && isNowActive;
        const hasInactivo = appliedEstados.includes('inactivo') && !isNowActive;
        const hasAsignado = appliedEstados.includes('asignado') && training.createdBy;
        const hasSinAsignar = appliedEstados.includes('sin_asignar') && !training.createdBy;
        return hasActivo || hasInactivo || hasAsignado || hasSinAsignar;
      });
    }
    
    // Filtro por mostrar inactivas aplicado
    if (!appliedMostrarInactivas) {
      filtered = filtered.filter(training => isTrainingActiveNow(training));
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
                ) : getFilteredTrainings().length === 0 && !loading ? (
                  <tr>
                    <td className="admin-empty" colSpan={6}>
                      {mostrarInactivas ? 'No hay capacitaciones para mostrar.' : 'No hay capacitaciones activas. Active "Mostrar capacitaciones inactivas" para ver todas.'}
                    </td>
                  </tr>
                ) : (
                  getFilteredTrainings().map((t) => {
                    // Niveles info
                    const nivelesCount = t.levels?.length || t.totalLevels || 0;
                    const nivelesLabel = nivelesCount > 0 ? `${nivelesCount} nivel${nivelesCount > 1 ? 'es' : ''}` : 'Sin niveles';
                    
                    // Profesor info
                    const profesor = t.createdBy ? `${t.createdBy.firstName || ''} ${t.createdBy.lastName || ''}`.trim() : '-';
                    const estado = t.createdBy ? 'Asignado' : 'Sin asignar';
                    
                    // Estado visual (mostrar Habilitado/Deshabilitado)
                    const estadoActivo = t.isActive ? 'Habilitado' : 'Deshabilitado';
                    const estadoColor = t.isActive ? 'var(--success-color)' : 'var(--danger-color)';
                    
                    return (
                      <tr key={t._id}>
                        <td data-label="Capacitación">
                          <div style={{ fontWeight: 600 }}>{t.title}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{t.subtitle}</div>
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
                              backgroundColor: t.isActive ? '#10b981' : '#ef4444'
                            }}
                          >
                            {estadoActivo}
                          </span>
                        </td>
                        <td data-label="Creado">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-AR') : '-'}
                        </td>
                        <td data-label="Acciones">
                          <div className="admin-actions">
                            <button 
                              className="admin-action-btn" 
                              title="Editar capacitación"
                              onClick={() => handleEditTraining(t._id)}
                              disabled={loading}
                            >
                              📝
                            </button>
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
    </>
  );
}

