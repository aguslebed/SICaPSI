import React from "react";
import admisionImg from "../../assets/admision2.png";
import profesorImg from "../../assets/profesor.png";
import cursoImg from "../../assets/curso.png";
import usuarioImg from "../../assets/usuario.png";
import { Link } from "react-router-dom";
import NavBar from "../../Components/Student/NavBar";

export default function AdminPanel() {
  const options = [
    {
      title: "Admision de Usuarios",
      link: "adminPanel/admisionUsuario",
      isImage: true,
      image: admisionImg,
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
      <NavBar />
      <main className="min-h-screen bg-[#f6f8fa] p-0">
        {/* Header azul superior eliminado y barra de administrador removida */}
        <section className="px-8 pt-8">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">Panel de Administrador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {options.map((option, index) => {
              const isImageBox = option.isImage;
              return (
                <Link
                  key={index}
                  to={option.link}
                  className={"transition-all duration-300 ease-in-out rounded-2xl p-8 flex flex-col items-center justify-center border min-h-[180px] hover:scale-105 hover:shadow-lg hover:bg-blue-100 hover:border-blue-300 active:scale-95 active:shadow-md transform"}
                  style={{ minWidth: 180, background: '#dedede', borderColor: '#dedede' }}
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
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
