import React from 'react';

export default function AssignTeacher({ teachers, loadingTeachers, assignedTeacher, setAssignedTeacher }) {
  return (
  <div className="p-2 bg-white">
      {loadingTeachers ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-medium text-gray-600">Cargando profesores...</p>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="bg-white border border-gray-300 rounded-sm p-2">


            <div className="space-y-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Profesor Asignado</label>
                <select
                  value={assignedTeacher} 
                  onChange={(e) => {
                    setAssignedTeacher(e.target.value);
                  }} 
                  className="w-full border border-gray-300 rounded-sm px-2 py-1 text-sm placeholder:text-sm focus:ring-2 focus:ring-green-50 focus:border-transparent transition-shadow cursor-pointer bg-white" 
                >
                  <option value="">-- Seleccione un profesor --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstName} {teacher.lastName} - {teacher.email}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {teachers.length === 0 
                    ? 'No hay profesores disponibles en el sistema' 
                    : `${teachers.length} profesor${teachers.length !== 1 ? 'es' : ''} disponible${teachers.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>

              {assignedTeacher && (
                <div className="bg-white border border-green-200 rounded-sm p-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-white text-xs font-bold bg-green-500">
                      ✓ ASIGNADO
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {teachers.find(t => t._id === assignedTeacher)?.firstName} {teachers.find(t => t._id === assignedTeacher)?.lastName}
                    </span>
                  </div>
                </div>
              )}

              {!assignedTeacher && (
                <div className="bg-white border border-gray-200 rounded-sm p-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Sin profesor asignado</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
