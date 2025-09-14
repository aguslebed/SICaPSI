import { Link } from "react-router-dom";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import home from "../../assets/home.jpg";

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
            <Link 
              to="/login" 
              className="text-orange-400 hover:underline"
            >
              LOGIN
            </Link>
          </nav>

          {/* Menu Mobile desplegable */}
          {mobileOpen && (
            <div className="absolute md:hidden left-0 right-0 top-full bg-white border-t shadow-md">
              <nav className="flex flex-col px-4 py-3 space-y-2 text-gray-800 font-semibold text-sm">
                <a href="#nosotros" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>NOSOTROS</a>
                <a href="#cursos" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>CURSOS</a>
                <a href="#novedades" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>NOVEDADES</a>
                <a href="#contactos" className="hover:text-orange-400 cursor-pointer" onClick={() => setMobileOpen(false)}>CONTACTOS</a>
                <Link to="/login" className="text-orange-400 hover:underline cursor-pointer" onClick={() => setMobileOpen(false)}>LOGIN</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="top"
        className="min-h-screen flex flex-col justify-center text-white px-6 md:px-8 lg:px-12 pt-24 md:pt-28"
        style={{
          backgroundImage: `url(${home})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl md:ml-auto mt-10 md:mt-0"> {/* desplaza APSEPBA a la derecha en pantallas grandes */}
          <h3 
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            APSEPBA
          </h3>
          <p 
            className="mt-4 text-base md:text-xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Asociación de Profesionales de Seguridad Privada de la Provincia de Buenos Aires.
          </p>
          <a
            href="#nosotros"
            className="mt-6 inline-block px-6 md:px-8 py-3 border border-white rounded-full text-sm md:text-lg font-semibold hover:bg-white hover:text-black transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            NOSOTROS
          </a>
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
