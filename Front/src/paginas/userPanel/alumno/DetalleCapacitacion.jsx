import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../../componentes/alumno/nvar";
import MenuVertical from "../../../componentes/alumno/MenuVertical";
import { useUser } from "../../../context/UserContext";

const DetalleCapacitacion = () => {
  const { id } = useParams();
  const { userData } = useUser();

  if (!userData || !userData.data || !Array.isArray(userData.data.cursos)) {
    return <div className="text-center mt-20">Cargando datos de curso...</div>;
  }
  console.log("DATOS: ", userData.data)
  const curso = userData.data.cursos.find(c => c._id === id);
  if (!curso) return <p className="text-center mt-20">Capacitación no encontrada</p>;

  // Progreso del usuario en este curso
  const progresoCurso = (userData.data.progreso || []).find(p => p.courseId?._id === id);
  const porcentaje = progresoCurso?.totalProgress || 0;

  return (
    <>
      <Navbar />
      <div className="flex">
        <MenuVertical />
        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Imagen y título */}
            <div
              className="h-48 bg-black bg-center bg-cover flex flex-col justify-center text-white px-8"
              style={{ backgroundImage: `url(${curso.image})` }}
            >
              <h1 className="text-3xl font-bold">{curso.title}</h1>
              <p className="text-lg">{curso.subtitle}</p>
            </div>
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 h-6">
              <div
                className="bg-green-500 h-6 text-center text-sm font-semibold text-white"
                style={{ width: `${porcentaje}%` }}
              >
                {porcentaje}%
              </div>
            </div>
            {/* Descripción */}
            <div className="p-6">
              <h2 className="font-semibold mb-2">Descripción de la capacitación</h2>
              <p>{curso.description}</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DetalleCapacitacion;
