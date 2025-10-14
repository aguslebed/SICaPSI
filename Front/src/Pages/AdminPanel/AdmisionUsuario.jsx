import { useState, useEffect } from 'react';
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

const estados = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Activo', value: 'available' },
  { label: 'Inactivo', value: 'disabled' },
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
  const [estado, setEstado] = useState([]);
  const [estadoMenu, setEstadoMenu] = useState(false);
  const [fechaMenu, setFechaMenu] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [fechaDesdeVisible, setFechaDesdeVisible] = useState(false);
  const [fechaHastaVisible, setFechaHastaVisible] = useState(false);

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

    // Filtro por estado de usuario
    if (estado.length > 0) {
      datosFiltrados = datosFiltrados.filter(usuario =>
        estado.includes(usuario.estado)
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
  }, [data, busqueda, tipo, estado, fechaDesde, fechaHasta]);

  // Función para aplicar filtros (ya se aplican automáticamente con useEffect)
  const aplicarFiltros = () => {
    console.log('Filtros aplicados:', { busqueda, tipo, fechaDesde, fechaHasta });
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setTipo([]);
    setEstado([]);
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

  // Función para manejar cambios en los checkboxes de estado
  const handleEstadoChange = (estadoValue) => {
    setEstado(prev => {
      if (prev.includes(estadoValue)) {
        return prev.filter(e => e !== estadoValue);
      } else {
        return [...prev, estadoValue];
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
          <h1 className="admin-title">Admisión de usuarios</h1>
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

            {/* Filtro Estado */}
            <div className="admin-filter-group admin-dropdown">
              <button onClick={() => setEstadoMenu(!estadoMenu)} className="admin-dropdown-btn">
                Estado
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {estadoMenu && (
                <div className="admin-dropdown-menu">
                  {estados.map((est) => (
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
                        {estado.includes(est.value) && (
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
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="admin-empty">
                        {data.length === 0 ? 'No se encontraron usuarios' : 'No hay usuarios que coincidan con los filtros aplicados'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((u, idx) => (
                      <tr key={u.id || idx}>
                        <td>{u.nombre}</td>
                        <td>{u.apellido}</td>
                        <td>{u.email}</td>
                        <td>{u.dni}</td>
                        <td>{u.fecha}</td>
                        <td>
                          <span className={`admin-badge ${
                            u.tipo === 'Administrador' ? 'admin-badge-warning' : 
                            u.tipo === 'Capacitador' ? 'admin-badge-success' : 
                            u.tipo === 'Directivo' ? 'admin-badge-info' : 
                            u.tipo === 'Alumno' ? 'admin-badge-purple' : 'admin-badge-gray'
                          }`}>
                            {u.tipo}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${
                            u.estado === 'available' ? 'admin-badge-success' : 
                            u.estado === 'pendiente' ? 'admin-badge-warning' : 'admin-badge-danger'
                          }`}>
                            {u.estado === 'available' ? 'Activo' : 
                             u.estado === 'pendiente' ? 'Pendiente' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button 
                              className="admin-action-btn" 
                              style={{ color: 'var(--success-color)' }}
                              title="Aprobar"
                              onClick={() => aprobarUsuario(u)}
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button 
                              className="admin-action-btn" 
                              style={{ color: 'var(--danger-color)' }}
                              title="Rechazar"
                              onClick={() => rechazarUsuario(u)}
                            >
                              <XCircle size={20} />
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