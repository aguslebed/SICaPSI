import React from "react";
import admisionImg from "../../assets/admision2.png";
import profesorImg from "../../assets/profesor.png";
import cursoImg from "../../assets/curso.png";

import usuarioImg from "../../assets/usuario.png";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../Components/Student/NavBar";
import { getAllActiveTrainings, fetchAdmisionUsuarios, getAllUsers } from '../../API/Request';
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";
import './DirectivoPanel.css';

export default function DirectivoPanel() {
  const navigate = useNavigate();
  const options = [
    {
      title: "Gestión Directivo",
      link: "/directivoPanel/gestionDirectivo",
      isImage: true,
      image: profesorImg,
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
                <img src={option.image} alt={option.title} />
                <p>{option.title}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
