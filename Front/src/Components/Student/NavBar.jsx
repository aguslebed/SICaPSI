import React, { useState } from "react";
import { logout } from '../../API/Request';
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
      {/* Div superior azul oscuro con logo */}
      <div className="w-full bg-blue-900 flex justify-center items-center h-14">
        <div className="black-ops-one-regular">
          <h3 className="text-4xl md:text-2xl text-white">
            SIC<span className="text-orange-400">A</span>PSI
          </h3>
        </div>
      </div>
      {/* Div inferior celeste con perfil y notificaciones */}
      <div className="w-full bg-[#0888c2] flex justify-end items-center h-16 px-8">
        {/* Notificaciones y perfil */}
        <div className="flex items-center gap-6">
          {/* Icono de campana */}
          <button type="button" aria-label="Ver notificaciones" className="relative hover:text-gray-200">
            <Bell className="w-6 h-6" />
            {/* Badge de notificaciones */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1 cursor-pointer">
              {userData?.messages?.total || 0}
            </span>
          </button>
          {/* Dropdown de usuario */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 cursor-pointer">
              <span className="font-medium text-white">{userData?.user?.role || "Usuario"}</span>
              <img
                src={userData?.user?.profileImage || "/images/alumno-avatar.png"}
                alt={userData?.user?.role || "Usuario"}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-56 bg-blue-700 text-white rounded-lg shadow-lg overflow-hidden z-50">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm hover:cursor-pointer ${
                      active ? "bg-blue-600" : ""
                    }`}
                    onClick={() => setOpenProfile(true)}
                  >
                    Perfil y preferencias
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm hover:cursor-pointer ${
                      active ? "bg-blue-600" : ""
                    }`}
                  >
                    Ayuda
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm text-red-400 hover:cursor-pointer ${
                      active ? "bg-blue-600" : ""
                    }`}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
      {openProfile && (
        <ProfilePreferencesModal open={openProfile} onClose={() => setOpenProfile(false)} />
      )}
    </header>
  );
};

export default NavBar;
