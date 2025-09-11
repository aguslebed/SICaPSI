import { useNavigate, useParams } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { FaLayerGroup } from 'react-icons/fa6';
import { FaEnvelope } from 'react-icons/fa';
import { FaClipboardList } from 'react-icons/fa';

function SideBar() {
  const navigate = useNavigate();
  const { idTraining } = useParams();  


  return (
    <div className="flex flex-col gap-6 py-8 ml-10 items-start w-[170px]">
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate('/userPanel')}>
        <FaHome className="text-xl" />
        <span>Inicio</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate(`/userPanel/${idTraining}/levels`)}>
        <FaLayerGroup className="text-xl" />
        <span>Niveles</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() => navigate(`/userPanel/${idTraining}/messages`)}>
        <FaEnvelope className="text-xl" />
        <span>Mensajería</span>
      </div>
      <div className="flex items-center gap-3 text-blue-600 text-lg border-b-2 border-blue-200 w-full pb-2 transition hover:bg-blue-50 hover:text-blue-800 hover:cursor-pointer" onClick={() =>  navigate(`/userPanel/${idTraining}/reports`)}>
        <FaClipboardList className="text-xl" />
        <span>Mis reportes</span>
      </div>
    </div>
  );
}

export default SideBar;
