import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

const WelcomeModal = () => {
  const { userData, setUserData } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const role = (userData?.user?.role || '').toLowerCase();
  const shouldShow = role === 'alumno' && !!userData?.metadata?.isFirstLogin;

  useEffect(() => {
    setIsOpen(shouldShow);
  }, [shouldShow]);

  const handleClose = () => {
    setIsOpen(false);
    if (shouldShow && userData) {
      try {
        setUserData({
          ...userData,
          metadata: {
            ...userData?.metadata,
            isFirstLogin: false
          }
        });
      } catch {}
    }
  };

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