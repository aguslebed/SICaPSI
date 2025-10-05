import React, { useState } from 'react';
import { CheckCircle, XCircle, Search, Filter, Bold } from 'lucide-react';
import NavBar from '../../Components/Student/NavBar';

const usuariosEjemplo = [
  { nombre: 'Juan', apellido: 'Juan', email: 'juan.juan@gmail.com', dni: '223334444', fecha: '12/07/2025', tipo: 'Capacitador', aprobado: true },
  { nombre: 'Pedro', apellido: 'Pedro', email: 'pedro.pedro@hotmail.com', dni: '55566777', fecha: '20/08/3035', tipo: 'Guardia', aprobado: true },
  { nombre: 'admin', apellido: 'admin', email: 'admin.admin@gmail.com', dni: '111111111', fecha: '11/08/2025', tipo: 'Administrador', aprobado: true },
  { nombre: 'admin', apellido: 'admin', email: 'admin.admin@gmail.com', dni: '111111111', fecha: '11/08/2025', tipo: 'Administrador', aprobado: true },
  { nombre: 'Agustina', apellido: 'Torres', email: 'agus.torres@gmail.com', dni: '5465675', fecha: '11/08/2025', tipo: 'Guardia', aprobado: true },
  { nombre: 'admin', apellido: 'admin', email: 'admin.admin@gmail.com', dni: '111111111', fecha: '11/08/2025', tipo: 'Administrador', aprobado: true },
  { nombre: 'Catalina', apellido: 'Gomez', email: 'cata.gomez@gmail.com', dni: '102746539', fecha: '11/08/2025', tipo: 'Capacitador', aprobado: true },

];

const tipos = [
  { label: 'Capacitador', value: 'Capacitador' },
  { label: 'Guardia', value: 'Guardia' },
  { label: 'Administrador', value: 'Administrador' },
];


