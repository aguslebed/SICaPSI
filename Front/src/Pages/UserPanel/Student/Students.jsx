import React from 'react';
import { BsFileBarGraphFill } from "react-icons/bs";
import { FaComments } from 'react-icons/fa';

export default function Students() {
	// Mock data for visual table (replace with real data later)
	const students = [
		{ id: 1, lastName: 'González', firstName: 'María', dni: '12345678', email: 'maria.gonzalez@example.com', lastLogin: '2025-10-10 09:12' },
		{ id: 2, lastName: 'Pérez', firstName: 'Juan', dni: '23456789', email: 'juan.perez@example.com', lastLogin: '2025-10-12 14:01' },
		{ id: 3, lastName: 'Rodríguez', firstName: 'Ana', dni: '34567890', email: 'ana.rodriguez@example.com', lastLogin: '2025-10-15 18:22' }
	];

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-screen-xl w-full mx-auto  flex px-4 sm:px-6 md:px-8">
				<main className="flex-1 min-w-0 py-6 md:py-8">
					
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Alumnos</h1>
                     
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
								{students.length === 0 ? (
									<tr><td colSpan={6} className="py-4 text-center text-gray-500">No hay alumnos para mostrar.</td></tr>
								) : (
									students.map((s, i) => (
										<tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
											<td className="py-2 px-2 text-left">{s.lastName}</td>
											<td className="py-2 px-2 text-left">{s.firstName}</td>
											<td className="py-2 px-2 text-left">{s.dni}</td>
											<td className="py-2 px-2 text-left">{s.email}</td>
											<td className="py-2 px-2 text-left">{s.lastLogin}</td>
											<td className="py-2 px-2 text-left">
												<div className="flex items-center gap-2">
													<button className="inline-flex items-center gap-2 px-3 py-1 bg-[#0077b6] text-white rounded-md hover:bg-blue-700 transition">
														<BsFileBarGraphFill className="text-sm" />
														<span>Seguimiento</span>
													</button>
													<button className="inline-flex items-center gap-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition">
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
            
				</main>
			</div>
		</div>
	);
}