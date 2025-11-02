import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { APIRegistro } from "../../API/Request";
import ModalMensajeRegistro from "../../Components/Modals/RegisterModal";
import ValidationErrorModal from "../../Components/Modals/ValidationErrorModal";
import { useUser } from "../../context/UserContext";
import NavBar from '../../Components/Student/NavBar';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();
  const isAdmin = userData?.user?.role === "Administrador";
  const isAdminCreateRoute = isAdmin && location?.pathname?.startsWith("/adminPanel/gestionUsuario/crearUsuario");

  //Estados MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCodigo, setModalCodigo] = useState(null);
  const [modalMensaje, setModalMensaje] = useState("");

  // Estados para modal de validación
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalCodigo >= 200 && modalCodigo < 400) {
      if (isAdminCreateRoute) {
        // Si es administrador creando un usuario, volver a la gestión de usuarios
        navigate("/adminPanel/gestionUsuario");
      } else {
        // Si es un registro normal, ir al login
        navigate("/login");
      }
    }
  };

  //Estado de los errores - REMOVIDO, ahora usamos modal
  const [documentType, setdocumentType] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [documentNumber, setdocumentNumber] = useState("");
  const [birthDate, setbirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setpostalCode] = useState("");
  const [address, setaddress] = useState("");
  const [addressNumber, setaddressNumber] = useState("");
  const [apartment, setapartment] = useState("");
  const [areaCode, setareaCode] = useState("");
  const [phone, setphone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setrePassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Rol (solo visible para administradores)
  const [selectedRole, setSelectedRole] = useState(null);
  const ROLE_OPTIONS = [
    { value: "Capacitador", label: "Capacitador" },
    { value: "Alumno", label: "Alumno" },
    { value: "Administrador", label: "Administrador" },
    { value: "Directivo", label: "Directivo" },
  ];
  
  
  // Estados de las provinces y ciudades
  const [province, setprovince] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [ciudades, setCiudades] = useState([]);

  // Array de archivos de provinces
  const provincesArchivos = [
    "buenos_aires", "catamarca", "chaco", "chubut", "ciudad_autónoma_de_buenos_aires", "corrientes", "córdoba", "entre_ríos", "formosa", "jujuy", "la_pampa", "la_rioja", "mendoza", "misiones", "neuquén", "río_negro", "salta", "san_juan", "san_luis", "santa_cruz", "santa_fe", "santiago_del_estero", "tierra_del_fuego,_antártida_e_islas_del_atlántico_sur", "tucumán"
  ];

  // Mapeo para mostrar el firstName legible
  const provincefirstNames = {
    "buenos_aires": "Buenos Aires",
    "catamarca": "Catamarca",
    "chaco": "Chaco",
    "chubut": "Chubut",
    "ciudad_autónoma_de_buenos_aires": "Ciudad Autónoma de Buenos Aires",
    "corrientes": "Corrientes",
    "córdoba": "Córdoba",
    "entre_ríos": "Entre Ríos",
    "formosa": "Formosa",
    "jujuy": "Jujuy",
    "la_pampa": "La Pampa",
    "la_rioja": "La Rioja",
    "mendoza": "Mendoza",
    "misiones": "Misiones",
    "neuquén": "Neuquén",
    "río_negro": "Río Negro",
    "salta": "Salta",
    "san_juan": "San Juan",
    "san_luis": "San Luis",
    "santa_cruz": "Santa Cruz",
    "santa_fe": "Santa Fe",
    "santiago_del_estero": "Santiago del Estero",
    "tierra_del_fuego,_antártida_e_islas_del_atlántico_sur": "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
    "tucumán": "Tucumán"
  };

  // Handler para cargar ciudades
  const handleprovinceChange = async (e) => {
    const prov = e.target.value;
    setprovince(prov);
    setCiudad("");
    if (prov) {
      try {
        const data = await import(`../../Components/Localidades/${prov}.json`);
        setCiudades(data.default.localidades || []);
      } catch {
        setCiudades([]);
      }
    } else {
      setCiudades([]);
    }
  };

  // Utilidades de validación y límites convencionales
  const nameRegex = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]/g; // para limpiar caracteres no permitidos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const addressAllowed = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 .,#º°-]/g; // caracteres comunes de dirección

  const maxBirthDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 16); // mínimo 16 años
    return d.toISOString().split("T")[0];
  }, []);
  const minBirthDate = "1900-01-01";

  const docConfig = useMemo(() => {
    switch (documentType) {
      case "DNI":
        return { type: "numeric", max: 8, pattern: /^\d{7,8}$/, help: "7 a 8 dígitos" };
      case "CUIL/CUIT":
        return { type: "numeric", max: 11, pattern: /^\d{11}$/, help: "11 dígitos" };
      case "Pasaporte":
        return { type: "alnum", max: 9, pattern: /^[A-Z0-9]{6,9}$/, help: "6 a 9 caracteres alfanuméricos" };
      default:
        return { type: "any", max: 12, pattern: /.*/, help: "" };
    }
  }, [documentType]);

  const sanitizeNumeric = (val, maxLen) => val.replace(/\D/g, "").slice(0, maxLen);
  const sanitizeName = (val) => val.replace(nameRegex, "").replace(/\s{2,}/g, " ").trimStart().slice(0, 50);
  const sanitizeAddress = (val) => val.replace(addressAllowed, "").replace(/\s{2,}/g, " ").slice(0, 60);
  const sanitizeApartment = (val) => val.replace(/[^A-Za-z0-9 -]/g, "").slice(0, 10);
  const sanitizePassport = (val, maxLen) => val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, maxLen);

  const validateBeforeSubmit = () => {
    const errors = [];
    if (!firstName || firstName.trim().length < 2) errors.push("Nombre inválido. Debe contener solo letras y mínimo 2 caracteres.");
    if (!lastName || lastName.trim().length < 2) errors.push("Apellido inválido. Debe contener solo letras y mínimo 2 caracteres.");
    if (!documentType) errors.push("Seleccione el tipo de documento.");
    if (documentType === "DNI" && !/^\d{7,8}$/.test(documentNumber)) errors.push("DNI inválido. Debe tener 7 u 8 dígitos.");
    if (documentType === "CUIL/CUIT" && !/^\d{11}$/.test(documentNumber)) errors.push("CUIL/CUIT inválido. Debe tener 11 dígitos.");
    if (documentType === "Pasaporte" && !/^[A-Z0-9]{6,9}$/.test(documentNumber)) errors.push("Pasaporte inválido. Debe ser alfanumérico (6 a 9).");
    if (!birthDate || birthDate < minBirthDate || birthDate > maxBirthDate) errors.push("Fecha de nacimiento inválida (mínimo 16 años).");
    if (!emailRegex.test(email)) errors.push("Correo electrónico inválido.");
    if (!/^\d{4,5}$/.test(postalCode)) errors.push("Código postal inválido (4 a 5 dígitos).");
    if (!address || address.length < 3) errors.push("Dirección inválida (mínimo 3 caracteres).");
    if (!/^\d{1,6}$/.test(addressNumber)) errors.push("Número de dirección inválido (solo dígitos, hasta 6).");
    if (!province) errors.push("Seleccione una provincia.");
    if (!ciudad) errors.push("Seleccione una ciudad.");
    if (!/^\d{2,4}$/.test(areaCode)) errors.push("Código de área inválido (2 a 4 dígitos).");
    if (!/^\d{6,10}$/.test(phone)) errors.push("Teléfono inválido (6 a 10 dígitos).");
    if (!password || password.length < 8 || password.length > 64) {
      errors.push("La contraseña debe tener entre 8 y 64 caracteres.");
    }
    if (password !== rePassword) errors.push("Las contraseñas no coinciden.");
    if (!isAdminCreateRoute && !aceptaTerminos) errors.push("Debe aceptar los términos y condiciones.");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateBeforeSubmit();
    if (errors.length) {
      setValidationMessage(errors[0]); // mostramos el primer error para guiar paso a paso
      setShowValidationModal(true);
      return;
    }

    try {
      const usuario = {
        firstName,
        lastName,
        documentType,
        documentNumber,
        birthDate,
        email,
        postalCode,
        address,
        addressNumber,
        apartment,
        province,
        city: ciudad,
        areaCode,
        phone,
        password,
        // Cuando un administrador crea el usuario, queda habilitado automáticamente
        ...(isAdminCreateRoute
          ? {
              status: 'available',
              createdByAdmin: true,
              ...(selectedRole ? { role: selectedRole } : {})
            }
          : {})
      };
      await APIRegistro(usuario);

      // Mostrar modal de éxito
      setModalCodigo(200);
      setModalMensaje("¡Usuario registrado correctamente!");
      setModalOpen(true);

      // Restablecer todos los campos
      setfirstName("");
      setlastName("");
      setdocumentType("");
      setdocumentNumber("");
      setbirthDate("");
      setEmail("");
      setpostalCode("");
      setaddress("");
      setaddressNumber("");
      setapartment("");
      setprovince("");
      setCiudad("");
      setareaCode("");
      setphone("");
      setPassword("");
      setrePassword("");
      setAceptaTerminos(false);
    setCiudades([]);
    setSelectedRole(null);

      // Redirigir o mostrar mensaje de éxito
    } catch (err) {
      setModalCodigo(err.code || 400);
      // Si hay detalles, los mostramos juntos
      let mensaje = err.message || "Error al registrar.";
      if (err.details && Array.isArray(err.details)) {
        mensaje += "\n" + err.details.map(d => `${d.field}: ${d.message}`).join("\n");
      }
      setModalMensaje(mensaje);
      setModalOpen(true);
    }
  };

  return (
    <>
    {/* MODAL DE VALIDACIÓN */}
      {showValidationModal && (
        <ValidationErrorModal
          mensaje={validationMessage}
          onClose={() => setShowValidationModal(false)}
        />
      )}
      
    {/* MODAL DE REGISTRO */}
      {modalOpen && (
        <ModalMensajeRegistro
          codigo={modalCodigo}
          mensaje={modalMensaje}
          onClose={handleModalClose}
        />
      )}
      {/* NavBar solo en ruta de creación desde Admin Panel */}
      {isAdminCreateRoute && <NavBar />}

      {/* Fondo: oculto en modo Admin crear usuario */}
      {!isAdminCreateRoute && (
        <div
          className="fixed inset-0 bg-[url('./assets/fondo.jpg')] bg-cover bg-center 
          before:content-[''] before:absolute before:inset-0 
          before:bg-[radial-gradient(1000px_600px_at_35%_35%,rgba(0,0,0,.08),transparent_40%)] 
          after:content-[''] after:absolute after:inset-0 
          after:bg-gradient-to-r after:from-[#10151b]/15 after:to-[#10151b]/35"
          aria-hidden="true"
        ></div>
      )}

      {/* Contenedor */}
      <main className="relative min-h-screen flex items-start justify-center px-4 pt-4 pb-2">
        <section className="w-full bg-white/95 shadow-2xl rounded-lg p-4" style={{ maxWidth: '500px' }}>
          {/* Logo - oculto en modo Admin crear usuario */}
          {!isAdminCreateRoute && (
            <div className="w-full flex justify-center mb-2 select-none">
              <h1 className="text-2xl font-extrabold tracking-widest">
                SIC<span className="text-[#f39a2d]">A</span>PSI
              </h1>
            </div>
          )}

          <h2 className="text-gray-900 text-lg font-bold text-center mb-2.5">
            {isAdminCreateRoute ? "Crear Usuario" : "Formulario de Inscripción"}
          </h2>

          {/* Formulario */}
          <form className="space-y-2" onSubmit={handleSubmit}>
            {/* firstName completo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nombre"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={firstName}
                onChange={e => setfirstName(sanitizeName(e.target.value))}
                minLength={2}
                maxLength={50}
                required
                inputMode="text"
                autoComplete="given-name"
                title="Solo letras, mínimo 2 y máximo 50 caracteres"
              />
              <input
                type="text"
                placeholder="Apellido"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={lastName}
                onChange={e => setlastName(sanitizeName(e.target.value))}
                minLength={2}
                maxLength={50}
                required
                inputMode="text"
                autoComplete="family-name"
                title="Solo letras, mínimo 2 y máximo 50 caracteres"
              />
            </div>

            {/* DNI y Fecha de Nacimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select className="border rounded-md px-2.5 py-1.5 w-full cursor-pointer text-sm" value={documentType} onChange={e => setdocumentType(e.target.value)} required>
                <option value="">Tipo de documento</option>
                <option value="DNI">DNI</option>
                <option value="CUIL/CUIT">CUIL/CUIT</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
              <input
                type="text"
                placeholder="Número"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={documentNumber}
                onChange={e => {
                  const v = e.target.value;
                  if (docConfig.type === "numeric") setdocumentNumber(sanitizeNumeric(v, docConfig.max));
                  else if (docConfig.type === "alnum") setdocumentNumber(sanitizePassport(v, docConfig.max));
                  else setdocumentNumber(v.slice(0, docConfig.max));
                }}
                maxLength={docConfig.max}
                required
                inputMode={docConfig.type === "numeric" ? "numeric" : "text"}
                title={docConfig.help || "Número de documento"}
              />
              <input
                type="date"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={birthDate}
                onChange={e => setbirthDate(e.target.value)}
                min={minBirthDate}
                max={maxBirthDate}
                required
              />
            </div>

            {/* Email y Código Postal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="email"
                placeholder="e-mail"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={email}
                onChange={e => setEmail(e.target.value.trim())}
                maxLength={254}
                required
                autoComplete="email"
                inputMode="email"
                title="Debe ser un correo válido"
              />
              <input
                type="text"
                placeholder="Código Postal"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={postalCode}
                onChange={e => setpostalCode(sanitizeNumeric(e.target.value, 5))}
                inputMode="numeric"
                maxLength={5}
                minLength={4}
                required
                title="4 a 5 dígitos"
              />
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Dirección"
                className="border rounded-md px-2.5 py-1.5 col-span-1 text-sm"
                value={address}
                onChange={e => setaddress(sanitizeAddress(e.target.value))}
                minLength={3}
                maxLength={60}
                required
                autoComplete="address-line1"
                title="Ingrese una dirección válida (máx. 60 caracteres)"
              />
              <input
                type="text"
                placeholder="Número"
                className="border rounded-md px-2.5 py-1.5 col-span-1 text-sm"
                value={addressNumber}
                onChange={e => setaddressNumber(sanitizeNumeric(e.target.value, 6))}
                inputMode="numeric"
                maxLength={6}
                required
                title="Solo dígitos (hasta 6)"
              />
              <input
                type="text"
                placeholder="Departamento"
                className="border rounded-md px-2.5 py-1.5 col-span-1 text-sm"
                value={apartment}
                onChange={e => setapartment(sanitizeApartment(e.target.value))}
                maxLength={10}
                title="Opcional. Solo letras, números, espacio y guión"
              />
            </div>

            {/* province y Ciudad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                className="border rounded-md px-2.5 py-1.5 w-full max-h-48 overflow-y-auto cursor-pointer text-sm"
                value={province}
                onChange={handleprovinceChange}
                required
              >
                <option value="">Provincia</option>
                {provincesArchivos.map(p => (
                  <option key={p} value={p}>{provincefirstNames[p]}</option>
                ))}
              </select>
              <select
                className="border rounded-md px-2.5 py-1.5 w-full max-h-48 overflow-y-auto cursor-pointer text-sm"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                disabled={!province}
                required
              >
                <option value="">Ciudad</option>
                {ciudades.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Código de área"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={areaCode}
                onChange={e => setareaCode(sanitizeNumeric(e.target.value, 4))}
                inputMode="numeric"
                maxLength={4}
                minLength={2}
                required
                title="2 a 4 dígitos"
              />
              <input
                type="text"
                placeholder="Número de teléfono"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={phone}
                onChange={e => setphone(sanitizeNumeric(e.target.value, 10))}
                inputMode="numeric"
                maxLength={10}
                minLength={6}
                required
                title="6 a 10 dígitos"
              />
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="password"
                placeholder="Contraseña"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={password}
                onChange={e => setPassword(e.target.value.slice(0, 64))}
                minLength={8}
                maxLength={64}
                required
                autoComplete="new-password"
                title="8 a 64 caracteres"
              />
              <input
                type="password"
                placeholder="Repetir contraseña"
                className="border rounded-md px-2.5 py-1.5 w-full text-sm"
                value={rePassword}
                onChange={e => setrePassword(e.target.value.slice(0, 64))}
                minLength={8}
                maxLength={64}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Rol (solo visible para administradores) */}
            {isAdminCreateRoute && (
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-gray-700">Rol del usuario</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={
                        "px-2 py-1.5 rounded-md border transition cursor-pointer text-xs " +
                        (selectedRole === opt.value
                          ? "bg-sky-500 text-white border-sky-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
                      }
                      onClick={() => setSelectedRole(opt.value)}
                      aria-pressed={selectedRole === opt.value}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Solo los administradores pueden asignar roles distintos a Guardia.</p>
              </div>
            )}

            {/* Aceptación de términos - solo visible para no administradores */}
            {!isAdminCreateRoute && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500 cursor-pointer"
                  checked={aceptaTerminos}
                  onChange={e => setAceptaTerminos(e.target.checked)}
                />
                <label className="ml-2 text-gray-700 text-sm">
                  Acepto los{" "}
                  <a
                    href="#"
                    className="text-sky-600 hover:underline font-semibold"
                  >
                    términos y condiciones
                  </a>
                </label>
              </div>
            )}

            {/* Botón de registro */}
            <button
              type="submit"
              className="w-full h-9 rounded-md bg-sky-500 text-white font-semibold hover:bg-sky-600 transition cursor-pointer text-sm"
            >
              {isAdminCreateRoute ? "Crear Usuario" : "Registrarse"}
            </button>
          </form>

          {/* Volver a inicio de sesión - solo visible para no administradores */}
          {!isAdminCreateRoute && (
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <a
                  href="/"
                  className="text-sky-600 hover:underline font-semibold text-xs"
                >
                  Inicia sesión
                </a>
              </span>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Register;