export default function AdmisionUsuario() {
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState([]);
  const [tipoMenu, setTipoMenu] = useState(false);
  const [fechaMenu, setFechaMenu] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [fechaDesdeVisible, setFechaDesdeVisible] = useState(false);
  const [fechaHastaVisible, setFechaHastaVisible] = useState(false);

  const Calendar = ({ onChange }) => (
    <input
      type="date"
      value={fecha.toISOString().split('T')[0]}
      onChange={(e) => {
        const newDate = new Date(e.target.value);
        setFecha(newDate);
        onChange(newDate);
      }}
    />
  );

{/*  Filtros simulados (no funcionales, solo UI) */ }
    return (
    <>
      <NavBar />
      <main className="bg-[#f7f8fa] min-h-screen p-0">
        {/* Barra superior */}
          <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-center">
            <div className="black-ops-one-regular">
            </div>
          </div>
        
      <div className="w-full bg-[#0888c2]" style={{ marginTop: '-12px' }}>
  <div className="max-w-screen-xl mx-auto flex items-center justify-between">

{/*---------------------------------  Botón de volver ------------------------------*/ }
    <button 
      onClick={() => window.location.href = '/AdminPanel'} 
      style={{ 
        background: '#4dc3ff', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '20px', 
        padding: '7px 14px', 
        fontWeight: 500, 
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)', 
        height: '36px', 
        position: 'absolute', 
        left: '20px',
        top: '8%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer' // Added to change cursor to pointer on hover
      }}
    >
      <span style={{padding: '2px', width: '27px', height: '28px', backgroundColor: '#4dc3ff', color: '#fff'}}>⬅</span> Volver
    </button>
  </div>
</div>  

    <h1 style={{ fontSize: '45px', fontFamily: 'Inter, sans-serif', padding: '20px 40px', position: 'absolute', top: '150px', backgroundColor: 'transparent' }}>Admisión de usuarios</h1>
    <hr style={{ marginTop: '80px', border: '1px solid #e5e7eb', width: '96%', marginLeft: '40px' }} />
    <section className="mx-10 bg-white rounded-xl shadow p-5" style={{ marginTop: '30px' }}>
  
  {/* Filtros */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginBottom: 24,
        justifyContent: 'flex-start',
        width: '100%'
      }}>

  {/* Buscar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar"
                  style={{
                    border: '2px solid #222',
                    borderRadius: 20,
                    padding: '7px 16px',
                    width: 280,
                    fontSize: 15,
                    outline: 'none',
                    background: '#fff',
                    marginRight: -38,
                    marginTop: '50px',
                    zIndex: 2,
                    height: 38
                  }}
                />
  {/*{-------------------------------lupita buscador-----------------------------*/}
                <button
                  style={{
                    background: 'rgb(77, 195, 255)',
                    border: '0px solid #222',
                    borderRadius: '20%',
                    width: 50,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    left: '50px',
                    top: '25px'
                  }}
                  title="Buscar"
                >
                  <span style={{ fontSize: 24 }}>🔎︎</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 30 }}>
                <button style={{ background: '#4dc3ff', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontWeight: 500, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: 36 }}>Aplicar Filtros</button>
                <button style={{ background: '#4dc3ff', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontWeight: 500, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: 36 }}>Limpiar Filtros</button>
              </div>
            </div>

  {/*------------------------------------------------- TIPO --------------------------------------*/}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', marginLeft: '300px', marginTop: '-50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

  {/* Botón para abrir/cerrar menú */}
          <button onClick={() => setTipoMenu(!tipoMenu)}
          style={{
          fontSize: 15,
          fontWeight: 500,
          color: '#444',
          border: '1px solid #bdbdbd',
          borderRadius: 7,
          padding: '7px 12px',
          background: '#f7f8fa',
          cursor: 'pointer',
          height: 36,
          width: 180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Tipo<img width="20" height="20" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
          </button></div>

  {/*----------------------- Menú desplegable------------------------------------------- */}
    {tipoMenu && (
      <div
        style={{
          position: 'absolute',
          top: 35, //esto es para cambiar el espacio entre 'tipo' y las opciones
          left: 0,
          width: 180,
          background: '#f7f8fa',
          border: '1px solid #ccc',
          borderRadius: 7,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          padding: 5,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 5 //espacio entre las opciones
        }}
      >

        
  {/*----------- las opciones del botón 'TIPO'------------------- */}
        {tipos.map((t) => (
          <label
            key={t.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: 15, //letra para cambiar capacitador, guardia o admin
              color: '#333',
              borderRadius: 6
            }}
          >
            <span
              onClick={() =>
                setTipo(
                  tipo.includes(t.value)
                    ? tipo.filter((v) => v !== t.value)
                    : [...tipo, t.value]
                )
              }
              
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background: '#fff',
                border: '1px solid #bdbdbd'
              }}
            >
              {tipo.includes(t.value) ? (
                <XCircle size={0} color="#444" />
              ) : (
                <span style={{ width: 10, color: '#18b620ff', fontWeight: 'bold' }}>✓</span>
              )}
            </span>
            {t.label}
          </label>
        ))}
      </div>
    )}
  </div>

                  

  {/*--------------------------------------------* Fecha de creación -----------------------------------------------*/}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', marginLeft: '80px', marginTop: '-50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Botón para abrir/cerrar menú */}
                <button
                  onClick={() => setFechaMenu(!fechaMenu)}
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#444',
                    border: '1px solid #bdbdbd',
                    borderRadius: 7,
                    padding: '7px 12px',
                    background: '#f7f8fa',
                    cursor: 'pointer',
                    height: 36,
                    width: 180,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >Fecha de creación
                  <img width="20" height="20" src="https://img.icons8.com/ios-glyphs/60/chevron-down.png" alt="chevron-down"/>
                </button>
              </div>

              {/* Menú desplegable */}
              {fechaMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 35,
                    left: 0,
                    width: 180,
                    background: '#f7f8fa',
                    border: '1px solid #ccc',
                    borderRadius: 7,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    padding: 15,
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 23
                  }}
                >
                  <button
                    onClick={() => setFechaDesdeVisible(!fechaDesdeVisible)}
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#444',
                      border: '1px solid #bdbdbd',
                      borderRadius: 7,
                      padding: '7px 12px',
                      background: '#fff',
                      cursor: 'pointer',
                      height: 36,
                      width: '100%',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {fechaDesde ? `Desde: ${new Date(fechaDesde).toLocaleDateString()}` : "Desde"}
                  </button>
                  {fechaDesdeVisible && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 7,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        padding: 10,
                        zIndex: 20
                      }}
                    >
                      <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => {
                          setFechaDesde(e.target.value);
                          setFechaDesdeVisible(false);
                        }}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setFechaHastaVisible(!fechaHastaVisible)}
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#444',
                      border: '1px solid #bdbdbd',
                      borderRadius: 7,
                      padding: '7px 12px',
                      background: '#fff',
                      cursor: 'pointer',
                      height: 36,
                      width: '100%',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {fechaHasta ? `Hasta: ${new Date(fechaHasta).toLocaleDateString()}` : "Hasta"}
                  </button>
                  {fechaHastaVisible && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 7,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        padding: 10,
                        zIndex: 20
                      }}
                    >
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => {
                          setFechaHasta(e.target.value);
                          setFechaHastaVisible(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>


  {/*-------------------------- Tabla con los datos -------------------------------*/}

            <div style={{ marginTop: '80px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <table style={{ width: '100%', fontSize: '16px', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead style={{ backgroundColor: '#0288d1', color: '#fff' }}>
                  <tr>
                    <th style={{ padding: '18px', fontWeight: 'bold' }}>Nombre</th>
                    <th style={{ padding: '18px', fontWeight: 'bold' }}>Apellido</th>
                    <th style={{ padding: '18px', fontWeight: 'bold' }}>Email</th>
                    <th style={{ padding: '18px', fontWeight: 'bold' }}>DNI</th>
                    <th style={{ padding: '18px', fontWeight: 'bold' }}>Fecha de creación</th>
                    <th style={{ padding: '18px', fontWeight: 'bold' }}>Tipo</th>
                    <th style={{ padding: '18px', fontWeight: 'bold' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#fff' }}>
                  {usuariosEjemplo.map((u, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '18px' }}>{u.nombre}</td>
                      <td style={{ padding: '18px' }}>{u.apellido}</td>
                      <td style={{ padding: '18px' }}>{u.email}</td>
                      <td style={{ padding: '18px' }}>{u.dni}</td>
                      <td style={{ padding: '18px' }}>{u.fecha}</td>
                      <td style={{ padding: '18px' }}>{u.tipo}</td>
                      <td style={{ padding: '18px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button style={{ color: '#4caf50', border: 'none', background: 'none', cursor: 'pointer' }} title="Aprobar">
                          <CheckCircle size={28} />
                        </button>
                        <button style={{ color: '#f44336', border: 'none', background: 'none', cursor: 'pointer' }} title="Rechazar">
                          <XCircle size={28} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '14px', color: '#757575' }}>
              <span>Anterior</span>
              <button style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#0288d1', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>1</button>
              <button style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#fff', color: '#757575', border: '1px solid #e5e7eb', cursor: 'pointer' }}>2</button>
              <button style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#fff', color: '#757575', border: '1px solid #e5e7eb', cursor: 'pointer' }}>3</button>
              <span>Siguiente</span>
            </div>
        </section>
      </main>
    </>
  );
}