import NavBar from "../../Components/Student/NavBar";
import { useParams } from "react-router-dom";

export default function ProfesorEditar() {
  const { id } = useParams();
  return (
    <>
      <NavBar />
      <div className="gp-wrap gp-afterHeader">
        <h1 className="gp-title">Editar profesor</h1>
        <div className="gp-card" style={{ padding: 20 }}>
          <p>Pantalla en blanco.</p>
        </div>
      </div>
    </>
  );
}