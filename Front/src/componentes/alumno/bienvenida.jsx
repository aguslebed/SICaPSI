import { useState, useEffect } from 'react';

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Verificar al cargar si debemos mostrar el modal
  useEffect(() => {
    const shouldShowModal = sessionStorage.getItem("showWelcomeModal");
    console.log(shouldShowModal)
    if (shouldShowModal === "true") {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    // Cambiar el estado a false y eliminar la bandera
    setIsOpen(false);
    sessionStorage.removeItem("showWelcomeModal");
  };

  // No renderizar nada si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-500/20 flex justify-center items-start pt-20 z-50 animate-fadeIn">  <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Bienvenido!</h1>
          <p className="text-gray-600 mb-6">
            Ya puedes acceder a tus capacitaciones.<br />
            Haz clic en <span className="font-semibold">Comenzar</span> para iniciar tu entrenamiento.
          </p>
          <button
            onClick={handleClose}
            className="w-full h-12 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition cursor-pointer"
          >
            COMENZAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;