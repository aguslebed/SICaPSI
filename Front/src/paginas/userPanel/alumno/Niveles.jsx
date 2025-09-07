import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, CheckCircle, Lock, BookOpen, PlayCircle } from "lucide-react";
import Navbar from "../../../componentes/alumno/nvar";
import MenuVertical from "../../../componentes/alumno/MenuVertical";

const Niveles = () => {
  const [openLevel, setOpenLevel] = useState(null);

  const niveles = [
    { id: 1, titulo: "Nivel 1", completado: true },
    { id: 2, titulo: "Nivel 2", completado: false },
    { id: 3, titulo: "Nivel 3", completado: false, bloqueado: true },
  ];

  const toggleNivel = (id) => {
    if (openLevel === id) {
      setOpenLevel(null);
    } else {
      setOpenLevel(id);
    }
  };
      
  {/* Links */}
  const Linkbibliografia = () => {
       window.location.href = "/panel/capacitacion/1/niveles/bibliografia";
   };
  
   const LinkCapacitación = () => {
       window.location.href = "/panel/capacitacion/1/niveles/capacitacion";
  };
  
  const LinkEvaluación = () => {
       window.location.href = "/panel/capacitacion/1/niveles/evaluacion";
  };


  return (
    <>
    <Navbar />
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <MenuVertical />


      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Niveles</h1>

        <div className="space-y-4">
          {niveles.map((nivel) => (
            <div key={nivel.id} className="border rounded-lg bg-white shadow">
              {/* Encabezado nivel */}
              <div
                className={`flex justify-between items-center px-6 py-3 cursor-pointer transition 
                  ${nivel.bloqueado ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-100"}`}
                onClick={() => !nivel.bloqueado && toggleNivel(nivel.id)}
              >
                <span className="font-semibold">{nivel.titulo}</span>

                <div className="flex items-center gap-2">
                  {nivel.completado && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {nivel.bloqueado && (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <ChevronDown
                    className={`w-5 h-5 transform transition-transform ${
                      openLevel === nivel.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Contenido desplegable */}
              {openLevel === nivel.id && !nivel.bloqueado && (
                <div className="px-6 py-4 space-y-3 bg-blue-50">
                  <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition hover:cursor-pointer"
                  onClick={Linkbibliografia}>
                    <BookOpen className="w-5 h-5" />
                    Bibliografía
                    
                  </button>

                  <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition hover:cursor-pointer"
                  onClick={LinkCapacitación}>
                    <PlayCircle className="w-5 h-5" />
                    Capacitación
                  </button>

                  <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition hover:cursor-pointer"
                  onClick={LinkEvaluación}>
                    Iniciar evaluación del {nivel.titulo}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
    </>
  );
};

export default Niveles;
