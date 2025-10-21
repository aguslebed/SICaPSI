import { useEffect, useMemo, useState, useRef } from "react";
import NavBar from "../../Components/Student/NavBar";
import { useNavigate } from "react-router-dom";
import { listTeachers, setTeacherStatus } from "../../API/Request";
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";
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


export default function GestionProfesores() {
  const navigate = useNavigate();

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

  // paginado
  const [page, setPage] = useState(1);
  const size = 10;

  // cargar desde backend
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const data = await listTeachers();
        const mapped = (data || []).map((r) => ({
          id: r._id || r.id,
          nombre: r.firstName,
          apellido: r.lastName,
          email: r.email,
          dni: r.documentNumber,
          estado: r.status === "available" ? "disponible" : "deshabilitado",
          creado: r.createdAt,
          curso: r.assignedTraining && r.assignedTraining.length > 0
            ? r.assignedTraining.map(training => training.title || training.subtitle).filter(Boolean)
            : ["–"],
        }));
        if (alive) setRowsRaw(mapped);
      } catch {
        if (alive) setRowsRaw([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // aplicar filtros (en memoria)
  const filtrados = useMemo(() => {
    let rows = [...rowsRaw];

    // filtro de texto solo cuando se aplica
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      rows = rows.filter((r) =>
        [r.nombre, r.apellido, r.email, r.dni, ...(r.curso || [])]
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
                  <td data-label="Curso Asignado">{r.curso?.map((c, i) => <div key={i}>{c}</div>)}</td>
                  <td data-label="Acciones">
                    <div className="admin-actions">
                      {/* Editar */}
                      <button
                        className="admin-action-btn"
                        title="Editar"
                        onClick={() => navigate(`/adminPanel/profesorEditar/${r.id}`)}
                      >
                        📝
                      </button>

                      <button
                        className="admin-action-btn"
                        title={r.estado === "disponible" ? "Bloquear" : "Habilitar"}
                        onClick={async () => {
                          const toStatus = r.estado === "disponible" ? "disabled" : "available";
                          const label = r.estado === "disponible" ? "bloquear" : "habilitar";
                          if (!window.confirm(`¿Seguro querés ${label} a ${r.nombre} ${r.apellido}?`)) return;

                          const prev = [...rowsRaw];
                          const next = prev.map((it) =>
                            it.id === r.id
                              ? { ...it, estado: toStatus === "available" ? "disponible" : "deshabilitado" }
                              : it
                          );
                          setRowsRaw(next);

                          try {
                            await setTeacherStatus(r.id, toStatus);
                          } catch {
                            alert("No se pudo cambiar el estado. Se revierte.");
                            setRowsRaw(prev);
                          }
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
        </div>
      </section>
        </div>
      </main>
    </>
  );
}