import { Link } from "react-router-dom";

const LayoutAlumno = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex gap-4">
        <Link href="/alumno/dashboard">Dashboard</Link>
        <Link href="/alumno/cursos">Cursos</Link>
        <Link href="/alumno/evaluacion">Evaluación</Link>
        <Link href="/alumno/mensajeria">Mensajería</Link>
        <Link href="/alumno/reportes">Reportes</Link>
        <Link href="/alumno/perfil">Perfil</Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}

export default LayoutAlumno