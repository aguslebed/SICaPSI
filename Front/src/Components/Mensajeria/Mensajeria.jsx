import { useState } from "react";
import BuzonEntrada from "./BuzonEntrada";
import BuzonSalida from "./BuzonSalida";
import BuzonEliminados from "./BuzonEliminados";
import BuzonEnviados from "./BuzonEnviados";

export default function Mensajeria() {
  const [tab, setTab] = useState("entrada");

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Mensajería</h2>

      {/* Botones de navegacion */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded ${tab === "entrada" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("entrada")}
        >
          Recibidos
        </button>
        <button
          className={`px-4 py-2 rounded ${tab === "enviados" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("enviados")}
        >
          Enviados
        </button>
        <button
          className={`px-4 py-2 rounded ${tab === "salida" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("salida")}
        >
          Salida
        </button>
        <button
          className={`px-4 py-2 rounded ${tab === "eliminados" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("eliminados")}
        >
          Papelera
        </button>
      </div>

      {/* Contenido dinamico */}
      <div className="border rounded bg-white p-4 shadow">
        {tab === "entrada" && <BuzonEntrada />}
        {tab === "enviados" && <BuzonEnviados />}
        {tab === "salida" && <BuzonSalida />}
        {tab === "eliminados" && <BuzonEliminados />}
      </div>
    </div>
  );
}
