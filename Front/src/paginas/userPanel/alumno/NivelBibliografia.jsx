import React from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, ExternalLink } from "lucide-react";
import MenuVertical from "../../../componentes/alumno/MenuVertical";
import Navbar from "../../../componentes/alumno/nvar";


const NivelBibliografia = () => {
  const { id, nivelId } = useParams();

  // 🔹 Datos simulados (vienen de backend después)
  const bibliografia = {
    titulo: `Nivel ${nivelId} - Bibliografía`,
    archivos: [
      { nombre: "Manual del curso", url: "/docs/manual.pdf" },
      { nombre: "Guía de prácticas", url: "/docs/guia.pdf" },
    ],
    enlaces: [
      { nombre: "Artículo de referencia", url: "https://example.com" },
      { nombre: "Página oficial", url: "https://example.org" },
    ],
  };

  return (
    <>
    <Navbar />
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <MenuVertical />

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{bibliografia.titulo}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vista previa PDF */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <img src="/images/pdf-icon.png" alt="PDF" className="w-40 mb-4" />
            <a
              href={bibliografia.archivos[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Descargar PDF
            </a>
          </div>

          {/* Archivos y enlaces */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold mb-4">Archivos y enlaces</h2>
            <ul className="space-y-3">
              {bibliografia.archivos.map((archivo, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {archivo.nombre}
                  </a>
                </li>
              ))}
              {bibliografia.enlaces.map((enlace, index) => (
                <li key={index} className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-500" />
                  <a
                    href={enlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {enlace.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div></>
  );
};

export default NivelBibliografia;
