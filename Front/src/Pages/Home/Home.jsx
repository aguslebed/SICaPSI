import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import home from "../../assets/home.jpg";

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 70, right: 50 });
  const loginButtonRef = useRef(null);

  const handleLoginClick = () => {
    console.log('LOGIN clickeado - estado antes:', loginDropdown);
    
    // Calcular posición del botón
    if (loginButtonRef.current) {
      const rect = loginButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 2, // Más pegado al botón
        right: window.innerWidth - rect.right // Alineado al borde derecho del botón
      });
    }
    
    setLoginDropdown(!loginDropdown);
    console.log('LOGIN clickeado - nuevo estado:', !loginDropdown);
  };

  return (
    <>
      {/* Navbar */}
      <header className="w-full fixed top-0 bg-white shadow z-50">
        <div className="relative max-w-screen-xl mx-auto flex items-center justify-between px-4 md:px-8 lg:px-12 py-4">
          {/* Logo con subtítulo */}
          <div className="flex flex-col leading-tight black-ops-one-regular">
            <a
              href="#top"
              className="text-4xl md:text-5xl"
            >
              SIC<span className="text-orange-400">A</span>PSI
            </a>
              <span
                className="text-xs md:text-sm -mt-1 inter-a" 
              >
                Sistema Inteligente de Capacitación de Personal de la Seguridad
              </span>

          </div>

          {/* Botón Hamburguesa (mobile) */}
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
          >
            {/* Ícono simple hamburguesa / X */}
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path fillRule="evenodd" d="M16.243 7.757a1 1 0 010 1.414L13.414 12l2.829 2.829a1 1 0 11-1.414 1.414L12 13.414l-2.829 2.829a1 1 0 11-1.414-1.414L10.586 12 7.757 9.171a1 1 0 111.414-1.414L12 10.586l2.829-2.829a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Menu Desktop */}
          <nav className="hidden md:flex space-x-4 md:space-x-8 text-gray-800 font-semibold text-sm md:text-base overflow-x-auto whitespace-nowrap no-scrollbar">
            <a href="#nosotros" className="hover:text-orange-400">NOSOTROS</a>
            <a href="#cursos" className="hover:text-orange-400">CURSOS</a>
            <a href="#novedades" className="hover:text-orange-400">NOVEDADES</a>
            <a href="#contactos" className="hover:text-orange-400">CONTACTOS</a>
            
            {/* Dropdown LOGIN */}
            <div className="relative inline-block">
              <button
                ref={loginButtonRef}
                onClick={handleLoginClick}
                className="cursor-pointer text-orange-400 hover:underline flex items-center gap-1"
                type="button"
              >
                LOGIN
                <svg className={`w-4 h-4 transition-transform ${loginDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown con diseño idéntico a la imagen */}
              {loginDropdown && (
                <div style={{
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                  width: '160px',
                  backgroundColor: '#fb923c', // Color naranja exacto
                  color: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 99999,
                  overflow: 'hidden',
                  border: 'none'
                }}>
                  {/* Flecha triangular apuntando hacia arriba */}
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '20px',
                    width: '0',
                    height: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '6px solid #fb923c'
                  }}></div>
                  
                  <Link
                    to="/registrarse"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '400',
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ea580c'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => setLoginDropdown(false)}
                  >
                    • Registrarse
                  </Link>
                  <Link
                    to="/login"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '400'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ea580c'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => setLoginDropdown(false)}
                  >
                    • Ingresar
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Menu Mobile desplegable */}
          {mobileOpen && (
            <div className="absolute md:hidden left-0 right-0 top-full bg-white border-t shadow-md">
              <nav className="flex flex-col px-4 py-3 space-y-2 text-gray-800 font-semibold text-sm">
                <a href="#nosotros" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>NOSOTROS</a>
                <a href="#cursos" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>CURSOS</a>
                <a href="#novedades" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>NOVEDADES</a>
                <a href="#contactos" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>CONTACTOS</a>
                
                {/* LOGIN Dropdown Mobile */}
                <div className="border-t pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLoginDropdown(!loginDropdown);
                    }}
                    className="text-orange-400 hover:underline cursor-pointer flex items-center gap-1 w-full text-left"
                  >
                    LOGIN
                    <svg className={`w-4 h-4 transition-transform ${loginDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {loginDropdown && (
                    <div className="ml-4 mt-1 space-y-1">
                      <Link
                        to="/registrarse"
                        className="block text-orange-400 hover:underline cursor-pointer"
                        onClick={() => {
                          setMobileOpen(false);
                          setLoginDropdown(false);
                        }}
                      >
                        • Registrarse
                      </Link>
                      <Link
                        to="/login"
                        className="block text-orange-400 hover:underline cursor-pointer"
                        onClick={() => {
                          setMobileOpen(false);
                          setLoginDropdown(false);
                        }}
                      >
                        • Ingresar
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="top"
        className="min-h-screen flex flex-col justify-center items-center md:items-start text-white px-6 md:px-8 lg:px-12 pt-24 md:pt-28"
        style={{
          backgroundImage: `url(${home})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="w-full">
          <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 mt-10 md:mt-0 text-center md:text-left">
            <h3 
              className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              APSEPBA
            </h3>
            <p 
              className="mt-4 text-base md:text-xl max-w-2xl leading-relaxed mx-auto md:mx-0"
              style={{ fontFamily: "'Inter', sans-serif", textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
            >
              Asociación de Profesionales de Seguridad
              <br />
              de la Provincia de Buenos Aires.
            </p>
            <a
              href="#nosotros"
              className="mt-6 inline-block px-6 md:px-8 py-3 border border-white rounded-full text-sm md:text-lg font-semibold hover:bg-white hover:text-black transition"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              NOSOTROS
            </a>
          </div>
        </div>
      </section>

      {/* Secciones internas */}
      <section id="nosotros" className="h-screen scroll-mt-24 md:scroll-mt-28 flex justify-center items-center px-6 md:px-8 lg:px-12">
        <h2 className="text-4xl font-bold">Sección Nosotros</h2>
      </section>
      <section id="cursos" className="h-screen scroll-mt-24 md:scroll-mt-28 flex justify-center items-center bg-gray-100 px-6 md:px-8 lg:px-12">
        <h2 className="text-4xl font-bold">Sección Cursos</h2>
      </section>
      <section id="novedades" className="h-screen scroll-mt-24 md:scroll-mt-28 flex justify-center items-center px-6 md:px-8 lg:px-12">
        <h2 className="text-4xl font-bold">Sección Novedades</h2>
      </section>
      <section id="contactos" className="h-screen scroll-mt-24 md:scroll-mt-28 flex justify-center items-center bg-gray-100 px-6 md:px-8 lg:px-12">
        <h2 className="text-4xl font-bold">Sección Contactos</h2>
      </section>

      {/* Botón WhatsApp */}
      <a
        href="https://wa.me/5491112345678" // cambia al tuyo
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#0B3954] text-white p-5 md:p-6 rounded-full shadow-xl hover:scale-110 transition"
      >
        <FaWhatsapp size={34} />
      </a>
    </>
  );
}

export default Home;
