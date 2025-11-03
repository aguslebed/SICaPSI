import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import { bulkRestoreMessages, bulkDeleteMessagesPermanent, getMe, sendMessage } from "../../API/Request";
import ComposeModal from "./ComposeModal";
import ConfirmActionModal from "../Modals/ConfirmActionModal";
import LoadingOverlay from "../Shared/LoadingOverlay";
import ErrorModal from "../Modals/ErrorModal";
import SucessModal from "../Modals/SucessModal";
import { Search } from "lucide-react";

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

export default function BuzonEliminados({ trainingId, sortBy = 'fecha' }) {
  const { userData, setUserData } = useUser();

  // Mensajes eliminados (carpeta 'trash')
  const normalizedTrainingId = useMemo(() => (trainingId ? String(trainingId) : null), [trainingId]);

  const trash = useMemo(
    () => (userData?.messages?.items || [])
      .filter((m) => m.folder === "trash")
      .filter((m) => {
        if (!normalizedTrainingId) return true;
        const messageTid = normalizeTrainingId(m?.trainingId);
        return !messageTid || messageTid === normalizedTrainingId;
      }),
    [userData, normalizedTrainingId]
  );

  const [messages, setMessages] = useState(trash);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Procesando...');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState({ open: false, type: null, ids: [] });
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyInitial, setReplyInitial] = useState(null);
  const [query, setQuery] = useState('');
  // Paginación
  const pageSize = 10;
  const totalItems = messages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageMessages = messages.slice(startIdx, endIdx);
  const allSelected = pageMessages.length > 0 && pageMessages.every((m) => selectedIds.includes(m._id));
  const pendingIdsRef = useRef([]);
  const suppressSyncRef = useRef(false);

  useEffect(() => {
    if (suppressSyncRef.current) {
      // Mientras alguno de los ids pendientes siga en 'trash' devuelto por backend, no sobreescribimos el estado local
      const stillThere = trash.some((m) => pendingIdsRef.current.includes(m._id));
      if (stillThere) return;
      suppressSyncRef.current = false;
      pendingIdsRef.current = [];
    }
    // Orden por fecha desc o por remitente (origen) si se requiere
    let list = trash;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const senderName = `${m.sender?.firstName || ''} ${m.sender?.lastName || ''}`.toLowerCase();
        const senderEmail = (m.sender?.email || '').toLowerCase();
        const subject = (m.subject || '').toLowerCase();
        const body = (m.message || '').toLowerCase();
        return senderName.includes(q) || senderEmail.includes(q) || subject.includes(q) || body.includes(q);
      });
    }
    if (sortBy === 'remitente') {
      list = [...list].sort((a, b) => {
        const an = `${a.sender?.lastName || ''} ${a.sender?.firstName || ''}`.toLowerCase();
        const bn = `${b.sender?.lastName || ''} ${b.sender?.firstName || ''}`.toLowerCase();
        return an.localeCompare(bn);
      });
    } else if (sortBy === 'unread') {
      // En papelera no se distingue lectura; ordenar por fecha
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setMessages(list);
  }, [trash, sortBy, query]);

  // Reset a la primera página cuando cambia el orden
  useEffect(() => { setCurrentPage(1); }, [sortBy, query]);

  // Clamp current page si cambia el tamaño de la lista
  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(messages.length / 10));
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
  }, [messages.length, currentPage]);

  const openDetail = (msg) => {
    setSelected(msg);
    setOpen(true);
  };

  const closeDetail = () => {
    setOpen(false);
    setSelected(null);
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    const pageIds = pageMessages.map((m) => m._id);
    setSelectedIds((prev) => {
      const isAllSelected = pageIds.every((id) => prev.includes(id));
      if (isAllSelected) return prev.filter((id) => !pageIds.includes(id));
      const set = new Set(prev);
      pageIds.forEach((id) => set.add(id));
      return Array.from(set);
    }); 
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-xl font-semibold">🗑️ Mensajes eliminados</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-yellow-900">{selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}</span>
          <button
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer text-sm"
            onClick={() => setConfirmAction({ open: true, type: 'restore', ids: selectedIds })}
          >
            ↩️ Restaurar
          </button>
          <button
            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer text-sm"
            onClick={() => setConfirmAction({ open: true, type: 'deletePermanent', ids: selectedIds })}
          >
            🗑️ Eliminar definitivamente
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3">🗑️</div>
          <p className="text-lg">Papelera vacía</p>
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="hidden md:block overflow-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input type="checkbox" className="cursor-pointer" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th className="p-3 text-left font-semibold">Remitente</th>
                  <th className="p-3 text-left font-semibold">Asunto</th>
                  <th className="p-3 text-left font-semibold">Eliminado</th>
                </tr>
              </thead>
              <tbody>
                {pageMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    className="border-t cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => openDetail(msg)}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={selectedIds.includes(msg._id)}
                        onChange={(e) => { e.stopPropagation(); toggleOne(msg._id); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-3">{msg.sender?.firstName} {msg.sender?.lastName}</td>
                    <td className="p-3">
                      <span className="truncate block max-w-[40ch]" title={msg.subject}>{msg.subject}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{new Date(msg.createdAt).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards móvil */}
          <div className="md:hidden space-y-2">
            {pageMessages.map((msg) => (
              <div
                key={msg._id}
                className={`border border-red-200 bg-red-50 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedIds.includes(msg._id) ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => openDetail(msg)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="cursor-pointer mt-1"
                    checked={selectedIds.includes(msg._id)}
                    onChange={(e) => { e.stopPropagation(); toggleOne(msg._id); }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {msg.sender?.firstName} {msg.sender?.lastName}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 truncate mb-1">{msg.subject}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded-full">Eliminado</span>
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
            <span className="px-3 text-sm whitespace-nowrap">{safePage} / {totalPages}</span>
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

      {/* Acciones individuales removidas en favor de acciones en lote */}

      {open && selected && (
        <ModalWrapper onClose={closeDetail} panelClassName="md:max-w-[720px]">
          <MessageDetail
            message={selected}
            onReply={() => {
              const subj = selected.subject?.trim()?.toLowerCase()?.startsWith('re:')
                ? selected.subject
                : `Re: ${selected.subject || ''}`;
              const original = `\n\n--- Respuesta ---\nEn respuesta a: ${selected.subject || ''}\nDe: ${selected.sender?.firstName || ''} ${selected.sender?.lastName || ''} <${selected.sender?.email || ''}>\nFecha: ${new Date(selected.createdAt).toLocaleString('es-AR')}\n\n${selected.message || ''}`;
              setReplyInitial({
                to: selected.sender?.email || '',
                subject: subj,
                body: original,
              });
              setOpen(false);
              setTimeout(() => setComposeOpen(true), 0);
            }}
            onDelete={() => setConfirmAction({ open: true, type: 'deletePermanent', ids: [selected._id] })}
          />
        </ModalWrapper>
      )}
      {isLoading && <LoadingOverlay label={loadingLabel} />}
      {errorMessage && <ErrorModal mensaje={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && (
        <SucessModal
          titulo={successMessage?.toLowerCase().includes('restaur') ? 'Mensajes restaurados' : (successMessage?.toLowerCase().includes('permanent') ? 'Eliminación definitiva' : 'Acción exitosa')}
          mensaje={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {/* Always render so reply works */}
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
            // Do not close here. ComposeModal will show inline success and call onClose itself.
            setReplyInitial(null);
            setTimeout(() => setSuccessMessage('Mensaje enviado correctamente'), 0);
            getMe().then(setUserData).catch((e) => console.error('getMe() fallo tras enviar:', e));
          } catch (e) { console.error(e); setErrorMessage(e?.message || 'Error al enviar mensaje'); }
        }}
      />
      <ConfirmActionModal
        open={confirmAction.open}
        title={confirmAction.type === 'restore' ? 'Confirmar restauración' : 'Confirmar eliminación'}
        message={confirmAction.type === 'restore' ? '¿Restaurar los mensajes seleccionados?' : '¿Eliminar permanentemente los mensajes seleccionados? Esta acción no se puede deshacer.'}
        confirmLabel={confirmAction.type === 'restore' ? 'Restaurar' : 'Eliminar definitivamente'}
        onClose={() => setConfirmAction({ open: false, type: null, ids: [] })}
        onConfirm={async () => {
          const ids = confirmAction.ids || [];
          setConfirmAction({ open: false, type: null, ids: [] });
          if (!ids.length) return;
          setIsLoading(true); setLoadingLabel(confirmAction.type === 'restore' ? 'Restaurando mensajes...' : 'Eliminando mensajes...');
          try {
            if (confirmAction.type === 'restore') {
              await bulkRestoreMessages(ids);
              const fresh = await getMe();
              setUserData(fresh);
              setSuccessMessage('Mensajes restaurados correctamente');
            } else {
              await bulkDeleteMessagesPermanent(ids);
              const fresh = await getMe();
              setUserData(fresh);
              setSuccessMessage('Mensajes eliminados permanentemente');
            }
          } catch (e) {
            console.error('Error en acción confirmada:', e);
            setErrorMessage(e?.message || 'Error al ejecutar la acción');
          } finally {
            setIsLoading(false);
          }
        }}
        onSuccess={() => setSuccessMessage('Mensaje enviado correctamente')}
      />
    </div>
  );
}
