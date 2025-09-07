import { FaHome } from 'react-icons/fa';
import { FaLayerGroup } from 'react-icons/fa6';
import { FaEnvelope } from 'react-icons/fa';
import { FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// import './MenuVertical.css';

function MenuVertical() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 py-8 ml-10 items-start w-[170px]">
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate('/panel')}>
        <FaHome className="text-xl" />
        <span>Inicio</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate('/panel/capacitacion/1/niveles')}>
        <FaLayerGroup className="text-xl" />
        <span>Niveles</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate('/panel/capacitacion/1/mensajeria')}>
        <FaEnvelope className="text-xl" />
        <span>Mensajería</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate('/panel/capacitacion/1/reportes')}>
        <FaClipboardList className="text-xl" />
        <span>Mis reportes</span>
      </div>
    </div>
  );
}

export default MenuVertical;
