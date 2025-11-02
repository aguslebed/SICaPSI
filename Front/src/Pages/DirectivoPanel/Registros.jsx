import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/Student/NavBar';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './DirectivoPanel.css';
import '../AdminPanel/AdminPanel.css';

// Mapeo de traducciones de acciones (todas las disponibles en el sistema)
const TRADUCCIONES_ACCIONES = {
  // Autenticación
  'LOGIN_SUCCESS': 'Inicio de Sesión Exitoso',
  'LOGIN_FAILED': 'Intento de Inicio de Sesión Fallido',
  'LOGOUT': 'Cierre de Sesión',
  'PASSWORD_CHANGED': 'Contraseña Cambiada',
  
  // Usuarios
  'USER_CREATED': 'Usuario Creado',
  'USER_UPDATED': 'Usuario Actualizado',
  'USER_DELETED': 'Usuario Eliminado',
  'USER_STATUS_CHANGED': 'Estado de Usuario Cambiado',
  'USER_APPROVED': 'Usuario Aprobado',
  'USER_REJECTED': 'Usuario Rechazado',
  'USER_ROLE_CHANGED': 'Rol de Usuario Cambiado',
  'USER_PROFILE_UPDATED': 'Perfil de Usuario Actualizado',
  'USER_PASSWORD_RESET': 'Contraseña de Usuario Restablecida',
  
  // Estudiantes
  'STUDENT_BLOCKED': 'Estudiante Bloqueado',
  'STUDENT_ENABLED': 'Estudiante Habilitado',
  'STUDENT_DELETED': 'Estudiante Eliminado',
  'STUDENT_ENROLLED': 'Estudiante Inscrito',
  'STUDENT_UNENROLLED': 'Estudiante Desinscrito',
  
  // Profesores
  'TEACHER_BLOCKED': 'Profesor Bloqueado',
  'TEACHER_ENABLED': 'Profesor Habilitado',
  'TEACHER_DELETED': 'Profesor Eliminado',
  'TEACHER_ASSIGNED_TO_TRAINING': 'Profesor Asignado a Capacitación',
  'TEACHER_REMOVED_FROM_TRAINING': 'Profesor Removido de Capacitación',
  
  // Capacitaciones
  'TRAINING_CREATED': 'Capacitación Creada',
  'TRAINING_UPDATED': 'Capacitación Actualizada',
  'TRAINING_DELETED': 'Capacitación Eliminada',
  'TRAINING_APPROVED': 'Capacitación Aprobada',
  'TRAINING_REJECTED': 'Capacitación Rechazada',
  'TRAINING_PUBLISHED': 'Capacitación Publicada',
  'TRAINING_ASSIGNED': 'Capacitación Asignada',
  'TRAINING_UNASSIGNED': 'Capacitación Desasignada',
  'TRAINING_SUBMITTED_FOR_APPROVAL': 'Capacitación Enviada para Aprobación',
  
  // Capacitadores
  'TRAINER_ASSIGNED': 'Capacitador Asignado',
  'TRAINER_UNASSIGNED': 'Capacitador Desasignado',
  
  // Sistema
  'REPORT_GENERATED': 'Reporte Generado',
  'DATA_EXPORTED': 'Datos Exportados',
  'FILE_UPLOADED': 'Archivo Subido',
  'UNAUTHORIZED_ACCESS': 'Acceso No Autorizado',
  'PERMISSION_DENIED': 'Permiso Denegado',
  'INVALID_TOKEN': 'Token Inválido',
  'SYSTEM_BACKUP': 'Respaldo del Sistema',
  'SYSTEM_RESTORE': 'Restauración del Sistema',
  'CONFIG_CHANGED': 'Configuración Cambiada'
};

