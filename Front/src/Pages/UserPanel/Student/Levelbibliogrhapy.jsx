import React from "react";
import { useParams } from "react-router-dom";
import { FileText, ExternalLink } from "lucide-react";
import MenuVertical from "../../../Components/Student/SideBar";
import Navbar from "../../../Components/Student/NavBar";
import { useUser } from "../../../Context/UserContext";

const Levelbibliogrhapy = () => {
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData.data || !Array.isArray(userData.data.training)) return <div>Cargando...</div>;

  // Buscar el curso y nivel
  const curso = userData.data.training.find(c => c._id === idTraining);
  if (!curso) return <div>No se encontró el curso.</div>;

  const nivel = Array.isArray(curso.levels) ? curso.levels.find(l => l._id === nivelId) : null;
  if (!nivel) return <div>No se encontró el nivel.</div>;

  // Bibliografía: puede ser array de objetos
  const bibliografias = Array.isArray(nivel.bibliography) ? nivel.bibliography : []; 
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        <MenuVertical />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Bibliografía</h1>
          {bibliografias.length === 0 ? (
            <div className="text-gray-500">No hay bibliografía disponible para este nivel.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bibliografias.map((biblio, idx) => (
                <div key={idx} className="bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 rounded-2xl shadow-xl border border-blue-200 flex flex-col gap-4 hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    <FileText className="w-10 h-10 text-blue-400" />
                    <h2 className="font-bold text-xl text-blue-700">{biblio.title}</h2>
                  </div>
                  {biblio.description && (
                    <p className="mb-2 text-gray-700 text-base italic">{biblio.description}</p>
                  )}
                  {/* Archivos / Descargas */}
                  {Array.isArray(biblio.videoUrl) && biblio.videoUrl.length > 0 && (
                    <div className="mb-2">
                      <h3 className="font-semibold text-blue-600 mb-2">Archivos descargables</h3>
                      <ul className="space-y-2">
                        {biblio.videoUrl.map((archivo, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <a href={archivo.url || archivo} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-100 rounded-lg text-blue-700 font-medium hover:bg-blue-200 transition">
                              {archivo.nombre || archivo.name || archivo.title || archivo.url || archivo}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Enlaces */}
                  {Array.isArray(biblio.links) && biblio.links.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-blue-600 mb-2">Enlaces útiles</h3>
                      <div className="flex flex-wrap gap-3">
                        {biblio.links.map((enlace, i) => (
                          <a
                            key={i}
                            href={enlace.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                          >
                            
                            Ir al enlaces
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Levelbibliogrhapy;
