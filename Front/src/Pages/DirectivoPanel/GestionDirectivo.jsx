import { useEffect, useMemo, useState } from 'react';
import NavBar from '../../Components/Student/NavBar';
import { getAllUsers } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './DirectivoPanel.css';

// Componente principal
export default function GestionDirectivo() {
  // búsqueda y filtros
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

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
        const data = await getAllUsers();
        const list = Array.isArray(data) ? data : (data?.items || []);
        const mapped = list.map(u => ({
          id: u._id || u.id,
          nombre: u.firstName,
          apellido: u.lastName,
          email: u.email,
          dni: u.documentNumber,
          role: u.role,
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
    if (selectedRole !== 'all') {
      rows = rows.filter(r => r.role?.toLowerCase() === selectedRole.toLowerCase());
    }
    return rows;
  }, [rowsRaw, appliedSearch, selectedRole]);

  const total = filtrados.length;
  const pageRows = useMemo(() => {
    const start = (page - 1) * size;
    return filtrados.slice(start, start + size);
  }, [filtrados, page]);

  

  useEffect(() => setPage(1), [appliedSearch, selectedRole]);

  return (
    <>
      {loading && <LoadingOverlay label="Cargando usuarios..." />}
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h1 className="admin-title">Listados</h1>
          <hr className="admin-divider" />

          <section className="admin-card">
          <div className="admin-filters flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 w-full md:flex-row md:gap-4 md:items-center md:w-auto">
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') setAppliedSearch(search); }}
                    placeholder="Buscar..."
                    className="admin-search-input"
                    style={{ minWidth: 0, flex: 1 }}
                  />
                  <button className="admin-search-btn" onClick={() => setAppliedSearch(search)} title="Buscar">🔎</button>
                </div>

                <select 
                  value={selectedRole} 
                  onChange={e => setSelectedRole(e.target.value)}
                  className="admin-filter-input w-full md:w-auto"
                  style={{ minWidth: 0 }}
                >
                  <option value="all">Filtrar por rol</option>
                  <option value="alumno">Alumno</option>
                  <option value="capacitador">Capacitador</option>
                  <option value="directivo">Directivo</option>
                </select>
              </div>
            </div>

            {/* Tabla - Desktop */}
            <div className="hidden md:block admin-table-wrapper" style={{ marginTop: '1.5rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>DNI</th>
                    <th>Rol</th>
                    <th>Provincia</th>
                    <th>Email</th>
                    <th>Fecha de creación</th>
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
                      <td data-label="DNI">{r.dni}</td>
                      <td data-label="Rol">{r.role}</td>
                      <td data-label="Provincia">Buenos Aires</td>
                      <td data-label="Email">{r.email}</td>
                      <td data-label="Fecha de creación">{r.creado ? new Date(r.creado).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Cards - Mobile */}
            <div className="md:hidden" style={{ marginTop: '1rem' }}>
              {pageRows.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#757575', background: 'white', borderRadius: '8px' }}>
                  Sin resultados
                </div>
              )}
              {pageRows.map(r => (
                <div key={r.id} style={{ background: 'white', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>Nombre completo</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{r.nombre} {r.apellido}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>DNI</div>
                      <div style={{ fontSize: '0.9rem' }}>{r.dni}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>Rol</div>
                      <div style={{ fontSize: '0.9rem' }}>{r.role}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>Email</div>
                    <div style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>{r.email}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>Provincia</div>
                      <div style={{ fontSize: '0.85rem' }}>Buenos Aires</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>Fecha de creación</div>
                      <div style={{ fontSize: '0.85rem' }}>{r.creado ? new Date(r.creado).toLocaleDateString() : '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Mostrando {((page - 1) * size) + 1} a {Math.min(page * size, total)} de {total} registros
              </div>

              <div className="admin-pagination">
                {total > 0 && (
                  <>
                    <button key="1" className={`admin-page-btn ${page === 1 ? 'active' : ''}`} onClick={() => setPage(1)}>1</button>
                    {total > size && <button key="2" className={`admin-page-btn ${page === 2 ? 'active' : ''}`} onClick={() => setPage(2)}>2</button>}
                    {total > size * 2 && <button key="3" className={`admin-page-btn ${page === 3 ? 'active' : ''}`} onClick={() => setPage(3)}>3</button>}
                    {total > page * size && <span className="admin-pagination-text" onClick={() => setPage(page + 1)} style={{cursor: 'pointer'}}>Siguiente</span>}
                  </>
                )}
              </div>
          </section>
        </div>
      </main>
    </>
  );
}