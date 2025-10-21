import React from 'react';

export default function PresentationForm(props) {
  const {
    title,
    subtitle,
    description,
    image,
    startDate,
    endDate,
    isActive,
    setTitle,
    setSubtitle,
    setDescription,
    setImage,
    setStartDate,
    setEndDate,
    setIsActive,
    uploadingFiles,
    uploadTrainingFile,
    deleteTrainingFile
  } = props;

  return (
  <div className="p-3 bg-white flex justify-center" style={{ zoom: '85%' }}>
    <div className="w-full max-w-3xl">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-2 py-1.5 text-sm font-semibold border border-gray-400" style={{ width: '25%' }}>
              Campo
            </th>
              <th className="bg-gray-500 text-white text-left px-2 py-1.5 text-sm font-semibold border border-gray-400">Datos de la capacitación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">Título</td>
            <td className="px-2 py-1.5 border border-gray-300">
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent" placeholder="Ingrese el título de la capacitación (Max caracter: 50)" />
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">Subtítulo</td>
            <td className="px-2 py-1.5 border border-gray-300">
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={100} className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent" placeholder="Subtítulo de la capacitación (Max caracter: 100)" />
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">Descripción</td>
            <td className="px-2 py-1.5 border border-gray-300">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent resize-none" rows={3} placeholder="Descripción detallada de la capacitación (Max caracter: 1000)" />
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300">Imagen</td>
            <td className="px-3 py-2 border border-gray-300">
              <div>
                <div className="flex items-center gap-3">
                  <input value={image || ''} onChange={(e) => setImage(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm placeholder:text-sm font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent placeholder-gray-400" placeholder="URL de imagen o deja vacío para subir archivo" />

                  <label className="inline-block">
                    <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const response = await uploadTrainingFile(file);
                        const filePath = typeof response === 'string' ? response : response.filePath;
                        setImage(filePath);
                      } catch (err) {
                        console.error('Error uploading image:', err);
                        alert('Error al subir la imagen');
                      } finally {
                        e.target.value = '';
                      }
                    }} className="hidden" />
                    <span className="inline-block px-4 py-2 bg-gray-500 border border-gray-500 rounded-lg text-sm text-white cursor-pointer hover:bg-gray-600">Choose File</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {uploadingFiles && uploadingFiles['presentation-image'] && (
                      <div className="animate-spin h-4 w-4 border-2 border-gray-200 border-t-gray-500 rounded-full" />
                    )}
                    {image && (<button type="button" onClick={async () => { if (image && typeof image === 'string' && image.startsWith('/uploads/')) { try { await deleteTrainingFile(image); } catch (error) { console.error('Error deleting image file:', error); } } setImage(''); }} className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded-md cursor-pointer">✕</button>)}
                  </div>
                </div>

                <div className="mt-2 text-xs text-indigo-600 font-medium text-right">Menor a 5 Mb - Formatos: JPG, PNG, GIF, WebP</div>
              </div>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">Fechas</td>
            <td className="px-2 py-1.5 border border-gray-300">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Fecha de Inicio</label>
                  <div className="relative">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-200 focus:border-transparent cursor-pointer" />
                    
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Fecha de Fin</label>
                  <div className="relative">
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-200 focus:border-transparent cursor-pointer" />
                    
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">Estado</td>
            <td className="px-2 py-1.5 border border-gray-300">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                  <label htmlFor="isActive" className="text-sm cursor-pointer">Habilitar Capacitación</label>
                </div>

                <span className="ml-auto inline-block px-4 py-1 rounded-full text-white text-sm font-bold text-center" style={{ minWidth: '110px', backgroundColor: isActive ? '#10b981' : '#ef4444' }}>{isActive ? 'HABILITADO' : 'DESHABILITADO'}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  );
}
