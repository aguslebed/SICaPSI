import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import NavBar from '../../Components/Student/NavBar';
import OpenCohortModal from '../../Components/Modals/OpenCohortModal';
import CreateTrainingModal from '../../Components/Modals/CreateTrainingModal';
import { useState, useEffect, useRef } from 'react';
import { getAllActiveTrainings, getAllTrainings, createTraining, updateTraining, addLevelsToTraining, updateLevelsInTraining, deleteTraining, getTrainingById, enrollStudentsToTraining } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './AdminPanel.css';

export default function GestionCapacitacion() {
  const [openCohorte, setOpenCohorte] = useState(false);
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
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
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
        const hasActivo = appliedEstados.includes('activo') && training.isActive;
        const hasInactivo = appliedEstados.includes('inactivo') && !training.isActive;
        const hasAsignado = appliedEstados.includes('asignado') && training.createdBy;
        const hasSinAsignar = appliedEstados.includes('sin_asignar') && !training.createdBy;
        return hasActivo || hasInactivo || hasAsignado || hasSinAsignar;
      });
    }
    
    // Filtro por mostrar inactivas aplicado
    if (!appliedMostrarInactivas) {
      filtered = filtered.filter(training => training.isActive);
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
                <button onClick={() => setOpenCohorte(true)} className="admin-btn admin-btn-primary cursor-pointer" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>
                  Abrir Cohorte
                </button>
                <button onClick={() => setOpenCreateTraining(true)} className="admin-btn admin-btn-success cursor-pointer" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>
                  Crear Capacitación
                </button>
              </div>
            </div>
          </div>

          <section style={{ marginTop: '1.5rem' }}>
            <div className="admin-table-wrapper">
            {loading && <LoadingOverlay label="Cargando capacitaciones..." />}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Capacitación</th>
                  <th>Niveles</th>
                  <th>Profesor Asignado</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
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
                    
                    // Estado visual
                    const estadoActivo = t.isActive ? 'Activa' : 'Inactiva';
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
                        <td data-label="Estado">
                          <span style={{ 
                            color: estadoColor, 
                            fontWeight: '600',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            backgroundColor: t.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            width: '80px',
                            textAlign: 'center',
                            display: 'inline-block',
                            border: `1px solid ${t.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {estadoActivo}
                          </span>
                        </td>
                        <td data-label="Creado">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-AR') : '-'}
                        </td>
                        <td data-label="Acciones">
                          <div className="admin-actions" style={{ gap: '0.5rem', justifyContent: 'center' }}>
                            <button 
                              className="cursor-pointer" 
                              style={{ 
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.2)',
                                minWidth: '70px',
                                justifyContent: 'center',
                                height: '32px'
                              }}
                              onClick={() => handleEditTraining(t._id)}
                              disabled={loading}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 3px 6px rgba(59, 130, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.2)';
                              }}
                            >
                              ✏️ Editar
                            </button>
                            <button 
                              className="cursor-pointer"
                              style={{ 
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)',
                                minWidth: '80px',
                                justifyContent: 'center',
                                height: '32px'
                              }}
                              onClick={() => handleDeleteTraining(t._id, t.title)}
                              disabled={loading}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 3px 6px rgba(239, 68, 68, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 1px 3px rgba(239, 68, 68, 0.2)';
                              }}
                            >
                              🗑️ Eliminar
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
      <OpenCohortModal
        open={openCohorte}
        onClose={() => setOpenCohorte(false)}
        cursos={trainings}
        profesores={sampleProfesores}
        onSave={(payload) => console.log('Guardar cohorte', payload)}
      />
      <CreateTrainingModal
        open={openCreateTraining}
        onClose={handleCloseModal}
        onSave={handleCreateTraining}
        editingTraining={editingTraining}
      />
    </>
  );
}

