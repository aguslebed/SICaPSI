import { useState } from "react";
import { login } from "../../API/Request";
import { Link } from "react-router-dom";
import { useUser } from "../../Context/UserContext";

function Login() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setUserData } = useUser(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const data = await login(email, password);
        setUserData(data); 
  

      // Indicar que se debe mostrar el modal
       sessionStorage.setItem("showWelcomeModal", "true");

      // Redirigir al dashboard
        window.location.href = "/userPanel";
    } catch (err) {
      setError(err.message);
    }
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
        <section className="w-full max-w-md bg-white/95 shadow-2xl rounded-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="w-full flex justify-center mb-6 select-none">
            <h1 className="text-4xl font-extrabold tracking-widest">
              SIC<span className="text-[#f39a2d]">A</span>PSI
            </h1>
          </div>

          <h2 className="text-gray-900 text-xl font-semibold mb-6">
            Iniciar sesión
          </h2>

          {/* Formulario */}
          <form id="loginForm" className="space-y-4 " onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm text-gray-700 mb-1"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className="w-full border-0 border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 transition-colors"
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm text-gray-700 mb-1"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full border-0 border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 accent-sky-500"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-700"
              >
                Recordar contraseña
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition cursor-pointer"
            >
              Acceder
            </button>

            <p id="error" className="text-red-600 text-sm mt-2">{error}</p>
          </form>

          {/* Texto de registro */}
          <div className="mt-6 text-center">
            <span className="text-xs text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link
                to="/registrarse" 
                className="text-sky-600 hover:underline font-semibold"
                style={{ fontSize: "0.95em" }}
              >
                Registrate
              </Link>
            </span>
          </div>
        </section>
      </main>
    </>
  );
}

export default Login;
