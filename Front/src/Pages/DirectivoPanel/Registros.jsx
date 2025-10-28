import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/Student/NavBar';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './DirectivoPanel.css';
import '../AdminPanel/AdminPanel.css';

export default function Registros() {
  const [loading, _setLoading] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroCapacitador, setFiltroCapacitador] = useState('');
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 3;

  useEffect(() => {
    // Aquí se cargarían los registros de la base de datos
    // Por ahora usaremos datos de ejemplo
    setRegistros([
      { id: 1, capacitador: 'Juan Perez', accion: 'Inicio de sesión', fecha: '19/08/2025 - 13:33', dni: '22333444' },
      { id: 2, capacitador: 'Pedro Pascal', accion: 'Inicio de sesión', fecha: '19/08/2025 - 13:33', dni: '55666777' },
      { id: 3, capacitador: 'Admin', accion: 'Exportación de informe', fecha: '19/08/2025 - 13:33', dni: '111111111' },
      // ...puedes agregar más registros reales aquí
    ]);
  }, []);

  const registrosFiltrados = registros.filter(registro => {
    const cumpleCapacitador = !filtroCapacitador || registro.capacitador.toLowerCase().includes(filtroCapacitador.toLowerCase());
    const cumpleAccion = !filtroAccion || registro.accion.toLowerCase().includes(filtroAccion.toLowerCase());
    const cumpleFecha = !filtroFecha || registro.fecha.includes(filtroFecha);
    return cumpleCapacitador && cumpleAccion && cumpleFecha;
  });

  const totalRegistros = registrosFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const registrosPagina = registrosFiltrados.slice((pagina - 1) * registrosPorPagina, pagina * registrosPorPagina);

  const handleGenerarReportes = () => {
    // Implementar funcionalidad de generación de reportes
    alert('Funcionalidad de generación de reportes pendiente');
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
              />
              <button className="admin-search-btn" title="Buscar" onClick={() => { /* opcional: disparar búsqueda */ }}>
                🔎
              </button>
            </div>
            <select
              value={filtroAccion}
              onChange={e => setFiltroAccion(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #bdbdbd' }}
            >
              <option value="">Acción</option>
              <option value="Inicio de sesión">Inicio de sesión</option>
              <option value="Exportación de informe">Exportación de informe</option>
              {/* Agrega más acciones si lo necesitas */}
            </select>
            <select
              value={filtroFecha}
              onChange={e => setFiltroFecha(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #bdbdbd' }}
            >
              <option value="">Fecha</option>
              {/* Genera opciones de fecha únicas */}
              {[...new Set(registros.map(r => r.fecha))].map(fecha => (
                <option key={fecha} value={fecha}>{fecha}</option>
              ))}
            </select>
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
              {registrosPagina.map((registro, idx) => (
              <div key={registro.id} className="registros-row" style={{ display: 'flex', alignItems: 'center', padding: '1rem 0.5rem', borderBottom: idx === registrosPagina.length - 1 ? 'none' : '1px solid #e0e0e0' }}>
                <div style={{ flex: 2, paddingLeft: '1rem' }}>{registro.capacitador}</div>
                <div style={{ flex: 2 }}>{registro.accion}</div>
                <div style={{ flex: 2 }}>{registro.fecha}</div>
                <div style={{ flex: 1 }}>{registro.dni}</div>
              </div>
            ))}
            {registrosPagina.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#757575' }}>No se encontraron registros.</div>
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