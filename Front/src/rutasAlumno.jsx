// src/RutasAlumno.jsx
import { Route, Routes } from 'react-router-dom';
import LayoutAlumno from './layoutAlumno';
import PanelDeUsuario from './paginas/userPanel/alumno/PanelDeUsuario';
import Cursos from './paginas/home/Cursos';
import Perfil from './paginas/userPanel/Perfil';
import DetalleCapacitacion from './paginas/userPanel/alumno/DetalleCapacitacion';
import Niveles from './paginas/userPanel/alumno/Niveles';
import NivelCapacitacion from "./paginas/userPanel/alumno/NivelCapacitacion";
import NivelBibliografia from "./paginas/userPanel/alumno/NivelBibliografia";
import MisReportes from "./paginas/userPanel/alumno/MisReportes";


const RutasAlumno = () => {
  return (
    <Routes>
      <Route path="/panel" element={<LayoutAlumno />}>
        <Route index element={<PanelDeUsuario />} />
        <Route path="cursos" element={<Cursos />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="/capacitacion/:id" element={<DetalleCapacitacion />} />
        <Route path="/capacitacion/:id/niveles" element={<Niveles />} />
        <Route path="/capacitacion/:id/nivel/:nivelId/capacitacion" element={<NivelCapacitacion />} />
        <Route path="/capacitacion/:id/nivel/:nivelId/bibliografia" element={<NivelBibliografia />} />
        <Route path="/reportes" element={<MisReportes />} />
      </Route>
    </Routes>
  );
};

export default RutasAlumno;