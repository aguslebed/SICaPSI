import React from 'react';
import { Home, BookOpen, PlayCircle, FileText, Users } from 'lucide-react';
import { normalizeRichTextValue, getPlainTextFromRichText } from './RichTextInput';

// Subcomponente para Preview de Presentación
function PreviewPresentacion({ title, subtitle, description, image }) {
  const sanitizedTitle = normalizeRichTextValue(title || '');
  const sanitizedSubtitle = normalizeRichTextValue(subtitle || '');
  const sanitizedDescription = normalizeRichTextValue(description || '');
  
  const hasTitle = getPlainTextFromRichText(sanitizedTitle).trim().length > 0;
  const hasSubtitle = getPlainTextFromRichText(sanitizedSubtitle).trim().length > 0;
  const hasDescription = getPlainTextFromRichText(sanitizedDescription).trim().length > 0;

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Imagen y título */}
        <div
          className="h-56 bg-black bg-center bg-cover flex flex-col justify-center text-white px-8"
          style={{ 
            backgroundImage: image 
              ? `url(${image.startsWith('http') || image.startsWith('data:') ? image : `${import.meta.env.VITE_API_URL}${image}`})` 
              : 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)'
          }}
        >
          <h1 className="text-3xl font-bold break-words whitespace-normal">
            {hasTitle ? (
              <div dir="ltr" dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
            ) : (
              'Título de la capacitación'
            )}
          </h1>
          <p className="text-lg break-words whitespace-normal">
            {hasSubtitle ? (
              <div dir="ltr" dangerouslySetInnerHTML={{ __html: sanitizedSubtitle }} />
            ) : (
              'Subtítulo de la capacitación'
            )}
          </p>
        </div>
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 h-6">
          <div
            className="bg-green-500 h-6 text-center text-sm font-semibold text-white"
            style={{ width: '0%' }}
          >
            0%
          </div>
        </div>
        {/* Descripción */}
        <div className="p-6">
          <h2 className="font-semibold mb-2">Descripción de la capacitación</h2>
          {hasDescription ? (
            <div
              className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap"
              dir="ltr"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-normal break-words">
              Descripción de la capacitación...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Subcomponente para Preview de Niveles
function PreviewNiveles({ levels, selectedLevel, onLevelClick, onBibliografiaClick, onTrainingClick, onTestClick }) {
  return (
    <div className="p-8">
  <h1 className="text-3xl font-bold text-gray-800 mb-6">Niveles</h1>
      <div className="space-y-4">
        {levels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay niveles creados aún
          </div>
        ) : (
          levels.map((level, index) => {
            const sanitizedLevelTitle = normalizeRichTextValue(level.title || '');
            const hasLevelTitle = getPlainTextFromRichText(sanitizedLevelTitle).trim().length > 0;
            return (
            <div key={index} className="border rounded-lg bg-white shadow">
              {/* Encabezado nivel */}
              <div
                className={`flex justify-between items-center px-6 py-3 cursor-pointer transition ${
                  index === selectedLevel ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => onLevelClick && onLevelClick(index)}
              >
                <span className="font-semibold text-gray-800 break-words whitespace-normal">
                  {hasLevelTitle ? (
                    <div dir="ltr" dangerouslySetInnerHTML={{ __html: sanitizedLevelTitle }} />
                  ) : (
                    `Nivel ${level.levelNumber}`
                  )}
                </span>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${
                    index === selectedLevel ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Contenido desplegable */}
              {index === selectedLevel && (
                <div className="px-6 py-4 space-y-3 bg-blue-50">
                  <button 
                    className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition text-left cursor-pointer"
                    onClick={() => onBibliografiaClick && onBibliografiaClick(index)}
                  >
                    <BookOpen className="w-5 h-5" />
                    Bibliografía
                  </button>
                  <button 
                    className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition text-left cursor-pointer"
                    onClick={() => onTrainingClick && onTrainingClick(index)}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Capacitación
                  </button>
                  <button 
                    className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition text-left cursor-pointer"
                    onClick={() => onTestClick && onTestClick(index)}
                  >
                    Iniciar evaluación del {level.title || `Nivel ${level.levelNumber}`}
                  </button>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Subcomponente para Preview de Training/Clase
function PreviewTraining({ level }) {
  if (!level?.training) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay información de training
      </div>
    );
  }

  const { title, description, url, duration } = level.training;
  
  const sanitizedTitle = normalizeRichTextValue(title || '');
  const hasTitle = getPlainTextFromRichText(sanitizedTitle).trim().length > 0;
  const sanitizedDescription = normalizeRichTextValue(description || '');
  const hasDescription = getPlainTextFromRichText(sanitizedDescription).trim().length > 0;
  
  // Mostrar placeholder si no hay video configurado
  const shouldShowPlaceholder = !url;

  // Función para detectar si es un video de YouTube
  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  // Función para extraer ID de YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    let videoId = null;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const isLocalFile = url && url.startsWith('/uploads/');
  const isDataUrl = url && url.startsWith('data:');
  const isVideoFile = url && (url.match(/\.(mp4|mov|avi|mkv|webm|ogg)$/i) || (isDataUrl && url.startsWith('data:video')));

  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 min-h-full">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Título */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-blue-700">
            {hasTitle ? (
              <div dir="ltr" dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
            ) : (
              level.title || 'Título de la clase'
            )}
          </h1>
        </header>

        {/* Contenido multimedia */}
        <div className="rounded-xl overflow-hidden shadow-md flex justify-center">
          <div className="w-full bg-black max-w-full overflow-hidden flex items-center justify-center">
            {shouldShowPlaceholder ? (
              // Placeholder con video de ejemplo
              <div className="w-full relative" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                  <div className="text-center px-8 py-12">
                    <svg 
                      className="w-24 h-24 mx-auto mb-4 text-blue-400 animate-pulse" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <p className="text-white text-xl font-bold mb-3">
                      [Vista previa del video de la clase]
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Aquí se reproducirá el contenido multimedia de la capacitación
                    </p>
                    <div className="inline-block bg-blue-500/20 border-2 border-blue-400 border-dashed rounded-lg px-6 py-3">
                      <p className="text-blue-300 text-xs font-semibold">
                        💡 Agrega una URL de YouTube o sube un video (MP4, MOV, AVI, etc.)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : url && isYouTubeUrl(url) ? (
              <iframe
                src={getYouTubeEmbedUrl(url)}
                title={title || 'Video de capacitación'}
                className="w-full h-[480px] border-0"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : url && (isLocalFile || isDataUrl) && isVideoFile ? (
              <video 
                controls 
                className="w-full h-auto"
                src={url.startsWith('http') || url.startsWith('data:') ? url : `${import.meta.env.VITE_API_URL}${url}`}
              >
                Tu navegador no soporta el elemento de video.
              </video>
            ) : url ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Archivo: {url}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Descripción */}
        <section className={`p-5 rounded-xl border ${
          hasDescription ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-2 border-dashed border-gray-300'
        }`}>
          <h3 className="font-semibold text-blue-600 mb-2">
            Descripción de la capacitación
          </h3>
          {hasDescription ? (
            <div
              className="text-gray-700 leading-relaxed break-words whitespace-pre-line"
              dir="ltr"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          ) : (
            <p className="text-gray-400 italic">
              En esta sección se mostrará una descripción detallada del contenido de la clase, los objetivos de aprendizaje y los temas que se cubrirán durante la capacitación. Es importante proporcionar información clara y concisa para que los guardias sepan qué esperar.
            </p>
          )}
        </section>

        {/* Duración */}
        <p className="text-sm text-blue-500 text-right">
          ⏱️ Duración: {duration > 0 ? `${duration} minutos` : '45 minutos (ejemplo)'}
        </p>
      </div>
    </div>
  );
}

// Subcomponente para Preview de Bibliografía
function PreviewBibliografia({ level, levelIndex, updateLevelField, handleFileDelete, tempBibData, editingIndex, onSelectItem }) {
  // Función para manejar el acceso a archivos (descarga o enlace externo)
  const handleAccess = async (url, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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

  // Datos de ejemplo para placeholder
  const placeholderBibliography = [
    {
      title: 'Manual de Procedimientos de Emergencia',
      description: 'Documento oficial con los protocolos y procedimientos a seguir en situaciones de emergencia. Incluye guías paso a paso y casos de estudio.',
      url: null,
      _type: 'placeholder'
    },
    {
      title: 'Normativa de Seguridad Vigente 2025',
      description: 'Compendio actualizado de leyes, decretos y resoluciones relacionadas con la seguridad y prevención de riesgos en el ámbito laboral.',
      url: null,
      _type: 'placeholder'
    }
  ];

  const isEditingExisting = typeof editingIndex === 'number' && editingIndex >= 0;

  const realBibliography = (level?.bibliography || []).map((item, idx) => ({
    ...item,
    _type: 'real',
    realIndex: idx,
    isEditingTarget: editingIndex === idx
  }));

  const hasLiveContent = !isEditingExisting && tempBibData && (tempBibData.title || tempBibData.description || tempBibData.url);

  const bibliographyToShow = [];

  if (hasLiveContent) {
    bibliographyToShow.push({
      title: tempBibData.title || 'Nuevo Material',
      description: tempBibData.description || '',
      url: tempBibData.url || null,
      _type: 'live-new'
    });
  }

  bibliographyToShow.push(...realBibliography);

  if (bibliographyToShow.length === 0) {
    bibliographyToShow.push(...placeholderBibliography);
  }

  const handleDelete = async (realIndex) => {
    if (realIndex < 0 || realIndex >= realBibliography.length) return;

    const item = realBibliography[realIndex];

    if (item.url && item.url.startsWith('/uploads/')) {
      try {
        await handleFileDelete(item.url, levelIndex);
      } catch (error) {
        console.error('Error eliminando archivo:', error);
      }
    }

    const newBibliography = [...(level?.bibliography || [])];
    newBibliography.splice(realIndex, 1);
    updateLevelField(levelIndex, 'bibliography', newBibliography);
  };

  const handleCardSelect = (realIndex) => {
    if (typeof onSelectItem === 'function') {
      onSelectItem(levelIndex, realIndex);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bibliografía</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bibliographyToShow.map((item, index) => {
          const itemType = item._type;
          const isPlaceholder = itemType === 'placeholder';
          const isLivePreview = itemType === 'live-new';
          const isReal = itemType === 'real';
          const isEditingTarget = Boolean(item.isEditingTarget);
          const sanitizedTitle = normalizeRichTextValue(item.title || '');
          const hasSanitizedTitle = getPlainTextFromRichText(sanitizedTitle).trim().length > 0;
          const sanitizedDescription = normalizeRichTextValue(item.description || '');
          const hasRichDescription = getPlainTextFromRichText(sanitizedDescription).trim().length > 0;
          const cardKey = isPlaceholder ? `placeholder-${index}` : isLivePreview ? 'live-preview' : `real-${item.realIndex}`;
          const baseClasses = 'rounded-2xl shadow-xl border overflow-hidden transition-all relative flex flex-col hover:shadow-2xl';
          const paletteClasses = isPlaceholder
            ? 'bg-white border-gray-300 border-dashed border-2 opacity-75'
            : isLivePreview
            ? 'bg-gradient-to-br from-green-50 via-white to-green-100 border-green-300 border-2'
            : isEditingTarget
            ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border-green-400 border-2'
            : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 border-blue-200';
          const cardClassName = `${baseClasses} ${paletteClasses} cursor-pointer`;

          return (
            <div
              key={cardKey}
              className={cardClassName}
              onClick={isReal ? () => handleCardSelect(item.realIndex) : undefined}
            >
              {(isLivePreview || isEditingTarget) && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                  <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap ${isEditingTarget ? 'bg-emerald-500' : 'bg-green-500 animate-pulse'}`}>
                    En edición
                  </span>
                </div>
              )}

              {isReal && updateLevelField && handleFileDelete && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(item.realIndex);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-red-50 text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-full transition-all cursor-pointer shadow-sm hover:shadow-md z-10"
                  title="Eliminar elemento"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="px-6 pt-8 pb-2">
                <div className="flex items-center gap-4 flex-1 min-w-0 max-w-full">
                  <FileText
                    className={`w-10 h-10 flex-shrink-0 ${
                      isPlaceholder ? 'text-gray-400' : isLivePreview ? 'text-green-500' : isEditingTarget ? 'text-emerald-500' : 'text-blue-400'
                    }`}
                  />
                  {hasSanitizedTitle ? (
                    <div
                      dir="ltr"
                      dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
                      className={`font-bold text-xl break-words overflow-wrap-anywhere ${
                        isPlaceholder ? 'text-gray-600' : isLivePreview ? 'text-green-700' : isEditingTarget ? 'text-emerald-700' : 'text-blue-700'
                      }`}
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      title={getPlainTextFromRichText(sanitizedTitle)}
                    />
                  ) : (
                    <h2
                      className={`font-bold text-xl break-words overflow-wrap-anywhere ${
                        isPlaceholder ? 'text-gray-600' : isLivePreview ? 'text-green-700' : isEditingTarget ? 'text-emerald-700' : 'text-blue-700'
                      }`}
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      title={item.title || `Material ${isReal ? item.realIndex + 1 : index + 1}`}
                    >
                      {item.title || `Material ${isReal ? item.realIndex + 1 : index + 1}`}
                    </h2>
                  )}
                </div>
              </div>

              <div className="px-6 py-3 flex-1" style={{ minHeight: '160px' }}>
                {hasRichDescription ? (
                  <div
                    className={`text-base leading-relaxed break-words ${isPlaceholder ? 'text-gray-600 italic' : 'text-gray-700 italic'}`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    dir="ltr"
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400 italic">Sin descripción</p>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                {item.url ? (
                  <button
                    onClick={(e) => handleAccess(item.url, e)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Acceder al Material</span>
                  </button>
                ) : (
                  <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold border-2 border-dashed border-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Agregar enlace</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Subcomponente para Preview de Inscripción
function PreviewInscripcion({ selectedStudents, students }) {
  const enrolledStudents = students.filter(s => selectedStudents.includes(s._id));

  return (
    <div className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Guardias Inscritos</h1>

      {/* Contador */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8 shadow-lg">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">
            {selectedStudents.length}
          </div>
          <div className="text-lg">
            {selectedStudents.length === 1 ? 'Guardia inscrito' : 'Guardias inscritos'}
          </div>
        </div>
      </div>

      {/* Lista de guardias */}
      {enrolledStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lista de guardias
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {enrolledStudents.map((student, index) => (
              <div 
                key={student._id} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 break-words whitespace-normal">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {student.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {enrolledStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          No hay guardias inscritos aún
        </div>
      )}
    </div>
  );
}

// Subcomponente para Preview de Test de Evaluación
function PreviewTest({ level, selectedScene }) {
  const [previewSceneIndex, setPreviewSceneIndex] = React.useState(null);

  if (!level?.test) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Test de Evaluación</h1>
        <div className="text-center py-8 text-gray-500">
          No hay test de evaluación configurado
        </div>
      </div>
    );
  }

  const { title, description, imageUrl, scenes } = level.test;

  const sanitizedTestTitle = normalizeRichTextValue(title || '');
  const hasTestTitle = getPlainTextFromRichText(sanitizedTestTitle).trim().length > 0;
  const sanitizedTestDescription = normalizeRichTextValue(description || '');
  const hasTestDescription = getPlainTextFromRichText(sanitizedTestDescription).trim().length > 0;

  // Si está editando una escena específica (selectedScene viene del padre), mostrar esa escena directamente
  const isEditingMode = selectedScene !== null && selectedScene !== undefined;
  const sceneToShow = isEditingMode ? selectedScene : previewSceneIndex;

  // Si hay una escena para mostrar (ya sea editando o previsualizando)
  if (sceneToShow !== null && scenes && scenes[sceneToShow]) {
    const scene = scenes[sceneToShow];
    
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-5xl">
          {/* Info de la escena */}
          <div className="mb-4 text-sm text-gray-500 text-left">
            <strong>Escena {sceneToShow + 1} de {scenes.length}</strong>
            {isEditingMode && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                📝 Modo Edición - Preview en Tiempo Real
              </span>
            )}
          </div>

          {/* Video de la escena o Placeholder */}
          <div className="w-full mb-6 rounded-2xl overflow-hidden shadow-lg bg-black">
            {scene.videoUrl ? (
              <video
                src={scene.videoUrl.startsWith('http') || scene.videoUrl.startsWith('data:') ? scene.videoUrl : `${import.meta.env.VITE_API_URL}${scene.videoUrl}`}
                controls={false}
                autoPlay
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                className="w-full h-auto object-contain"
                style={{ maxHeight: '50vh' }}
              />
            ) : (
              <div className="w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900" style={{ minHeight: '40vh' }}>
                <div className="text-center px-8 py-12">
                  <svg 
                    className="w-20 h-20 mx-auto mb-4 text-gray-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                    />
                  </svg>
                  <p className="text-gray-400 text-lg font-medium mb-2">
                    Sin video configurado
                  </p>
                  <p className="text-gray-500 text-sm">
                    Coloca una URL o carga un archivo de video para esta escena
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Descripción de la escena */}
          {(() => {
            const sanitizedSceneDescription = normalizeRichTextValue(scene.description || '');
            const hasSceneDescription = getPlainTextFromRichText(sanitizedSceneDescription).trim().length > 0;
            return (
              <h2 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-800 px-4">
                {hasSceneDescription ? (
                  <div dir="ltr" dangerouslySetInnerHTML={{ __html: sanitizedSceneDescription }} />
                ) : (
                  'Sin descripción'
                )}
              </h2>
            );
          })()}

          {/* Opciones (Botones) */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center mb-6 px-4">
            {scene.options && scene.options.length > 0 ? (
              scene.options.map((opt, idx) => (
                <button
                  key={idx}
                  className="bg-[#009fe3] text-white font-bold px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-xl hover:bg-[#0077b6] transition cursor-pointer w-full md:w-64"
                  onClick={() => {
                    // Si está en modo edición, no navegar
                    if (isEditingMode) {
                      return;
                    }
                    // Buscar la siguiente escena
                    const nextSceneIndex = scenes.findIndex(s => s.idScene === opt.next);
                    if (nextSceneIndex !== -1) {
                      setPreviewSceneIndex(nextSceneIndex);
                    } else {
                      alert(`Fin del test. Puntos: ${opt.points || 0}`);
                      setPreviewSceneIndex(null);
                    }
                  }}
                >
                  {opt.description || `Opción ${idx + 1}`}
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No hay opciones configuradas para esta escena
              </div>
            )}
          </div>

          {/* Botón Finalizar Simulación - Solo mostrar en modo simulación */}
          {!isEditingMode && (
            <div className="flex justify-center mt-6">
              <button
                className="bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                onClick={() => setPreviewSceneIndex(null)}
              >
                Finalizar Simulación
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista inicial del test
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Test de Evaluación</h1>
      
      <div className="flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full flex flex-col items-center">
          {/* Imagen/video inicial */}
          {imageUrl ? (
            <img
              src={imageUrl.startsWith('http') || imageUrl.startsWith('data:') ? imageUrl : `${import.meta.env.VITE_API_URL}${imageUrl}`}
              alt={title || 'Test de Evaluación'}
              className="rounded-2xl w-full object-cover mb-8 max-h-[50vh]"
            />
          ) : (
            <div className="w-full rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 border-2 border-dashed border-indigo-300 mb-8 flex items-center justify-center" style={{ minHeight: '300px' }}>
              <div className="text-center px-8 py-12">
                <svg className="w-20 h-20 mx-auto mb-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-indigo-600 text-lg font-bold mb-2">
                  [Imagen de portada del test]
                </p>
                <p className="text-indigo-500 text-sm">
                  Agrega una imagen representativa para la evaluación
                </p>
              </div>
            </div>
          )}
          
          {/* Información del test */}
          <h2 className={`text-2xl font-bold mb-4 text-center ${
            hasTestTitle ? 'text-gray-800' : 'text-gray-400 italic'
          }`}>
            {hasTestTitle ? (
              <div dir="ltr" dangerouslySetInnerHTML={{ __html: sanitizedTestTitle }} />
            ) : (
              'Evaluación Interactiva del Nivel'
            )}
          </h2>
          
          {hasTestDescription ? (
            <div
              className="mb-6 text-center text-gray-600 leading-relaxed break-words"
              dir="ltr"
              dangerouslySetInnerHTML={{ __html: sanitizedTestDescription }}
            />
          ) : (
            <p className="mb-6 text-center text-gray-400 italic">
              En este test interactivo pondrás a prueba los conocimientos adquiridos durante la capacitación. Responde cuidadosamente a cada situación planteada para obtener la mejor calificación.
            </p>
          )}
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full">
            <button
              className="bg-[#009fe3] text-white font-bold px-8 py-4 rounded-lg text-xl hover:bg-[#0077b6] transition cursor-pointer w-full sm:w-64"
              onClick={() => setPreviewSceneIndex(null)}
            >
              Reiniciar video
            </button>
            <button
              className="bg-[#009fe3] text-white font-bold px-8 py-4 rounded-lg text-xl hover:bg-[#0077b6] transition cursor-pointer w-full sm:w-64"
              onClick={() => {
                if (scenes && scenes.length > 0) {
                  setPreviewSceneIndex(0);
                } else {
                  alert('No hay escenas configuradas aún');
                }
              }}
            >
              Iniciar Simulación
            </button>
          </div>
          
          {/* Información de escenas */}
          {scenes && scenes.length > 0 && (
            <div className="mt-6 text-sm text-gray-500 text-center">
              <p>Esta evaluación contiene {scenes.length} escena{scenes.length !== 1 ? 's' : ''} interactiva{scenes.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function TrainingPreview({ 
  activeSection, 
  title, 
  subtitle, 
  description, 
  image, 
  levels, 
  selectedLevel,
  selectedScene,
  selectedStudents,
  students,
  updateLevelField,
  handleFileDelete,
  bibliographyTempData,
  editingBibliographyIndex,
  onLevelClick,
  onBibliografiaClick,
  onTrainingClick,
  onTestClick,
  onBibliographyItemSelect
}) {
  const renderContent = () => {
    switch (activeSection) {
      case 'presentacion':
        return (
          <PreviewPresentacion 
            title={title}
            subtitle={subtitle}
            description={description}
            image={image}
          />
        );
      
      case 'niveles':
        return (
          <PreviewNiveles 
            levels={levels}
            selectedLevel={selectedLevel}
            onLevelClick={onLevelClick}
            onBibliografiaClick={onBibliografiaClick}
            onTrainingClick={onTrainingClick}
            onTestClick={onTestClick}
          />
        );
      
      case 'training':
        return (
          <PreviewTraining 
            level={levels[selectedLevel]}
          />
        );
      
      case 'bibliografia':
        return (
          <PreviewBibliografia 
            level={levels[selectedLevel]}
            levelIndex={selectedLevel}
            updateLevelField={updateLevelField}
            handleFileDelete={handleFileDelete}
            tempBibData={bibliographyTempData}
            editingIndex={editingBibliographyIndex}
            onSelectItem={onBibliographyItemSelect}
          />
        );
      
      case 'test':
        return (
          <PreviewTest 
            level={levels[selectedLevel]}
            selectedScene={selectedScene}
          />
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 p-8">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-lg font-semibold mb-2">Selecciona una sección para ver la vista previa</p>
              <p className="text-sm text-gray-400">Haz clic en cualquier sección del editor para ver cómo se verá</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
}
