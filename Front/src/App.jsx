import { Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './paginas/home/home'; 
import InicioDeSesion from './paginas/home/inicioDeSesion';
import PanelDeUsuario from './paginas/userPanel/alumno/PanelDeUsuario'; 
import PrivateRoute from './api/PrivateRoute';
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


        <Route path="/panel" element={<PrivateRoute><PanelDeUsuario /></PrivateRoute>} /> 
        <Route path="/panel/capacitacion/:id" element={<PrivateRoute><DetalleCapacitacion/></PrivateRoute>} />
        <Route path='/panel/capacitacion/:id/niveles' element={<PrivateRoute><Niveles/></PrivateRoute>} />
        <Route path='/panel/capacitacion/:id/mensajeria' element={<PrivateRoute><ConsultaCapacitador/></PrivateRoute>} />
        <Route path='/panel/capacitacion/:id/reportes' element={<PrivateRoute><MisReportes/></PrivateRoute>} />

        
        <Route path='/panel/capacitacion/:id/niveles/:nivelId' element={<PrivateRoute><NivelBibliografia/></PrivateRoute>} />
        <Route path='/panel/capacitacion/:id/niveles/capacitacion' element={<PrivateRoute><NivelCapacitacion/></PrivateRoute>} />
       


        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;