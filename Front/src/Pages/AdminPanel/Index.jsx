import React, { useState } from "react";
import admisionImg from "../../assets/admision2.png";
import profesorImg from "../../assets/profesor.png";
import cursoImg from "../../assets/curso.png";
import usuarioImg from "../../assets/usuario.png";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../Components/Student/NavBar";
import { getAllActiveTrainings, fetchAdmisionUsuarios } from '../../API/Request';
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const options = [
    {
      title: "Admision de Usuarios",
      link: "adminPanel/admisionUsuario",
      isImage: true,
      image: admisionImg,
      onClick: async () => {
        setLoading(true);
        try {
          const data = await fetchAdmisionUsuarios();
          navigate("/adminPanel/admisionUsuario", { state: { data } });
        } catch (error) {
          console.error("Error fetching data for AdmisionUsuario:", error);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      title: "Gestión de Usuarios",
      link: "/adminPanel/gestionUsuario",
      isImage: true,
      image: usuarioImg,
    },
    {
      title: "Gestión de Cursos",
      link: "/adminPanel/gestionCursos",
      isImage: true,
      image: cursoImg,
    },
    {
      title: "Gestión de Profesores",
      link: "/adminPanel/gestionProfesores",
      isImage: true,
      image: profesorImg,
    },
  ];

  return (
    <>
      {loading && <LoadingOverlay />}
      <NavBar />
      <main className="min-h-screen bg-[#f6f8fa] w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">Panel de Administrador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {options.map((option, index) => {
              const isImageBox = option.isImage;
              return (
                <div
                  key={index}
                  className={"transition-all duration-300 ease-in-out rounded-2xl p-8 flex flex-col items-center justify-center border min-h-[180px] hover:scale-105 hover:shadow-lg hover:bg-blue-100 hover:border-blue-300 active:scale-95 active:shadow-md transform cursor-pointer"}
                  style={{ minWidth: 180, background: '#dedede', borderColor: '#dedede' }}
                  onClick={option.onClick}
                >
                  {isImageBox ? (
                    <img
                      src={option.image}
                      alt={option.title}
                      style={{ width: '100px', height: '100px', objectFit: 'contain', display: 'block', margin: '0 auto 18px auto', background: 'transparent', borderRadius: 0, boxShadow: 'none' }}
                    />
                  ) : (
                    <div className="mb-6">{option.icon}</div>
                  )}
                  <p className="text-center text-black font-semibold text-lg">{option.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
