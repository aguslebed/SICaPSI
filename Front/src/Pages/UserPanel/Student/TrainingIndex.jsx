import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../../Components/Student/NavBar";
import MenuVertical from "../../../Components/Student/SideBar";
import { useUser } from "../../../Context/UserContext";

const TrainingIndex = () => {
  const { idTraining } = useParams();
  const { userData } = useUser();

  if (!userData || !userData.data || !Array.isArray(userData.data.training)) {
    return <div className="text-center mt-20">Cargando datos de training...</div>;
  } 
  const training = userData.data.training.find(c => c._id === idTraining);
  if (!training) return <p className="text-center mt-20">Capacitación no encontrada</p>;

 
  return (
    <>
      <Navbar />
      <div className="flex">
        <MenuVertical />
        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Imagen y título */}
            <div
              className="h-48 bg-black bg-center bg-cover flex flex-col justify-center text-white px-8"
              style={{ backgroundImage: `url(${training.image})` }}
            >
              <h1 className="text-3xl font-bold">{training.title}</h1>
              <p className="text-lg">{training.subtitle}</p>
            </div>
            {/* Barra de progress */}
            <div className="w-full bg-gray-200 h-6">
              <div
                className="bg-green-500 h-6 text-center text-sm font-semibold text-white"
                style={{ width: `${training.progressPercentage}%` }}
              >
                {training.progressPercentage}%
              </div>
            </div>
            {/* Descripción */}
            <div className="p-6">
              <h2 className="font-semibold mb-2">Descripción de la capacitación</h2>
              <p>{training.description}</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TrainingIndex;