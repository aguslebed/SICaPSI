import React from 'react';
import NavBar from '../../Components/Student/NavBar';
import './DirectivoPanel.css';
import { BiBarChart } from "react-icons/bi";

export default function Estadisticas() {
  return (
    <>
      <NavBar />
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h2 className="admin-title">Estadísticas</h2>
          <hr className="admin-divider" />
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '1rem',
            padding: '3rem',
            margin: '2rem 0'
          }}>
            <BiBarChart size={120} style={{ color: '#6c757d', marginBottom: '2rem' }} />
            
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#495057', 
              marginBottom: '1rem' 
            }}>
              Módulo en Desarrollo
            </h3>
            
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#6c757d', 
              marginBottom: '0.5rem',
              lineHeight: '1.6'
            }}>
              El módulo de Estadísticas se encuentra actualmente en desarrollo.
            </p>
            
            <p style={{ 
              fontSize: '1rem', 
              color: '#868e96', 
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Estará disponible próximamente con reportes detallados y análisis de datos.
            </p>
            
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e9ecef',
              borderRadius: '0.5rem',
              border: '1px solid #ced4da'
            }}>
              <span style={{ 
                fontSize: '0.9rem', 
                color: '#495057',
                fontWeight: '500'
              }}>
                🚧 En construcción
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}