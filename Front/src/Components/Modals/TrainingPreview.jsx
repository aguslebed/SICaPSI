import React from 'react';
import { Home, BookOpen, PlayCircle, FileText, Users } from 'lucide-react';

// Subcomponente para Preview de Presentación
function PreviewPresentacion({ title, subtitle, description, image }) {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Imagen y título */}
        <div
          className="h-56 bg-black bg-center bg-cover flex flex-col justify-center text-white px-8"
          style={{ 
            backgroundImage: image 
              ? `url(${image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL}${image}`})` 
              : 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)'
          }}
        >
          <h1 className="text-3xl font-bold">{title || 'Título de la capacitación'}</h1>
          <p className="text-lg">{subtitle || 'Subtítulo de la capacitación'}</p>
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
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {description || 'Descripción de la capacitación...'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Subcomponente para Preview de Niveles
function PreviewNiveles({ levels, selectedLevel, onLevelClick }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Niveles</h1>
      <div className="space-y-4">
        {levels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay niveles creados aún
          </div>
        ) : (
          levels.map((level, index) => (
            <div key={index} className="border rounded-lg bg-white shadow">
              {/* Encabezado nivel */}
              <div
                className={`flex justify-between items-center px-6 py-3 cursor-pointer transition ${
                  index === selectedLevel ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => onLevelClick && onLevelClick(index)}
              >
                <span className="font-semibold text-gray-800">
                  Capacitación {level.levelNumber} - Nivel {level.levelNumber}: {level.title || `Nivel ${level.levelNumber}`}
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
                  <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition text-left">
                    <BookOpen className="w-5 h-5" />
                    Bibliografía
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition text-left">
                    <PlayCircle className="w-5 h-5" />
                    Capacitación
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition text-left">
                    Iniciar evaluación del {level.title || `Nivel ${level.levelNumber}`}
                  </button>
                </div>
              )}
            </div>
          ))
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
  const isVideoFile = url && url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 min-h-full">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Título */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-blue-700">
            {title || level.title || 'Título de la clase'}
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
                        💡 Agrega una URL de YouTube o sube un video MP4
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
            ) : url && isLocalFile && isVideoFile ? (
              <video 
                controls 
                className="w-full h-auto"
                src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`}
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
          description ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-2 border-dashed border-gray-300'
        }`}>
          <h3 className="font-semibold text-blue-600 mb-2">
            Descripción de la capacitación
          </h3>
          <p className={`leading-relaxed whitespace-pre-line ${
            description ? 'text-gray-700' : 'text-gray-400 italic'
          }`}>
            {description || 'En esta sección se mostrará una descripción detallada del contenido de la clase, los objetivos de aprendizaje y los temas que se cubrirán durante la capacitación. Es importante proporcionar información clara y concisa para que los guardias sepan qué esperar.'}
          </p>
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
function PreviewBibliografia({ level }) {
  // Datos de ejemplo para placeholder
  const placeholderBibliography = [
    {
      title: 'Manual de Procedimientos de Emergencia',
      description: 'Documento oficial con los protocolos y procedimientos a seguir en situaciones de emergencia. Incluye guías paso a paso y casos de estudio.',
      url: null,
      isPlaceholder: true
    },
    {
      title: 'Normativa de Seguridad Vigente 2025',
      description: 'Compendio actualizado de leyes, decretos y resoluciones relacionadas con la seguridad y prevención de riesgos en el ámbito laboral.',
      url: null,
      isPlaceholder: true
    },
    {
      title: 'Guía de Primeros Auxilios',
      description: 'Material complementario con técnicas básicas de primeros auxilios, RCP y atención de emergencias médicas.',
      url: null,
      isPlaceholder: true
    }
  ];

  // Combinar bibliografía real con placeholders
  const realBibliography = level?.bibliography || [];
  const bibliographyToShow = [...realBibliography];
  
  // Agregar placeholders solo si hay menos de 3 items
  if (bibliographyToShow.length < 3) {
    const remainingSlots = 3 - bibliographyToShow.length;
    const placeholdersNeeded = placeholderBibliography.slice(0, remainingSlots);
    bibliographyToShow.push(...placeholdersNeeded);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bibliografía</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bibliographyToShow.map((item, index) => (
          <div 
            key={item.isPlaceholder ? `placeholder-${index}` : index} 
            className={`p-6 rounded-2xl shadow-xl border flex flex-col gap-4 hover:shadow-2xl transition-all ${
              item.isPlaceholder 
                ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100 border-gray-300 border-dashed border-2 opacity-75'
                : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-4 mb-2">
              <FileText className={`w-10 h-10 ${item.isPlaceholder ? 'text-gray-400' : 'text-blue-400'}`} />
              <h2 className={`font-bold text-xl ${item.isPlaceholder ? 'text-gray-600' : 'text-blue-700'}`}>
                {item.title || `Material ${index + 1}`}
              </h2>
            </div>
            {item.description && (
              <p className={`text-base italic ${item.isPlaceholder ? 'text-gray-600' : 'text-gray-700'}`}>
                {item.description}
              </p>
            )}
            <div>
              <h3 className={`font-semibold mb-2 ${item.isPlaceholder ? 'text-gray-500' : 'text-blue-600'}`}>
                Material
              </h3>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Acceder
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold border-2 border-dashed border-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Agregar enlace
                </div>
              )}
            </div>
          </div>
        ))}
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
                  <div className="font-medium text-gray-800">
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
            <strong>Escena:</strong> {scene.idScene} {scene.videoUrl && `| Ruta video: ${scene.videoUrl}`}
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
                src={scene.videoUrl.startsWith('http') ? scene.videoUrl : `${import.meta.env.VITE_API_URL}${scene.videoUrl}`}
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
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-800 px-4">
            {scene.description || 'Sin descripción'}
          </h2>

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
              src={imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_URL}${imageUrl}`}
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
            title ? 'text-gray-800' : 'text-gray-400 italic'
          }`}>
            {title || 'Evaluación Interactiva del Nivel'}
          </h2>
          
          <p className={`mb-6 text-center ${
            description ? 'text-gray-600' : 'text-gray-400 italic'
          }`}>
            {description || 'En este test interactivo pondrás a prueba los conocimientos adquiridos durante la capacitación. Responde cuidadosamente a cada situación planteada para obtener la mejor calificación.'}
          </p>
          
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
              <p className="mb-2">Este test contiene {scenes.length} escena{scenes.length !== 1 ? 's' : ''} interactiva{scenes.length !== 1 ? 's' : ''}</p>
              
              {/* Lista de escenas para navegación rápida */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {scenes.map((scene, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPreviewSceneIndex(idx)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition cursor-pointer"
                  >
                    Escena {scene.idScene} {scene.lastOne && '(Final)'}
                  </button>
                ))}
              </div>
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
  onLevelClick
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
