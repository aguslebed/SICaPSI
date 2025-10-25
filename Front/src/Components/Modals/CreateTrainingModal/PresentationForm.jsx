import React, { useState } from 'react';
import RichTextInput, { getPlainTextFromRichText } from './RichTextInput';

export default function PresentationForm(props) {
  const {
    title,
    subtitle,
    description,
    image,
    startDate,
    endDate,
    setTitle,
    setSubtitle,
    setDescription,
    setImage,
    setStartDate,
    setEndDate,
    uploadingFiles,
    uploadTrainingFile,
    deleteTrainingFile,
    showWarningModal,
    pendingImageFile,
    setPendingImageFile
  } = props;

  const titleLength = getPlainTextFromRichText(title).length;
  const subtitleLength = getPlainTextFromRichText(subtitle).length;
  const descriptionLength = getPlainTextFromRichText(description).length;

  return (
  <div className="p-2 bg-white">
    <div className="w-full">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 text-xs font-semibold border border-gray-400" style={{ width: '25%' }}>
              Campo
            </th>
              <th className="bg-gray-500 text-white text-left px-1.5 py-1 text-xs font-semibold border border-gray-400">Datos de la capacitación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>Título</td>
            <td className="px-1.5 py-1 border border-gray-300">
              <RichTextInput
                value={title}
                onChange={(html) => setTitle(html)}
                maxLength={100}
                placeholder="Ingrese el título de la capacitación (Max caracteres: 100)"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{titleLength}/100 caracteres</p>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">Subtítulo</td>
            <td className="px-1.5 py-1 border border-gray-300">
              <RichTextInput
                value={subtitle}
                onChange={(html) => setSubtitle(html)}
                maxLength={150}
                placeholder="Ingrese el subtítulo de la capacitación (Max caracteres: 150)"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{subtitleLength}/150 caracteres</p>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">Descripción</td>
            <td className="px-1.5 py-1 border border-gray-300">
              <RichTextInput
                value={description}
                onChange={(htmlValue) => setDescription(htmlValue)}
                maxLength={1000}
                placeholder="Ingrese la descripción detallada de la capacitación (Max caracteres: 1000)"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{descriptionLength}/1000 caracteres</p>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">Imagen</td>
            <td className="px-1.5 py-1 border border-gray-300">
              <div>
                <div className="flex items-center">
                  <input value={image || ''} onChange={(e) => setImage(e.target.value)} className="flex-1 border border-gray-200 rounded-sm px-2 py-1.5 text-xs placeholder:text-xs font-normal focus:ring-2 focus:ring-green-50 focus:border-green-300 bg-white" placeholder="https://ejemplo.com/imagen.jpg" />

                  <div className="flex items-center gap-2 ml-2">
                    <label className="inline-block">
                    <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      // Validar tamaño (5MB max)
                      if (file.size > 5 * 1024 * 1024) {
                        if (showWarningModal) {
                          showWarningModal('El archivo excede el tamaño máximo de 5 MB');
                        }
                        e.target.value = '';
                        return;
                      }
                      
                      // Guardar el archivo en estado pendiente (no subirlo todavía)
                      if (setPendingImageFile) {
                        setPendingImageFile(file);
                      }
                      
                      // Crear una vista previa local
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImage(event.target.result); // Usar data URL para preview
                      };
                      reader.readAsDataURL(file);
                      
                      e.target.value = '';
                    }} className="hidden" />
                      <span className="inline-block bg-gray-500 border border-gray-500 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-600">Choose File</span>
                    </label>

                    {uploadingFiles && uploadingFiles['presentation-image'] && (
                      <div className="animate-spin h-3 w-3 border-2 border-gray-200 border-t-green-600 rounded-full" />
                    )}
                    {image && (
                      <button type="button" onClick={() => { 
                        setImage(''); 
                        if (setPendingImageFile) {
                          setPendingImageFile(null);
                        }
                      }} className="text-red-600 hover:text-red-800 text-xs px-1.5 py-0.5 border border-red-200 rounded-md cursor-pointer">✕</button>)}
                  </div>
                </div>

                <p className="text-[10px] text-indigo-600 mt-0.5 text-right">Menor a 5 Mb - Formatos: JPG, PNG, GIF, WebP</p>
              </div>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">Fechas</td>
            <td className="px-1.5 py-1 border border-gray-300">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-600 mb-0.5">Fecha de Inicio</label>
                  <div className="relative">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-sm px-2 py-1 text-xs focus:ring-2 focus:ring-green-50 focus:border-transparent cursor-pointer" />
                    
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] text-gray-600 mb-0.5">Fecha de Fin</label>
                  <div className="relative">
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-sm px-2 py-1 text-xs focus:ring-2 focus:ring-green-50 focus:border-transparent cursor-pointer" />
                    
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  );
}
