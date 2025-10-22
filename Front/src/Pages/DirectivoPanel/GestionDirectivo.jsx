import React, { useEffect, useMemo, useState, useRef } from 'react';
import NavBar from '../../Components/Student/NavBar';
import { getStudents } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './DirectivoPanel.css';

// Chip para estado simple (reusa clases existentes)
function ChipEstado({ status }) {
  const ok = String(status).toLowerCase() === 'available' || String(status).toLowerCase() === 'habilitado';
  return (
    <span className={`admin-badge ${ok ? 'admin-badge-success' : 'admin-badge-danger'}`}>
      {ok ? 'Habilitado' : 'Deshabilitado'}
    </span>
  );
}

// Componente principal
export default function GestionDirectivo() {
  // búsqueda
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // dropdown refs
  const fechaMenuRef = useRef(null);
  const [fechaMenu, setFechaMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (fechaMenuRef.current && !fechaMenuRef.current.contains(e.target)) setFechaMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // datos
  const [rowsRaw, setRowsRaw] = useState([]);
  const [loading, setLoading] = useState(false);

  // paginado simple
  const [page, setPage] = useState(1);
  const size = 10;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const data = await getStudents();

        const list = Array.isArray(data) ? data : (data?.items || []);
        const mapped = list.map(u => ({
          id: u._id || u.id,
          nombre: u.firstName,
          apellido: u.lastName,
          email: u.email,
          dni: u.documentNumber,
          estado: u.status,
          creado: u.createdAt,
          progreso: u.progress ?? u.trainingProgress ?? 0,
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

  // filtrar en memoria
  const filtrados = useMemo(() => {
    let rows = [...rowsRaw];
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      rows = rows.filter(r => [r.nombre, r.apellido, r.email, r.dni].join(' ').toLowerCase().includes(q));
    }
    if (desde) {
      rows = rows.filter(r => {
        const d = r.creado ? new Date(r.creado) : null;
        if (!d || isNaN(d)) return true;
        return d >= new Date(desde);
      });
    }
    if (hasta) {
      rows = rows.filter(r => {
        const d = r.creado ? new Date(r.creado) : null;
        if (!d || isNaN(d)) return true;
        return d <= new Date(hasta);
      });
    }
    return rows;
  }, [rowsRaw, appliedSearch, desde, hasta]);

  const total = filtrados.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const pageRows = useMemo(() => {
    const start = (page - 1) * size;
    return filtrados.slice(start, start + size);
  }, [filtrados, page]);

  useEffect(() => setPage(1), [appliedSearch, desde, hasta]);

  return (
    <>
      {loading && <LoadingOverlay label="Cargando alumnos..." />}
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h1 className="admin-title">Panel Directivo</h1>
          <hr className="admin-divider" />

          <section className="admin-card">
            <div className="admin-filters" style={{ alignItems: 'flex-start' }}>
              {/* Búsqueda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 'fit-content' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') setAppliedSearch(search); }}
                    placeholder="Buscar alumno"
                    className="admin-search-input"
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <button className="admin-search-btn" onClick={() => setAppliedSearch(search)} title="Buscar">🔎</button>
                </div>
              </div>

              {/* Filtro Fecha */}
              <div className="admin-filter-group admin-dropdown" ref={fechaMenuRef}>
                <button onClick={() => setFechaMenu(!fechaMenu)} className="admin-dropdown-btn">
                  Fecha
                  <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
                </button>
                {fechaMenu && (
                  <div className="admin-dropdown-menu" style={{ minWidth: '200px', padding: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Desde</label>
                    <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="admin-filter-input" style={{ width: '100%', marginBottom: '0.5rem' }} />
                    <label style={{ display: 'block', marginBottom: 6 }}>Hasta</label>
                    <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="admin-filter-input" style={{ width: '100%', marginTop: '0.5rem' }} />
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
                    <th>Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan="7" className="admin-empty">Sin resultados</td>
                    </tr>
                  )}
                  {pageRows.map(r => (
                    <tr key={r.id}>
                      <td data-label="Nombre">{r.nombre}</td>
                      <td data-label="Apellido">{r.apellido}</td>
                      <td data-label="Email">{r.email}</td>
                      <td data-label="DNI">{r.dni}</td>
                      <td data-label="Estado"><ChipEstado status={r.estado} /></td>
                      <td data-label="Fecha de creación">{r.creado ? new Date(r.creado).toLocaleDateString() : '-'}</td>
                      <td className='flex justify-center' data-label="Progreso">
                        <div style={{ width: 160 }}>
                          <div style={{ height: 10, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, Math.max(0, Number(r.progreso || 0)))}%`, height: '100%', background: '#10b981' }} />
                          </div>
                          <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>{Math.round(Number(r.progreso || 0))}%</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="admin-pagination">
                <span className="admin-pagination-text">Anterior</span>
                {[...Array(pages)].map((_, i) => (
                  <button key={i} className={`admin-page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <span className="admin-pagination-text">Siguiente</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}