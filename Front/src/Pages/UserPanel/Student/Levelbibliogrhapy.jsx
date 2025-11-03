import React from "react";
import { useParams } from "react-router-dom";
import { FileText, ExternalLink } from "lucide-react";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";
import { normalizeRichTextValue, getPlainTextFromRichText } from "../../../Components/Modals/CreateTrainingModal/RichTextInput";
import StudentFeedbackButton from "./StudentFeedbackButton";

const Levelbibliogrhapy = () => {
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData || !Array.isArray(userData.training)) return <LoadingOverlay label="Cargando bibliografía..." />;

  // Buscar el curso y nivel
  const curso = userData.training.find((c) => c._id === idTraining);
  if (!curso) return <div>No se encontró el curso.</div>;

  const nivel = Array.isArray(curso.levels) ? curso.levels.find((l) => l._id === nivelId) : null;
  if (!nivel) return <div>No se encontró el nivel.</div>;

  // Bibliografía: puede ser array de objetos
  const bibliografias = Array.isArray(nivel.bibliography) ? nivel.bibliography : [];
  
  // Función para manejar el acceso a archivos (descarga o enlace externo)
  const handleAccess = async (url) => {
    if (!url) return;
    
    // Verificar si es un archivo local (comienza con /uploads/ o es una ruta relativa)
    const isLocalFile = url.startsWith('/uploads/') || url.startsWith('uploads/') || (!url.startsWith('http://') && !url.startsWith('https://'));
    
    if (isLocalFile) {
      try {
        // Para archivos locales, hacer fetch y forzar la descarga
        const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
        const fullUrl = url.startsWith('/') ? url : `/${url}`;
        const fileName = url.split('/').pop() || 'archivo';
        
        // Fetch del archivo
        const response = await fetch(`${API_BASE}${fullUrl}`);
        if (!response.ok) throw new Error('Error al descargar el archivo');
        
        // Convertir a blob
        const blob = await response.blob();
        
        // Crear URL temporal del blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Crear enlace temporal y hacer click para forzar descarga
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Liberar la URL del blob
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Error al descargar el archivo:', error);
        alert('Error al descargar el archivo. Por favor, intente nuevamente.');
      }
    } else {
      // Para enlaces externos, abrir en nueva pestaña
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8">
          <main className="flex-1 min-w-0 py-6 md:py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Bibliografía</h1>
            {bibliografias.length === 0 ? (
              <div className="text-gray-500">No hay bibliografía disponible para este nivel.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {bibliografias.map((biblio, idx) => {
                  const sanitizedTitle = normalizeRichTextValue(biblio.title || "");
                  const hasTitle = getPlainTextFromRichText(sanitizedTitle).trim().length > 0;
                  const sanitizedDescription = normalizeRichTextValue(biblio.description || "");
                  const hasDescription = getPlainTextFromRichText(sanitizedDescription).trim().length > 0;

                  return (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-200 overflow-hidden hover:shadow-2xl transition-all flex flex-col"
                  >
                    {/* HEADER - Título */}
                    <div className="px-6 pt-6 pb-2">
                      <div className="flex items-center gap-4">
                        <FileText className="w-10 h-10 text-blue-400 flex-shrink-0" />
                        {hasTitle ? (
                          <h2
                            className="font-bold text-xl text-blue-700 break-words"
                            dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
                          />
                        ) : (
                          <h2 className="font-bold text-xl text-blue-700">
                            Material {idx + 1}
                          </h2>
                        )}
                      </div>
                    </div>

                    {/* BODY - Descripción con altura fija */}
                    <div className="px-6 py-3 flex-1" style={{ minHeight: '160px' }}>
                      {hasDescription ? (
                        <div
                          className="text-gray-700 text-base italic break-words"
                          dir="ltr"
                          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-sm text-gray-400 italic">Sin descripción</p>
                        </div>
                      )}
                    </div>

                    {/* FOOTER - Botón de acceso */}
                    <div className="px-6 pb-6">
                      {(biblio.url || biblio.videoUrl) ? (
                        <button
                          onClick={() => handleAccess(biblio.url || biblio.videoUrl)}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>Acceder</span>
                        </button>
                      ) : (
                        <div className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold border-2 border-dashed border-gray-400">
                          <span>Sin material disponible</span>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
      <StudentFeedbackButton trainingId={idTraining} />
    </>
  );
};

export default Levelbibliogrhapy;
