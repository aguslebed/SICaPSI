import React from "react";
import { Link, useParams } from "react-router-dom";
import MenuVertical from "../../../componentes/alumno/MenuVertical";
import Navbar from "../../../componentes/alumno/nvar";

const NivelCapacitacion = () => {
  const { id, nivelId } = useParams();

  // 🔹 Datos simulados (estos vendrán de backend en el futuro)
  const nivel = {
    titulo: `Nivel ${nivelId} - Capacitación`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Ejemplo
    descripcion: "Descripción del nivel con los temas que verás en la capacitación.",
  };

  return (
    <>
    <Navbar />
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <MenuVertical />

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{nivel.titulo}</h1>

        {/* Video */}
        <div className="bg-black rounded-lg overflow-hidden shadow-md mb-6">
          <video controls className="w-full max-w-3xl mx-auto">
            <source src={nivel.videoUrl} type="video/mp4" />
            Tu navegador no soporta videos en HTML5.
          </video>
        </div>

        {/* Descripción */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-semibold text-lg mb-2">Descripción del nivel</h2>
          <p className="text-gray-700">{nivel.descripcion}</p>
        </div>
      </main>
    </div>
    </>
  );
};

export default NivelCapacitacion;
