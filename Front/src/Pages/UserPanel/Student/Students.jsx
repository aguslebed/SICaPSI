import React, { useEffect, useState, useMemo } from 'react';
import { BsFileBarGraphFill } from 'react-icons/bs';
import { FaComments } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsersEnrolledInTraining } from '../../../API/Request';

export default function Students() {
	const { idTraining } = useParams();
	const navigate = useNavigate();
	const [students, setStudents] = useState([]);
	const [search, setSearch] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let mounted = true;
		async function fetchStudents() {
			setLoading(true);
			setError(null);
			try {
				const data = await getUsersEnrolledInTraining(idTraining);
				if (!mounted) return;
				setStudents(Array.isArray(data) ? data : (data?.items || []));
			} catch (e) {
				if (!mounted) return;
				setError(e.message || 'Error cargando alumnos');
			} finally {
				if (mounted) setLoading(false);
			}
		}
		fetchStudents();
		return () => { mounted = false; };
	}, [idTraining]);

	const filteredStudents = useMemo(() => {
		if (!appliedSearch || !appliedSearch.trim()) return students;
		const q = appliedSearch.toLowerCase();
		return students.filter(s => {
			const hay = [s.firstName || s.first_name || '', s.lastName || s.last_name || '', s.email || '', s.documentNumber || s.dni || '']
				.join(' ').toLowerCase();
			return hay.includes(q);
		});
	}, [students, appliedSearch]);

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-screen-xl w-full mx-auto  flex px-4 sm:px-6 md:px-8">
				<main className="flex-1 min-w-0 py-6 md:py-8">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Alumnos</h1>

					{loading ? (
						<div className="py-8 text-center text-gray-600">Cargando alumnos...</div>
					) : error ? (
						<div className="py-8 text-center text-red-600">{error}</div>
					) : (
						<>
							<div>
								{/* Search bar (similar to GestionProfesores) */}
								<div className="mb-4 flex gap-2 items-center">
									<div className="flex-1">
										<input
											type="text"
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											onKeyDown={e => { if (e.key === 'Enter') setAppliedSearch(search); }}
											placeholder="Buscar alumno"
											className="w-full rounded-md border px-3 py-2"
										/>
									</div>
									<button onClick={() => setAppliedSearch(search)} className="px-3 py-2 bg-[#0077b6] text-white rounded-md">Buscar</button>
									<button onClick={() => { setSearch(''); setAppliedSearch(''); }} className="px-3 py-2 border rounded-md">Limpiar</button>
								</div>

								<div className="overflow-x-auto rounded-2xl">
									<table className="min-w-full border border-gray-200">
										<thead>
											<tr className="bg-[#0077b6] text-white">
												<th className="py-3 px-4 text-left">Apellido</th>
												<th className="py-3 px-4 text-left">Nombre</th>
												<th className="py-3 px-4 text-left">DNI</th>
												<th className="py-3 px-4 text-left">Email</th>
												<th className="py-3 px-4 text-left">Último acceso</th>
												<th className="py-3 px-4 text-left">Acciones</th>
											</tr>
										</thead>
										<tbody>
											{filteredStudents.length === 0 ? (
												<tr><td colSpan={6} className="py-4 text-center text-gray-500">No hay alumnos para mostrar.</td></tr>
											) : (
												filteredStudents.map((s, i) => (
													<tr key={s._id || s.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
														<td className="py-2 px-2 text-left">{s.lastName || s.last_name || ''}</td>
														<td className="py-2 px-2 text-left">{s.firstName || s.first_name || ''}</td>
														<td className="py-2 px-2 text-left">{s.documentNumber || s.dni || s.document_number || ''}</td>
														<td className="py-2 px-2 text-left">{s.email || ''}</td>
														<td className="py-2 px-2 text-left">{s.lastLogin || s.last_login || ''}</td>
														<td className="py-2 px-2 text-left">
															<div className="flex items-center gap-2">
																<button
																	onClick={() => navigate(`/trainer/${idTraining}/reports`)}
																	className="inline-flex items-center gap-2 px-3 py-1 bg-[#0077b6] text-white rounded-md hover:bg-blue-700 transition"
																>
																	<BsFileBarGraphFill className="text-sm" />
																	<span>Seguimiento</span>
																</button>
																<button
																	onClick={() => navigate(`/trainer/${idTraining}/messages`)}
																	className="inline-flex items-center gap-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
																>
																	<FaComments className="text-sm" />
																	<span>Mensaje</span>
																</button>
															</div>
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							</div>
						</>
					)}
				</main>
			</div>
		</div>
	  );
	}