export default function Registros() {
  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroCapacitador, setFiltroCapacitador] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [filtroCapacitadorAplicado, setFiltroCapacitadorAplicado] = useState('');
  const [filtroAccionAplicado, setFiltroAccionAplicado] = useState('');
  const [filtroFechaAplicado, setFiltroFechaAplicado] = useState('');
  const [accionesDisponibles, setAccionesDisponibles] = useState([]);
  const registrosPorPagina = 10;

  // Función para traducir acciones
  const traducirAccion = (accion) => {
    return TRADUCCIONES_ACCIONES[accion] || accion;
  };

  // Cargar acciones disponibles
  const cargarAcciones = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/audit/actions`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const acciones = Array.isArray(data.data) ? data.data : [];
        setAccionesDisponibles(acciones);
      }
    } catch (error) {
      console.warn('No se pudieron cargar acciones:', error);
    }
  };

  // Cargar registros desde el backend
  const cargarRegistros = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
      
      console.log('🚀 Frontend: Iniciando carga de registros...');
      console.log('🌐 Frontend: API_BASE:', API_BASE);
      
      const params = new URLSearchParams({
        page: pagina,
        limit: registrosPorPagina
      });
      
      console.log('🔍 Frontend: Preparando búsqueda con filtros aplicados:', {
        filtroAccionAplicado,
        filtroCapacitadorAplicado, 
        filtroFechaAplicado
      });
      
      if (filtroAccionAplicado) params.append('action', filtroAccionAplicado);
      if (filtroCapacitadorAplicado) params.append('trainerName', filtroCapacitadorAplicado);
      if (filtroFechaAplicado) {
        // Si ya es un objeto con inicio/fin, usar esos valores
        if (typeof filtroFechaAplicado === 'object' && filtroFechaAplicado.inicio) {
          console.log('📅 Frontend: Usando fechas pre-calculadas:', filtroFechaAplicado);
          params.append('startDate', filtroFechaAplicado.inicio);
          params.append('endDate', filtroFechaAplicado.fin);
        } else {
          // Fallback para compatibilidad
          const fecha = new Date(filtroFechaAplicado);
          const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
          const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
          fechaFin.setUTCHours(23, 59, 59, 999);
          
          console.log('📅 Frontend: Calculando fechas (fallback):', {
            fechaOriginal: filtroFechaAplicado,
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString()
          });
          
          params.append('startDate', fechaInicio.toISOString());
          params.append('endDate', fechaFin.toISOString());
        }
      }

      const response = await fetch(`${API_BASE}/audit/logs?${params}`, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🌐 Frontend: Respuesta del servidor:', response.status);
      
      if (response.status === 401) {
        console.error('❌ Frontend: No autorizado - verificar autenticación');
        // Intentar recargar la página o redirigir al login
        setRegistros([]);
        setTotalPaginas(1);
        setTotalRegistros(0);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Frontend: Datos recibidos:', data);
        setRegistros(data.data || []);
        setTotalPaginas(data.pagination?.pages || 1);
        setTotalRegistros(data.pagination?.total || 0);
      } else {
        console.error('❌ Frontend: Error en la respuesta:', response.status);
        setRegistros([]);
        setTotalPaginas(1);
        setTotalRegistros(0);
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
      setRegistros([]);
      setTotalPaginas(1);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAcciones();
    // Cargar registros iniciales sin filtros
    cargarRegistros();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await cargarRegistros();
    };
    loadData();
  }, [pagina, filtroAccionAplicado, filtroCapacitadorAplicado, filtroFechaAplicado]);

  const handleBuscarCapacitador = () => {
    console.log('🔍 Frontend: Búsqueda manual triggered');
    
    setFiltroCapacitadorAplicado(filtroCapacitador);
    setFiltroAccionAplicado(filtroAccion);
    
    // Manejar filtro de fecha correctamente
    if (filtroFecha) {
      const fechaInicio = new Date(filtroFecha);
      fechaInicio.setUTCHours(0, 0, 0, 0);
      
      const fechaFin = new Date(filtroFecha);
      fechaFin.setUTCHours(23, 59, 59, 999); // FIX: Hasta el final del día

      console.log('📅 Frontend: Filtro fecha aplicado', {
        fechaOriginal: filtroFecha,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      });
      
      setFiltroFechaAplicado({
        inicio: fechaInicio.toISOString(),
        fin: fechaFin.toISOString()
      });
    } else {
      setFiltroFechaAplicado(null);
    }
    
    setPagina(1); // Volver a la primera página cuando se busque
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '-';
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGenerarReportes = async () => {
    try {
      setLoading(true);
      console.log('📊 Frontend: Generando reporte Excel...');
      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
      
      const params = new URLSearchParams();
      
      // Aplicar los mismos filtros que usa la búsqueda
      if (filtroAccionAplicado) {
        params.append('action', filtroAccionAplicado);
        console.log('📊 Frontend: Filtro acción aplicado:', filtroAccionAplicado);
      }
      
      if (filtroCapacitadorAplicado) {
        params.append('trainerName', filtroCapacitadorAplicado);
        console.log('📊 Frontend: Filtro capacitador aplicado:', filtroCapacitadorAplicado);
      }
      
      if (filtroFechaAplicado) {
        // Si ya es un objeto con inicio/fin, usar esos valores
        if (typeof filtroFechaAplicado === 'object' && filtroFechaAplicado.inicio) {
          params.append('startDate', filtroFechaAplicado.inicio);
          params.append('endDate', filtroFechaAplicado.fin);
          console.log('📊 Frontend: Filtro fecha aplicado (objeto):', filtroFechaAplicado);
        } else {
          // Fallback para compatibilidad
          const fecha = new Date(filtroFechaAplicado);
          const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
          const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
          fechaFin.setUTCHours(23, 59, 59, 999);
          params.append('startDate', fechaInicio.toISOString());
          params.append('endDate', fechaFin.toISOString());
          console.log('📊 Frontend: Filtro fecha aplicado (fallback):', {
            fechaOriginal: filtroFechaAplicado,
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString()
          });
        }
      }

      console.log('📊 Frontend: Solicitando Excel con parámetros:', params.toString());
      const response = await fetch(`${API_BASE}/audit/export-excel?${params}`, { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-auditoria-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('✅ Frontend: Archivo Excel descargado exitosamente');
      } else {
        console.error('❌ Frontend: Error en respuesta del servidor:', response.status);
        alert('Error generando el reporte Excel. Inténtelo nuevamente.');
      }
    } catch (error) {
      console.error('❌ Frontend: Error generando reporte Excel:', error);
      alert('Error generando el reporte Excel. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h1 className="admin-title">Registros de actividad</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar por capacitador"
                value={filtroCapacitador}
                onChange={e => setFiltroCapacitador(e.target.value)}
                className="admin-search-input"
                style={{ flex: 1, minWidth: 0, width: '200px' }}
                onKeyPress={e => e.key === 'Enter' && handleBuscarCapacitador()}
              />
              <button className="admin-search-btn" title="Buscar" onClick={handleBuscarCapacitador}>
                🔎
              </button>
            </div>
            <select
              value={filtroAccion}
              onChange={e => setFiltroAccion(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #bdbdbd' }}
            >
              <option value="">Acción</option>
              {accionesDisponibles.map(accion => (
                <option key={accion} value={accion}>
                  {traducirAccion(accion)}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filtroFecha}
              onChange={e => setFiltroFecha(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #bdbdbd' }}
            />
            <button
              style={{ background: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 2rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginLeft: 'auto' }}
              onClick={handleGenerarReportes}
            >
              Generar Reportes
            </button>
          </div>
          <div style={{ background: '#1976d2', borderRadius: 0, color: 'white', display: 'flex', padding: '0.7rem 0.5rem' }}>
            <div style={{ flex: 2, textAlign: 'left', paddingLeft: '1rem' }}>Capacitadores</div>
            <div style={{ flex: 2, textAlign: 'left' }}>Acción</div>
            <div style={{ flex: 2, textAlign: 'left' }}>Fecha/Hora</div>
            <div style={{ flex: 1, textAlign: 'left' }}>DNI</div>
          </div>
          <div className="admin-table-wrapper registros-table" style={{ background: 'white', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minHeight: '120px' }}>
            {loading && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#757575' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <div>Cargando registros de auditoría...</div>
              </div>
            )}
            
            {!loading && registros.map((registro, idx) => (
              <div key={registro._id || registro.id || idx} className="registros-row" style={{ display: 'flex', alignItems: 'center', padding: '1rem 0.5rem', borderBottom: idx === registros.length - 1 ? 'none' : '1px solid #e0e0e0' }}>
                <div style={{ flex: 2, paddingLeft: '1rem' }}>
                  {registro.userSnapshot?.firstName && registro.userSnapshot?.lastName 
                    ? `${registro.userSnapshot.firstName} ${registro.userSnapshot.lastName}` 
                    : registro.userSnapshot?.email || 'Usuario desconocido'}
                </div>
                <div style={{ flex: 2 }}>{traducirAccion(registro.action) || registro.actionDescription || registro.action}</div>
                <div style={{ flex: 2 }}>{formatearFecha(registro.timestamp)}</div>
                <div style={{ flex: 1 }}>{registro.userSnapshot?.documentNumber || '-'}</div>
              </div>
            ))}
            
            {!loading && registros.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#757575' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                <div>No se encontraron registros de auditoría.</div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#999' }}>
                  Los registros aparecerán aquí cuando se realicen acciones en el sistema.
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', color: '#757575' }}>
            <span>Mostrando {((pagina - 1) * registrosPorPagina) + 1} a {Math.min(pagina * registrosPorPagina, totalRegistros)} de {totalRegistros} registros</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {[...Array(totalPaginas)].map((_, i) => (
                <button
                  key={i}
                  style={{
                    background: pagina === i + 1 ? '#bdbdbd' : '#f5f5f5',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.3rem 0.7rem',
                    cursor: 'pointer',
                    fontWeight: pagina === i + 1 ? 'bold' : 'normal',
                  }}
                  onClick={() => setPagina(i + 1)}
                  disabled={pagina === i + 1}
                >
                  {i + 1}
                </button>
              ))}
              {pagina < totalPaginas && (
                <button style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
              )}
            </div>
          </div>
        </div>
      </main>
      {loading && <LoadingOverlay />}
    </>
  );
}