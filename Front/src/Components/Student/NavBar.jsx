import React, { useMemo, useState } from "react";
import { logout, resolveImageUrl, setMessageRead } from '../../API/Request';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell } from "lucide-react"; // íconos
import { Menu } from "@headlessui/react"; // dropdown accesible
import { useUser } from "../../context/UserContext";
import ProfilePreferencesModal from "../Modals/ProfilePreferencesModal";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser } = useUser();
  const { userData, setUserData } = useUser();
  const [openProfile, setOpenProfile] = useState(false); 
  const items = useMemo(() => userData?.messages?.items || [], [userData]);
  const trainings = useMemo(() => userData?.training || userData?.assignedTraining || [], [userData]);
  const firstTrainingId = trainings?.[0]?._id || trainings?.[0] || '';
  const resolveTrainingId = (msg) => {
    const fromMsg = msg?.trainingId?._id || msg?.trainingId;
    if (fromMsg) return fromMsg;
    if (firstTrainingId) return firstTrainingId;
    return '';
  };
  // Helper to resolve and check if a training is active
  const isTrainingActive = useMemo(() => {
    const map = new Map();
    (Array.isArray(trainings) ? trainings : []).forEach(t => {
      if (t && typeof t === 'object' && t._id) {
        map.set(t._id, t.isActive !== false);
      } else if (typeof t === 'string') {
        map.set(t, true);
      }
    });
    return (id) => {
      if (!id) return true; // mensajes generales
      if (map.has(id)) return map.get(id);
      return true; // por defecto permitir si se desconoce
    };
  }, [trainings]);

  const unreadItemsRaw = useMemo(() => items.filter(m => m.folder === 'inbox' && !m.isRead), [items]);
  const unreadItems = useMemo(
    () => unreadItemsRaw.filter(m => {
      const tid = (m?.trainingId && (m.trainingId._id || m.trainingId)) || undefined;
      return isTrainingActive(tid);
    }),
    [unreadItemsRaw, isTrainingActive]
  );
  const unreadCount = unreadItems.length;
  
  // Rutas donde se debe mostrar el botón "Volver"
  const allowedRoutes = [
    '/adminPanel/gestionUsuario/crearUsuario',
    '/adminPanel/gestionUsuario/modificarUsuario',
    '/adminPanel/admisionUsuario',
    '/adminPanel/gestionUsuario',
    '/adminPanel/gestionCursos',
    '/adminPanel/gestionProfesores',
    '/adminPanel/gestionCapacitacion',
  // La gestión directivo ahora vive en /directivoPanel
  ];
  
  const shouldShowBackButton = allowedRoutes.some(route => location.pathname.includes(route));
  
  const handleLogout = async () => {
    try {
      await logout();
      logoutUser(); // Limpia contexto y localStorage
      navigate('/');
    } catch (e) {
      alert('Error al cerrar sesión', e);
    }
  };

  return (
    <header className="w-full">
      {/* Barra superior con logo */}
      <div className="w-full bg-blue-900">
        <div className="w-full mx-auto h-10 md:h-12 flex items-center justify-center" style={{ padding: '0 2.5rem' }}>
          <div className="black-ops-one-regular">
            <h3 className="text-xl sm:text-2xl text-white">
              SIC<span className="text-orange-400">A</span>PSI
            </h3>
          </div>
        </div>
      </div>

      {/* Barra inferior con acciones (notificaciones / usuario) */}
      <div className="w-full bg-[#0888c2]">
        <div className="w-full h-12 md:h-14 flex items-center px-4 sm:px-6 lg:px-10">
          {/* Botón Volver para rutas específicas del admin panel */}
          {shouldShowBackButton && (
            <button
              onClick={() => {
                // Navegar hacia atrás en el historial del navegador
                window.history.back();
              }}
              className="flex items-center justify-center gap-2 text-white bg-[#4dc3ff] hover:bg-[#3bb3ef] px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-md hover:shadow-lg font-semibold text-base"
              style={{ minWidth: '120px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Volver</span>
            </button>
          )}
          
          {/* Espaciador flexible para empujar elementos a la derecha */}
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Notificaciones (campana) */}
            <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                aria-label="Ver notificaciones"
                className="relative p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Bell className="cursor-pointer w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="cursor-pointer absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 text-[10px] font-semibold bg-red-500 text-white rounded-full flex items-center justify-center ring-2 ring-[#0888c2]">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">Notificaciones</span>
              </Menu.Button>
              <Menu.Items className="fixed sm:absolute top-[88px] sm:top-auto left-0 right-0 sm:left-auto sm:right-2 mx-auto sm:mx-0 w-full sm:w-80 max-w-[92vw] sm:max-w-none rounded-lg bg-white text-gray-800 shadow-lg ring-1 ring-black/10 overflow-hidden z-50">
                <div className="py-2 max-h-[60vh] overflow-auto overflow-x-hidden">
                  {unreadItems.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">No hay mensajes nuevos</div>
                  ) : (
                    unreadItems.slice(0, 8).map((m) => {
                      const trainingId = resolveTrainingId(m);
                      const senderName = `${m.sender?.firstName || ''} ${m.sender?.lastName || ''}`.trim();
                      const date = new Date(m.createdAt).toLocaleDateString('es-AR');

                      // Resolve training title from the trainings list (may be objects or ids)
                      const resolvedTraining = Array.isArray(trainings)
                        ? trainings.find(t => (t && ((t._id && t._id === trainingId) || t === trainingId)))
                        : undefined;
                      const trainingTitle = resolvedTraining?.title || resolvedTraining?.name || (trainingId ? `Curso ${String(trainingId).slice(0,6)}` : 'General');

                      return (
                        <Menu.Item key={m._id}>
                          {({ active }) => (
                            <button
                              className={`w-full text-left px-4 py-3 text-sm ${active ? 'bg-gray-100' : ''} cursor-pointer`}
                              onClick={async () => {
                                // Optimista: marcar como leído en el store local para refrescar contador
                                try {
                                  if (!m.isRead) {
                                    const next = { ...userData, messages: { ...userData.messages, items: userData.messages.items.map(it => it._id === m._id ? { ...it, isRead: true } : it) } };
                                    setUserData(next);
                                    // Backend
                                    await setMessageRead({ id: m._id, isRead: true });
                                  }
                                } catch {<></>}
                                // Navegar a la bandeja del curso solo si activo
                                if (trainingId && isTrainingActive(trainingId)) navigate(`/userPanel/${trainingId}/messages`);
                                else navigate('/userPanel');
                              }}
                              title="Ir a bandeja de entrada"
                            >
                              <span className="inline-block text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded" dangerouslySetInnerHTML={{ __html: trainingTitle || 'General' }} />
                              <div className="font-semibold">{m.subject || '(Sin asunto)'}</div>
                              <div className="text-xs text-gray-600">De: {senderName || 'Desconocido'} · {date}</div>
                              <div className="mt-1 flex items-center gap-2">
                                {trainingId && !isTrainingActive(trainingId) && (
                                  <span className="inline-block text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded">Curso inactivo</span>
                                )}
                              </div>
                            </button>
                          )}
                        </Menu.Item>
                      );
                    })
                  )}
                </div>
                {unreadItems.length > 8 && (
                  <div className="border-t border-gray-200" />
                )} 
              </Menu.Items>
            </Menu>

            {/* Usuario / Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-full">
                <span className="hidden sm:inline text-white font-medium max-w-[140px] truncate text-sm">
                  {userData?.user?.firstName || 'Usuario'}
                </span>
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shrink-0">
                  <img
                    src={resolveImageUrl(userData?.user?.profileImage) || "/images/alumno-avatar.png"}
                    alt={userData?.user?.firstName || "Usuario"}
                    className="w-full h-full object-cover"
                  />
                </div>
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
