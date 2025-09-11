import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../Components/Student/NavBar";
import MenuVertical from "../../../Components/Student/SideBar";
import { useUser } from "../../../Context/UserContext";

const LevelTest = () => {
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData?.data?.training) return <div>Cargando...</div>;

  // Buscar el curso y nivel
  const training = userData.data.training.find(t => t._id === idTraining);
  if (!training) return <div>No se encontró el curso.</div>;
  const level = Array.isArray(training.levels) ? training.levels.find(l => l._id === nivelId) : null;
  if (!level) return <div>No se encontró el nivel.</div>;
  const tests = Array.isArray(level.test) ? level.test : [];
  console.log("TEST: ", tests);
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
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        <MenuVertical />
        <main className="flex-1 p-8 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full flex flex-col items-center">
            {sceneIndex === null ? (
              <>
                {/* Imagen/video inicial */}
                <img
                  src={training?.image}
                  alt={training?.title}
                  className="rounded-2xl w-full object-cover mb-8"
                  style={{ maxHeight: 350 }}
                />
                <div className="flex gap-8 justify-center">
                  <button
                    className="bg-[#009fe3] text-white font-bold px-8 py-4 rounded-lg text-xl hover:bg-[#0077b6] transition"
                    onClick={handleRestart}
                  >
                    Reiniciar video
                  </button>
                  <button
                    className="bg-[#009fe3] text-white font-bold px-8 py-4 rounded-lg text-xl hover:bg-[#0077b6] transition"
                    onClick={handleStart}
                  >
                    Iniciar Simulación
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Video de la escena */}
                {tests[sceneIndex].videoUrl && (
                  <iframe
                    src={tests[sceneIndex].videoUrl}
                    width="1150"
                    height="768"
                    frameBorder="0"
                    scrolling="no"
                    allowFullScreen
                    className="rounded-2xl w-full mb-6"
                    style={{ maxHeight: 350 }}
                    title="Simulación Video"
                  />
                )}
                {/* Descripción */}
                <h2 className="text-xl font-bold mb-4 text-center">{tests[sceneIndex].description}</h2>
                {/* Opciones */}
                <div className="flex gap-8 justify-center w-full">
                  {Array.isArray(tests[sceneIndex].options) &&
                    tests[sceneIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        className="bg-[#009fe3] text-white font-bold px-8 py-4 rounded-lg text-xl hover:bg-[#0077b6] transition w-1/2"
                        onClick={() => handleOption(opt.next)}
                      >
                        {opt.description}
                      </button>
                    ))}
                </div>
                {/* Botón para reiniciar */}
                <button
                  className="mt-8 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                  onClick={handleRestart}
                >
                  Reiniciar Simulación
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default LevelTest;