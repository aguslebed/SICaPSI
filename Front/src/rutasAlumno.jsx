// src/RutasAlumno.jsx
import { Route, Routes } from 'react-router-dom';
import LayoutAlumno from './layoutAlumno';
import PanelDeUsuario from './paginas/userPanel/alumno/PanelDeUsuario';
import Cursos from './paginas/home/Cursos';
import Perfil from './paginas/userPanel/Perfil';

const RutasAlumno = () => {
  return (
    <Routes>
      <Route path="/panel" element={<LayoutAlumno />}>
        <Route index element={<PanelDeUsuario />} />
        <Route path="cursos" element={<Cursos />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
};

export default RutasAlumno;