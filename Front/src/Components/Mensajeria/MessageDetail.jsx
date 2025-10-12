import { resolveImageUrl } from "../../API/Request";
import.meta.env;

export default function MessageDetail({ message, onReply, onDelete, onClose }) {
  if (!message) return null;

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
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
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-6 relative">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={resolveImageUrl(avatarUser?.profileImage) || '/vite.svg'}
                alt={avatarName}
                className="w-20 h-20 rounded-full bg-gray-100 object-cover border"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
                <div className="mt-3 text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  <span>{formatDateTime(message.createdAt)}</span>
                </div>
              </div>
                  <span className="font-medium text-gray-700">De: </span>
                  <span className="text-gray-800 truncate">{senderName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700">Para: </span>
                  <span className="text-gray-800 truncate">{recipientName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700">Asunto:</span>
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
              className="cursor-pointer absolute right-6 top-6 w-11 h-11 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center shadow-md z-50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-6 lg:px-8 py-4 flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-10 max-h-[75vh] overflow-auto space-y-6">
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                  <strong>Mensaje:</strong>
                  <div className="mt-2">{message.message}</div>
                </div>
         
              {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Adjuntos</h4>
                  <div className="space-y-2">
                    {message.attachments.map((a, idx) => {
                      const label = a?.originalName || a?.filename || (typeof a === 'string' ? a : 'Adjunto');
                      const rawHref = a?.url || (typeof a === 'string' ? a : undefined);
                      // Prefer secure download endpoint when message has _id and index
                      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
                      const href = (message?._id != null)
                        ? `${API_BASE}/messages/${message._id}/attachments/${idx}/download`
                        : (rawHref ? resolveImageUrl(rawHref) : undefined);
                      return (
                        <div key={idx} className="flex items-center gap-3 p-2 border rounded">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-600">📎</div>
                          <div className="flex-1 text-sm break-all">
                            {href ? (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{label}</a>
                            ) : (
                              <span>{label}</span>
                            )}
                          </div>
                          {href && (
                            <a href={href} download={label} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Descargar</a>
                          )}
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-end gap-3">
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="cursor-pointer px-3 py-2 rounded-md border text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                >
                  Eliminar
                </button>
              )}
              {onReply && (
                <button
                  type="button"
                  onClick={onReply}
                  className="cursor-pointer px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
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
