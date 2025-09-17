import React from "react";
import { useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '../../API/Request';

const TrainingCard = ({ titulo, subtitulo, porcentaje, estado, link, imagen }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (estado === "activo") {
      navigate(link);
    }
  };

  return (
    <button
      type="button"
      className={`relative w-full h-40 rounded-md overflow-hidden transition text-left ${
        estado === "activo" ? "hover:shadow-lg cursor-pointer" : "cursor-not-allowed opacity-80"
      }`}
      onClick={handleClick}
      disabled={estado !== "activo"}
      aria-disabled={estado !== "activo"}
    >
      {/* Imagen de fondo */}
      <div
        className={`absolute inset-0 bg-cover bg-center ${
          estado === "activo" ? "" : "grayscale"
        }`}
        style={{ backgroundImage: `url(${resolveImageUrl(imagen)})` }}
      />

      {/* Overlay verde solo si está activo */}
      {estado === "activo" && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-transparent" />
      )}

      {/* Contenido */}
      <div className="absolute top-4 left-4 text-white z-10">
        <h3 className="text-xl font-bold">{titulo}</h3>
        <p className="text-sm">{subtitulo}</p>
      </div>

      {/* Barra de progreso (siempre que esté activo) */}
      {estado === "activo" && (
        <div className="absolute bottom-0 left-0 w-full h-6 bg-black/40 flex items-center">
          {/* Parte verde proporcional */}
          <div
            className="absolute left-0 top-0 h-full bg-green-500"
            style={{ width: `${porcentaje}%` }}
          ></div>

          {/* Texto centrado siempre */}
          <span className="relative z-10 w-full text-center text-xs font-bold text-white">
            {porcentaje}%
          </span>
        </div>
      )}
    </button>
  );
};

export default TrainingCard;