import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import home from "../../assets/home.jpg";

function Home() {
  return (
    <>
      {/* Navbar */}
      <header className="w-full fixed top-0 bg-white shadow z-50">
        <div className="flex items-center justify-between px-4 md:px-12 py-4">
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

          {/* Menu */}
          <nav className="space-x-4 md:space-x-8 text-gray-800 font-semibold text-sm md:text-base">
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
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="top"
        className="h-screen flex flex-col justify-center text-white px-6 md:px-24"
        style={{
          backgroundImage: `url(${home})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="max-w-80 mt-20"> {/* mueve APSEPBA a la derecha */}
          <h3 
            className="text-4x1 md:text-5xl font-bold"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            APSEPBA
          </h3>
          <p 
            className="mt-4 text-base md:text-1xl"
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
      <section id="nosotros" className="h-screen flex justify-center items-center">
        <h2 className="text-4xl font-bold">Sección Nosotros</h2>
      </section>
      <section id="cursos" className="h-screen flex justify-center items-center bg-gray-100">
        <h2 className="text-4xl font-bold">Sección Cursos</h2>
      </section>
      <section id="novedades" className="h-screen flex justify-center items-center">
        <h2 className="text-4xl font-bold">Sección Novedades</h2>
      </section>
      <section id="contactos" className="h-screen flex justify-center items-center bg-gray-100">
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
