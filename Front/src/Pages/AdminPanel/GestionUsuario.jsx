import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import NavBar from '../../Components/Student/NavBar';
import { deleteUser as deleteUserApi, getAllUsers } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';


function getEstadoLabel(status) {
  if (status === 'available') return { label: 'Habilitado', color: 'bg-green-500' };
  if (status === 'disabled') return { label: 'Deshabilitado', color: 'bg-red-500' };
  if (status === 'pending') return { label: 'Pendiente', color: 'bg-yellow-400' };
  return { label: status, color: 'bg-gray-400' };
}

function getRoleLabel(role) {
  if (role === 'Capacitador') return 'Capacitador';
  if (role === 'Alumno') return 'Guardia';
  if (role === 'Directivo') return 'Directivo';
  if (role === 'Administrador') return 'Administrador';
  return role;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR');
}

export default function GestionUsuario() {
  // Estados para los filtros aplicados
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Estados para los filtros en edición (inputs)
  const [tipoEdit, setTipoEdit] = useState('');
  const [estadoEdit, setEstadoEdit] = useState('');
  const [fechaDesdeEdit, setFechaDesdeEdit] = useState('');
  const [fechaHastaEdit, setFechaHastaEdit] = useState('');

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState(''); // Nuevo estado
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data.items);
        // console.log(data.items);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Filtros
  useEffect(() => {
    let result = [...users];

    if (searchApplied.trim()) {
      const s = searchApplied.trim().toLowerCase();
      result = result.filter(
        u =>
          u.firstName?.toLowerCase().includes(s) ||
          u.lastName?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.documentNumber?.toLowerCase().includes(s)
      );
    }
    if(filtersApplied){

      if (tipo) {
        result = result.filter(u => getRoleLabel(u.role) === tipo);
      }
      if (estado) {
        const estadoMap = {
          'Habilitado': 'available',
          'Deshabilitado': 'disabled',
          'Pendiente': 'pending'
        };
        result = result.filter(u => u.status === estadoMap[estado]);
      }
      if (fechaDesde) {
        result = result.filter(u => new Date(u.createdAt) >= new Date(fechaDesde));
      }
      if (fechaHasta) {
        result = result.filter(u => new Date(u.createdAt) <= new Date(fechaHasta));
      }
    }
    setFilteredUsers(result);
  }, [users, searchApplied, tipo, estado, fechaDesde, fechaHasta, filtersApplied]);

  // Aplica los filtros (excepto búsqueda)
  const aplicarFiltros = () => {
    setTipo(tipoEdit);
    setEstado(estadoEdit);
    setFechaDesde(fechaDesdeEdit);
    setFechaHasta(fechaHastaEdit);
    setFiltersApplied(true);
  };

  // Limpia todos los filtros
  const limpiarFiltros = () => {
    setTipo('');
    setEstado('');
    setFechaDesde('');
    setFechaHasta('');
    setTipoEdit('');
    setEstadoEdit('');
    setFechaDesdeEdit('');
    setFechaHastaEdit('');
    setFiltersApplied(false);
  };

  const deleteUser = async (id) => {
  try {
    await deleteUserApi(id);
    const updatedUsers = users.filter(u => u._id !== id);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
  } catch (error) {
    alert(error.message || "Error al eliminar usuario");
  }
};

  return (
    <>
      {loading && <LoadingOverlay label="Cargando usuarios..." />}
      <NavBar />
      <main className="p-6 bg-[#f6f8fa] min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Gestión de usuarios</h1>
            <Link to="/adminPanel/gestionUsuario/crearUsuario" className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg">Crear usuario</Link>
          </div>
          {/* Filtros */}
          <div className="bg-white rounded shadow p-4 flex flex-wrap gap-4 mb-6 items-end">
            <div>
              <label className="block text-sm mb-1">Buscar</label>
              <div className="flex">
                <input
                  type="text"
                  className="border rounded-l px-3 py-1"
                  placeholder="Buscar..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button
                  className="bg-sky-400 text-white px-3 rounded-r cursor-pointer"
                  onClick={() => setSearchApplied(search)}
                >🔍</button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Tipo</label>
              <select
                className="border rounded px-3 py-1"
                value={tipoEdit}
                onChange={e => setTipoEdit(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Capacitador">Capacitador</option>
                <option value="Guardia">Guardia</option>
                <option value="Administrador">Administrador</option>
                <option value="Directivo">Directivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Estado</label>
              <select
                className="border rounded px-3 py-1"
                value={estadoEdit}
                onChange={e => setEstadoEdit(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Habilitado">Habilitado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Deshabilitado">Deshabilitado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Fecha de creación</label>
              <div className="flex gap-1 items-center">
                <p>Desde:</p>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={fechaDesdeEdit}
                  onChange={e => setFechaDesdeEdit(e.target.value)}
                />
                <p>Hasta:</p>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={fechaHastaEdit}
                  onChange={e => setFechaHastaEdit(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                className="bg-sky-400 text-white px-3 py-1 rounded cursor-pointer"
                onClick={aplicarFiltros}
              >Aplicar Filtros</button>
              <button
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer"
                onClick={limpiarFiltros}
              >Limpiar Filtros</button>
            </div>
          </div>
          {/* Tabla */}
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#0888c2] text-white">
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Apellido</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">DNI</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha de creación</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">No hay usuarios para mostrar.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const estado = getEstadoLabel(u.status);
                    return (
                      <tr key={u._id} className="border-b">
                        <td className="px-4 py-3">{u.firstName}</td>
                        <td className="px-4 py-3">{u.lastName}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.documentNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`text-white px-3 py-1 rounded-full text-sm ${estado.color}`}>{estado.label}</span>
                        </td>
                        <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">{getRoleLabel(u.role)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link to="/adminPanel/gestionUsuario/modificarUsuario"
                              state={{ user: u }}
                              className="cursor-pointer"
                              >
                      📝  </Link>
                            <button className='cursor-pointer' title="Deshabilitar usuario" onClick={() => deleteUser(u._id)}><span role="img" aria-label="users">🚫</span></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <div className="flex justify-end mt-4 gap-2">
            <button className="px-3 py-1 rounded border">Anterior</button>
            <button className="px-3 py-1 rounded border bg-sky-400 text-white">1</button>
            <button className="px-3 py-1 rounded border">2</button>
            <button className="px-3 py-1 rounded border">3</button>
            <button className="px-3 py-1 rounded border">Siguiente</button>
          </div>
          <Outlet />
        </div>
      </main>
    </>
  );
}
