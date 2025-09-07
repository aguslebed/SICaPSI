import React from "react";
import { Bell } from "lucide-react"; // íconos
import { Menu } from "@headlessui/react"; // dropdown accesible

const Navbar = () => {
  return (
    <header className="w-full bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo centrado */}
        <div className="flex-1 text-center black-ops-one-regular">
          <h3 className="text-4xl md:text-2xl text-white">
            SIC<span className="text-orange-400">A</span>PSI
          </h3>
        </div>

        {/* Notificaciones y perfil */}
        <div className="flex items-center gap-6">
          {/* Icono de campana */}
          <button className="relative hover:text-gray-200">
            <Bell className="w-6 h-6" />
            {/* Badge de notificaciones */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
              2
            </span>
          </button>

          {/* Dropdown de usuario */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 cursor-pointer">
              <img
                src="/images/alumno-avatar.png"
                alt="Alumno"
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <span className="font-medium">Alumno</span>
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-56 bg-blue-700 text-white rounded-lg shadow-lg overflow-hidden z-50">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm ${
                      active ? "bg-blue-600" : ""
                    }`}
                  >
                    Perfil y preferencias
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm ${
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
                    className={`w-full text-left px-4 py-2 text-sm text-red-400 ${
                      active ? "bg-blue-600" : ""
                    }`}
                  >
                    Cerrar sesión
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
