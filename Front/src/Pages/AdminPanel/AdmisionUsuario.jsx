import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Filter, Bold } from 'lucide-react';
import NavBar from '../../Components/Student/NavBar';
import { useLocation } from 'react-router-dom';
import { listUsers, updateUser } from '../../API/Request';

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
      <main className="bg-[#f7f8fa] min-h-screen p-0 max-w-screen-xl mx-auto">
        {/* Barra superior */}
          <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-center">
            <div className="black-ops-one-regular">
            </div>
          </div>
        
 

    <h1 style={{ fontSize: '45px', fontFamily: 'Inter, sans-serif', padding: '20px 40px', position: 'absolute', top: '150px', backgroundColor: 'transparent' }}>Admisión de usuarios</h1>
    <hr style={{ marginTop: '80px', border: '1px solid #e5e7eb', width: '96%', marginLeft: '40px' }} />
    <section className="mx-10 bg-white rounded-xl shadow p-5" style={{ marginTop: '30px' }}>
  
  {/* Filtros */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginBottom: 24,
        justifyContent: 'flex-start',
        width: '100%'
      }}>

  {/* Buscar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar"
                  style={{
                    border: '2px solid #222',
                    borderRadius: 20,
                    padding: '7px 16px',
                    width: 280,
                    fontSize: 15,
                    outline: 'none',
                    background: '#fff',
                    marginRight: -38,
                    marginTop: '50px',
                    zIndex: 2,
                    height: 38
                  }}
                />
  {/*{-------------------------------lupita buscador-----------------------------*/}
                <button
                  style={{
                    background: 'rgb(77, 195, 255)',
                    border: '0px solid #222',
                    borderRadius: '20%',
                    width: 50,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    left: '50px',
                    top: '25px'
                  }}
                  title="Buscar"
                >
                  <span style={{ fontSize: 24 }}>🔎︎</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 30 }}>
                <button 
                  onClick={aplicarFiltros}
                  style={{ background: '#4dc3ff', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontWeight: 500, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: 36 }}
                >
                  Aplicar Filtros
                </button>
                <button 
                  onClick={limpiarFiltros}
                  style={{ background: '#4dc3ff', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontWeight: 500, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: 36 }}
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

  {/*------------------------------------------------- TIPO --------------------------------------*/}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', marginLeft: '300px', marginTop: '-50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

  {/* Botón para abrir/cerrar menú */}
          <button onClick={() => setTipoMenu(!tipoMenu)}
          style={{
          fontSize: 15,
          fontWeight: 500,
          color: '#444',
          border: '1px solid #bdbdbd',
          borderRadius: 7,
          padding: '7px 12px',
          background: '#f7f8fa',
          cursor: 'pointer',
          height: 36,
          width: 180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Tipo<img width="20" height="20" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
          </button></div>

  {/*----------------------- Menú desplegable------------------------------------------- */}
    {tipoMenu && (
      <div
        style={{
          position: 'absolute',
          top: 35, //esto es para cambiar el espacio entre 'tipo' y las opciones
          left: 0,
          width: 180,
          background: '#f7f8fa',
          border: '1px solid #ccc',
          borderRadius: 7,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          padding: 5,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 5 //espacio entre las opciones
        }}
      >

        
  {/*----------- las opciones del botón 'TIPO'------------------- */}
        {tipos.map((t) => (
          <label
            key={t.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: 15, //letra para cambiar capacitador, guardia o admin
              color: '#333',
              borderRadius: 6
            }}
          >
            <span
              onClick={() => handleTipoChange(t.value)}
              
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background: '#fff',
                border: '1px solid #bdbdbd'
              }}
            >
              {tipo.includes(t.value) ? (
                <XCircle size={0} color="#444" />
              ) : (
                <span style={{ width: 10, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
              )}
            </span>
            {t.label}
          </label>
        ))}
      </div>
    )}
  </div>

                  

  {/*------------------------------------------------- ESTADO --------------------------------------*/}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', marginLeft: '80px', marginTop: '-50px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Botón para abrir/cerrar menú */}
      <button onClick={() => setEstadoMenu(!estadoMenu)}
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: '#444',
          border: '1px solid #bdbdbd',
          borderRadius: 7,
          padding: '7px 12px',
          background: '#f7f8fa',
          cursor: 'pointer',
          height: 36,
          width: 180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
        Estado<img width="20" height="20" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
      </button>
    </div>

    {/* Menú desplegable */}
    {estadoMenu && (
      <div
        style={{
          position: 'absolute',
          top: 35,
          left: 0,
          width: 180,
          background: '#f7f8fa',
          border: '1px solid #ccc',
          borderRadius: 7,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          padding: 5,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 5
        }}
      >
        {/* Opciones del botón 'ESTADO' */}
        {estados.map((est) => (
          <label
            key={est.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: 15,
              color: '#333',
              borderRadius: 6
            }}
          >
            <span
              onClick={() => handleEstadoChange(est.value)}
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background: '#fff',
                border: '1px solid #bdbdbd'
              }}
            >
              {estado.includes(est.value) ? (
                <span style={{ width: 10, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
              ) : (
                <XCircle size={0} color="#444" />
              )}
            </span>
            {est.label}
          </label>
        ))}
      </div>
    )}
  </div>

  {/*--------------------------------------------* Fecha de creación -----------------------------------------------*/}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', marginLeft: '80px', marginTop: '-50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Botón para abrir/cerrar menú */}
                <button
                  onClick={() => setFechaMenu(!fechaMenu)}
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#444',
                    border: '1px solid #bdbdbd',
                    borderRadius: 7,
                    padding: '7px 12px',
                    background: '#f7f8fa',
                    cursor: 'pointer',
                    height: 36,
                    width: 180,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >Fecha de creación
                  <img width="20" height="20" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
                </button>
              </div>

              {/* Menú desplegable */}
              {fechaMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 35,
                    left: 0,
                    width: 180,
                    background: '#f7f8fa',
                    border: '1px solid #ccc',
                    borderRadius: 7,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    padding: 15,
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 23
                  }}
                >
                  <button
                    onClick={() => setFechaDesdeVisible(!fechaDesdeVisible)}
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#444',
                      border: '1px solid #bdbdbd',
                      borderRadius: 7,
                      padding: '7px 12px',
                      background: '#fff',
                      cursor: 'pointer',
                      height: 36,
                      width: '100%',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {fechaDesde ? `Desde: ${new Date(fechaDesde).toLocaleDateString()}` : "Desde"}
                  </button>
                  {fechaDesdeVisible && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 7,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        padding: 10,
                        zIndex: 20
                      }}
                    >
                      <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => {
                          setFechaDesde(e.target.value);
                          setFechaDesdeVisible(false);
                        }}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setFechaHastaVisible(!fechaHastaVisible)}
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#444',
                      border: '1px solid #bdbdbd',
                      borderRadius: 7,
                      padding: '7px 12px',
                      background: '#fff',
                      cursor: 'pointer',
                      height: 36,
                      width: '100%',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {fechaHasta ? `Hasta: ${new Date(fechaHasta).toLocaleDateString()}` : "Hasta"}
                  </button>
                  {fechaHastaVisible && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 7,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        padding: 10,
                        zIndex: 20
                      }}
                    >
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => {
                          setFechaHasta(e.target.value);
                          setFechaHastaVisible(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>


  {/*-------------------------- Tabla con los datos -------------------------------*/}

            <div style={{ marginTop: '80px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#666' }}>
                  Cargando usuarios...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#f44336' }}>
                  {error}
                </div>
              ) : (
                <table style={{ width: '100%', fontSize: '16px', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead style={{ backgroundColor: '#0288d1', color: '#fff' }}>
                    <tr>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>Nombre</th>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>Apellido</th>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>Email</th>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>DNI</th>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>Fecha de creación</th>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>Tipo</th>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>Estado</th>
                      <th style={{ padding: '18px', fontWeight: 'bold' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#fff' }}>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                          {data.length === 0 ? 'No se encontraron usuarios' : 'No hay usuarios que coincidan con los filtros aplicados'}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((u, idx) => (
                        <tr key={u.id || idx} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '18px' }}>{u.nombre}</td>
                          <td style={{ padding: '18px' }}>{u.apellido}</td>
                          <td style={{ padding: '18px' }}>{u.email}</td>
                          <td style={{ padding: '18px' }}>{u.dni}</td>
                          <td style={{ padding: '18px' }}>{u.fecha}</td>
                          <td style={{ padding: '18px' }}>
                            <span style={{
                              backgroundColor: u.tipo === 'Administrador' ? '#ff9800' : 
                                             u.tipo === 'Capacitador' ? '#4caf50' : 
                                             u.tipo === 'Directivo' ? '#2196f3' : 
                                             u.tipo === 'Alumno' ? '#9c27b0' : '#9e9e9e',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {u.tipo}
                            </span>
                          </td>
                          <td style={{ padding: '18px' }}>
                            <span style={{
                              backgroundColor: u.estado === 'available' ? '#4caf50' : 
                                             u.estado === 'pendiente' ? '#ff9800' : '#f44336',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {u.estado === 'available' ? 'Activo' : 
                               u.estado === 'pendiente' ? 'Pendiente' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={{ padding: '18px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              style={{ color: '#4caf50', border: 'none', background: 'none', cursor: 'pointer' }} 
                              title="Aprobar"
                              onClick={() => aprobarUsuario(u)}
                            >
                              <CheckCircle size={28} />
                            </button>
                            <button 
                              style={{ color: '#f44336', border: 'none', background: 'none', cursor: 'pointer' }} 
                              title="Rechazar"
                              onClick={() => rechazarUsuario(u)}
                            >
                              <XCircle size={28} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Paginación */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '14px', color: '#757575' }}>
              <span>Anterior</span>
              <button style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#0288d1', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>1</button>
              <button style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#fff', color: '#757575', border: '1px solid #e5e7eb', cursor: 'pointer' }}>2</button>
              <button style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#fff', color: '#757575', border: '1px solid #e5e7eb', cursor: 'pointer' }}>3</button>
              <span>Siguiente</span>
            </div>
        </section>
      </main>
    </>
  );
}