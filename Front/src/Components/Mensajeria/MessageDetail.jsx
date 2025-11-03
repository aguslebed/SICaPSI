import { resolveImageUrl, downloadMessageAttachment } from "../../API/Request";
import.meta.env;
import { useState } from "react";

export default function MessageDetail({ message, onReply, onDelete, onClose }) {
  if (!message) return null;
  
  const [downloadingIndex, setDownloadingIndex] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };
  
  const handleDownloadAttachment = async (idx) => {
    setDownloadingIndex(idx);
    setDownloadError(null);
    try {
      const att = message.attachments[idx];
      const filename = att?.originalName || att?.filename || `adjunto-${idx}`;
      await downloadMessageAttachment(message._id, idx, filename);
    } catch (err) {
      console.error('Error descargando adjunto:', err);
      setDownloadError(err.message || 'Error al descargar el archivo');
    } finally {
      setDownloadingIndex(null);
    }
  };

  const senderName = `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || message.sender?.email || 'Desconocido';
  const recipientName = `${message.recipient?.firstName || ''} ${message.recipient?.lastName || ''}`.trim() || message.recipient?.email || 'Tú';
  // Mostrar el avatar del "contraparte": si es un mensaje enviado, usamos el destinatario; si no, el remitente
  const avatarUser = message.folder === 'sent' ? message.recipient : message.sender;
  const avatarName = message.folder === 'sent' ? recipientName : senderName;

  return (
  <div className="min-h-[60vh] text-base text-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 relative">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex-shrink-0">
              <img
                src={resolveImageUrl(avatarUser?.profileImage) || '/vite.svg'}
                alt={avatarName}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-100 object-cover border"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
                <div className="mt-1 sm:mt-3 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  <span className="truncate">{formatDateTime(message.createdAt)}</span>
                </div>
              </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="font-medium text-gray-700 whitespace-nowrap">De: </span>
                    <span className="text-gray-800 truncate">{senderName}</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="font-medium text-gray-700 whitespace-nowrap">Para: </span>
                    <span className="text-gray-800 truncate">{recipientName}</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="font-medium text-gray-700 whitespace-nowrap">Asunto:</span>
                    <span className="text-gray-800 truncate">{message.subject || '(Sin asunto)'}</span>
                  </div>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar"
              className="cursor-pointer absolute right-3 sm:right-6 top-3 sm:top-6 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center shadow-md z-50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-10 max-h-[75vh] overflow-auto space-y-4 sm:space-y-6">
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  <strong>Mensaje:</strong>
                  <div className="mt-2">{message.message}</div>
                </div>
         
              {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Adjuntos</h4>
                  {downloadError && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {downloadError}
                    </div>
                  )}
                  <div className="space-y-2">
                    {message.attachments.map((a, idx) => {
                      const label = a?.originalName || a?.filename || (typeof a === 'string' ? a : 'Adjunto');
                      const isDownloading = downloadingIndex === idx;
                      return (
                        <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 border rounded">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded flex items-center justify-center text-gray-600 text-sm sm:text-base">📎</div>
                          <div className="flex-1 text-xs sm:text-sm break-all">
                            <span className="text-gray-800">{label}</span>
                            {a?.size && (
                              <span className="text-gray-500 ml-2">({(a.size / 1024).toFixed(1)} KB)</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDownloadAttachment(idx)}
                            disabled={isDownloading}
                            className={`text-xs px-2 py-1 rounded cursor-pointer whitespace-nowrap ${
                              isDownloading 
                                ? 'bg-gray-200 text-gray-500 cursor-wait' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isDownloading ? '⏳ Descargando...' : '⬇️ Descargar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer actions */}
      {(onReply || onDelete) && (
        <div className="sticky bottom-0 z-40 bg-white border-t">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="cursor-pointer px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                >
                  Eliminar
                </button>
              )}
              {onReply && (
                <button
                  type="button"
                  onClick={onReply}
                  className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
                >
                  Responder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
