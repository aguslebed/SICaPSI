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
  <div className="p-2 md:p-2 lg:p-2.5 xl:p-3 bg-white">
    <div className="w-full">
      <table className="w-full border-collapse text-xs md:text-xs lg:text-xs xl:text-sm">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400" style={{ width: '20%' }}>
              Campo
            </th>
              <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400">Datos de la capacitación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">Título</td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <RichTextInput
                value={title}
                onChange={(html) => setTitle(html)}
                maxLength={100}
                placeholder="Ingrese el título de la capacitación (Max caracteres: 100)"
              />
              <p className="text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-gray-500 mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1 text-right">{titleLength}/100 caracteres</p>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">Subtítulo</td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <RichTextInput
                value={subtitle}
                onChange={(html) => setSubtitle(html)}
                maxLength={150}
                placeholder="Ingrese el subtítulo de la capacitación (Max caracteres: 150)"
              />
              <p className="text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-gray-500 mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1 text-right">{subtitleLength}/150 caracteres</p>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">Descripción</td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <RichTextInput
                value={description}
                onChange={(htmlValue) => setDescription(htmlValue)}
                maxLength={1000}
                placeholder="Ingrese la descripción detallada de la capacitación (Max caracteres: 1000)"
              />
              <p className="text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-gray-500 mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1 text-right">{descriptionLength}/1000 caracteres</p>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">Imagen</td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <div>
                <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-2 xl:gap-2">
                  <input value={image || ''} onChange={(e) => setImage(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm placeholder:text-xs md:placeholder:text-xs lg:placeholder:text-xs xl:placeholder:text-sm font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent placeholder-gray-400" placeholder="URL de imagen o deja vacío para subir archivo" />

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
                    <span className="inline-block px-2 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 bg-gray-500 border border-gray-500 rounded-lg text-xs md:text-xs lg:text-xs xl:text-sm text-white cursor-pointer hover:bg-gray-600">Choose File</span>
                  </label>

                  <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-2 xl:gap-2">
                    {uploadingFiles && uploadingFiles['presentation-image'] && (
                      <div className="animate-spin h-3 w-3 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 border-2 border-gray-200 border-t-gray-500 rounded-full" />
                    )}
                    {image && (<button type="button" onClick={() => { 
                      setImage(''); 
                      if (setPendingImageFile) {
                        setPendingImageFile(null);
                      }
                    }} className="text-red-600 hover:text-red-800 text-xs md:text-xs lg:text-xs xl:text-sm px-1.5 py-0.5 md:px-1.5 md:py-0.5 lg:px-2 lg:py-0.5 xl:px-2 xl:py-1 border border-red-200 rounded-md cursor-pointer">✕</button>)}
                  </div>
                </div>

                <div className="mt-1 md:mt-1 lg:mt-1.5 xl:mt-2 text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-indigo-600 text-right">Menor a 5 Mb - Formatos: JPG, PNG, GIF, WebP</div>
              </div>
            </td>
          </tr>

          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">Fechas</td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <div className="flex gap-2 md:gap-2 lg:gap-2.5 xl:gap-3 items-center">
                <div className="flex-1">
                  <label className="block text-[10px] md:text-[10px] lg:text-[11px] xl:text-sm text-gray-600 mb-0.5 md:mb-0.5 lg:mb-0.5 xl:mb-1">Fecha de Inicio</label>
                  <div className="relative">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm focus:ring-2 focus:ring-green-200 focus:border-transparent cursor-pointer" />
                    
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] md:text-[10px] lg:text-[11px] xl:text-sm text-gray-600 mb-0.5 md:mb-0.5 lg:mb-0.5 xl:mb-1">Fecha de Fin</label>
                  <div className="relative">
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm focus:ring-2 focus:ring-green-200 focus:border-transparent cursor-pointer" />
                    
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
