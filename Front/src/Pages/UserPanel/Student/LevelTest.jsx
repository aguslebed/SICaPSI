import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";
import { useUser } from "../../../context/UserContext";

const LevelTest = () => {
  // Botón base: mantenemos cursor-pointer y legibilidad, pero adaptativo
  const buttonStyle = {
    whiteSpace: 'normal',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '0.90rem',
    fontWeight: '600',
    padding: '0.75rem 1rem',
    border: '2px solid #009fe3',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background 0.2s, border 0.2s',
  };
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData?.training) return <LoadingOverlay label="Cargando capacitación..." />;

  // Buscar el curso y nivel
  const training = userData.training.find(t => t._id === idTraining);
  if (!training) return <div>No se encontró el curso.</div>;
  const level = Array.isArray(training.levels) ? training.levels.find(l => l._id === nivelId) : null;
  if (!level) return <div>No se encontró el nivel.</div>;
  // Nuevo esquema: level.test es un objeto { title, description, imageUrl, scenes: [...] }
  // Compatibilidad: si level.test era un array, seguimos usando ese array como escenas
  const scenes = useMemo(() => {
    if (Array.isArray(level.test)) return level.test;
    if (level?.test?.scenes && Array.isArray(level.test.scenes)) return level.test.scenes;
    return [];
  }, [level]);
  const tests = scenes; 
  const testTitle = level?.test?.title;
  console.log("Esta es la imagen:  ", level.test.imageUrl);
  const testImage = level?.test?.imageUrl;
  // Estado para la simulación
  const [sceneIndex, setSceneIndex] = useState(null);

  // Reiniciar video (volver al inicio)
  const handleRestart = () => setSceneIndex(null);

  // Iniciar simulación (ir a la primera escena)
  const handleStart = () => setSceneIndex(0);

  // Ir a la siguiente escena según opción
  const handleOption = (nextId) => {
    const nextIndex = tests.findIndex(test => test.idScene === nextId);
    if (nextIndex !== -1) {
      setSceneIndex(nextIndex);
    } else {
      // Si no hay siguiente, termina la simulación
      setSceneIndex(null);
    }
  };

  // Render principal
  return (
    <>
      {/* Modal bloqueante para el examen */}
      {sceneIndex !== null ? (
        <div className="fixed inset-0 z-[9999] bg-white/0 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full sm:w-[90vw] md:w-[75vw] lg:w-[60vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col items-center justify-between">
            {/* Debug info: escena y ruta de video */}
            <div style={{marginBottom: '6px', color: '#888', fontSize: '0.9em'}}>
              <strong>Escena:</strong> {tests[sceneIndex]?.idScene} &nbsp;|&nbsp; <strong>Ruta video:</strong> {tests[sceneIndex]?.videoUrl}
            </div>
            {/* Video de la escena */}
            {tests[sceneIndex].videoUrl && (
              <div className="w-full mb-3 sm:mb-4">
                <div className="aspect-video w-full max-h-[40vh] md:max-h-[42vh] lg:max-h-[45vh] rounded-2xl overflow-hidden bg-[#222]">
                  <video
                    key={tests[sceneIndex].videoUrl}
                    src={tests[sceneIndex].videoUrl}
                    autoPlay
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback noautoplay"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
            {/* Descripción */}
            <h2 className="text-base sm:text-lg font-bold mb-2 text-center min-h-10 flex items-center justify-center">{tests[sceneIndex].description}</h2>
            {/* Opciones */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 md:gap-6 justify-center w-full">
              {Array.isArray(tests[sceneIndex].options) &&
                tests[sceneIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    className="bg-[#009fe3] text-white font-bold rounded-lg hover:bg-[#0077b6] transition cursor-pointer w-full sm:w-64 min-h-12 px-4"
                    style={buttonStyle}
                    onClick={() => handleOption(opt.next)}
                  >
                    {opt.description}
                  </button>
                ))}
            </div>
            {/* Botón para reiniciar */}
            <button
              className="mt-4 sm:mt-6 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer"
              onClick={handleRestart}
            >
              Finalizar Simulación
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-[70vh] md:min-h-0 bg-gray-100">
            <div className="max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8">
              <main className="flex-1 min-w-0 py-6 md:py-10 lg:py-12 flex justify-center items-center md:items-start">
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-3xl w-full flex flex-col items-center">
                {/* Imagen/video inicial */}
                <img
                  src={testImage}
                  alt={testTitle}
                  className="rounded-2xl w-full object-cover mb-6 sm:mb-8 max-h-[50vh]"
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 md:gap-8 justify-center w-full">
                  <button
                    className="bg-[#009fe3] text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-xl hover:bg-[#0077b6] transition cursor-pointer w-full sm:w-64"
                    onClick={handleRestart}
                  >
                    Reiniciar video
                  </button>
                  <button
                    className="bg-[#009fe3] text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-xl hover:bg-[#0077b6] transition cursor-pointer w-full sm:w-64"
                    onClick={handleStart}
                  >
                    Iniciar Simulación
                  </button>
                </div>
              </div>
              </main>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LevelTest;