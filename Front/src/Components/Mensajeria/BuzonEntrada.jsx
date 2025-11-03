import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import ComposeModal from "./ComposeModal";
import { sendMessage, setMessageRead, getMe, bulkMoveToTrash, bulkSetMessageRead } from "../../API/Request";
import { Search, Paperclip } from "lucide-react";
import LoadingOverlay from "../Shared/LoadingOverlay";
import ErrorModal from "../Modals/ErrorModal";
import SucessModal from "../Modals/SucessModal";
import ConfirmActionModal from "../Modals/ConfirmActionModal";

const normalizeTrainingId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return value._id;
    if (value.$oid) return value.$oid;
    if (typeof value.toString === 'function') {
      const str = value.toString();
      return str.startsWith('ObjectId(') ? str.slice(9, -1) : str;
    }
  }
  return String(value);
};

export default function BuzonEntrada({ hideCompose = false, trainingId, sortBy = 'fecha' }) {
  const { userData, setUserData } = useUser();

  // Solo mensajes de entrada (carpeta inbox)
  const normalizedTrainingId = useMemo(() => (trainingId ? String(trainingId) : null), [trainingId]);

  const inbox = useMemo(() => (userData?.messages?.items || [])
    .filter((m) => m.folder === "inbox")
    .filter((m) => {
      if (!normalizedTrainingId) return true;
      const messageTid = normalizeTrainingId(m?.trainingId);
      return !messageTid || messageTid === normalizedTrainingId;
    }), [userData, normalizedTrainingId]);
  const [messages, setMessages] = useState(inbox);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyInitial, setReplyInitial] = useState(null); // datos iniciales para responder
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Procesando...');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState({ open: false, type: null, ids: [] });
  const pendingIdsRef = useRef([]); // ids con cambio de carpeta en vuelo
  const suppressSyncRef = useRef(false); // evita deshacer updates optimistas

  useEffect(() => {
    // Si hay operaciones en curso que deberían haber removido estos ids de inbox,
    // evitamos sobreescribir el estado local hasta que el backend refleje el cambio.
    if (suppressSyncRef.current) {
      const stillThere = inbox.some((m) => pendingIdsRef.current.includes(m._id));
      if (stillThere) return; // esperar a que ya no estén
      // Ya no están: podemos volver a sincronizar normalmente
      suppressSyncRef.current = false;
      pendingIdsRef.current = [];
    }
    // Filtro por búsqueda: solo asunto y remitente (nombre/apellido)
    const q = query.trim().toLowerCase();
    let list = inbox;
    if (q) {
      list = inbox.filter((m) => {
        const subject = (m.subject || '').toLowerCase();
        const senderName = `${m.sender?.firstName || ''} ${m.sender?.lastName || ''}`.toLowerCase();
        const senderEmail = (m.sender?.email || '').toLowerCase();
        const body = (m.message || '').toLowerCase();
        return subject.includes(q) || senderName.includes(q) || senderEmail.includes(q) || body.includes(q);
      });
    }
    // Orden
    if (sortBy === 'unread') {
      list = [...list].sort((a, b) => {
        // No leídos primero, luego por fecha desc
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sortBy === 'remitente') {
      list = [...list].sort((a, b) => {
        const an = `${a.sender?.lastName || ''} ${a.sender?.firstName || ''}`.toLowerCase();
        const bn = `${b.sender?.lastName || ''} ${b.sender?.firstName || ''}`.toLowerCase();
        return an.localeCompare(bn);
      });
    } else {
      // fecha desc por defecto
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setMessages(list);
  }, [inbox, query, sortBy]);

  // Reset a la primera página solo cuando cambia filtro u orden
  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortBy]);

  // Si baja la cantidad de páginas, ajustar currentPage al máximo válido
  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(messages.length / 10));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [messages.length, currentPage]);

  const openDetail = (msg) => {
    // Abrir de inmediato sin overlay; marcar como leído en background con update optimista
    const optimistic = msg.isRead ? msg : { ...msg, isRead: true };
    // actualizar selección y tabla de manera optimista
    setSelected(optimistic);
    setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
    setOpen(true);

    if (!msg.isRead) {
      (async () => {
        try {
          await setMessageRead({ id: msg._id, isRead: true });
          const fresh = await getMe();
          setUserData(fresh);
        } catch (e) {
          // Si falla, solo registramos; no interrumpimos la lectura ni mostramos overlay
          console.error('Error marcando como leído (background):', e);
        }
      })();
    }
  };

  const closeDetail = () => {
    setOpen(false);
    setSelected(null);
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Paginación
  const pageSize = 10;
  const totalItems = messages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageMessages = messages.slice(startIdx, endIdx);

  const allSelected = pageMessages.length > 0 && pageMessages.every((m) => selectedIds.includes(m._id));

  const toggleAll = () => {
    const pageIds = pageMessages.map((m) => m._id);
    setSelectedIds((prev) => {
      const isAllSelected = pageIds.every((id) => prev.includes(id));
      if (isAllSelected) {
        return prev.filter((id) => !pageIds.includes(id));
      }
      const set = new Set(prev);
      pageIds.forEach((id) => set.add(id));
      return Array.from(set);
    });
  };

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-2">
        {!hideCompose && (
          <button className="cursor-pointer inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 sm:order-2" onClick={() => setComposeOpen(true)}>
            <span className="text-lg leading-none">📝</span> <span>Redactar</span>
          </button>
        )}
        <div className="flex items-center gap-2 flex-1 sm:order-1">
          <input
            type="text"
            placeholder="Buscar mensajes..."
            className="border px-3 py-2 rounded flex-1 min-w-0 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="cursor-pointer px-3 py-2 border rounded text-blue-600 hover:bg-blue-50">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Acciones sobre selección */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-blue-900">{selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}</span>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer text-sm"
              onClick={() => setConfirmAction({ open: true, type: 'moveToTrash', ids: selectedIds })}
            >
              🗑️ Eliminar
            </button>
            <button
              className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50 cursor-pointer text-sm"
              onClick={async () => {
                setIsLoading(true); setLoadingLabel('Marcando como leído...');
                try {
                  await bulkSetMessageRead(selectedIds, true);
                  const fresh = await getMe();
                  setUserData(fresh);
                } catch (e) {
                  console.error('Error marcando como leído:', e);
                  setErrorMessage(e?.message || 'Error al marcar mensajes como leídos');
                } finally {
                  setIsLoading(false);
                  setSelectedIds([]);
                }
              }}
            >
              ✓ Marcar leído
            </button>
            <button
              className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50 cursor-pointer text-sm"
              onClick={async () => {
                setIsLoading(true); setLoadingLabel('Marcando como no leído...');
                try {
                  await bulkSetMessageRead(selectedIds, false);
                  const fresh = await getMe();
                  setUserData(fresh);
                } catch (e) {
                  console.error('Error marcando como no leído:', e);
                  setErrorMessage(e?.message || 'Error al marcar mensajes como no leídos');
                } finally {
                  setIsLoading(false);
                  setSelectedIds([]);
                }
              }}
            >
              ✕ Marcar no leído
            </button>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg">No hay mensajes</p>
        </div>
      ) : (
        <>
          {/* Tabla para desktop */}
          <div className="hidden md:block overflow-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input type="checkbox" className="cursor-pointer" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th className="p-3 text-left font-semibold">Remitente</th>
                  <th className="p-3 text-left font-semibold">Asunto</th>
                  <th className="p-3 w-10 text-center" title="Adjuntos">📎</th>
                  <th className="p-3 text-left font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pageMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`border-t cursor-pointer transition-colors hover:bg-gray-50 ${!msg.isRead ? 'bg-blue-50 font-medium' : ''}`}
                    onClick={() => openDetail(msg)}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={selectedIds.includes(msg._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleOne(msg._id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-3">
                      {((msg.sender?.firstName || '') + ' ' + (msg.sender?.lastName || '')).trim() || msg.sender?.email || 'Desconocido'}
                    </td>
                    <td className="p-3">
                      <span className="truncate block max-w-[40ch]" title={msg.subject}>
                        {msg.subject}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {Array.isArray(msg.attachments) && msg.attachments.length > 0 ? (
                        <Paperclip size={16} className="inline text-gray-500" />
                      ) : null}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatDateTime(msg.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards para móvil */}
          <div className="md:hidden space-y-2">
            {pageMessages.map((msg) => (
              <div
                key={msg._id}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  !msg.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                } ${selectedIds.includes(msg._id) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => openDetail(msg)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="cursor-pointer mt-1"
                    checked={selectedIds.includes(msg._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleOne(msg._id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`font-semibold text-sm truncate ${!msg.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                        {((msg.sender?.firstName || '') + ' ' + (msg.sender?.lastName || '')).trim() || msg.sender?.email || 'Desconocido'}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className={`text-sm mb-1 truncate ${!msg.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {msg.subject}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip size={12} />
                          {msg.attachments.length}
                        </span>
                      )}
                      {!msg.isRead && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium">
                          Nuevo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Paginación */}
      {messages.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Mostrando {startIdx + 1}-{Math.min(endIdx, totalItems)} de {totalItems}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              className="px-3 py-1.5 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              ← Anterior
            </button>
            <span className="px-3 text-sm whitespace-nowrap">
              {safePage} / {totalPages}
            </span>
            <button
              className="px-3 py-1.5 border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {open && selected && (
        <ModalWrapper onClose={closeDetail} panelClassName="md:max-w-[720px]">
          <MessageDetail
            message={selected}
            onReply={() => {
              // Preparar datos iniciales para responder
              const subj = selected.subject?.trim()?.toLowerCase()?.startsWith('re:')
                ? selected.subject
                : `Re: ${selected.subject || ''}`;
              const original = `\n\n--- Respuesta ---\nEn respuesta a: ${selected.subject || ''}\nDe: ${selected.sender?.firstName || ''} ${selected.sender?.lastName || ''} <${selected.sender?.email || ''}>\nFecha: ${new Date(selected.createdAt).toLocaleString('es-AR')}\n\n${selected.message || ''}`;
              setReplyInitial({
                // Pass sender email string to be used as initial recipient
                to: selected.sender?.email || '',
                subject: subj,
                body: original,
              });
              setOpen(false);
              // Delay opening compose to ensure the detail modal is fully closed
              setTimeout(() => setComposeOpen(true), 0);
            }}
            onDelete={() => {
              // Reutilizamos el flujo de confirmación existente (mover a papelera)
              setConfirmAction({ open: true, type: 'moveToTrash', ids: [selected._id] });
            }}
            onClose={closeDetail}
          />
        </ModalWrapper>
      )}

      {/* ComposeModal must be available even when hideCompose is true, so replies can open it */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        trainingId={trainingId}
        initialTo={replyInitial?.to}
        initialSubject={replyInitial?.subject}
        initialBody={replyInitial?.body}
        onSend={async (payload) => {
          try {
            await sendMessage({ to: payload.to, subject: payload.subject, body: payload.body, attachments: payload.attachments, trainingId, recipientEmails: payload.recipientEmails, recipientIds: payload.recipientIds });
            // Refresh user data; do not close compose modal here so ComposeModal can display inline success
            setReplyInitial(null);
            setTimeout(() => setSuccessMessage('Mensaje enviado correctamente'), 0);
            // Refrescar datos en segundo plano (no bloquear el modal)
            getMe().then(setUserData).catch((e) => console.error('getMe() fallo tras enviar:', e));
          } catch (e) {
                setErrorMessage(e?.message || 'Error al enviar mensaje');
            console.error('Error al enviar mensaje:', e);
          }
        }}
        onSuccess={() => setSuccessMessage('Mensaje enviado correctamente')}
      />
      {isLoading && <LoadingOverlay label={loadingLabel} />}
      {errorMessage && <ErrorModal mensaje={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && (
        <SucessModal
          titulo={successMessage?.toLowerCase().includes('elimin') ? 'Mensajes eliminados' : 'Mensaje enviado'}
          mensaje={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      <ConfirmActionModal
        open={confirmAction.open}
        title={'Confirmar eliminación'}
        message={'¿Mover los mensajes seleccionados a la papelera?'}
        confirmLabel={'Eliminar'}
        onClose={() => setConfirmAction({ open: false, type: null, ids: [] })}
        onConfirm={async () => {
          const ids = confirmAction.ids || [];
          setConfirmAction({ open: false, type: null, ids: [] });
          if (!ids.length) return;
          // optimistic remove from UI, backend will sync
          setSelectedIds([]);
          setSelected(null);
          setMessages((prev) => prev.filter((m) => !ids.includes(m._id)));
          setIsLoading(true); setLoadingLabel('Eliminando mensajes...');
          try {
            pendingIdsRef.current = ids;
            suppressSyncRef.current = true;
            await bulkMoveToTrash(ids);
            const fresh = await getMe();
            setUserData(fresh);
            setSuccessMessage('Mensajes eliminados correctamente');
          } catch (e) {
            console.error('Error al mover a la papelera', e);
            setErrorMessage(e?.message || 'Error al eliminar');
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
