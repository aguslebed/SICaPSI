import React from "react";
import WelcomeModal from "../../../componentes/alumno/bienvenida";
import CapacitacionCard from "../../../componentes/alumno/capacitacion";
import Navbar from "../../../componentes/alumno/nvar"

// Panel principal de usuario
const PanelDeUsuario = () => {
  // Datos de ejemplo para las capacitaciones
  const capacitaciones = [
    {
      titulo: "Capacitación 1",
      subtitulo: "Edificio de departamentos",
      porcentaje: 59,
      estado: "activo",
      link: "/panel/capacitacion/1",
      imagen: "src/assets/capacitacion/departamentos.jpg",
      
    },
    {
      titulo: "Capacitación 2",
      subtitulo: "Barrio privado pequeño",
      porcentaje: 0,
      estado: "activo",
      link: "/panel/capacitacion/2",
      imagen: "src/assets/capacitacion/barrioPrivadoChico.jpg",
    },
    {
      titulo: "Capacitación 3",
      subtitulo: "Barrio privado grande",
      porcentaje: 0,
      estado: "desactivado",
      link: "/panel/capacitacion/3",
      imagen: "src/assets/capacitacion/barrioPrivadoGrande.jpg",
    },
    {
      titulo: "Capacitación 4",
      subtitulo: "Garita de seguridad",
      porcentaje: 0,
      estado: "desactivado",
      link: "/panel/capacitacion/4",
      imagen: "src/assets/capacitacion/garitaDeSeguridad.jpg",
    },
    {
      titulo: "Capacitación 5",
      subtitulo: "Pubs y discotecas",
      porcentaje: 0,
      estado: "desactivado",
      link: "/panel/capacitacion/5",
      imagen: "src/assets/capacitacion/pubsYDisco.jpg",
    },
  ];

  return (
    <>
      <Navbar />
      <WelcomeModal />
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
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {capacitaciones.map((cap, index) => (
              <CapacitacionCard key={index} {...cap} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelDeUsuario;
