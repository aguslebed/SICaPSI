import { useEffect, useState } from "react";
import { login } from "../../API/Request";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from "../../Components/Shared/LoadingOverlay";
import ValidationErrorModal from "../../Components/Modals/ValidationErrorModal";
import AuthErrorModal from "../../Components/Modals/AuthErrorModal";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { userData, setUserData } = useUser(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;
    const role = userData?.user?.role;
    if (!role) return;
    if (role === 'Administrador') {
      navigate('/adminPanel', { replace: true });
    } else if (role === 'Directivo') {
      navigate('/directivoPanel', { replace: true });
    } else if (role === 'Capacitador') {
      navigate('/trainer', { replace: true });
    } else {
      navigate('/userPanel', { replace: true });
    }
  }, [userData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    // Validar campos vacíos
    if (!email && !password) {
      setValidationMessage("Debe completar todos los campos");
      setShowValidationModal(true);
      return;
    }
    if (!email) {
      setValidationMessage("Debe ingresar su correo electrónico");
      setShowValidationModal(true);
      return;
    }
    if (!password) {
      setValidationMessage("Debe ingresar su contraseña");
      setShowValidationModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const data = await login(email, password);
      setUserData(data);

      // Indicar que se debe mostrar el modal
      sessionStorage.setItem("showWelcomeModal", "true");

      // Redirigir según rol
      const role = data?.user?.role;
      if (role === 'Administrador') {
        navigate('/adminPanel');
      } else if (role === 'Directivo') {
        navigate('/directivoPanel');
      } else if (role === 'Capacitador') {
        navigate('/trainer');
      } else {
        navigate('/userPanel');
      }
    } catch (err) {
      // Mostrar modal de error con el mensaje específico si existe
      const msg = err?.message || "Email o contraseña Inválidos";
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Modal de validación */}
      {showValidationModal && (
        <ValidationErrorModal
          mensaje={validationMessage}
          onClose={() => setShowValidationModal(false)}
        />
      )}

      {/* Modal de error de autenticación */}
      {showErrorModal && (
        <AuthErrorModal
          mensaje={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {/* Fondo */}
      <div
        className="fixed inset-0 bg-[url('./assets/fondo.jpg')] bg-cover bg-center 
        before:content-[''] before:absolute before:inset-0 
        before:bg-[radial-gradient(1000px_600px_at_35%_35%,rgba(0,0,0,.08),transparent_40%)] 
        after:content-[''] after:absolute after:inset-0 
        after:bg-gradient-to-r after:from-[#10151b]/15 after:to-[#10151b]/35"
        aria-hidden="true"
      ></div>

      {/* Overlay de carga */}
      {isLoading && <LoadingOverlay label="Iniciando sesión..." />}

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
          <form id="loginForm" className="space-y-4 " onSubmit={handleSubmit} aria-busy={isLoading}>
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
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={isLoading}
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
                disabled={isLoading}
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
              className={`w-full h-12 rounded-lg text-white font-semibold transition ${isLoading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 cursor-pointer'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Procesando...
                </span>
              ) : (
                'Acceder'
              )}
            </button>
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
