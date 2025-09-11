import Home from './Pages/Home/Home';
import InicioDeSesion from './Pages/Login/Login';
import PanelDeUsuario from './Pages/UserPanel/Student/UserPanel';
import PrivateRoute from './PrivateRoute';
import Registrarse from './Pages/Register/Register';
import NotFound from './Pages/NotFound';
import DetalleCapacitacion from './Pages/UserPanel/Student/TrainingIndex';
import TrainingLevels from './Pages/UserPanel/Student/TrainingLevels';
import MisReportes from './Pages/UserPanel/Student/TrainingReports';
import NivelBibliografia from './Pages/UserPanel/Student/Levelbibliogrhapy';
import NivelCapacitacion from './Pages/UserPanel/Student/LevelTraining';
import ConsultaCapacitador from './Components/Modals/consultaCapacitador';

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <InicioDeSesion /> },
  { path: '/registrarse', element: <Registrarse /> },
  { path: '/userPanel', element: <PrivateRoute><PanelDeUsuario /></PrivateRoute> },
  { path: '/userPanel/:idTraining', element: <PrivateRoute><DetalleCapacitacion /></PrivateRoute> },
  { path: '/userPanel/:idTraining/levels', element: <PrivateRoute><TrainingLevels /></PrivateRoute> },
  { path: '/userPanel/:idTraining/messages', element: <PrivateRoute><ConsultaCapacitador /></PrivateRoute> },
  { path: '/userPanel/:idTraining/reports', element: <PrivateRoute><MisReportes /></PrivateRoute> },
  { path: '/userPanel/:idTraining/:nivelId/bibliogrhapy', element: <PrivateRoute><NivelBibliografia /></PrivateRoute> },
  { path: '/userPanel/:idTraining/:nivelId/training', element: <PrivateRoute><NivelCapacitacion /></PrivateRoute> },
//  { path: '/userPanel/:idTraining/:nivelId/trainingExam', element: <PrivateRoute><NivelCapacitacion /></PrivateRoute> },
  { path: '*', element: <NotFound /> }
];
