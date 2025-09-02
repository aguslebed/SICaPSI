import { useState } from "react";
import { Link } from "react-router-dom";

function Registrarse() {
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("Funcionalidad de registro pendiente.");
    // Aquí irá la lógica de registro
  };

  return (
    <>
      {/* Fondo */}
      <div
        className="fixed inset-0 bg-[url('./assets/fondo.jpg')] bg-cover bg-center 
        before:content-[''] before:absolute before:inset-0 
        before:bg-[radial-gradient(1000px_600px_at_35%_35%,rgba(0,0,0,.08),transparent_40%)] 
        after:content-[''] after:absolute after:inset-0 
        after:bg-gradient-to-r after:from-[#10151b]/15 after:to-[#10151b]/35"
        aria-hidden="true"
      ></div>

      {/* Contenedor */}
      <main className="relative min-h-screen flex items-center justify-center p-6">
        <section className="w-full max-w-2xl bg-white/95 shadow-2xl rounded-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="w-full flex justify-center mb-6 select-none">
            <h1 className="text-4xl font-extrabold tracking-widest">
              SIC<span className="text-[#f39a2d]">A</span>PSI
            </h1>
          </div>

          <h2 className="text-gray-900 text-2xl font-bold text-center mb-6">
            Formulario de Inscripción
          </h2>

          {/* Formulario */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nombre completo */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Apellidos"
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* DNI y Fecha de Nacimiento */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="DNI"
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="date"
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Email y Código Postal */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Mail"
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Código Postal"
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Dirección"
                className="border rounded-lg px-3 py-2 col-span-1"
              />
              <input
                type="text"
                placeholder="Número"
                className="border rounded-lg px-3 py-2 col-span-1"
              />
              <input
                type="text"
                placeholder="Departamento"
                className="border rounded-lg px-3 py-2 col-span-1"
              />
            </div>

            {/* Provincia y Localidad */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Provincia"
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Localidad"
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Código de área"
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Número de teléfono"
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Contraseña"
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="password"
                placeholder="Repetir contraseña"
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Aceptación de términos */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
              />
              <label className="ml-2 text-gray-700">
                Acepto los{" "}
                <a
                  href="#"
                  className="text-sky-600 hover:underline font-semibold"
                >
                  términos y condiciones
                </a>
              </label>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition cursor-pointer"
            >
              Registrarse
            </button>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </form>

          {/* Volver a inicio de sesión */}
          <div className="mt-6 text-center">
            <span className="text-xs text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <a
                href="/"
                className="text-sky-600 hover:underline font-semibold"
                style={{ fontSize: "0.95em" }}
              >
                Inicia sesión
              </a>
            </span>
          </div>
        </section>
      </main>
    </>
  );
}

export default Registrarse;