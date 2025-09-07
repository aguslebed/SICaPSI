import { Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './paginas/home/home'; 
import InicioDeSesion from './paginas/home/inicioDeSesion';
import PanelDeUsuario from './paginas/userPanel/alumno/PanelDeUsuario'; 
import Registrarse from './paginas/registro/Registrarse';
import NotFound from './paginas/NotFound';
import DetalleCapacitacion from './paginas/userPanel/alumno/DetalleCapacitacion';
import Niveles from './paginas/userPanel/alumno/Niveles';
import MisReportes from './paginas/userPanel/alumno/MisReportes';
import NivelBibliografia from './paginas/userPanel/alumno/NivelBibliografia';
import NivelCapacitacion from './paginas/userPanel/alumno/NivelCapacitacion';
import ConsultaCapacitador from './componentes/ConsultaCapacitador/consultaCapacitador'

function App() {
  return (
    <> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<InicioDeSesion />} />
        <Route path="/registrarse" element={<Registrarse />} />


        <Route path="/panel" element={<PanelDeUsuario />} /> 
        <Route path="/panel/capacitacion/1" element={<DetalleCapacitacion/>} />
        <Route path='/panel/capacitacion/1/niveles' element={<Niveles/>} />
        <Route path='/panel/capacitacion/1/mensajeria' element={<ConsultaCapacitador/>} />
        <Route path='/panel/capacitacion/1/reportes' element={<MisReportes/>} />
        <Route path='/panel/capacitacion/1/niveles/bibliografia' element={<NivelBibliografia/>} />
        <Route path='/panel/capacitacion/1/niveles/capacitacion' element={<NivelCapacitacion/>} />
       


        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;