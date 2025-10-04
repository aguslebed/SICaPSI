import { useEffect, useMemo, useState } from "react";
import "./gestionPanel.css";
import NavBar from "../../Components/Student/NavBar";
import { useNavigate } from "react-router-dom";
import { listTeachers, setTeacherStatus } from "../../API/Request";
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";

// Pill de estado
function Chip({ estado }) {
  const ok = estado === "disponible";
  return (
    <span className={`chip ${ok ? "chip--ok" : "chip--off"}`}>
      {ok ? "Disponible" : "Deshabilitado"}
    </span>
  );
}

export default function GestionProfesores() {
  const navigate = useNavigate();

  // filtros
  const [search, setSearch] = useState("");
  const [filtrarDisponible, setFD] = useState(true);
  const [filtrarDeshabilitado, setFDes] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // datos
  const [rowsRaw, setRowsRaw] = useState([]);

  // loading
  const [loading, setLoading] = useState(false);

  // paginado
  const [page, setPage] = useState(1);
  const size = 10;

  // cargar desde backend
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const data = await listTeachers(); // [] o {items:[]}
        // CAMBIO: Mapeo actualizado para usar los campos correctos del backend
        // Ahora usa los campos estándar del modelo User actualizado
        const mapped = (data || []).map((r) => ({
          id: r._id || r.id, // Usar _id de MongoDB como principal
          nombre: r.firstName, // Campo estándar del modelo
          apellido: r.lastName, // Campo estándar del modelo
          email: r.email,
          dni: r.documentNumber, // Campo correcto del modelo User
          estado: r.status === "available" ? "disponible" : "deshabilitado", // Mapear status del modelo
          creado: r.createdAt, // Campo estándar de timestamps
          curso: r.assignedTraining && r.assignedTraining.length > 0
            ? r.assignedTraining.map(training => training.title || training.subtitle).filter(Boolean)
            : ["–"], // Mapear cursos asignados
        }));
        if (alive) setRowsRaw(mapped);
      } catch {
        // Silenciar errores y mostrar vacío hasta que el back esté listo
        if (alive) setRowsRaw([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // aplicar filtros (en memoria)
  const filtrados = useMemo(() => {
    let rows = [...rowsRaw];

    // texto
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        [r.nombre, r.apellido, r.email, r.dni, ...(r.curso || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // estado
    rows = rows.filter((r) => {
      if (r.estado === "disponible" && !filtrarDisponible) return false;
      if (r.estado === "deshabilitado" && !filtrarDeshabilitado) return false;
      return true;
    });

    // fechas
    if (desde || hasta) {
      rows = rows.filter((r) => {
        const d = r.creado ? new Date(r.creado) : null;
        if (!d || isNaN(d)) return true;
        if (desde && d < new Date(desde)) return false;
        if (hasta && d > new Date(hasta)) return false;
        return true;
      });
    }
    return rows;
  }, [rowsRaw, search, filtrarDisponible, filtrarDeshabilitado, desde, hasta]);

  const total = filtrados.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const pageRows = useMemo(() => {
    const start = (page - 1) * size;
    return filtrados.slice(start, start + size);
  }, [filtrados, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filtrarDisponible, filtrarDeshabilitado, desde, hasta]);

  function limpiar() {
    setSearch("");
    setFD(true);
    setFDes(true);
    setDesde("");
    setHasta("");
  }

  return (
    <>
      {loading && <LoadingOverlay label="Cargando profesores..." />}
      <NavBar />

      <div className="gp-wrap gp-afterHeader">
        <h1 className="gp-title">Gestión de Profesores</h1>

        {/* Filtros */}
        <section className="gp-filters">
          <div className="gp-col">
            <div className="gp-label">Buscar</div>
            <div className="gp-search">
              <input
                className="gp-input"
                placeholder="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="gp-btn gp-btn--icon">🔎</button>
            </div>
            <div className="gp-actions">
              <button className="gp-btn gp-btn--primary">Aplicar Filtros</button>
              <button className="gp-btn" onClick={limpiar}>
                Limpiar Filtros
              </button>
            </div>
          </div>

          <div className="gp-col">
            <div className="gp-label">Estado</div>
            <div className="gp-card">
              <label className="gp-check">
                <input
                  type="checkbox"
                  checked={filtrarDisponible}
                  onChange={(e) => setFD(e.target.checked)}
                />
                <span>Disponible</span>
              </label>
              <label className="gp-check">
                <input
                  type="checkbox"
                  checked={filtrarDeshabilitado}
                  onChange={(e) => setFDes(e.target.checked)}
                />
                <span>Deshabilitado</span>
              </label>
            </div>
          </div>

          <div className="gp-col">
            <div className="gp-label">Fecha de creación</div>
            <div className="gp-card gp-grid2">
              <label className="gp-stack">
                <span>Desde</span>
                <input
                  type="date"
                  className="gp-input"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                />
              </label>
              <label className="gp-stack">
                <span>Hasta</span>
                <input
                  type="date"
                  className="gp-input"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="gp-tableCard">
          <table className="gp-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>DNI</th>
                <th>Estado</th>
                <th>Fecha de creación</th>
                <th>Curso Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan="8" className="gp-empty">Sin resultados</td>
                </tr>
              )}
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>{r.apellido}</td>
                  <td>{r.email}</td>
                  <td>{r.dni}</td>
                  <td><Chip estado={r.estado} /></td>
                  <td>{r.creado ? new Date(r.creado).toLocaleDateString() : "-"}</td>
                  <td>{r.curso?.map((c, i) => <div key={i}>{c}</div>)}</td>
                  <td className="gp-actionsRow">
                    {/* Editar */}
                    <button
                      className="gp-iconBtn"
                      title="Editar"
                      onClick={() => navigate(`/adminPanel/gestionProfesores/editar/${r.id}`)}
                    >
                      ✏️
                    </button>

                    <button
                      className="gp-iconBtn"
                      title={r.estado === "disponible" ? "Bloquear" : "Habilitar"}
                      onClick={async () => {
                        // CAMBIO: Actualización de la lógica para usar los valores correctos del backend
                        const toStatus = r.estado === "disponible" ? "disabled" : "available";
                        const label = r.estado === "disponible" ? "bloquear" : "habilitar";
                        if (!window.confirm(`¿Seguro querés ${label} a ${r.nombre} ${r.apellido}?`)) return;

                        const prev = [...rowsRaw];
                        // Actualizar el estado local optimistamente
                        const next = prev.map((it) =>
                          it.id === r.id
                            ? { ...it, estado: toStatus === "available" ? "disponible" : "deshabilitado" }
                            : it
                        );
                        setRowsRaw(next);

                        try {
                          await setTeacherStatus(r.id, toStatus);
                        } catch {
                          alert("No se pudo cambiar el estado. Se revierte.");
                          setRowsRaw(prev); // Revertir en caso de error
                        }
                      }}
                    >
                      {r.estado === "disponible" ? "🚫" : "✅"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="gp-pager">
            <button className="gp-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </button>
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                className={`gp-btn gp-pageBtn ${page === i + 1 ? "is-active" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="gp-btn" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </button>
          </div>
        </section>
      </div>
    </>
  );
}