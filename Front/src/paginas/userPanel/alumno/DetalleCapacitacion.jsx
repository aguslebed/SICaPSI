import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../../componentes/alumno/nvar";
import MenuVertical from "../../../componentes/alumno/MenuVertical";
const capacitaciones = [
  {
    id: 1,
    titulo: "Capacitación 1",
    subtitulo: "Edificio de departamentos",
    porcentaje: 50,
    imagen: "/src/assets/capacitacion/departamentos.jpg",
  },
  {
    id: 2,
    titulo: "Capacitación 2",
    subtitulo: "Barrio privado pequeño",
    porcentaje: 0,
    imagen: "/src/assets/capacitacion/barrioPrivadoChico.jpg",
  },
  {
    id: 3,
    titulo: "Capacitación 3",
    subtitulo: "Barrio privado grande",
    porcentaje: 0,
    imagen: "/src/assets/capacitacion/barrioPrivadoGrande.jpg",
  },
  {
    id: 4,
    titulo: "Capacitación 4",
    subtitulo: "Garita de seguridad",
    porcentaje: 0,
    imagen: "/src/assets/capacitacion/garitaDeSeguridad.jpg",
  },
  {
    id: 5,
    titulo: "Capacitación 5",
    subtitulo: "Pubs y discotecas",
    porcentaje: 0,
    imagen: "/src/assets/capacitacion/pubsYDisco.jpg",
  },
];

const DetalleCapacitacion = () => {
  const { id=1 } = useParams();
  const cap = capacitaciones.find((c) => c.id === Number(id));
  if (!cap) {
    return <p className="text-center mt-20">Capacitación no encontrada</p>;
  }

  return (
    <>
      <Navbar />
    <div className="flex">
      <MenuVertical />

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Imagen y título */}
          <div
            className="h-48 bg-black bg-center bg-cover flex flex-col justify-center text-white px-8"
            style={{ backgroundImage: `url(${cap.imagen})` }}
          >
            <h1 className="text-3xl font-bold">{cap.titulo}</h1>
            <p className="text-lg">{cap.subtitulo}</p>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 h-6">
            <div
              className="bg-green-500 h-6 text-center text-sm font-semibold text-white"
              style={{ width: `${cap.porcentaje}%` }}
            >
              {cap.porcentaje}%
            </div>
          </div>

          {/* Descripción */}
          <div className="p-6">
            <h2 className="font-semibold mb-2">Descripción de la capacitación</h2>
            <p>Texto que va a pasar Paula</p>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default DetalleCapacitacion;
