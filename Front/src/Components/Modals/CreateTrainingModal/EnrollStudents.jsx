import React from 'react';

export default function EnrollStudents({ loadingStudents, students, searchStudent, setSearchStudent, handleSearch, handleClearSearch, selectedStudents, handleStudentSelection, selectAllStudents, deselectAllStudents, getFilteredStudents }) {
  return (
    <div className="border border-gray-300 rounded-sm p-2 bg-white">
      {loadingStudents ? (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando guardias...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Buscador */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 border border-gray-300 rounded-sm">
            <div className="flex-1 relative">
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { handleSearch(); } }}
                className="w-full pl-8 pr-2 py-1 bg-white border border-gray-200 rounded-sm text-sm placeholder:text-sm focus:border-green-300 focus:ring-1 focus:ring-green-200 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-sm text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              Buscar
            </button>
            {searchStudent && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-sm text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controles de selección */}
          {students.length > 0 && (
            <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-sm">
              <span className="text-sm text-gray-600">
                {selectedStudents.length > 0 
                  ? `${selectedStudents.length} seleccionado${selectedStudents.length !== 1 ? 's' : ''}` 
                  : `${getFilteredStudents().length} disponible${getFilteredStudents().length !== 1 ? 's' : ''}`
                }
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllStudents}  
                  className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-sm cursor-pointer"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={deselectAllStudents}
                  className="px-2 py-1 text-sm bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-sm cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Listas de guardias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Disponibles */}
            <div className="border border-gray-300 rounded-sm">
              <div className="bg-gray-500 text-white px-2 py-1.5 border-b border-gray-400">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Disponibles</h3>
                  <span className="text-sm">{getFilteredStudents().length}</span>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto bg-white">
                {getFilteredStudents().length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">{students.length === 0 ? 'No hay guardias disponibles' : 'No se encontraron guardias'}</p>
                  </div>
                ) : (
                  getFilteredStudents().map((student) => (
                    <div
                      key={student._id}
                      className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer ${
                        selectedStudents.includes(student._id) ? 'bg-green-50' : ''
                      }`}
                      onClick={() => handleStudentSelection(student._id, !selectedStudents.includes(student._id))}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={(e) => { e.stopPropagation(); handleStudentSelection(student._id, e.target.checked); }}
                        className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{student.firstName} {student.lastName}</div>
                      </div>
                      <div className="text-sm text-gray-600">{student.documentNumber}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Seleccionados */}
            <div className="border border-gray-300 rounded-sm">
              <div className="bg-gray-500 text-white px-2 py-1.5 border-b border-gray-400">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Seleccionados</h3>
                  <span className="text-sm">{selectedStudents.length}</span>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto bg-white">
                {selectedStudents.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">No hay guardias seleccionados</p>
                  </div>
                ) : (
                  selectedStudents.map((studentId) => {
                    const student = students.find(s => s._id === studentId);
                    if (!student) return null;

                    return (
                      <div
                        key={studentId}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 truncate">{student.firstName} {student.lastName}</div>
                        </div>
                        <div className="text-sm text-gray-600">{student.documentNumber}</div>
                        <button
                          onClick={() => handleStudentSelection(studentId, false)}
                          className="text-red-600 hover:text-red-800 text-sm px-1.5 py-0.5 border border-red-200 rounded cursor-pointer"
                          title="Quitar"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
