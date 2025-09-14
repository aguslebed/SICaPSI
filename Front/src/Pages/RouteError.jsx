import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function RouteError() {
  const error = useRouteError();
  console.error('Route error:', error);

  // Fallback friendly UI for route loading/eval errors (e.g. dynamic import failures)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-xl shadow p-6 max-w-xl w-full text-center">
        <h2 className="text-2xl font-bold mb-2">Ocurrió un error al cargar la página</h2>
        <p className="text-sm text-gray-600 mb-4">Es posible que el módulo no se haya cargado correctamente.</p>
        <pre className="text-xs text-left text-red-600 bg-red-50 rounded p-3 mb-4 overflow-auto">{String(error?.message || error)}</pre>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Reintentar
          </button>
          <Link to="/" className="px-4 py-2 border rounded">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
