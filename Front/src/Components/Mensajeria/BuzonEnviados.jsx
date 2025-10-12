import { useEffect, useMemo, useRef, useState } from "react";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import ComposeModal from "./ComposeModal";
import { sendMessage, getMe, moveMessageToTrash, bulkMoveToTrash } from "../../API/Request";
import { useUser } from "../../context/UserContext";
import LoadingOverlay from "../Shared/LoadingOverlay";
import ErrorModal from "../Modals/ErrorModal";
import SucessModal from "../Modals/SucessModal";
import ConfirmActionModal from "../Modals/ConfirmActionModal";

export default function BuzonEnviados({ hideCompose = false, trainingId, sortBy = 'fecha' }) {
  const { userData, setUserData } = useUser();

  // Mensajes enviados (carpeta 'sent')
  const sent = useMemo(
    () => (userData?.messages?.items || [])
      .filter((m) => m.folder === "sent")
      .filter((m) => { const t = m?.trainingId; const tid = (t && (t._id || t)) || undefined; return !tid || tid === trainingId; }),
    [userData, trainingId]
  );

  const [messages, setMessages] = useState(sent);
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
    if (sortBy === 'remitente') {
      list = [...list].sort((a, b) => {
        const an = `${a.recipient?.lastName || ''} ${a.recipient?.firstName || ''}`.toLowerCase();
        const bn = `${b.recipient?.lastName || ''} ${b.recipient?.firstName || ''}`.toLowerCase();
        return an.localeCompare(bn);
      });
    } else if (sortBy === 'fecha') {
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setMessages(list);
  }, [sent, sortBy]);

  // Reset a la primera página cuando cambia el orden
  useEffect(() => { setCurrentPage(1); }, [sortBy]);

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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">📤 Mensajes enviados</h3>
        {!hideCompose && (
          <button className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded" onClick={() => setComposeOpen(true)}>Redactar</button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <button
            className={`underline ${selectedIds.length ? 'text-red-600 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
            disabled={!selectedIds.length}
            onClick={() => {
                if (!selectedIds.length) return;
                setConfirmAction({ open: true, type: 'moveToTrash', ids: selectedIds });
              }}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 w-10 text-center">
                <input type="checkbox" className="cursor-pointer" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="p-2 text-left">Destino</th>
              <th className="p-2 text-left">Asunto</th>
              <th className="p-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-2 text-center text-gray-500">No hay mensajes enviados</td>
              </tr>
            ) : (
              pageMessages.map((msg) => (
                <tr
                  key={msg._id}
                  className="border-t cursor-pointer transition-colors hover:bg-gray-100 hover:shadow-inner"
                  onClick={() => openDetail(msg)}
                  title="Click para ver"
                >
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={selectedIds.includes(msg._id)}
                      onChange={(e) => { e.stopPropagation(); toggleOne(msg._id); }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="p-2 text-left">{msg.recipient?.firstName} {msg.recipient?.lastName}</td>
                  <td className="p-2 text-left">{msg.subject}</td>
                  <td className="p-2 text-left">{new Date(msg.createdAt).toLocaleDateString('es-AR')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-sm mt-3">
        <div className="text-gray-600 order-2 sm:order-1">
          {totalItems > 0 ? (
            <span>
              Mostrando {startIdx + 1}-{Math.min(endIdx, totalItems)} de {totalItems}
            </span>
          ) : (
            <span>Sin resultados</span>
          )}
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2 self-end sm:self-auto">
          <button
            className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Anterior
          </button>
          <span className="px-2 whitespace-nowrap">Página {safePage} de {totalPages}</span>
          <button
            className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>

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
