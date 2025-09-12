import ModalWrapper from "./ModalWrapper";

const SucessModal = ({ mensaje, onClose }) => {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="text-center space-y-4">
        <div className="text-green-500 text-5xl">✔</div>
        <p className="font-semibold">Mensaje enviado</p>
        <p className="text-gray-600">{mensaje}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          OK
        </button>
      </div>
    </ModalWrapper>
  );
};

export default SucessModal;
