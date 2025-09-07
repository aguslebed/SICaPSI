import ModalWrapper from "./ModalWrapper";

const ModalError = ({ mensaje, onClose }) => {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="text-center space-y-4">
        <div className="text-red-500 text-5xl">✖</div>
        <p className="font-semibold">{mensaje}</p>
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

export default ModalError;
