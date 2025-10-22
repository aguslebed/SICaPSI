import React from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";
import { resolveImageUrl } from "../../../API/Request";
import { normalizeRichTextValue, getPlainTextFromRichText } from "../../../Components/Modals/CreateTrainingModal/RichTextInput";

const LevelTraining = () => {
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData || !Array.isArray(userData.training))
    return <LoadingOverlay label="Cargando capacitación..." />;

  const curso = userData.training.find((c) => c._id === idTraining);
  if (!curso) return <div>No se encontró el curso.</div>;

  const nivel = Array.isArray(curso.levels)
    ? curso.levels.find((l) => l._id === nivelId)
    : null;
  if (!nivel) return <div>No se encontró el nivel.</div>;

  const training = nivel.training || {};
  const sanitizedDescription = normalizeRichTextValue(training.description || "");
  const hasDescription = getPlainTextFromRichText(sanitizedDescription).trim().length > 0;

  // Función para convertir URLs de YouTube al formato embed
  const convertToEmbedUrl = (url) => {
    if (!url) return url;
    
    // Convertir URLs de YouTube watch a embed
    const youtubeWatchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeWatchMatch) {
      return `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`;
    }
    
    // Si ya es una URL embed o otra URL, devolverla tal como está
    return url;
  };

  // Función para determinar cómo mostrar el contenido
  const renderContent = () => {
    if (!training.url) return null;

    const isLocalFile = training.url.startsWith('/uploads/');
    const isVideoFile = training.url.match(/\.(mp4|webm|ogg)$/i);
    const isPdfFile = training.url.match(/\.(pdf)$/i);
    const isPresentationFile = training.url.match(/\.(ppt|pptx)$/i);

    if (isLocalFile) {
      const fullUrl = resolveImageUrl(training.url);
      
      if (isVideoFile) {
        // Video local
        return (
          <video 
            controls 
            className="w-full h-auto max-w-[1080px] max-h-[720px] mx-auto"
            preload="metadata"
          >
            <source src={fullUrl} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        );
      } else if (isPdfFile) {
        // PDF local
        return (
          <div className="w-full max-w-[1080px] max-h-[720px] mx-auto">
            <iframe
              src={fullUrl}
              className="w-full h-[720px] border-0"
              title="Documento PDF"
            />
            <div className="mt-2 text-center">
              <a 
                href={fullUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                📄 Abrir PDF en nueva pestaña
              </a>
            </div>
          </div>
        );
      } else if (isPresentationFile) {
        // Presentación local
        return (
          <div className="w-full max-w-[1080px] mx-auto text-center">
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-4">Presentación disponible</h3>
              <a 
                href={fullUrl} 
                download
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📥 Descargar Presentación
              </a>
            </div>
          </div>
        );
      }
    } else {
      // URL externa (iframe para videos de YouTube, Vimeo, etc.)
      const embedUrl = convertToEmbedUrl(training.url);
      return (
        <iframe
          src={embedUrl}
          title="Video de capacitación"
          className="w-full h-full min-w-[280px] sm:min-w-[420px] md:min-w-[640px] min-h-[180px] sm:min-h-[240px] md:min-h-[360px] border-0"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Título */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-blue-700 break-words" dangerouslySetInnerHTML={{ __html: normalizeRichTextValue(training.title || nivel.title) || 'Clase Magistral' }} />
          <p className="text-lg text-gray-600 break-words" dangerouslySetInnerHTML={{ __html: normalizeRichTextValue(nivel.description) || '' }} />
        </header>

        {/* Contenido multimedia */}
        {training.url && (
          <div className="rounded-xl overflow-hidden shadow-md flex justify-center">
            <div className="w-full bg-black max-w-[1080px] max-h-[720px] overflow-hidden flex items-center justify-center mx-auto">
              {renderContent()}
            </div>
          </div>
        )}

        {/* Descripción */}
        {hasDescription && (
          <section className="bg-blue-50 p-5 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-600 mb-2">
              Descripción de la capacitación
            </h3>
            <div
              className="text-gray-700 leading-relaxed break-words"
              dir="ltr"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </section>
        )}

        {/* Duración */}
        {training.duration && (
          <p className="text-sm text-blue-500 text-right">
            ⏱️ Duración: {training.duration} minutos
          </p>
        )}
      </div>
    </div>
  );
};

export default LevelTraining;
