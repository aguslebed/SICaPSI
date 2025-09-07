import { Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './paginas/home/home'; 
import InicioDeSesion from './paginas/home/inicioDeSesion';
import PanelDeUsuario from './paginas/userPanel/alumno/PanelDeUsuario'; 
import Registrarse from './paginas/registro/Registrarse';
import NotFound from './paginas/NotFound';

function App() {
  return (
    <> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<InicioDeSesion />} />
        <Route path="/registrarse" element={<Registrarse />} />
        <Route path="/panel" element={<PanelDeUsuario />} /> 

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
 
    </>
  );
}

export default App;