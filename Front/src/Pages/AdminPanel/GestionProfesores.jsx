import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import NavBar from "../../Components/Student/NavBar";
import { listTeachers, setTeacherStatus, getAllTrainings, unenrollTrainerFromTraining, enrollTrainerToTraining, getTrainerByTrainingId } from "../../API/Request";
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";
import ConfirmActionModal from "../../Components/Modals/ConfirmActionModal";
import ErrorModal from "../../Components/Modals/ErrorModal";
import SucessModal from "../../Components/Modals/SucessModal";
import ModalWrapper from "../../Components/Modals/ModalWrapper";
import './AdminPanel.css';

// Badge de estado
function Chip({ estado }) {
  const ok = estado === "disponible";
  return (
    <span className={`admin-badge ${ok ? "admin-badge-success" : "admin-badge-danger"}`}>
      {ok ? "Disponible" : "Deshabilitado"}
    </span>
  );
}

const INITIAL_EDIT_MODAL_STATE = {
  open: false,
  teacher: null,
  selectedTrainingId: '',
  occupant: null,
  isSubmitting: false
};


export default function GestionProfesores() {

  // filtros
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filtrarDisponible, setFD] = useState(true);
  const [filtrarDeshabilitado, setFDes] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ filtrarDisponible: true, filtrarDeshabilitado: true, desde: "", hasta: "" });

  // Estados para el dropdown de fecha
  const [fechaMenu, setFechaMenu] = useState(false);
  const [fechaDesdeVisible, setFechaDesdeVisible] = useState(false);
  const [fechaHastaVisible, setFechaHastaVisible] = useState(false);
  
  // Estados para el dropdown de estado
  const [estadoMenu, setEstadoMenu] = useState(false);

  // Referencias para los dropdowns
  const estadoMenuRef = useRef(null);
  const fechaMenuRef = useRef(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (estadoMenuRef.current && !estadoMenuRef.current.contains(event.target)) {
        setEstadoMenu(false);
      }
      if (fechaMenuRef.current && !fechaMenuRef.current.contains(event.target)) {
        setFechaMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // datos
  const [rowsRaw, setRowsRaw] = useState([]);

  // loading
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState(null);

  // paginado
  const [page, setPage] = useState(1);
  const size = 10;
  // confirm / success / error modals for status changes
  const [confirmAction, setConfirmAction] = useState({ open: false, teacherId: null, toStatus: null, label: '', name: '' });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [trainingOptions, setTrainingOptions] = useState([]);
  const [trainingsCatalogLoading, setTrainingsCatalogLoading] = useState(false);
  const [trainingsCatalogError, setTrainingsCatalogError] = useState(null);
  const trainerCacheRef = useRef({});
  const [editModal, setEditModal] = useState(INITIAL_EDIT_MODAL_STATE);
  const [editModalError, setEditModalError] = useState(null);

  const mapTeacherRow = useCallback((rawTeacher) => {
    const trainings = Array.isArray(rawTeacher?.assignedTraining)
      ? rawTeacher.assignedTraining.map((training) => ({
          id: training?._id || training?.id || '',
          title: training?.title || training?.subtitle || 'Capacitación sin título'
        }))
      : [];

    return {
      id: rawTeacher?._id || rawTeacher?.id,
      nombre: rawTeacher?.firstName || '',
      apellido: rawTeacher?.lastName || '',
      email: rawTeacher?.email || '',
      dni: rawTeacher?.documentNumber || '',
      estado: rawTeacher?.status === 'available' ? 'disponible' : 'deshabilitado',
      creado: rawTeacher?.createdAt,
      curso: trainings.length > 0 ? trainings.map((training) => training.title) : ['–'],
      trainings,
      fullName: [rawTeacher?.firstName, rawTeacher?.lastName].filter(Boolean).join(' ').trim()
    };
  }, []);

  const refreshTeachers = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await listTeachers();
      const items = Array.isArray(data) ? data : (data?.items || []);
      const mapped = items.map(mapTeacherRow);
      setRowsRaw(mapped);
    } catch (error) {
      console.error('Error cargando profesores:', error);
      setRowsRaw([]);
      setListError(error?.message || 'No se pudieron cargar los profesores.');
    } finally {
      setLoading(false);
    }
  }, [mapTeacherRow]);

  useEffect(() => {
    refreshTeachers();
  }, [refreshTeachers]);

  const loadTrainingsCatalog = useCallback(async () => {
    setTrainingsCatalogLoading(true);
    setTrainingsCatalogError(null);
    try {
      const data = await getAllTrainings();
      const items = Array.isArray(data) ? data : (data?.items || []);
      const options = items
        .map((training) => {
          const id = training?._id || training?.id || '';
          if (!id) return null;
          const title = training?.title || training?.subtitle || 'Capacitación sin título';
          const statusLabel = training?.pendingApproval
            ? 'Pendiente'
            : training?.isActive
              ? 'Activa'
              : 'Borrador';
          return {
            id,
            title,
            status: statusLabel
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
      setTrainingOptions(options);
    } catch (error) {
      console.error('Error cargando capacitaciones:', error);
      setTrainingOptions([]);
      setTrainingsCatalogError(error?.message || 'No se pudieron cargar las capacitaciones.');
    } finally {
      setTrainingsCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrainingsCatalog();
  }, [loadTrainingsCatalog]);

  const fetchTrainerForTraining = useCallback(async (trainingId) => {
    if (!trainingId) return null;
    if (Object.prototype.hasOwnProperty.call(trainerCacheRef.current, trainingId)) {
      return trainerCacheRef.current[trainingId];
    }
    try {
      const response = await getTrainerByTrainingId(trainingId);
      const trainer = response?.trainer ?? response ?? null;
      trainerCacheRef.current = { ...trainerCacheRef.current, [trainingId]: trainer };
      return trainer;
    } catch (error) {
      console.warn('No se pudo obtener el profesor asignado para la capacitación', trainingId, error);
      trainerCacheRef.current = { ...trainerCacheRef.current, [trainingId]: null };
      return null;
    }
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal(INITIAL_EDIT_MODAL_STATE);
    setEditModalError(null);
  }, []);

  const handleOpenEditModal = useCallback((teacherRow) => {
    if (!teacherRow) return;
    if (!trainingOptions.length && !trainingsCatalogLoading) {
      loadTrainingsCatalog();
    }
    const primaryTrainingId = teacherRow.trainings && teacherRow.trainings.length > 0
      ? teacherRow.trainings[0].id || ''
      : '';
    setEditModal({
      open: true,
      teacher: teacherRow,
      selectedTrainingId: primaryTrainingId,
      occupant: null,
      isSubmitting: false
    });
    setEditModalError(null);
  }, [loadTrainingsCatalog, trainingOptions.length, trainingsCatalogLoading]);

  const handleTrainingSelectionChange = useCallback((event) => {
    const { value } = event.target;
    setEditModal((prev) => ({
      ...prev,
      selectedTrainingId: value,
      occupant: value ? undefined : null
    }));
    setEditModalError(null);
  }, []);

  useEffect(() => {
    if (!editModal.open) {
      return;
    }
    const trainingId = editModal.selectedTrainingId;
    if (!trainingId) {
      setEditModal((prev) => ({ ...prev, occupant: null }));
      return;
    }

    let cancelled = false;
    setEditModal((prev) => ({ ...prev, occupant: undefined }));
    fetchTrainerForTraining(trainingId)
      .then((trainer) => {
        if (!cancelled) {
          setEditModal((prev) => ({ ...prev, occupant: trainer || null }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEditModal((prev) => ({ ...prev, occupant: null }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editModal.open, editModal.selectedTrainingId, fetchTrainerForTraining]);

  const summaryItems = useMemo(() => {
    if (!editModal.open || !editModal.teacher) {
      return [];
    }

    const teacherTrainings = Array.isArray(editModal.teacher.trainings)
      ? editModal.teacher.trainings
      : [];
    const teacherName = editModal.teacher.fullName || editModal.teacher.email || 'el profesor';
    const selectedId = editModal.selectedTrainingId;
    const selectedTraining = trainingOptions.find((option) => option.id === selectedId);
    const items = [];
    const pushItem = (message, intent = 'info') => {
      items.push({ message, intent });
    };

    if (!selectedId) {
      if (teacherTrainings.length === 0) {
        pushItem(`El profesor ${teacherName} continuará sin capacitaciones asignadas.`);
      } else {
        teacherTrainings.forEach((training) => {
          pushItem(`Se quitará la capacitación "${training.title}" del profesor ${teacherName}.`, 'remove');
        });
      }
      return items;
    }

    const selectedTitle = selectedTraining?.title || 'Capacitación seleccionada';
    pushItem(`Se asignará la capacitación "${selectedTitle}" al profesor ${teacherName}.`, 'assign');

    teacherTrainings.forEach((training) => {
      if (training.id && training.id !== selectedId) {
        pushItem(`Se quitará la capacitación "${training.title}" del profesor ${teacherName}.`, 'remove');
      }
    });

    const occupant = editModal.occupant;
    const occupantId = occupant && (occupant._id || occupant.id);
    if (occupantId && occupantId !== editModal.teacher.id) {
      const occupantName = [occupant.firstName, occupant.lastName].filter(Boolean).join(' ').trim() || occupant.email || 'otro profesor';
      pushItem(`La capacitación "${selectedTitle}" se quitará del profesor ${occupantName}.`, 'remove');
    }

    return items;
  }, [editModal, trainingOptions]);

  const hasTrainingChanges = useMemo(() => {
    if (!editModal.open || !editModal.teacher) return false;
    const currentTrainingIds = Array.isArray(editModal.teacher.trainings)
      ? editModal.teacher.trainings.map((training) => training.id).filter(Boolean)
      : [];
    const selectedId = editModal.selectedTrainingId;
    if (!selectedId) {
      return currentTrainingIds.length > 0;
    }
    if (currentTrainingIds.length === 0) {
      return true;
    }
    return !(currentTrainingIds.length === 1 && currentTrainingIds[0] === selectedId);
  }, [editModal]);

  const handleEditModalSubmit = useCallback(async () => {
    if (!editModal.teacher) {
      return;
    }

    if (!hasTrainingChanges) {
      closeEditModal();
      return;
    }

    setEditModalError(null);
    setEditModal((prev) => ({ ...prev, isSubmitting: true }));

    const teacherId = editModal.teacher.id;
    const currentTrainingIds = Array.isArray(editModal.teacher.trainings)
      ? editModal.teacher.trainings.map((training) => training.id).filter(Boolean)
      : [];
    const selectedId = editModal.selectedTrainingId;

    try {
      if (selectedId) {
        let occupant = editModal.occupant;
        if (occupant === undefined) {
          occupant = await fetchTrainerForTraining(selectedId);
        }
        const occupantId = occupant && (occupant._id || occupant.id);
        if (occupantId && occupantId !== teacherId) {
          try {
            await unenrollTrainerFromTraining(selectedId, occupantId);
            trainerCacheRef.current = { ...trainerCacheRef.current, [selectedId]: null };
          } catch (error) {
            console.warn('No se pudo quitar al profesor anterior de la capacitación seleccionada:', error);
          }
        }
      }

      for (const trainingId of currentTrainingIds) {
        if (!selectedId || trainingId !== selectedId) {
          await unenrollTrainerFromTraining(trainingId, teacherId);
        }
      }

      if (selectedId && !currentTrainingIds.includes(selectedId)) {
        await enrollTrainerToTraining(selectedId, teacherId);
        trainerCacheRef.current = {
          ...trainerCacheRef.current,
          [selectedId]: {
            _id: teacherId,
            firstName: editModal.teacher.nombre,
            lastName: editModal.teacher.apellido,
            email: editModal.teacher.email
          }
        };
      }

      const teacherName = editModal.teacher.fullName || editModal.teacher.email || 'el profesor';
      setSuccessMessage(`Se actualizaron las capacitaciones de ${teacherName}.`);
      closeEditModal();
      await refreshTeachers();
    } catch (error) {
      console.error('Error actualizando capacitación del profesor:', error);
      setEditModalError(error?.message || 'No se pudo actualizar la capacitación del profesor.');
      setEditModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [closeEditModal, editModal, fetchTrainerForTraining, hasTrainingChanges, refreshTeachers]);

  const teacherTrainingsForModal = editModal.teacher && Array.isArray(editModal.teacher.trainings)
    ? editModal.teacher.trainings
    : [];
  const selectedTrainingOption = editModal.selectedTrainingId
    ? trainingOptions.find((option) => option.id === editModal.selectedTrainingId) || null
    : null;
  const occupantData = editModal.occupant;
  const occupantId = occupantData && (occupantData._id || occupantData.id);
  const occupantName = occupantData
    ? [occupantData.firstName, occupantData.lastName].filter(Boolean).join(' ').trim() || occupantData.email || ''
    : '';
  const occupantIsSameTeacher = Boolean(occupantId && editModal.teacher && occupantId === editModal.teacher.id);
  const summaryIntentStyles = useMemo(() => ({
    assign: {
      background: 'rgba(37, 99, 235, 0.12)',
      borderColor: 'rgba(37, 99, 235, 0.3)',
      color: '#1d4ed8'
    },
    remove: {
      background: 'rgba(220, 38, 38, 0.12)',
      borderColor: 'rgba(220, 38, 38, 0.3)',
      color: '#b91c1c'
    },
    info: {
      background: 'rgba(30, 64, 175, 0.08)',
      borderColor: 'rgba(148, 163, 184, 0.4)',
      color: '#1f2937'
    }
  }), []);

  // aplicar filtros (en memoria)
  const stripHtml = (value) =>
    typeof value === 'string' ? value.replace(/<[^>]+>/g, '').trim() : value ?? '';

  const renderHtml = (value) => ({ __html: value || '' });

  const filtrados = useMemo(() => {
    let rows = [...rowsRaw];

    // filtro de texto solo cuando se aplica
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      rows = rows.filter((r) =>
        [r.nombre, r.apellido, r.email, r.dni, ...(r.curso || []).map(stripHtml)]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // filtros de estado y fechas solo cuando se aplican
    if (!appliedFilters.filtrarDisponible || !appliedFilters.filtrarDeshabilitado) {
      rows = rows.filter((r) => {
        if (r.estado === "disponible" && appliedFilters.filtrarDisponible) return true;
        if (r.estado === "deshabilitado" && appliedFilters.filtrarDeshabilitado) return true;
        return false;
      });
    }
    if (appliedFilters.desde || appliedFilters.hasta) {
      rows = rows.filter((r) => {
        const d = r.creado ? new Date(r.creado) : null;
        if (!d || isNaN(d)) return true;
        if (appliedFilters.desde && d < new Date(appliedFilters.desde)) return false;
        if (appliedFilters.hasta && d > new Date(appliedFilters.hasta)) return false;
        return true;
      });
    }
    return rows;
  }, [rowsRaw, appliedSearch, appliedFilters]);

  const total = filtrados.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const pageRows = useMemo(() => {
    const start = (page - 1) * size;
    return filtrados.slice(start, start + size);
  }, [filtrados, page]);

  // Resetear página al aplicar filtros
  useEffect(() => {
    setPage(1);
  }, [appliedSearch, appliedFilters]);

  function limpiar() {
    setSearch("");
    setFD(true);
    setFDes(true);
    setDesde("");
    setHasta("");
    setAppliedSearch("");
    setAppliedFilters({ filtrarDisponible: true, filtrarDeshabilitado: true, desde: "", hasta: "" });
  }

  // Función para manejar cambios en los checkboxes de estado
  const handleEstadoChange = (estadoValue) => {
    if (estadoValue === 'disponible') {
      setFD(!filtrarDisponible);
    } else if (estadoValue === 'deshabilitado') {
      setFDes(!filtrarDeshabilitado);
    }
  };

  const estados = [
    { label: 'Disponible', value: 'disponible' },
    { label: 'Deshabilitado', value: 'deshabilitado' },
  ];

  return (
    <>
      {loading && <LoadingOverlay label="Cargando profesores..." />}
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h1 className="admin-title">Gestión de Profesores</h1>
          <hr className="admin-divider" />

          {/* Sección principal con filtros y tabla */}
          <section className="admin-card">
            {/* Filtros */}
            <div className="admin-filters" style={{ alignItems: 'flex-start' }}>
            {/* Búsqueda y Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 'fit-content' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') setAppliedSearch(search); }}
                  placeholder="Buscar profesor"
                  className="admin-search-input"
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button className="admin-search-btn" onClick={() => setAppliedSearch(search)} title="Buscar">
                  🔎
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setAppliedFilters({ filtrarDisponible, filtrarDeshabilitado, desde, hasta })} 
                  className="admin-btn admin-btn-primary admin-btn-sm" 
                  style={{ flex: 1 }}
                >
                  Aplicar Filtros
                </button>
                <button onClick={limpiar} className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }}>
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Filtro Estado */}
            <div className="admin-filter-group admin-dropdown" ref={estadoMenuRef}>
              <button onClick={() => setEstadoMenu(!estadoMenu)} className="admin-dropdown-btn">
                Estado
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {estadoMenu && (
                <div className="admin-dropdown-menu">
                  {estados.map((est) => (
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
                        {((est.value === 'disponible' && filtrarDisponible) || (est.value === 'deshabilitado' && filtrarDeshabilitado)) && (
                          <span style={{ fontSize: 12, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </span>
                      {est.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Filtro Fecha */}
            <div className="admin-filter-group admin-dropdown" ref={fechaMenuRef}>
              <button onClick={() => setFechaMenu(!fechaMenu)} className="admin-dropdown-btn">
                Fecha
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {fechaMenu && (
                <div className="admin-dropdown-menu" style={{ minWidth: '200px', padding: '0.75rem' }}>
                  <button
                    onClick={() => setFechaDesdeVisible(!fechaDesdeVisible)}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.8125rem' }}
                  >
                    {desde ? `Desde: ${new Date(desde).toLocaleDateString()}` : "Desde"}
                  </button>
                  {fechaDesdeVisible && (
                    <input
                      type="date"
                      value={desde}
                      onChange={(e) => {
                        setDesde(e.target.value);
                        setFechaDesdeVisible(false);
                      }}
                      className="admin-filter-input"
                      style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                  )}

                  <button
                    onClick={() => setFechaHastaVisible(!fechaHastaVisible)}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                  >
                    {hasta ? `Hasta: ${new Date(hasta).toLocaleDateString()}` : "Hasta"}
                  </button>
                  {fechaHastaVisible && (
                    <input
                      type="date"
                      value={hasta}
                      onChange={(e) => {
                        setHasta(e.target.value);
                        setFechaHastaVisible(false);
                      }}
                      className="admin-filter-input"
                      style={{ width: '100%', marginTop: '0.5rem' }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabla */}
          <div className="admin-table-wrapper" style={{ marginTop: '1.5rem' }}>
            {listError && (
              <div className="admin-empty" style={{ color: 'var(--danger-color)', marginBottom: '0.75rem' }}>
                {listError}
              </div>
            )}
            <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>DNI</th>
                <th>Estado</th>
                <th>Fecha de creación</th>
                <th>Curso Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan="8" className="admin-empty">Sin resultados</td>
                </tr>
              )}
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td data-label="Nombre">{r.nombre}</td>
                  <td data-label="Apellido">{r.apellido}</td>
                  <td data-label="Email">{r.email}</td>
                  <td data-label="DNI">{r.dni}</td>
                  <td data-label="Estado"><Chip estado={r.estado} /></td>
                  <td data-label="Fecha de creación">{r.creado ? new Date(r.creado).toLocaleDateString() : "-"}</td>
                  <td data-label="Curso Asignado">
                    {r.curso?.map((c, i) => (
                      <div key={i} dangerouslySetInnerHTML={renderHtml(c)} />
                    ))}
                  </td>
                  <td data-label="Acciones">
                    <div className="admin-actions">
                      {/* Editar */}
                      <button
                        className="admin-action-btn"
                        title="Editar"
                        onClick={() => handleOpenEditModal(r)}
                      >
                        📝
                      </button>

                      <button
                        className="admin-action-btn"
                        title={r.estado === "disponible" ? "Bloquear" : "Habilitar"}
                        onClick={() => {
                          const toStatus = r.estado === "disponible" ? "disabled" : "available";
                          const label = r.estado === "disponible" ? "bloquear" : "habilitar";
                          setConfirmAction({ open: true, teacherId: r.id, toStatus, label, name: `${r.nombre} ${r.apellido}` });
                        }}
                      >
                        {r.estado === "disponible" ? "🚫" : "✅"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {total > size && (
            <div className="admin-pagination">
              <button
                className="admin-pagination-text"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  className={`admin-page-btn ${page === i + 1 ? "active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="admin-pagination-text"
                onClick={() => setPage(prev => Math.min(pages, prev + 1))}
                disabled={page === pages}
              >
                Siguiente
              </button>
            </div>
            )}

            {/* Modal para reasignar capacitaciones */}
            {editModal.open && (
              <ModalWrapper
                onClose={() => {
                  if (!editModal.isSubmitting) {
                    closeEditModal();
                  }
                }}
                showCloseButton={!editModal.isSubmitting}
                panelClassName="max-w-md"
              >
                <div className="flex flex-col gap-4 p-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Reasignar capacitación</h2>
                    <p className="mt-1 text-sm text-gray-600">{editModal.teacher?.fullName || editModal.teacher?.email}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="training-selection" className="text-sm font-medium text-gray-700">
                      Capacitación
                    </label>
                    <select
                      id="training-selection"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                      value={editModal.selectedTrainingId}
                      onChange={handleTrainingSelectionChange}
                      disabled={editModal.isSubmitting || trainingsCatalogLoading}
                    >
                      <option value="">Sin capacitación</option>
                      {trainingOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {stripHtml(option.title)}
                        </option>
                      ))}
                    </select>
                    {trainingsCatalogLoading && <p className="text-xs text-gray-500">Cargando...</p>}
                    {trainingsCatalogError && <p className="text-xs text-red-600">{trainingsCatalogError}</p>}
                  </div>

                  {summaryItems.length > 0 && (
                    <div className="rounded-md bg-blue-50 p-3">
                      <ul className="space-y-1 text-xs text-gray-700">
                        {summaryItems.map(({ message, intent }, index) => (
                          <li
                            key={index}
                            className={intent === 'remove' ? 'text-red-700' : intent === 'assign' ? 'text-blue-700' : ''}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {editModalError && (
                    <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      {editModalError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      className="flex-1 cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={closeEditModal}
                      disabled={editModal.isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                      onClick={handleEditModalSubmit}
                      disabled={!hasTrainingChanges || editModal.isSubmitting}
                    >
                      {editModal.isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </ModalWrapper>
            )}

            {/* Confirm / Success / Error modals for status change */}
            <ConfirmActionModal
              open={confirmAction.open}
              title={`Confirmar ${confirmAction.label}`}
              message={`¿Seguro querés ${confirmAction.label} a ${confirmAction.name}?`}
              confirmLabel={confirmAction.label?.charAt(0).toUpperCase() + confirmAction.label?.slice(1)}
              onClose={() => setConfirmAction({ open: false, teacherId: null, toStatus: null, label: '', name: '' })}
              onConfirm={async () => {
                if (!confirmAction.teacherId) return;
                setConfirmAction((c) => ({ ...c, open: false }));
                const prev = [...rowsRaw];
                const next = prev.map((it) =>
                  it.id === confirmAction.teacherId
                    ? { ...it, estado: confirmAction.toStatus === "available" ? "disponible" : "deshabilitado" }
                    : it
                );
                setRowsRaw(next);
                setIsProcessing(true);
                try {
                  await setTeacherStatus(confirmAction.teacherId, confirmAction.toStatus);
                  setSuccessMessage('Estado actualizado correctamente');
                } catch (e) {
                  setErrorMessage('No se pudo cambiar el estado. Se revierte.');
                  setRowsRaw(prev);
                } finally {
                  setIsProcessing(false);
                }
              }}
            />
            {isProcessing && <LoadingOverlay label="Procesando cambio de estado..." />}
            {successMessage && <SucessModal titulo={'Operación exitosa'} mensaje={successMessage} onClose={() => setSuccessMessage(null)} />}
            {errorMessage && <ErrorModal mensaje={errorMessage} onClose={() => setErrorMessage(null)} />}
        </div>
      </section>
        </div>
      </main>
    </>
  );
}