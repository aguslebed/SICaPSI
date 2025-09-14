import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

const TrainingReports = () => {
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const { userData } = useUser();
  const { idTraining } = useParams();
  const trainings = userData?.training || [];
  // Filtrar solo el training actual
  const selectedTraining = trainings.find(t => t._id === idTraining);
  const reports = selectedTraining?.report || []; 
  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8">

          {/* Contenido principal */}
          <main className="flex-1 min-w-0 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
            Mis reportes (HU-11 Alumno)
          </h1>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-[#0077b6] text-white">
                  <th className="py-3 px-4 text-left">Nivel</th>
                  <th className="py-3 px-4 text-left">Puntaje</th>
                  <th className="py-3 px-4 text-left">Errores</th>
                  <th className="py-3 px-4 text-left">Video</th>
                  <th className="py-3 px-4 text-left">Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-500">No hay reportes para este curso.</td></tr>
                ) : (
                  reports.map((report, rIdx) => (
                    <tr key={selectedTraining._id + '-' + (report._id || rIdx)} className={rIdx % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                      <td className="py-2 px-4 text-left">{report.level}</td>
                      <td className="py-2 px-4 text-left">{Array.isArray(report.score) ? report.score.join(", ") : (report.score ?? "-")}</td>
                      <td className="py-2 px-4 text-left">{report.errorsCount ?? "-"}</td>
                      <td className="py-2 px-4 text-left">
                        {report.videoUrl ? (
                          <a
                            href={report.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0077b6] underline"
                          >
                            ir al video
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-4 text-left">{report.description ?? "En revisión"}</td>
                    </tr>
                  ))
                )}
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
      </div>
    </>
  );
};

export default TrainingReports;

