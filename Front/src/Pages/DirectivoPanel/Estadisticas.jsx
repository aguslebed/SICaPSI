import React, { useEffect, useState } from 'react';
import './DirectivoPanel.css';
import NavBar from '../../Components/Student/NavBar';
import { getAllActiveTrainings, getAllTrainingsProgress, getStudents, getTrainingProgress } from '../../API/Request';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';

export default function Estadisticas() {
  const [loading, setLoading] = useState(false);
  const [generalSearch, setGeneralSearch] = useState('');
  const [generalCap, setGeneralCap] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCap, setStudentCap] = useState('all');
  const [individualRows, setRowsRaw] = useState([]);
  const [generalRows, setGeneralRows] = useState([]);

  const filteredGeneral = generalRows.filter(r =>
    (generalCap === 'all' || r.cap === generalCap) &&
    (r.nivel.toLowerCase().includes(generalSearch.toLowerCase()) ||
      String(r.cap).includes(generalSearch))
  );

  const filteredIndividuals = individualRows.filter(r =>
    (studentCap === 'all' || r.cap.includes(studentCap)) &&
    (r.nombre.toLowerCase().includes(studentSearch.toLowerCase()) ||
      r.cap.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const generateGeneralPDF = () => {
    const doc = new jsPDF();
    doc.text('Progreso General de Capacitaciones', 20, 10);
    autoTable(doc, {
      head: [['Capacitación', 'Total Niveles', 'Usuarios', '%Completados', 'Total Niveles Completados']],
      body: filteredGeneral.map(row => [row.cap, row.nivel, row.usuarios, row.vistos, row.completados]),
    });
    doc.save('progreso_general.pdf');
  };

  const generateIndividualPDF = () => {
    const doc = new jsPDF();
    doc.text('Progreso Individual de Estudiantes', 20, 10);
    autoTable(doc, {
      head: [['Nombre', 'Capacitación', 'Nivel', 'Avance', 'Fecha de inicio']],
      body: filteredIndividuals.map(row => [row.nombre, row.cap, row.nivel, row.avance, row.inicio ? new Date(row.inicio).toLocaleDateString() : '-']),
    });
    doc.save('progreso_individual.pdf');
  };

  const handleExportPending = () => {
    alert('Funcionalidad pendiente');
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const trainingsProgress = await getAllTrainingsProgress();
        const activeTrainings = await getAllActiveTrainings();

        const activeTrainingIds = new Set(activeTrainings.map(t => t._id));
        const filteredProgress = trainingsProgress.data.filter(tp => activeTrainingIds.has(tp.trainingId));
        const activeTrainingMap = new Map(activeTrainings.map(t => [t._id, t.title]));

        const generalData = filteredProgress.map(tp => ({
          cap: activeTrainingMap.get(tp.trainingId) || tp.trainingId,
          nivel: `${tp.totalLevels}`,
          vistos: `${tp.averagePercent}%`,
          usuarios: `${tp.totalUsers}`,
          completados: `${tp.totalLevelsCompleted}/${tp.totalUsers * tp.totalLevels}`,
        })).sort((a, b) => a.cap.localeCompare(b.cap));

        if (alive) setGeneralRows(generalData);

        const data = await getStudents();
        const students = Array.isArray(data) ? data : (data?.items || []);
        const promises = [];

        for (const student of students) {
          for (const trainingId of student.assignedTraining || []) {
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

        const results = await Promise.all(promises);
        const progressData = results
          .filter(r => r.response?.success)
          .map(({ student, trainingId, response }) => ({
            nombre: `${student.firstName} ${student.lastName}`,
            cap: activeTrainingMap.get(trainingId) || trainingId,
            nivel: `${response.data.levelsCompleted}/${response.data.totalLevels}`,
            avance: `${response.data.progressPercent}%`,
            inicio: student.createdAt,
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        if (alive) setRowsRaw(progressData);
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        if (alive) {
          setRowsRaw([]);
          setGeneralRows([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {loading && <LoadingOverlay label="Cargando estadísticas..." />}
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
                  <option value="Capacitación 1">1</option>
                  <option value="Capacitación 2">2</option>
                  <option value="Capacitación 3">3</option>
                </select>
              </div>
            <button className="admin-btn admin-btn-secondary" onClick={handleExportPending}>Exportar Datos</button>
            </div>
            <div className="admin-table-wrapper" style={{ marginTop: '1.25rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Capacitación</th>
                    <th>Total Niveles</th>
                    <th>Usuarios</th>
                    <th>%Completados</th>
                    <th>Total Niveles Completados</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGeneral.length > 0 ? (
                    filteredGeneral.map((r, i) => (
                      <tr key={i}>
                        <td>{r.cap}</td>
                        <td>{r.nivel}</td>
                        <td>{r.usuarios}</td>
                        <td>{r.vistos}</td>
                        <td>{r.completados}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No se encontraron resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Botones debajo de la tabla */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="admin-btn admin-btn-primary" onClick={generateGeneralPDF}>Generar PDF</button>
              {/* <button className="admin-btn admin-btn-primary" onClick={handleExportPending}>Exportar Datos</button> */}
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
                <button className="admin-btn admin-btn-secondary" onClick={handleExportPending}>Exportar Datos</button>
              </div>

              <div className="admin-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Capacitación</th>
                      <th>Nivel</th>
                      <th>Avance</th>
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
                          <td>{r.avance}</td>
                          <td>{r.inicio ? new Date(r.inicio).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center' }}>No se encontraron resultados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Botones debajo de la tabla */}
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="admin-btn admin-btn-primary" onClick={generateIndividualPDF}>Generar PDF</button>
                {/* <button className="admin-btn admin-btn-primary" onClick={handleExportPending}>Exportar Datos</button> */}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
