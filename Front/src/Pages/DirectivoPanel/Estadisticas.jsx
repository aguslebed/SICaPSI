import React, { useState } from 'react';
import './DirectivoPanel.css';
import NavBar from '../../Components/Student/NavBar';

export default function Estadisticas() {
  const [loading] = useState(false);

  // Filtros generales
  const [generalSearch, setGeneralSearch] = useState('');
  const [generalCap, setGeneralCap] = useState('all');

  // Filtros individuales
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCap, setStudentCap] = useState('all');

  // Datos de ejemplo
  const generalRows = [
    { cap: 1, nivel: 'Nivel 1', vistos: '100%', completados: '100%', inicio: '31/07/2025' },
    { cap: 2, nivel: 'Nivel 2', vistos: '80%', completados: '75%', inicio: '25/08/2025' },
    { cap: 3, nivel: 'Nivel 3', vistos: '40%', completados: '20%', inicio: '23/08/2025' },
  ];

  const individualRows = [
    { nombre: 'Juan Juan', cap: 1, nivel: '2/3', intentos: 5, avance: '50%', duracion: '90 min.', inicio: '31/07/2025' },
    { nombre: 'Pedro Pedro', cap: 2, nivel: '3/3', intentos: 3, avance: '75%', duracion: '120 min.', inicio: '25/08/2025' },
    { nombre: 'Pepito Pepito', cap: 3, nivel: '1/3', intentos: 2, avance: '100%', duracion: '180 min.', inicio: '23/08/2025' },
  ];

  // --- FILTROS ---

  const filteredGeneral = generalRows.filter(r =>
    (generalCap === 'all' || r.cap === Number(generalCap)) &&
    (r.nivel.toLowerCase().includes(generalSearch.toLowerCase()) ||
     String(r.cap).includes(generalSearch))
  );

  const filteredIndividuals = individualRows.filter(r =>
    (studentCap === 'all' || r.cap === Number(studentCap)) &&
    (r.nombre.toLowerCase().includes(studentSearch.toLowerCase()) ||
     String(r.cap).includes(studentSearch))
  );

  return (
    <>
      {loading && <div className="loading-overlay">Cargando estadísticas...</div>}
      <NavBar />

      <main className="admin-container">
        <div className="admin-content-wrapper" style={{ maxWidth: 1100, margin: '1.25rem auto' }}>
          
          {/* --- PROGRESO GENERAL --- */}
          <h1 className="admin-title">Progreso General</h1>
          <hr className="admin-divider" />

          <section className="admin-card">
            <div className="admin-filters" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={generalSearch}
                  onChange={e => setGeneralSearch(e.target.value)}
                  placeholder="Buscar o filtrar por capacitación"
                  className="admin-search-input"
                  style={{ minWidth: '220px' }}
                />
                <select
                  value={generalCap}
                  onChange={e => setGeneralCap(e.target.value)}
                  className="admin-filter-input"
                  style={{ minWidth: '180px' }}
                >
                  <option value="all">Todas</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              <button className="admin-btn admin-btn-secondary">Exportar Datos</button>
            </div>

            <div className="admin-table-wrapper" style={{ marginTop: '1.25rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Capacitación</th>
                    <th>Nivel</th>
                    <th>%Vistos</th>
                    <th>Completados</th>
                    <th>Fecha de inicio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGeneral.length > 0 ? (
                    filteredGeneral.map((r, i) => (
                      <tr key={i}>
                        <td>{r.cap}</td>
                        <td>{r.nivel}</td>
                        <td>{r.vistos}</td>
                        <td>{r.completados}</td>
                        <td>{r.inicio}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No se encontraron resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* --- PROGRESO INDIVIDUAL --- */}
          <section style={{ marginTop: '2rem' }}>
            <h2 className="admin-title">Progreso Individual</h2>
            <hr className="admin-divider" />

            <div className="admin-card">
              <div className="admin-filters" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Buscar Alumno"
                    className="admin-search-input"
                    style={{ minWidth: '220px' }}
                  />
                  <select
                    value={studentCap}
                    onChange={e => setStudentCap(e.target.value)}
                    className="admin-filter-input"
                    style={{ minWidth: '180px' }}
                  >
                    <option value="all">Todas</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>

                <button className="admin-btn admin-btn-secondary">Exportar Datos</button>
              </div>

              <div className="admin-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Capacitación</th>
                      <th>Nivel</th>
                      <th>Nro.Intentos</th>
                      <th>Avance</th>
                      <th>Duración</th>
                      <th>Fecha de inicio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIndividuals.length > 0 ? (
                      filteredIndividuals.map((r, i) => (
                        <tr key={i}>
                          <td>{r.nombre}</td>
                          <td>{r.cap}</td>
                          <td>{r.nivel}</td>
                          <td>{r.intentos}</td>
                          <td>{r.avance}</td>
                          <td>{r.duracion}</td>
                          <td>{r.inicio}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center' }}>No se encontraron resultados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
