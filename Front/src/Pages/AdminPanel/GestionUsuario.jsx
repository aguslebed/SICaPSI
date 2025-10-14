import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import NavBar from '../../Components/Student/NavBar';
import { deleteUser as deleteUserApi, getAllUsers } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './AdminPanel.css';


function getEstadoLabel(status) {
  if (status === 'available') return { label: 'Habilitado', color: 'bg-green-500' };
  if (status === 'disabled') return { label: 'Deshabilitado', color: 'bg-red-500' };
  if (status === 'pending') return { label: 'Pendiente', color: 'bg-yellow-400' };
  return { label: status, color: 'bg-gray-400' };
}

function getRoleLabel(role) {
  if (role === 'Capacitador') return 'Capacitador';
  if (role === 'Alumno') return 'Guardia';
  if (role === 'Directivo') return 'Directivo';
  if (role === 'Administrador') return 'Administrador';
  return role;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR');
}

export default function GestionUsuario() {
  // Estados para los filtros aplicados
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Estados para los filtros en edición (inputs)
  const [tipoEdit, setTipoEdit] = useState('');
  const [estadoEdit, setEstadoEdit] = useState('');
  const [fechaDesdeEdit, setFechaDesdeEdit] = useState('');
  const [fechaHastaEdit, setFechaHastaEdit] = useState('');
  
  // Estados para el dropdown de fecha
  const [fechaMenu, setFechaMenu] = useState(false);
  const [fechaDesdeVisible, setFechaDesdeVisible] = useState(false);
  const [fechaHastaVisible, setFechaHastaVisible] = useState(false);
  
  // Estados para los dropdowns de Tipo y Estado
  const [tipoMenu, setTipoMenu] = useState(false);
  const [estadoMenu, setEstadoMenu] = useState(false);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState(''); // Nuevo estado
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data.items);
        // console.log(data.items);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Filtros
  useEffect(() => {
    let result = [...users];

    if (searchApplied.trim()) {
      const s = searchApplied.trim().toLowerCase();
      result = result.filter(
        u =>
          u.firstName?.toLowerCase().includes(s) ||
          u.lastName?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.documentNumber?.toLowerCase().includes(s)
      );
    }

    if (filtersApplied) {
      // Filtrado por tipos - primero usar las selecciones múltiples si existen
      if (tiposSeleccionados && tiposSeleccionados.length > 0) {
        result = result.filter(u => tiposSeleccionados.includes(getRoleLabel(u.role)));
      } else if (tipo) {
        result = result.filter(u => getRoleLabel(u.role) === tipo);
      }

      // Filtrado por estados - primero usar las selecciones múltiples si existen
      if (estadosSeleccionados && estadosSeleccionados.length > 0) {
        // Soportar variantes del backend (inglés/español)
        const estadoMapLookup = {
          'Habilitado': ['available', 'habilitado'],
          'Deshabilitado': ['disabled', 'deshabilitado'],
          'Pendiente': ['pending', 'pendiente']
        };
        // mapped será la lista plana de valores aceptables en minúsculas
        const mapped = estadosSeleccionados
          .map(e => estadoMapLookup[e] || [])
          .flat()
          .map(m => String(m).toLowerCase());
  const availableStatuses = Array.from(new Set((users || []).map(u => String(u.status || '').toLowerCase())));
        if (mapped.length > 0) {
          result = result.filter(u => mapped.includes(String(u.status || '').toLowerCase()));
        }
      } else if (estado) {
        const estadoMapLookup = {
          'Habilitado': ['available', 'habilitado'],
          'Deshabilitado': ['disabled', 'deshabilitado'],
          'Pendiente': ['pending', 'pendiente']
        };
        const expectedList = (estadoMapLookup[estado] || []).map(s => String(s).toLowerCase());
        result = result.filter(u => expectedList.includes(String(u.status || '').toLowerCase()));
      }

      // Filtrado por fechas
      if (fechaDesde) {
        result = result.filter(u => new Date(u.createdAt) >= new Date(fechaDesde));
      }
      if (fechaHasta) {
        result = result.filter(u => new Date(u.createdAt) <= new Date(fechaHasta));
      }
    }

    setFilteredUsers(result);
  }, [users, searchApplied, tipo, estado, fechaDesde, fechaHasta, filtersApplied, tiposSeleccionados, estadosSeleccionados]);

  // Aplica los filtros (excepto búsqueda)
  const aplicarFiltros = () => {
    setTipo(tipoEdit);
    setEstado(estadoEdit);
    setFechaDesde(fechaDesdeEdit);
    setFechaHasta(fechaHastaEdit);
    setFiltersApplied(true);
    // Debug: mostrar selección de estados y estados presentes en users
    // debug logs removed
  };

  // Limpia todos los filtros
  const limpiarFiltros = () => {
    setTipo('');
    setEstado('');
    setFechaDesde('');
    setFechaHasta('');
    setTipoEdit('');
    setEstadoEdit('');
    setFechaDesdeEdit('');
    setFechaHastaEdit('');
    setFiltersApplied(false);
    setTiposSeleccionados([]);
    setEstadosSeleccionados([]);
  };

  // Funciones para manejar cambios en los checkboxes
  const handleTipoChange = (tipoValue) => {
    setTiposSeleccionados(prev => {
      const newSelection = prev.includes(tipoValue)
        ? prev.filter(t => t !== tipoValue)
        : [...prev, tipoValue];
      // Actualizar tipoEdit basado en la selección
      if (newSelection.length === 1) {
        setTipoEdit(newSelection[0]);
      } else if (newSelection.length === 0 || newSelection.length === tipos.length) {
        setTipoEdit('');
      } else {
        setTipoEdit(newSelection[0]); // Tomar el primero si hay múltiples
      }
      return newSelection;
    });
  };

  const handleEstadoChange = (estadoValue) => {
    setEstadosSeleccionados(prev => {
      const newSelection = prev.includes(estadoValue)
        ? prev.filter(e => e !== estadoValue)
        : [...prev, estadoValue];
      // Actualizar estadoEdit basado en la selección
      if (newSelection.length === 1) {
        setEstadoEdit(newSelection[0]);
      } else if (newSelection.length === 0 || newSelection.length === estadosOpciones.length) {
        setEstadoEdit('');
      } else {
        setEstadoEdit(newSelection[0]); // Tomar el primero si hay múltiples
      }
      return newSelection;
    });
  };

  const tipos = [
    { label: 'Capacitador', value: 'Capacitador' },
    { label: 'Guardia', value: 'Guardia' },
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Directivo', value: 'Directivo' },
  ];

  const estadosOpciones = [
    { label: 'Habilitado', value: 'Habilitado' },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Deshabilitado', value: 'Deshabilitado' },
  ];

  const deleteUser = async (id) => {
  try {
    await deleteUserApi(id);
    const updatedUsers = users.filter(u => u._id !== id);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
  } catch (error) {
    alert(error.message || "Error al eliminar usuario");
  }
};

  return (
    <>
      {loading && <LoadingOverlay label="Cargando usuarios..." />}
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <div className="admin-flex admin-justify-between admin-items-center" style={{ marginBottom: '0.5rem' }}>
            <h1 className="admin-title" style={{ marginBottom: 0 }}>Gestión de usuarios</h1>
            <Link to="/adminPanel/gestionUsuario/crearUsuario" className="admin-btn admin-btn-success">
              Crear usuario
            </Link>
          </div>
          <hr className="admin-divider" />
          
          {/* Filtros y Tabla dentro de la misma sección */}
          <section className="admin-card">
            <div className="admin-filters" style={{ alignItems: 'flex-start' }}>
            {/* Búsqueda y Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 'fit-content' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="admin-search-input"
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button className="admin-search-btn" onClick={() => setSearchApplied(search)} title="Buscar">
                  🔎
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={aplicarFiltros} className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }}>
                  Aplicar Filtros
                </button>
                <button onClick={limpiarFiltros} className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }}>
                  Limpiar Filtros
                </button>
              </div>
            </div>
            
            {/* Filtro Tipo */}
            <div className="admin-filter-group admin-dropdown">
              <button onClick={() => setTipoMenu(!tipoMenu)} className="admin-dropdown-btn">
                Tipo
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {tipoMenu && (
                <div className="admin-dropdown-menu">
                  {tipos.map((t) => (
                    <label key={t.value} className="admin-dropdown-item">
                      <span
                        onClick={() => handleTipoChange(t.value)}
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
                        {tiposSeleccionados.includes(t.value) && (
                          <span style={{ fontSize: 12, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </span>
                      {t.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Filtro Estado */}
            <div className="admin-filter-group admin-dropdown">
              <button onClick={() => setEstadoMenu(!estadoMenu)} className="admin-dropdown-btn">
                Estado
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {estadoMenu && (
                <div className="admin-dropdown-menu">
                  {estadosOpciones.map((est) => (
                    <label key={est.value} className="admin-dropdown-item">
                      <span
                        onClick={() => handleEstadoChange(est.value)}
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
            
            {/* Filtro Fecha */}
            <div className="admin-filter-group admin-dropdown">
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
                    {fechaDesdeEdit ? `Desde: ${new Date(fechaDesdeEdit).toLocaleDateString()}` : "Desde"}
                  </button>
                  {fechaDesdeVisible && (
                    <input
                      type="date"
                      value={fechaDesdeEdit}
                      onChange={(e) => {
                        setFechaDesdeEdit(e.target.value);
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
                    {fechaHastaEdit ? `Hasta: ${new Date(fechaHastaEdit).toLocaleDateString()}` : "Hasta"}
                  </button>
                  {fechaHastaVisible && (
                    <input
                      type="date"
                      value={fechaHastaEdit}
                      onChange={(e) => {
                        setFechaHastaEdit(e.target.value);
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
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">No hay usuarios para mostrar.</td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const estado = getEstadoLabel(u.status);
                  return (
                    <tr key={u._id}>
                      <td>{u.firstName}</td>
                      <td>{u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.documentNumber}</td>
                      <td>
                        <span className={`admin-badge ${
                          estado.color === 'bg-green-500' ? 'admin-badge-success' : 
                          estado.color === 'bg-yellow-400' ? 'admin-badge-warning' : 
                          'admin-badge-danger'
                        }`}>
                          {estado.label}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>{getRoleLabel(u.role)}</td>
                      <td>
                        <div className="admin-actions">
                          <Link to="/adminPanel/gestionUsuario/modificarUsuario"
                            state={{ user: u }}
                            className="admin-action-btn"
                            title="Editar usuario"
                          >
                            📝
                          </Link>
                          <button 
                            className="admin-action-btn" 
                            title="Deshabilitar usuario" 
                            onClick={() => deleteUser(u._id)}
                          >
                            🚫
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="admin-pagination">
          <span className="admin-pagination-text">Anterior</span>
          <button className="admin-page-btn active">1</button>
          <button className="admin-page-btn">2</button>
          <button className="admin-page-btn">3</button>
          <span className="admin-pagination-text">Siguiente</span>
        </div>
      </section>
        <Outlet />
        </div>
      </main>
    </>
  );
}
