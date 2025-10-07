import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateUser } from "../../API/Request";
import ModalMensajeRegistro from "../../Components/Modals/RegisterModal";
import ValidationErrorModal from "../../Components/Modals/ValidationErrorModal";
import NavBar from '../../Components/Student/NavBar';

function ActualizarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  // El usuario a editar debe venir por location.state.user
  const usuario = location.state?.user;

  // MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCodigo, setModalCodigo] = useState(null);
  const [modalMensaje, setModalMensaje] = useState("");

  // Modal de validación
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  // Estados del formulario (inicializados con los datos del usuario)
  const [documentType, setdocumentType] = useState(usuario?.documentType ?? "");
  const [firstName, setfirstName] = useState(usuario?.firstName ?? "");
  const [lastName, setlastName] = useState(usuario?.lastName ?? "");
  const [documentNumber, setdocumentNumber] = useState(usuario?.documentNumber ?? "");
  const [birthDate, setbirthDate] = useState(usuario?.birthDate?.slice(0,10) ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [postalCode, setpostalCode] = useState(usuario?.postalCode ?? "");
  const [address, setaddress] = useState(usuario?.address ?? "");
  const [addressNumber, setaddressNumber] = useState(usuario?.addressNumber ?? "");
  const [apartment, setapartment] = useState(usuario?.apartment ?? "");
  const [province, setprovince] = useState(usuario?.province ?? "");
  const [ciudad, setCiudad] = useState(usuario?.city ?? "");
  const [ciudades, setCiudades] = useState([]);
  const [areaCode, setareaCode] = useState(usuario?.areaCode ?? "");
  const [phone, setphone] = useState(usuario?.phone ?? "");
  // El campo password no se edita aquí
  const [selectedRole, setSelectedRole] = useState(usuario?.role ?? null);

  // Provincias y mapeo
  const provincesArchivos = [
    "buenos_aires", "catamarca", "chaco", "chubut", "ciudad_autónoma_de_buenos_aires", "corrientes", "córdoba", "entre_ríos", "formosa", "jujuy", "la_pampa", "la_rioja", "mendoza", "misiones", "neuquén", "río_negro", "salta", "san_juan", "san_luis", "santa_cruz", "santa_fe", "santiago_del_estero", "tierra_del_fuego,_antártida_e_islas_del_atlántico_sur", "tucumán"
  ];
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

  // Roles
  const ROLE_OPTIONS = [
    { value: "Trainer", label: "Capacitador" },
    { value: "Student", label: "Guardia" },
    { value: "Administrator", label: "Administrador" },
    { value: "Manager", label: "Directivo" },
  ];

  // Cargar ciudades al cambiar provincia
  useEffect(() => {
    async function cargarCiudades() {
      if (province) {
        try {
          const data = await import(`../../Components/Localidades/${province}.json`);
          setCiudades(data.default.localidades || []);
        } catch {
          setCiudades([]);
        }
      } else {
        setCiudades([]);
      }
    }
    cargarCiudades();
  }, [province]);

  // Modal close
  const handleModalClose = () => {
    setModalOpen(false);
    if (modalCodigo >= 200 && modalCodigo < 400) {
      navigate("/adminPanel/gestionUsuario", { replace: true, state: null });
    }
  };

  // Submit edición
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación
    if (!firstName || !lastName || !documentType || !documentNumber || !birthDate 
     || !email || !postalCode || !address || !addressNumber || !province || !ciudad || !areaCode || !phone) {
      setValidationMessage("Debe completar todos los campos");
      setShowValidationModal(true);
      return;
    }

    try {
      const patch = {
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
        role: selectedRole
      };
      await updateUser(usuario._id, patch);

      setModalCodigo(200);
      setModalMensaje("¡Usuario actualizado correctamente!");
      setModalOpen(true);
    } catch (err) {
      setModalCodigo(err.code || 400);
      let mensaje = err.message || "Error al actualizar.";
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

      <NavBar />

      <main className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-8">
        <section className="w-full max-w-2xl bg-white/95 shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10">
          <div className="w-full flex justify-center mb-6 select-none">
            <h1 className="text-4xl font-extrabold tracking-widest">
              SIC<span className="text-[#f39a2d]">A</span>PSI
            </h1>
          </div>

          <h2 className="text-gray-900 text-2xl font-bold text-center mb-6">
            Editar Usuario
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 ">
              <select className="border rounded-lg px-3 py-2 w-full cursor-pointer" value={documentType} onChange={e => setdocumentType(e.target.value)}>
                <option value="">Tipo de documento</option>
                <option value="DNI">DNI</option>
                <option value="CUIL/CUIT">CUIL/CUIT</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
              <input type="text" placeholder="Número" className="border rounded-lg px-3 py-2 w-full" value={documentNumber} onChange={e => setdocumentNumber(e.target.value)} />
              <input type="date" className="border rounded-lg px-3 py-2 w-full" value={birthDate} onChange={e => setbirthDate(e.target.value)} />
            </div>

            {/* Email y Código Postal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <select
                className="border rounded-lg px-3 py-2 w-full max-h-48 overflow-y-auto cursor-pointer"
                value={province}
                onChange={e => setprovince(e.target.value)}
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
                disabled={!province}
              >
                <option value="">Ciudad</option>
                {ciudades.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

            {/* Rol */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">Rol del usuario</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={
                      "px-3 py-2 rounded-lg border transition cursor-pointer " +
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

            {/* Botón de actualizar */}
            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition cursor-pointer"
            >
              Actualizar Usuario
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default ActualizarUsuario;