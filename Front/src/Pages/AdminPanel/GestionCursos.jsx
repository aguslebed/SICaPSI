import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import NavBar from '../../Components/Student/NavBar';
import OpenCohortModal from '../../Components/Modals/OpenCohortModal';
import CreateTrainingModal from '../../Components/Modals/CreateTrainingModal';
import { useState, useEffect } from 'react';
import { getAllActiveTrainings } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import './AdminPanel.css';

export default function GestionCursos() {
  const [openCohorte, setOpenCohorte] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para los dropdowns
  const [nivelMenu, setNivelMenu] = useState(false);
  const [estadoMenu, setEstadoMenu] = useState(false);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState([]);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);

  const niveles = [
    { label: 'Nivel 1', value: 'nivel1' },
    { label: 'Nivel 2', value: 'nivel2' },
    { label: 'Nivel 3', value: 'nivel3' },
  ];

  const estadosOpciones = [
    { label: 'Asignado', value: 'asignado' },
    { label: 'Sin asignar', value: 'sin_asignar' },
  ];

  // Funciones para manejar cambios en los checkboxes
  const handleNivelChange = (nivelValue) => {
    setNivelesSeleccionados(prev => {
      if (prev.includes(nivelValue)) {
        return prev.filter(n => n !== nivelValue);
      } else {
        return [...prev, nivelValue];
      }
    });
  };

  const handleEstadoChange = (estadoValue) => {
    setEstadosSeleccionados(prev => {
      if (prev.includes(estadoValue)) {
        return prev.filter(e => e !== estadoValue);
      } else {
        return [...prev, estadoValue];
      }
    });
  };

  // sample profesores placeholder (could come from API later)
  const sampleProfesores = [
    { _id: 'p1', displayName: 'Juan Perez (Disponible)' },
    { _id: 'p2', displayName: 'Pedro Pascal' },
  ];

  useEffect(() => {
    let mounted = true;
    const fetchTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllActiveTrainings();
        // backend may return an array or { items: [] }
        const items = Array.isArray(data) ? data : (data?.items || []);
        if (mounted) setTrainings(items);
      } catch (err) {
        console.error('Error fetching trainings', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTrainings();
    return () => { mounted = false; };
  }, []);
  const [openCreateTraining, setOpenCreateTraining] = useState(false);
  return (
    <>
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h1 className="admin-title">Gestión de cursos</h1>
          <hr className="admin-divider" />

          <section className="admin-card">
            <div className="admin-filters" style={{ alignItems: 'flex-start' }}>
            {/* Búsqueda y Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 'fit-content' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Buscar curso"
                  className="admin-search-input"
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button className="admin-search-btn" title="Buscar">
                  🔎
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }}>
                  Aplicar Filtros
                </button>
                <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }}>
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="admin-filter-group admin-dropdown">
              <button onClick={() => setNivelMenu(!nivelMenu)} className="admin-dropdown-btn">
                Nivel
                <img width="14" height="14" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
              </button>
              {nivelMenu && (
                <div className="admin-dropdown-menu">
                  {niveles.map((n) => (
                    <label key={n.value} className="admin-dropdown-item">
                      <span
                        onClick={() => handleNivelChange(n.value)}
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
                        {nivelesSeleccionados.includes(n.value) && (
                          <span style={{ fontSize: 12, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </span>
                      {n.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

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

            {/* Acciones - Botones a la derecha */}
            <div className="admin-filter-group" style={{ marginLeft: 'auto' }}>
              <div className="admin-actions">
                <button onClick={() => setOpenCohorte(true)} className="admin-btn admin-btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>
                  Abrir Cohorte
                </button>
                <button onClick={() => setOpenCreateTraining(true)} className="admin-btn admin-btn-success" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>
                  Crear Capacitación
                </button>
              </div>
            </div>
          </div>

          <section style={{ marginTop: '1.5rem' }}>
            <div className="admin-table-wrapper">
            {loading && <LoadingOverlay label="Cargando capacitaciones..." />}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Capacitación</th>
                  <th>Nivel</th>
                  <th>Profesor Asignado</th>
                  <th>Cupos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(!trainings || trainings.length === 0) && !loading ? (
                  <tr>
                    <td className="admin-empty" colSpan={6}>
                      No hay cursos para mostrar.
                    </td>
                  </tr>
                ) : (
                  trainings.map((t) => {
                    const firstLevel = t.levels && t.levels.length ? (t.levels[0].levelNumber || t.levels[0].levelNumber) : null;
                    const nivelLabel = firstLevel ? `Nivel ${firstLevel}` : (t.totalLevels ? `Nivel 1` : '—');
                    const profesor = t.createdBy ? `${t.createdBy.firstName || ''} ${t.createdBy.lastName || ''}`.trim() : '-';
                    const estado = t.createdBy ? 'Asignado' : 'Sin asignar';
                    return (
                      <tr key={t._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{t.title}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{t.subtitle}</div>
                        </td>
                        <td>{nivelLabel}</td>
                        <td>{profesor || '-'}</td>
                        <td>-</td>
                        <td style={{ color: estado === 'Asignado' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                          {estado}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-btn admin-btn-sm" style={{ backgroundColor: 'var(--warning-color)', color: 'white' }}>
                              Editar
                            </button>
                            <button className="admin-btn admin-btn-danger admin-btn-sm">
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

        <Outlet />
        </div>
      </main>
      <OpenCohortModal
        open={openCohorte}
        onClose={() => setOpenCohorte(false)}
        cursos={trainings}
        profesores={sampleProfesores}
        onSave={(payload) => console.log('Guardar cohorte', payload)}
      />
      <CreateTrainingModal
        open={openCreateTraining}
        onClose={() => setOpenCreateTraining(false)}
        onSave={(payload) => console.log('Crear capacitación', payload)}
      />
    </>
  );
}

