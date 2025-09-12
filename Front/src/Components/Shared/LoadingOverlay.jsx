import React from 'react';

export default function LoadingOverlay({ label = 'Procesando...' }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm flex flex-col items-center gap-4">
        <span className="animate-spin h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full" />
        <p className="text-slate-700 font-semibold">{label}</p>
        <p className="text-slate-500 text-sm text-center">No cierres esta ventana</p>
      </div>
    </div>
  );
}
