import { useState } from "react";
import { Link } from "react-router-dom";
import { APIRegistro } from "../../api/auth";
import ModalMensajeRegistro from "../../componentes/modales/registro";

function Registrarse() {

  //Estados MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCodigo, setModalCodigo] = useState(null);
  const [modalMensaje, setModalMensaje] = useState("");

  //Estado de los errores
  const [error, setError] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [direccion, setDireccion] = useState("");
  const [numeroDireccion, setNumeroDireccion] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [codArea, setCodArea] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [repetirPassword, setRepetirPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  
  // Estados de las provincias y ciudades
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [ciudades, setCiudades] = useState([]);

  // Array de archivos de provincias
  const provinciasArchivos = [
    "buenos_aires", "catamarca", "chaco", "chubut", "ciudad_autónoma_de_buenos_aires", "corrientes", "córdoba", "entre_ríos", "formosa", "jujuy", "la_pampa", "la_rioja", "mendoza", "misiones", "neuquén", "río_negro", "salta", "san_juan", "san_luis", "santa_cruz", "santa_fe", "santiago_del_estero", "tierra_del_fuego,_antártida_e_islas_del_atlántico_sur", "tucumán"
  ];

  // Mapeo para mostrar el nombre legible
  const provinciaNombres = {
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
  const handleProvinciaChange = async (e) => {
    const prov = e.target.value;
    setProvincia(prov);
    setCiudad("");
    if (prov) {
      try {
        const data = await import(`../../componentes/Localidades/${prov}.json`);
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

    const form = e.target;
    const nombre = form[0].value;
    const apellidos = form[1].value;
    const tipoDocumentoValue = form[2].value;
    const numeroDocumento = form[3].value;
    const fechaNacimiento = form[4].value;
    const email = form[5].value;
    const codigoPostal = form[6].value;
    const direccion = form[7].value;
    const numeroDireccion = form[8].value;
    const departamento = form[9].value;
    const provincia = form[10].value;
    const localidad = form[11].value;
    const codArea = form[12].value;
    const telefono = form[13].value;
    const password = form[14].value;
    const repetirPassword = form[15].value;
    const aceptaTerminos = form[16].checked;

    if (!nombre || !apellidos || !tipoDocumentoValue || !numeroDocumento || !fechaNacimiento 
     || !email || !codigoPostal || !direccion || !numeroDireccion || !provincia || !localidad || !codArea || !telefono || !password 
     || !repetirPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (password !== repetirPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    try {
      const usuario = {
        nombre,
        apellidos,
        tipoDocumento: tipoDocumentoValue,
        numeroDocumento,
        fechaNacimiento,
        email,
        codigoPostal,
        direccion,
        numeroDireccion,
        departamento,
        provincia,
        localidad,
        codArea,
        telefono,
        password
      };
      const data = await APIRegistro(usuario);

      // Mostrar modal de éxito
      setModalCodigo(200);
      setModalMensaje("¡Usuario registrado correctamente!");
      setModalOpen(true);

      // Restablecer todos los campos
      setNombre("");
      setApellidos("");
      setTipoDocumento("");
      setNumeroDocumento("");
      setFechaNacimiento("");
      setEmail("");
      setCodigoPostal("");
      setDireccion("");
      setNumeroDireccion("");
      setDepartamento("");
      setProvincia("");
      setCiudad("");
      setCodArea("");
      setTelefono("");
      setPassword("");
      setRepetirPassword("");
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
                        onClose={() => setModalOpen(false)}
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
            <div className="grid grid-cols-3 gap-4 ">
              <select className="border rounded-lg px-3 py-2 w-full cursor-pointer" value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} required>
                <option value="">Tipo de documento</option>
                <option value="DNI">DNI</option>
                <option value="CUIL/CUIT">CUIL/CUIT</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
              <input type="text" placeholder="Número" className="border rounded-lg px-3 py-2 w-full" required />
              <input type="date" className="border rounded-lg px-3 py-2 w-full" required />
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

            {/* Provincia y Ciudad */}
            <div className="grid grid-cols-2 gap-4">
              <select
                className="border rounded-lg px-3 py-2 w-full max-h-48 overflow-y-auto cursor-pointer"
                value={provincia}
                onChange={handleProvinciaChange}
                required
              >
                <option value="">Provincia</option>
                {provinciasArchivos.map(p => (
                  <option key={p} value={p}>{provinciaNombres[p]}</option>
                ))}
              </select>
              <select
                className="border rounded-lg px-3 py-2 w-full max-h-48 overflow-y-auto cursor-pointer"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                required
                disabled={!provincia}
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
                className="h-5 w-5 text-sky-500 border-gray-300 rounded focus:ring-sky-500 cursor-pointer"
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