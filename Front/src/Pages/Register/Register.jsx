import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { APIRegistro } from "../../API/Request";
import ModalMensajeRegistro from "../../Components/Modals/RegisterModal";

function Register() {
  const navigate = useNavigate();

  //Estados MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCodigo, setModalCodigo] = useState(null);
  const [modalMensaje, setModalMensaje] = useState("");

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalCodigo >= 200 && modalCodigo < 400) {
      navigate("/login");
    }
  };

  //Estado de los errores
  const [error, setError] = useState("");
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
      } catch (err) {
        setCiudades([]);
      }
    } else {
      setCiudades([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar usando los estados
    if (!firstName || !lastName || !documentType || !documentNumber || !birthDate 
     || !email || !postalCode || !address || !addressNumber || !province || !ciudad || !areaCode || !phone || !password 
     || !rePassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (password !== rePassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones.");
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
        password
      };
      const data = await APIRegistro(usuario);

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
    {/* MODAL */}
      {modalOpen && (
        <ModalMensajeRegistro
          codigo={modalCodigo}
          mensaje={modalMensaje}
          onClose={handleModalClose}
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
            {/* firstName completo */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                className="border rounded-lg px-3 py-2 w-full"
                value={firstName}
                onChange={e => setfirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Apellido"
                className="border rounded-lg px-3 py-2 w-full"
                value={lastName}
                onChange={e => setlastName(e.target.value)}
              />
            </div>

            {/* DNI y Fecha de Nacimiento */}
            <div className="grid grid-cols-3 gap-4 ">
              <select className="border rounded-lg px-3 py-2 w-full cursor-pointer" value={documentType} onChange={e => setdocumentType(e.target.value)} required>
                <option value="">Tipo de documento</option>
                <option value="DNI">DNI</option>
                <option value="CUIL/CUIT">CUIL/CUIT</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
              <input type="text" placeholder="Número" className="border rounded-lg px-3 py-2 w-full" required value={documentNumber} onChange={e => setdocumentNumber(e.target.value)} />
              <input type="date" className="border rounded-lg px-3 py-2 w-full" required value={birthDate} onChange={e => setbirthDate(e.target.value)} />
            </div>

            {/* Email y Código Postal */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="e-mail"
                className="border rounded-lg px-3 py-2 w-full"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Código Postal"
                className="border rounded-lg px-3 py-2 w-full"
                value={postalCode}
                onChange={e => setpostalCode(e.target.value)}
              />
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Dirección"
                className="border rounded-lg px-3 py-2 col-span-1"
                value={address}
                onChange={e => setaddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Número"
                className="border rounded-lg px-3 py-2 col-span-1"
                value={addressNumber}
                onChange={e => setaddressNumber(e.target.value)}
              />
              <input
                type="text"
                placeholder="Departamento"
                className="border rounded-lg px-3 py-2 col-span-1"
                value={apartment}
                onChange={e => setapartment(e.target.value)}
              />
            </div>

            {/* province y Ciudad */}
            <div className="grid grid-cols-2 gap-4">
              <select
                className="border rounded-lg px-3 py-2 w-full max-h-48 overflow-y-auto cursor-pointer"
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
                className="border rounded-lg px-3 py-2 w-full max-h-48 overflow-y-auto cursor-pointer"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                required
                disabled={!province}
              >
                <option value="">Ciudad</option>
                {ciudades.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Código de área"
                className="border rounded-lg px-3 py-2 w-full"
                value={areaCode}
                onChange={e => setareaCode(e.target.value)}
              />
              <input
                type="text"
                placeholder="Número de teléfono"
                className="border rounded-lg px-3 py-2 w-full"
                value={phone}
                onChange={e => setphone(e.target.value)}
              />
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Contraseña"
                className="border rounded-lg px-3 py-2 w-full"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Repetir contraseña"
                className="border rounded-lg px-3 py-2 w-full"
                value={rePassword}
                onChange={e => setrePassword(e.target.value)}
              />
            </div>

            {/* Aceptación de términos */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-sky-500 border-gray-300 rounded focus:ring-sky-500 cursor-pointer"
                checked={aceptaTerminos}
                onChange={e => setAceptaTerminos(e.target.checked)}
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

export default Register;