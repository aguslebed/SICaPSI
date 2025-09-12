import React, { useState } from "react";
import { logout, resolveImageUrl } from '../../API/Request';
import { useNavigate } from 'react-router-dom';
import { Bell } from "lucide-react"; // íconos
import { Menu } from "@headlessui/react"; // dropdown accesible
import { useUser } from "../../Context/UserContext";
import ProfilePreferencesModal from "../Modals/ProfilePreferencesModal";

const NavBar = () => {
  const navigate = useNavigate();
  const { logoutUser } = useUser();
  const { userData } = useUser();
  const [openProfile, setOpenProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      logoutUser(); // Limpia contexto y localStorage
      navigate('/');
    } catch (err) {
      alert('Error al cerrar sesión');
    }
  };

  return (
    <header className="w-full">
      {/* Barra superior con logo */}
      <div className="w-full bg-blue-900">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 h-12 md:h-14 flex items-center justify-center">
          <div className="black-ops-one-regular">
            <h3 className="text-2xl sm:text-3xl text-white">
              SIC<span className="text-orange-400">A</span>PSI
            </h3>
          </div>
        </div>
      </div>

      {/* Barra inferior con acciones (notificaciones / usuario) */}
      <div className="w-full bg-[#0888c2]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 h-14 md:h-16 flex items-center justify-end">
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Notificaciones */}
            <button
              type="button"
              aria-label="Ver notificaciones"
              className="relative p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[11px] font-semibold bg-red-500 text-white rounded-full flex items-center justify-center ring-2 ring-[#0888c2]">
                {userData?.messages?.total || 0}
              </span>
              <span className="sr-only">Notificaciones</span>
            </button>

            {/* Usuario / Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-full">
                <span className="hidden sm:inline text-white font-medium max-w-[140px] truncate">
                  {userData?.user?.role || 'Usuario'}
                </span>
                <img
                  src={resolveImageUrl(userData?.user?.profileImage) || "/images/alumno-avatar.png"}
                  alt={userData?.user?.role || "Usuario"}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-56 rounded-lg bg-white text-gray-800 shadow-lg ring-1 ring-black/10 overflow-hidden z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`cursor-pointer w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                        onClick={() => setOpenProfile(true)}
                      >
                        Perfil y preferencias
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`cursor-pointer w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                      >
                        Ayuda
                      </button>
                    )}
                  </Menu.Item>
                </div>
                <div className="border-t border-gray-200" />
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-red-50' : ''}`}
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>

      {openProfile && (
        <ProfilePreferencesModal open={openProfile} onClose={() => setOpenProfile(false)} />
      )}
    </header>
  );
};

export default NavBar;
