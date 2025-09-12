import React from "react";

const TrainingCard = ({ titulo, subtitulo, porcentaje, estado, link, imagen }) => {
  const handleClick = () => {
    if (estado === "activo") {
      window.location.href = link;
    }
  };

  return (
    <div
      className={`relative w-full h-40 rounded-md overflow-hidden cursor-pointer transition ${
        estado === "activo" ? "hover:shadow-lg" : "cursor-not-allowed"
      }`}
      onClick={handleClick}
    >
      {/* Imagen de fondo */}
      <div
        className={`absolute inset-0 bg-cover bg-center ${
          estado === "activo" ? "" : "grayscale"
        }`}
        style={{ backgroundImage: `url(${imagen})` }}
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
    </div>
  );
};

export default TrainingCard;