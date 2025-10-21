import React, { useState, useEffect, useRef } from 'react';
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
  if (role === 'Alumno') return 'Alumno';
  if (role === 'Directivo') return 'Directivo';
  if (role === 'Administrador') return 'Administrador';
  return role;
}

function getRoleColor(role) {
  if (role === 'Capacitador') return 'bg-green-500';
  if (role === 'Alumno') return 'bg-purple-500';
  if (role === 'Directivo') return 'bg-blue-500';
  if (role === 'Administrador') return 'bg-orange-500';
  return 'bg-gray-500';
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
  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estados para modal de eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Referencias para los dropdowns
  const tipoMenuRef = useRef(null);
  const estadoMenuRef = useRef(null);
  const fechaMenuRef = useRef(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (tipoMenuRef.current && !tipoMenuRef.current.contains(event.target)) {
        setTipoMenu(false);
      }
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
    // Resetear página cuando cambian filtros o usuarios
    setPage(1);
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
    { label: 'Alumno', value: 'Alumno' },
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Directivo', value: 'Directivo' },
  ];

  const estadosOpciones = [
    { label: 'Habilitado', value: 'Habilitado' },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Deshabilitado', value: 'Deshabilitado' },
  ];

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await deleteUserApi(userToDelete._id);
      const updatedUsers = users.filter(u => u._id !== userToDelete._id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      setUserToDelete(null);
    } catch (error) {
      alert(error.message || "Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <>
      {loading && <LoadingOverlay label="Cargando usuarios..." />}
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <div className="admin-flex admin-justify-between admin-items-center" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h1 className="admin-title" style={{ marginBottom: 0 }}>Gestión de usuarios</h1>
            <Link to="/adminPanel/gestionUsuario/crearUsuario" className="admin-btn admin-btn-success" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
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
            <div className="admin-filter-group admin-dropdown" ref={tipoMenuRef}>
              <button onClick={() => setTipoMenu(!tipoMenu)} className="admin-dropdown-btn">
                Tipo
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {tipoMenu && (
                <div className="admin-dropdown-menu">
                  {tipos.map((t) => (
                    <label 
                      key={t.value} 
                      className="admin-dropdown-item"
                      onClick={() => handleTipoChange(t.value)}
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
            <div className="admin-filter-group admin-dropdown" ref={estadoMenuRef}>
              <button onClick={() => setEstadoMenu(!estadoMenu)} className="admin-dropdown-btn">
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
                (() => {
                  const total = filteredUsers.length;
                  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                  const start = (page - 1) * itemsPerPage;
                  const slice = filteredUsers.slice(start, start + itemsPerPage);
                  return slice.map(u => {
                    const estado = getEstadoLabel(u.status);
                    return (
                      <tr key={u._id}>
                        <td data-label="Nombre">{u.firstName}</td>
                        <td data-label="Apellido">{u.lastName}</td>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="DNI">{u.documentNumber}</td>
                        <td data-label="Estado">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium text-center"
                            style={{ minWidth: '110px', backgroundColor: 
                              estado.color === 'bg-green-500' ? '#10b981' : 
                              estado.color === 'bg-yellow-400' ? '#facc15' : '#ef4444' }}
                          >
                            {estado.label}
                          </span>
                        </td>
                        <td data-label="Fecha">{formatDate(u.createdAt)}</td>
                        <td data-label="Tipo">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium text-center"
                            style={{ minWidth: '110px', backgroundColor: getRoleColor(u.role) === 'bg-green-500' ? '#10b981' :
                                     getRoleColor(u.role) === 'bg-purple-500' ? '#a855f7' :
                                     getRoleColor(u.role) === 'bg-blue-500' ? '#3b82f6' :
                                     getRoleColor(u.role) === 'bg-orange-500' ? '#f97316' : '#6b7280' }}
                          >
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td data-label="Acciones">
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
                              title="Eliminar usuario" 
                              onClick={() => openDeleteModal(u)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                <circle cx="17" cy="17" r="5" fill="black"/>
                                <path d="M14.5 14.5l5 5M19.5 14.5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                })()
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {filteredUsers.length > itemsPerPage && (
          <div className="admin-pagination">
            <button
              className="admin-pagination-text"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            {Array.from({ length: Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage)) }).map((_, i) => (
              <button
                key={i}
                className={`admin-page-btn ${page === i + 1 ? 'active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="admin-pagination-text"
              onClick={() => setPage(prev => Math.min(Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage)), prev + 1))}
              disabled={page === Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
        <Outlet />
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}
            >
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#1f2937'
              }}>
                ¿Confirmar eliminación?
              </h3>
              <p style={{ 
                marginBottom: '24px', 
                color: '#4b5563',
                fontSize: '0.95rem'
              }}>
                ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.nombre} {userToDelete?.apellido}</strong>? 
                Esta acción no se puede deshacer.
              </p>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de éxito */}
        {showSuccessModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                textAlign: 'center'
              }}
            >
              {/* Checkmark verde */}
              <div style={{ 
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <svg 
                  width="64" 
                  height="64" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10" fill="#10b981" />
                  <path 
                    d="M8 12l2 2 4-4" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#1f2937'
              }}>
                Usuario eliminado exitosamente
              </h3>
              
              <p style={{ 
                marginBottom: '24px', 
                color: '#6b7280',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                Usuario dado de baja correctamente. No podrá acceder al sistema.
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  width: '100%'
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
