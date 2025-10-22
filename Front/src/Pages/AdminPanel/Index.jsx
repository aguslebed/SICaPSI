import React from "react";
import admisionImg from "../../assets/admision2.png";
import profesorImg from "../../assets/profesor.png";
import cursoImg from "../../assets/curso.png";

import usuarioImg from "../../assets/usuario.png";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../Components/Student/NavBar";
import { getAllActiveTrainings, fetchAdmisionUsuarios, getAllUsers } from '../../API/Request';
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";
import './AdminPanel.css';

export default function AdminPanel() {
  const navigate = useNavigate();
  const options = [
    {
      title: "Admisión de Usuarios",
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
       onClick: async () => {
        setLoading(true);
        try {
          navigate("/adminPanel/gestionUsuario");
        } catch (error) {
          console.error("Error fetching data for GestionUsuario:", error);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      title: "Gestión de Capacitación",
      link: "/adminPanel/gestionCapacitacion",
      isImage: true,
      image: cursoImg,
    },
    {
      title: "Gestión de Profesores",
      link: "/adminPanel/gestionProfesores",
      isImage: true,
      image: profesorImg,
        onClick: async () => {
        setLoading(true);
        try {
          navigate("/adminPanel/gestionProfesores");
        } catch (error) {
          console.error("Error fetching data for GestionUsuario:", error);
        } finally {
          setLoading(false);
        }
      },
    },
     {
      title: "Gestión Directivo",
      link: "/adminPanel/gestionDirectivo",
      isImage: true,
      image: profesorImg,
        onClick: async () => {
        setLoading(true);
        try {
          navigate("/adminPanel/gestionDirectivo");
        } catch (error) {
          console.error("Error fetching data for Gestion Directivo:", error);
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  return (
    <>
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h2 className="admin-title">Panel de Administrador</h2>
          <hr className="admin-divider" />
          <div className="admin-grid">
          {options.map((option, index) => {
            return (
              <div
                key={index}
                className="admin-grid-card"
                onClick={async () => {
                  try {
                    // If this is the Gestion Capacitacion card, fetch active trainings first
                    if (option.link.includes('gestionCapacitacion')) {
                      await getAllActiveTrainings();
                      navigate('/adminPanel/gestionCapacitacion');
                      return;
                    }
                    // otherwise navigate to the configured link
                    navigate(option.link.startsWith('/') ? option.link : `/${option.link}`);
                  } catch (err) {
                    // If unauthorized, redirect to login
                    if (err?.response?.status === 401) {
                      navigate('/login');
                      return;
                    }
                    // otherwise still navigate (or show an alert)
                    console.error('Error loading trainings', err);
                    navigate(option.link.startsWith('/') ? option.link : `/${option.link}`);
                  }
                }}
              >
                <img
                  src={option.image}
                  alt={option.title}
                />
                <p>{option.title}</p>
              </div>
            );
          })}
        </div>
        </div>
      </main>
    </>
  );
}
