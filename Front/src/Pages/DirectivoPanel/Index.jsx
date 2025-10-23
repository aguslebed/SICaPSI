import React from "react";
import admisionImg from "../../assets/admision2.png";
import usuarioImg from "../../assets/usuario.png";
import listadoImg from "../../assets/listado.png";


import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../Components/Student/NavBar";
import { getAllActiveTrainings, fetchAdmisionUsuarios, getAllUsers } from '../../API/Request';
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";
import { BiBarChart } from "react-icons/bi"; // Ícono de gráfico de barras
import { IoDocumentTextOutline } from "react-icons/io5"; // Ícono de documento más similar
import './DirectivoPanel.css';

export default function DirectivoPanel() {
  const navigate = useNavigate();
  const options = [
    {
      title: "Validar Contenido",
      link: "/directivoPanel/validarContenido",
      isImage: true,
      image: admisionImg,
      onClick: async () => {
        try {
          navigate('/directivoPanel/validarContenido');
        } catch (error) {
          console.error("Error navegando a ValidarContenido:", error);
        }
      },
    },
    {
      title: "Estadísticas",
      link: "/directivoPanel/estadisticas",
      isImage: false,
      icon: BiBarChart,
      onClick: async () => {
        try {
          navigate('/directivoPanel/estadisticas');
        } catch (error) {
          console.error("Error navegando a Estadísticas:", error);
        }
      },
    },
    {
      title: "Registros",
      link: "/directivoPanel/registros",
      isImage: false,
      icon: IoDocumentTextOutline,
      onClick: async () => {
        try {
          navigate('/directivoPanel/registros');
        } catch (error) {
          console.error("Error navegando a Registros:", error);
        }
      },
    },
    {
      title: "Listados",
      link: "/directivoPanel/gestionDirectivo",
      isImage: true,
      image: listadoImg,
      onClick: async () => {
        try {
          navigate('/directivoPanel/gestionDirectivo');
        } catch (error) {
          console.error("Error navegando a GestionDirectivo:", error);
        }
      },
    },
  ];

  return (
    <>
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h2 className="admin-title">Panel Directivo</h2>
          <hr className="admin-divider" />
          <div className="admin-grid">
            {options.map((option, index) => (
              <div
                key={index}
                className="admin-grid-card"
                onClick={option.onClick}
              >
                {option.isImage ? (
                  <img src={option.image} alt={option.title} />
                ) : (
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <option.icon size={60} style={{ color: '#000000' }} />
                  </div>
                )}
                <p>{option.title}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
