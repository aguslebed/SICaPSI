import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ModalMensajeRegistro = ({ codigo, mensaje, onClose }) => {
  const esExito = codigo >= 200 && codigo < 400;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 flex flex-col items-center relative">
        {esExito ? (
          <FaCheckCircle className="text-green-500 text-5xl mb-2" />
        ) : (
          <FaTimesCircle className="text-red-500 text-5xl mb-2" />
        )}
        <p className={`text-center mb-4 ${esExito ? "text-green-700" : "text-red-700"}`}>
          {mensaje}
        </p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2 cursor-pointer"
          onClick={onClose}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ModalMensajeRegistro;