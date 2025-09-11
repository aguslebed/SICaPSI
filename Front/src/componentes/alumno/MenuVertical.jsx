import { useNavigate, useParams } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { FaLayerGroup } from 'react-icons/fa6';
import { FaEnvelope } from 'react-icons/fa';
import { FaClipboardList } from 'react-icons/fa';

function MenuVertical() {
  const navigate = useNavigate();
  const { id } = useParams();  


  return (
    <div className="flex flex-col gap-6 py-8 ml-10 items-start w-[170px]">
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate('/panel')}>
        <FaHome className="text-xl" />
        <span>Inicio</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate(`/panel/capacitacion/${id}/niveles`)}>
        <FaLayerGroup className="text-xl" />
        <span>Niveles</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate(`/panel/capacitacion/${id}/mensajeria`)}>
        <FaEnvelope className="text-xl" />
        <span>Mensajería</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() =>  navigate(`/panel/capacitacion/${id}/reportes`)}>
        <FaClipboardList className="text-xl" />
        <span>Mis reportes</span>
      </div>
    </div>
  );
}

export default MenuVertical;
