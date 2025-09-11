import React from "react";
import { useParams } from "react-router-dom";
import MenuVertical from "../../../componentes/alumno/MenuVertical";
import Navbar from "../../../componentes/alumno/nvar";
import { useUser } from "../../../context/UserContext";

const NivelCapacitacion = () => {
  const { id, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData) return <div>Cargando...</div>;

  const curso = userData.cursos.find(c => c._id === id);
  const nivel = curso?.levels.find(l => l._id === nivelId);
  const videoUrl = nivel?.training?.videoUrl;
  const descripcion = nivel?.training?.description;

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
