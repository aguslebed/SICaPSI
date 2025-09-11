import React from "react";
import WelcomeModal from "../../../componentes/alumno/bienvenida";
import CapacitacionCard from "../../../componentes/alumno/capacitacion";
import Navbar from "../../../componentes/alumno/nvar";
import { useUser } from "../../../context/UserContext";

// Panel principal de usuario
const PanelDeUsuario = () => {
  const { userData } = useUser();

  // Si los datos aún no están cargados
  if (!userData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Cargando datos de usuario...</h2>
            <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  // Cursos del usuario
  const cursos = userData.data?.cursos || [];

  // Renderizar solo los datos requeridos
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Encabezado */}
          <div className="text-left mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Capacitaciones
            </h1>
            <p className="text-gray-600 text-lg">
              Selecciona una capacitación para continuar tu entrenamiento
            </p>
          </div>

          {/* Grid de capacitaciones */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {cursos.length > 0 ? (
              cursos.map((curso) => (
                <CapacitacionCard
                  key={curso._id}
                  titulo={curso.title}
                  subtitulo={curso.subtitle}
                  porcentaje={0} // Si tienes el progreso, puedes calcularlo aquí
                  estado={curso.isActive ? "activo" : "desactivado"}
                  link={`/panel/capacitacion/${curso._id}`}
                  imagen={curso.image}
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">No tienes cursos asignados.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelDeUsuario; 