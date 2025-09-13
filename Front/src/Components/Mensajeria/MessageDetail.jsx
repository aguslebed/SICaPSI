export default function MessageDetail({ message }) {
  if (!message) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Selecciona un mensaje para ver el contenido
      </div>
    );
  }

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-2xl font-semibold mb-1 break-words">{message.subject}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium text-gray-700">De:</span>{' '}
              {message.sender?.firstName} {message.sender?.lastName} ({message.sender?.email})
            </p>
            <p>
              <span className="font-medium text-gray-700">Para:</span>{' '}
              {message.recipient?.firstName} {message.recipient?.lastName} ({message.recipient?.email})
            </p>
            <p>
              <span className="font-medium text-gray-700">Fecha:</span>{' '}
              {formatDateTime(message.createdAt)}
            </p>
          </div>
        </div>

        <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
          {message.message}
        </div>

        {Array.isArray(message.attachments) && message.attachments.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Adjuntos</p>
            <ul className="list-disc list-inside space-y-1">
              {message.attachments.map((a, idx) => {
                const label = a?.originalName || a?.filename || (typeof a === 'string' ? a : 'Archivo adjunto');
                const href = a?.url || (typeof a === 'string' ? a : undefined);
                return (
                  <li key={idx} className="break-all">
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 underline">{label}</a>
                    ) : (
                      <span>{label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
