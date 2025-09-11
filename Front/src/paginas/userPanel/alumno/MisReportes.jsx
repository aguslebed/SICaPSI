import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../componentes/alumno/nvar"
import MenuVertical from "../../../componentes/alumno/MenuVertical";


import { useUser } from "../../../context/UserContext";
const MisReportes = () => {
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const { userData } = useUser();
  const reportes = userData?.reportes || [];

  return (
    <><Navbar />
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <MenuVertical />

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Mis reportes (HU-11 Alumno)
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Nivel</th>
                <th className="py-3 px-4 text-left">Puntaje</th>
                <th className="py-3 px-4 text-left">Errores</th>
                <th className="py-3 px-4 text-left">Video</th>
                <th className="py-3 px-4 text-left">Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">{reporte.nivel}</td>
                  <td className="py-2 px-4">
                    {reporte.puntaje !== null ? reporte.puntaje : "-"}
                  </td>
                  <td className="py-2 px-4">
                    {reporte.errores !== null ? reporte.errores : "-"}
                  </td>
                  <td className="py-2 px-4">
                    {reporte.videoUrl ? (
                      <button
                        className="text-blue-600 underline"
                        onClick={() => setVideoSeleccionado(reporte.videoUrl)}
                      >
                        Ir al video
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2 px-4">{reporte.comentarios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal del video */}
        {videoSeleccionado && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
              <h2 className="text-lg font-bold mb-4 text-center">
                Reporte de desempeño
              </h2>
              <video controls className="w-full rounded-lg">
                <source src={videoSeleccionado} type="video/mp4" />
                Tu navegador no soporta el video.
              </video>
              <div className="mt-4 flex justify-center">
                <button
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  onClick={() => setVideoSeleccionado(null)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default MisReportes;

