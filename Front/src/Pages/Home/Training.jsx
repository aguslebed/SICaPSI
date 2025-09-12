import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Training = () => {
  const [cursos, setCursos] = useState([]);
  const Curs = [
    {
      id: 1,
      titulo: "Curso de React para Principiantes",
      docente: "Ana García",
      fechaInicio: "2024-01-15",
      progreso: 75,
      niveles: [
        { nivel_1: "Introducción a React" },
        { nivel_2: "Componentes y Props" },
        { nivel_3: "Estado y Eventos" },
        { nivel_4: "Hooks Avanzados" }
      ]
    },
    {
      id: 2,
      titulo: "JavaScript Moderno ES6+",
      docente: "Carlos Rodríguez",
      fechaInicio: "2024-02-10",
      progreso: 40,
      niveles: [
        { nivel_1: "Fundamentos de JavaScript" },
        { nivel_2: "Arrow Functions y Destructuring" },
        { nivel_3: "Promesas y Async/Await" },
        { nivel_4: "Módulos y Webpack" }
      ]
    },
    {
      id: 3,
      titulo: "Desarrollo Full Stack con MERN",
      docente: "María López",
      fechaInicio: "2024-03-05",
      progreso: 20,
      niveles: [
        { nivel_1: "MongoDB y Bases de Datos" },
        { nivel_2: "Express.js y APIs REST" },
        { nivel_3: "React Frontend" },
        { nivel_4: "Despliegue y Production" }
      ]
    }
  ];

 
 
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await axios.get('/api/usuario/cursos');
        const data = Array.isArray(response.data) ? response.data : [];
        setCursos(Curs); //CAMBIAR
        typeof data;
        
      } catch (error) {
        console.error('Error al cargar los cursos:', error);
      }
    };

    fetchCursos();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mis Cursos</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursos.length != 0 ?
                  Curs.map((cursos) => (
                    <div key={cursos._id} className="bg-white rounded-lg shadow p-4">
                      <h3 className="text-lg font-bold text-indigo-700 mb-1">{cursos.titulo}</h3>
                      <p className="text-sm text-gray-600 mb-2">Docente: {cursos.docente}</p>
                      <p className="text-sm text-gray-500 mb-4">Inicio: {new Date(cursos.fechaInicio).toLocaleDateString()}</p>

                      {/* Progreso */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-indigo-500 h-3 rounded-full"
                            style={{ width: `${cursos.progreso}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{cursos.progreso}% completado</p>
                      </div>

                      <Link
                        to={`/curso/${cursos._id}`}
                        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                      >
                        Ir al curso
                      </Link>
                    </div>))
                  :
                    <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">
                      No estás inscrito en ningún curso actualmente.
                    </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Training;