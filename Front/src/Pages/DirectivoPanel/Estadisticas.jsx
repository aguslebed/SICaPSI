import React, { useEffect, useState } from 'react';
import './DirectivoPanel.css';
import NavBar from '../../Components/Student/NavBar';
import { getAllActiveTrainings, getStudents, getTrainingProgress } from '../../API/Request';

export default function Estadisticas() {
  const [loading, setLoading] = useState(false);

  // Filtros generales
  const [generalSearch, setGeneralSearch] = useState('');
  const [generalCap, setGeneralCap] = useState('all');

  // Filtros individuales
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCap, setStudentCap] = useState('all');

  // Datos
  const [individualRows, setRowsRaw] = useState([]);

  const generalRows = [
    { cap: 1, nivel: 'Nivel 1', vistos: '100%', completados: '100%', inicio: '31/07/2025' },
    { cap: 2, nivel: 'Nivel 2', vistos: '80%', completados: '75%', inicio: '25/08/2025' },
    { cap: 3, nivel: 'Nivel 3', vistos: '40%', completados: '20%', inicio: '23/08/2025' },
  ];

  // --- FILTROS ---
  const filteredGeneral = generalRows.filter(r =>
    (generalCap === 'all' || r.cap === Number(generalCap)) &&
    (r.nivel.toLowerCase().includes(generalSearch.toLowerCase()) ||
      String(r.cap).includes(generalSearch))
  );

  const filteredIndividuals = individualRows.filter(r =>
    (studentCap === 'all' || r.cap.includes(studentCap)) &&
    (r.nombre.toLowerCase().includes(studentSearch.toLowerCase()) ||
      r.cap.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {

        const data = await getStudents();
        const students = Array.isArray(data) ? data : (data?.items || []);
        const activeTrainings = await getAllActiveTrainings();

        // Crear un mapa para lookup rápido de títulos por ID
        const activeTrainingMap = new Map(activeTrainings.map(t => [t._id, t.title]));
        const promises = [];

        for (const student of students) {
          for (const trainingId of student.assignedTraining || []) {
            // Filtrar solo trainings activos
            if (activeTrainingMap.has(trainingId)) {
              promises.push(
                getTrainingProgress(trainingId, student._id).then(response => ({
                  student,
                  trainingId,
                  response
                }))
              );
            }
          }
        }

        // 3️⃣ Ejecutar todas las llamadas en paralelo
        const results = await Promise.all(promises);

        // 4️⃣ Mapear resultados en formato de tabla
        const progressData = results
          .filter(r => r.response?.success)
          .map(({ student, trainingId, response }) => ({
            nombre: `${student.firstName} ${student.lastName}`,
            cap: activeTrainingMap.get(trainingId) || trainingId, // Mostrar título si activo, sino ID
            nivel: `${response.data.levelsCompleted}/${response.data.totalLevels}`,
            intentos: Math.floor(Math.random() * 5) + 1, // simulado
            avance: `${response.data.progressPercent}%`,
            duracion: `${Math.floor(Math.random() * 120) + 60} min.`,
            inicio: student.createdAt, // placeholder
          }));

        // 5️⃣ Actualizar estado
        if (alive) setRowsRaw(progressData);
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        if (alive) setRowsRaw([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // --- RENDER ---
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
                      {/* <th>Nro.Intentos</th> */}
                      <th>Avance</th>
                      {/* <th>Duración</th> */}
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
                          {/* <td>{r.intentos}</td> */}
                          <td>{r.avance}</td>
                          {/* <td>{r.duracion}</td> */}
                          <td>{r.inicio ? new Date(r.inicio).toLocaleDateString() : '-'}</td>
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
