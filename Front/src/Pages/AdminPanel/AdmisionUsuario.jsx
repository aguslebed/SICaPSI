import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Search, Filter, Bold } from 'lucide-react';
import NavBar from '../../Components/Student/NavBar';
import { useLocation } from 'react-router-dom';
import { listUsers, updateUser } from '../../API/Request';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        const response = await listUsers();
        
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
        const usuariosTransformados = usuarios.map(usuario => ({
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

    // Solo cargar si no hay datos desde el estado de navegación
    if (!location.state?.data || location.state.data.length === 0) {
      cargarUsuarios();
    }
  }, [location.state?.data]);

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

  // Funciones para las acciones de aprobar/rechazar
  const aprobarUsuario = async (usuario) => {
    try {
      // Confirmación antes de aprobar
      if (!window.confirm(`¿Estás seguro de que deseas aprobar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
        return;
      }

      console.log('Aprobando usuario:', usuario);
      
      // Actualizar el status del usuario a 'available' si está deshabilitado
      await updateUser(usuario.id, { status: 'available' });
      
      // Actualizar los datos localmente para reflejar el cambio inmediatamente
      const datosActualizados = data.map(u => 
        u.id === usuario.id ? { ...u, estado: 'available' } : u
      );
      setData(datosActualizados);
      
      alert(`Usuario ${usuario.nombre} ${usuario.apellido} aprobado correctamente`);
    } catch (error) {
      console.error('Error al aprobar usuario:', error);
      alert(`Error al aprobar el usuario: ${error.message}`);
    }
  };

  const rechazarUsuario = async (usuario) => {
    try {
      // Confirmación antes de rechazar
      if (!window.confirm(`¿Estás seguro de que deseas rechazar/desactivar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
        return;
      }

      console.log('Rechazando usuario:', usuario);
      
      // Actualizar el status del usuario a 'disabled'
      await updateUser(usuario.id, { status: 'disabled' });
      
      // Actualizar los datos localmente para reflejar el cambio inmediatamente
      const datosActualizados = data.map(u => 
        u.id === usuario.id ? { ...u, estado: 'disabled' } : u
      );
      setData(datosActualizados);
      
      alert(`Usuario ${usuario.nombre} ${usuario.apellido} ha sido desactivado`);
    } catch (error) {
      console.error('Error al rechazar usuario:', error);
      alert(`Error al rechazar el usuario: ${error.message}`);
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
                    filteredData.map((u, idx) => (
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
                              onClick={() => aprobarUsuario(u)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                                <path d="M8 12l2.5 2.5 5.5-5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="admin-action-btn" 
                              title="Rechazar"
                              onClick={() => rechazarUsuario(u)}
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

            {/* Paginación */}
            <div className="admin-pagination">
              <span className="admin-pagination-text">Anterior</span>
              <button className="admin-page-btn active">1</button>
              <button className="admin-page-btn">2</button>
              <button className="admin-page-btn">3</button>
              <span className="admin-pagination-text">Siguiente</span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}