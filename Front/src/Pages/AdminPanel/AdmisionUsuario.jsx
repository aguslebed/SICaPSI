import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Search, Filter, Bold } from 'lucide-react';
import NavBar from '../../Components/Student/NavBar';
import { useLocation } from 'react-router-dom';
import { listUsers, updateUser, deleteUser } from '../../API/Request';
import './AdminPanel.css';

const tipos = [
  { label: 'Capacitador', value: 'Capacitador' },
  { label: 'Directivo', value: 'Directivo' },
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Alumno', value: 'Alumno' },
];

export default function AdmisionUsuario() {
  const location = useLocation();
  const [data, setData] = useState(location.state?.data || []);
  const [filteredData, setFilteredData] = useState([]);
  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states for confirm / success / error flows
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null); // 'approve' | 'reject'
  const [userToProcess, setUserToProcess] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessageModal, setErrorMessageModal] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState([]);
  const [tipoMenu, setTipoMenu] = useState(false);
  const [fechaMenu, setFechaMenu] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [fechaDesdeVisible, setFechaDesdeVisible] = useState(false);
  const [fechaHastaVisible, setFechaHastaVisible] = useState(false);

  // Referencias para los dropdowns
  const tipoMenuRef = useRef(null);
  const fechaMenuRef = useRef(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (tipoMenuRef.current && !tipoMenuRef.current.contains(event.target)) {
        setTipoMenu(false);
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

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setLoading(true);
        setError(null);
        // Filtrar solo usuarios con estado pendiente
        const response = await listUsers({ status: 'pendiente' });
        
        // La respuesta tiene la estructura { total, page, limit, items }
        console.log('Respuesta de la API:', response);
        
        if (!response) {
          setError('No se recibió respuesta del servidor');
          return;
        }
        
        const usuarios = response.items || [];
        
        if (!Array.isArray(usuarios)) {
          console.error('usuarios no es un array:', usuarios);
          setError('Formato de datos incorrecto recibido del servidor');
          return;
        }
        
        // Transformar los datos para que coincidan con la estructura esperada
        // Solo incluir usuarios con estado pendiente
        const usuariosTransformados = usuarios
          .filter(usuario => usuario.status === 'pendiente')
          .map(usuario => ({
            nombre: usuario.firstName,
            apellido: usuario.lastName,
            email: usuario.email,
            dni: usuario.documentNumber,
            fecha: new Date(usuario.createdAt).toLocaleDateString(),
            tipo: usuario.role,
            estado: usuario.status,
            id: usuario._id
          }));
        
        setData(usuariosTransformados);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        
        // Manejo específico de diferentes tipos de errores
        if (error.message && error.message.includes('No autorizado')) {
          setError('No tienes permisos para ver esta información. Por favor, inicia sesión como administrador.');
        } else if (error.message && error.message.includes('conexión')) {
          setError('Error de conexión con el servidor. Verifica que el backend esté funcionando.');
        } else {
          setError(`Error al cargar los usuarios: ${error.message || 'Error desconocido'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    // Siempre cargar usuarios pendientes al montar
    cargarUsuarios();
  }, []); // Removido location.state?.data de dependencias

  // Efecto para filtrar datos cuando cambian los filtros o los datos
  useEffect(() => {
    let datosFiltrados = [...data];

    // Filtro por búsqueda de texto
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim();
      datosFiltrados = datosFiltrados.filter(usuario =>
        usuario.nombre.toLowerCase().includes(terminoBusqueda) ||
        usuario.apellido.toLowerCase().includes(terminoBusqueda) ||
        usuario.email.toLowerCase().includes(terminoBusqueda) ||
        usuario.dni.includes(terminoBusqueda)
      );
    }

    // Filtro por tipo de usuario
    if (tipo.length > 0) {
      datosFiltrados = datosFiltrados.filter(usuario =>
        tipo.includes(usuario.tipo)
      );
    }

    // Filtro por fecha desde
    if (fechaDesde) {
      const fechaDesdeObj = new Date(fechaDesde);
      datosFiltrados = datosFiltrados.filter(usuario => {
        const fechaUsuario = new Date(usuario.fecha.split('/').reverse().join('-'));
        return fechaUsuario >= fechaDesdeObj;
      });
    }

    // Filtro por fecha hasta
    if (fechaHasta) {
      const fechaHastaObj = new Date(fechaHasta);
      datosFiltrados = datosFiltrados.filter(usuario => {
        const fechaUsuario = new Date(usuario.fecha.split('/').reverse().join('-'));
        return fechaUsuario <= fechaHastaObj;
      });
    }

    setFilteredData(datosFiltrados);
    // Resetear página cuando cambian los datos o filtros
    setPage(1);
  }, [data, busqueda, tipo, fechaDesde, fechaHasta]);

  // Función para aplicar filtros (ya se aplican automáticamente con useEffect)
  const aplicarFiltros = () => {
    console.log('Filtros aplicados:', { busqueda, tipo, fechaDesde, fechaHasta });
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setTipo([]);
    setFechaDesde('');
    setFechaHasta('');
    setFecha(new Date());
  };

  // Función para manejar cambios en los checkboxes de tipo
  const handleTipoChange = (tipoValue) => {
    setTipo(prev => {
      if (prev.includes(tipoValue)) {
        return prev.filter(t => t !== tipoValue);
      } else {
        return [...prev, tipoValue];
      }
    });
  };

  // Open confirmation modal for approve
  const openConfirmApprove = (usuario) => {
    setActionToConfirm('approve');
    setUserToProcess(usuario);
    setShowConfirmModal(true);
  };

  // Open confirmation modal for reject
  const openConfirmReject = (usuario) => {
    setActionToConfirm('reject');
    setUserToProcess(usuario);
    setShowConfirmModal(true);
  };

  const cancelConfirm = () => {
    setShowConfirmModal(false);
    setUserToProcess(null);
    setActionToConfirm(null);
  };

  // Perform the confirmed action (approve or reject)
  const confirmAction = async () => {
    if (!userToProcess || !actionToConfirm) return;
    setLoading(true);
    try {
      if (actionToConfirm === 'approve') {
        await updateUser(userToProcess.id, { status: 'available' });
        setData(prev => prev.filter(u => u.id !== userToProcess.id));
        setSuccessMessage(`Usuario ${userToProcess.nombre} ${userToProcess.apellido} aprobado correctamente y removido de admisión`);
      } else if (actionToConfirm === 'reject') {
        await deleteUser(userToProcess.id);
        setData(prev => prev.filter(u => u.id !== userToProcess.id));
        setSuccessMessage(`Usuario ${userToProcess.nombre} ${userToProcess.apellido} fue rechazado y eliminado`);
      }

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setUserToProcess(null);
      setActionToConfirm(null);
    } catch (err) {
      console.error('Error en acción de admisión:', err);
      setErrorMessageModal(err?.message || 'Error desconocido');
      setShowConfirmModal(false);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const Calendar = ({ onChange }) => (
    <input
      type="date"
      value={fecha.toISOString().split('T')[0]}
      onChange={(e) => {
        const newDate = new Date(e.target.value);
        setFecha(newDate);
        onChange(newDate);
      }}
    />
  );

  // Computos de paginación derivados
  const totalFiltered = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const startIndex = (page - 1) * itemsPerPage;
  const pageSlice = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <div style={{ marginBottom: '0.5rem' }}>
            <h1 className="admin-title" style={{ marginBottom: 0 }}>Admisión de usuarios</h1>
          </div>
          <hr className="admin-divider" />
          
          <section className="admin-card">
            {/* Filtros */}
            <div className="admin-filters" style={{ alignItems: 'flex-start' }}>
            {/* Búsqueda y Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 'fit-content' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, email o DNI"
                  className="admin-search-input"
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button className="admin-search-btn" title="Buscar">
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
                        {tipo.includes(t.value) && (
                          <span style={{ fontSize: 12, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </span>
                      {t.label}
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
                    {fechaDesde ? `Desde: ${new Date(fechaDesde).toLocaleDateString()}` : "Desde"}
                  </button>
                  {fechaDesdeVisible && (
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => {
                        setFechaDesde(e.target.value);
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
                    {fechaHasta ? `Hasta: ${new Date(fechaHasta).toLocaleDateString()}` : "Hasta"}
                  </button>
                  {fechaHastaVisible && (
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => {
                        setFechaHasta(e.target.value);
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
            {loading ? (
              <div className="admin-empty">
                Cargando usuarios...
              </div>
            ) : error ? (
              <div className="admin-empty" style={{ color: 'var(--danger-color)' }}>
                {error}
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>DNI</th>
                    <th>Fecha de creación</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-empty">
                        {data.length === 0 ? 'No se encontraron usuarios' : 'No hay usuarios que coincidan con los filtros aplicados'}
                      </td>
                    </tr>
                  ) : (
                    pageSlice.map((u, idx) => (
                      <tr key={u.id || idx}>
                        <td data-label="Nombre">{u.nombre}</td>
                        <td data-label="Apellido">{u.apellido}</td>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="DNI">{u.dni}</td>
                        <td data-label="Fecha">{u.fecha}</td>
                        <td data-label="Tipo">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium text-center"
                            style={{ 
                              minWidth: '110px',
                              backgroundColor: 
                                u.tipo === 'Administrador' ? '#f97316' : 
                                u.tipo === 'Capacitador' ? '#10b981' : 
                                u.tipo === 'Directivo' ? '#3b82f6' : 
                                u.tipo === 'Alumno' ? '#a855f7' : '#6b7280'
                            }}
                          >
                            {u.tipo}
                          </span>
                        </td>
                        <td data-label="Acciones">
                          <div className="admin-actions">
                            <button 
                              className="admin-action-btn" 
                              title="Aprobar"
                              onClick={() => openConfirmApprove(u)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                                <path d="M8 12l2.5 2.5 5.5-5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="admin-action-btn" 
                              title="Rechazar"
                              onClick={() => openConfirmReject(u)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                                <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

            {/* Paginación (debajo de la tabla) */}
            {totalFiltered > itemsPerPage && (
              <div className="admin-pagination">
                <button
                  className="admin-pagination-text"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
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
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 10, maxWidth: 480, width: '90%' }}>
            <h3 style={{ marginBottom: 12 }}>{actionToConfirm === 'approve' ? 'Confirmar aprobación' : 'Confirmar rechazo'}</h3>
            <p style={{ marginBottom: 20 }}>¿Estás seguro de que deseas {actionToConfirm === 'approve' ? 'aprobar' : 'rechazar'} al usuario <strong>{userToProcess?.nombre} {userToProcess?.apellido}</strong>?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={cancelConfirm} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmAction} disabled={loading} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: actionToConfirm === 'approve' ? '#10b981' : '#ef4444', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Procesando...' : (actionToConfirm === 'approve' ? 'Aprobar' : 'Rechazar')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 10, maxWidth: 480, width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 12 }}>Operación exitosa</h3>
            <p style={{ marginBottom: 20 }}>{successMessage}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowSuccessModal(false)} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#10b981', color: 'white', width: '100%', cursor: 'pointer' }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 10, maxWidth: 480, width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 12, color: '#ef4444' }}>Error</h3>
            <p style={{ marginBottom: 20 }}>{errorMessageModal}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowErrorModal(false)} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', width: '100%', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}