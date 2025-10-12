import ModalWrapper from "./ModalWrapper";

// Props:
// - titulo: optional heading for the success modal (defaults to 'Mensaje enviado')
// - mensaje: body text describing the successful action
// - onClose: callback when closing the modal
const SucessModal = ({ titulo = 'Mensaje enviado', mensaje = 'Tu mensaje se envió correctamente.', onClose }) => {
  return (
    <ModalWrapper onClose={onClose} panelClassName="w-[92vw] sm:w-auto max-w-[480px]" showCloseButton={false}>
      <div className="p-6 text-center space-y-4">
        <div className="text-green-500 text-5xl leading-none">✔</div>
        <h3 className="text-lg font-semibold">{titulo}</h3>
        {mensaje && <p className="text-gray-600">{mensaje}</p>}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default SucessModal;
