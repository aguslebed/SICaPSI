import { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import ModalError from "./ErrorModal";
import ModalExito from "./SucessModal";
import Navbar from "../Student/NavBar";
import MenuVertical from "../Student/SideBar";
 
const ConsultaCapacitador = ({ onClose }) => {
  const [nombre, setNombre] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!mensaje.trim()) {
      setError("El mensaje no puede estar vacío");
      return;
    }

    setError("");
    setExito(true);
 
  };

  if (error) {
    return <ModalError mensaje={error} onClose={() => setError("")} />;
  }

  if (exito) {
    return (
      <ModalExito
        mensaje="Recibirás respuesta dentro de 48hs"
        onClose={() => {
          setExito(false);
          onClose();
        }}
      />
    );
  }

  return (
    <>
       <Navbar/> 
       <MenuVertical/> 
        <ModalWrapper onClose={onClose}>
          <h2 className="text-lg font-bold text-center mb-4">
            Consulta a capacitador
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              className="w-full border rounded-md p-2"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            >
              <option value="">Nombre del capacitador</option>
              <option value="cap1">Capacitador 1</option>
              <option value="cap2">Capacitador 2</option>
            </select>

            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Asunto"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
            />

            <textarea
              className="w-full border rounded-md p-2"
              rows="4"
              placeholder="Mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            ></textarea>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
            >
              Enviar
            </button>
          </form>
        </ModalWrapper>
    </>
  );
};

export default ConsultaCapacitador;
