import { useNavigate, useParams } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { FaLayerGroup } from 'react-icons/fa6';
import { FaEnvelope } from 'react-icons/fa';
import { FaClipboardList } from 'react-icons/fa';
import { FaComments } from 'react-icons/fa'; // icono opcional para Mensajería

function SideBar() {
  const navigate = useNavigate();
  const { idTraining } = useParams();  

  return (
    <nav className="flex flex-col gap-4 lg:gap-6 items-start w-full lg:w-64 flex-shrink-0" aria-label="Menú lateral">
      <button
        type="button"
        className="flex items-center gap-3 text-left text-blue-700 text-base lg:text-lg border-b border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
        onClick={() => navigate('/userPanel')}
      >
        <FaHome className="text-xl" />
        <span>Inicio</span>
      </button>

      <button
        type="button"
        className="flex items-center gap-3 text-left text-blue-700 text-base lg:text-lg border-b border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
        onClick={() => navigate(`/userPanel/${idTraining}/levels`)}
      >
        <FaLayerGroup className="text-xl" />
        <span>Niveles</span>
      </button>

      {/* 🔹 Nuevo botón de Mensajería general */}
      <button
        type="button"
        className="flex items-center gap-3 text-left text-blue-700 text-base lg:text-lg border-b border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
        onClick={() => navigate(`/userPanel/${idTraining}/messages`)}
      >
        <FaComments className="text-xl" />
        <span>Mensajería</span>
      </button>

      <button
        type="button"
        className="flex items-center gap-3 text-left text-blue-700 text-base lg:text-lg border-b border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
        onClick={() => navigate(`/userPanel/${idTraining}/reports`)}
      >
        <FaClipboardList className="text-xl" />
        <span>Mis reportes</span>
      </button>
    </nav>
  );
}

export default SideBar;
