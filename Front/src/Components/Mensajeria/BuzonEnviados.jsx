import { useEffect, useMemo, useRef, useState } from "react";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import ComposeModal from "./ComposeModal";
import { sendMessage, getMe, bulkMoveToTrash } from "../../API/Request";
import { useUser } from "../../context/UserContext";
import LoadingOverlay from "../Shared/LoadingOverlay";
import ErrorModal from "../Modals/ErrorModal";
import SucessModal from "../Modals/SucessModal";
import ConfirmActionModal from "../Modals/ConfirmActionModal";
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

export default function BuzonEnviados({ hideCompose = false, trainingId, sortBy = 'fecha' }) {
  const { userData, setUserData } = useUser();

  // Mensajes enviados (carpeta 'sent')
  const normalizedTrainingId = useMemo(() => (trainingId ? String(trainingId) : null), [trainingId]);

  const sent = useMemo(
    () => (userData?.messages?.items || [])
      .filter((m) => m.folder === "sent")
      .filter((m) => {
        if (!normalizedTrainingId) return true;
        const messageTid = normalizeTrainingId(m?.trainingId);
        return !messageTid || messageTid === normalizedTrainingId;
      }),
    [userData, normalizedTrainingId]
  );

  const [messages, setMessages] = useState(sent);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Procesando...');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState({ open: false, type: null, ids: [] });
  // Paginación
  const pageSize = 10;
  const totalItems = messages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageMessages = messages.slice(startIdx, endIdx);

  const allSelected = pageMessages.length > 0 && pageMessages.every((m) => selectedIds.includes(m._id));
  const [open, setOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyInitial, setReplyInitial] = useState(null);
  const pendingIdsRef = useRef([]);
  const suppressSyncRef = useRef(false);

  useEffect(() => {
    if (suppressSyncRef.current) {
      const stillThere = sent.some((m) => pendingIdsRef.current.includes(m._id));
      if (stillThere) return;
      suppressSyncRef.current = false;
      pendingIdsRef.current = [];
    }
    // Orden simple por fecha desc, u opcionalmente por sortBy si llega desde padre
    let list = sent;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const recipientName = `${m.recipient?.firstName || ''} ${m.recipient?.lastName || ''}`.toLowerCase();
        const recipientEmail = (m.recipient?.email || '').toLowerCase();
        const subject = (m.subject || '').toLowerCase();
        const body = (m.message || '').toLowerCase();
        return recipientName.includes(q) || recipientEmail.includes(q) || subject.includes(q) || body.includes(q);
      });
    }
    if (sortBy === 'remitente') {
      list = [...list].sort((a, b) => {
        const an = `${a.recipient?.lastName || ''} ${a.recipient?.firstName || ''}`.toLowerCase();
        const bn = `${b.recipient?.lastName || ''} ${b.recipient?.firstName || ''}`.toLowerCase();
        return an.localeCompare(bn);
      });
    } else if (sortBy === 'unread') {
      // En enviados no existe concepto de leído/no leído; mantener orden cronológico
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'fecha') {
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setMessages(list);
  }, [sent, sortBy, query]);

  // Reset a la primera página cuando cambia el orden
  useEffect(() => { setCurrentPage(1); }, [sortBy, query]);

  // Clamp current page si cambia el tamaño de la lista
  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(messages.length / 10));
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
  }, [messages.length, currentPage]);

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm">
          <span className="font-semibold text-blue-900">{selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}</span>
          <button
            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer text-sm"
            onClick={() => setConfirmAction({ open: true, type: 'moveToTrash', ids: selectedIds })}
          >
            🗑️ Eliminar
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg">No hay mensajes enviados</p>
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
                  <th className="p-3 text-left font-semibold">Destinatario</th>
                  <th className="p-3 text-left font-semibold">Asunto</th>
                  <th className="p-3 text-left font-semibold">Fecha</th>
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
                    <td className="p-3">{msg.recipient?.firstName} {msg.recipient?.lastName}</td>
                    <td className="p-3">
                      <span className="truncate block max-w-[40ch]" title={msg.subject}>{msg.subject}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{formatDateTime(msg.createdAt)}</td>
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
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md bg-white ${
                  selectedIds.includes(msg._id) ? 'ring-2 ring-blue-500' : ''
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
                        {msg.recipient?.firstName} {msg.recipient?.lastName}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 truncate">{msg.subject}</div>
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

      {open && selected && (
        <ModalWrapper onClose={closeDetail} panelClassName="md:max-w-[720px]">
          <MessageDetail
            message={selected}
                onClose={closeDetail}
            onReply={() => {
              const subj = selected.subject?.trim()?.toLowerCase()?.startsWith('re:')
                ? selected.subject
                : `Re: ${selected.subject || ''}`;
              const original = `\n\n--- Respuesta ---\nEn respuesta a: ${selected.subject || ''}\nPara: ${selected.recipient?.firstName || ''} ${selected.recipient?.lastName || ''} <${selected.recipient?.email || ''}>\nFecha: ${new Date(selected.createdAt).toLocaleString('es-AR')}\n\n${selected.message || ''}`;
              setReplyInitial({
                to: selected.recipient?.email || '',
                subject: subj,
                body: original,
              });
              setOpen(false);
              setTimeout(() => setComposeOpen(true), 0);
            }}
            onDelete={() => {
              setConfirmAction({ open: true, type: 'moveToTrash', ids: [selected._id] });
            }}
          />
        </ModalWrapper>
      )}

      {/* Always render so reply works even when hideCompose is true */}
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
            // Refresh data; do not close compose modal here so ComposeModal can display inline success
            setReplyInitial(null);
            setTimeout(() => setSuccessMessage('Mensaje enviado correctamente'), 0);
            getMe().then(setUserData).catch((e) => console.error('getMe() fallo tras enviar:', e));
          } catch (e) {
            console.error(e);
            setErrorMessage(e?.message || 'Error al enviar mensaje');
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
            console.error('Error eliminando mensajes enviados:', e);
            setErrorMessage(e?.message || 'Error al eliminar mensajes');
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
