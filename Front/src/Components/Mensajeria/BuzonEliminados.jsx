import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import { restoreMessage, deleteMessagePermanent, bulkRestoreMessages, bulkDeleteMessagesPermanent, getMe, sendMessage } from "../../API/Request";
import ComposeModal from "./ComposeModal";
import ConfirmActionModal from "../Modals/ConfirmActionModal";
import LoadingOverlay from "../Shared/LoadingOverlay";
import ErrorModal from "../Modals/ErrorModal";
import SucessModal from "../Modals/SucessModal";

export default function BuzonEliminados({ trainingId, sortBy = 'fecha' }) {
  const { userData, setUserData } = useUser();

  // Mensajes eliminados (carpeta 'trash')
  const trash = useMemo(
    () => (userData?.messages?.items || [])
      .filter((m) => m.folder === "trash")
      .filter((m) => { const t = m?.trainingId; const tid = (t && (t._id || t)) || undefined; return !tid || tid === trainingId; }),
    [userData, trainingId]
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
    if (sortBy === 'remitente') {
      list = [...list].sort((a, b) => {
        const an = `${a.sender?.lastName || ''} ${a.sender?.firstName || ''}`.toLowerCase();
        const bn = `${b.sender?.lastName || ''} ${b.sender?.firstName || ''}`.toLowerCase();
        return an.localeCompare(bn);
      });
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setMessages(list);
  }, [trash, sortBy]);

  // Reset a la primera página cuando cambia el orden
  useEffect(() => { setCurrentPage(1); }, [sortBy]);

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
      <h3 className="text-xl font-semibold">🗑️ Mensajes eliminados</h3>

      <div className="text-sm text-gray-700 flex items-center flex-wrap gap-2">
        <button
          className={`underline ${selectedIds.length ? 'text-green-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
          disabled={!selectedIds.length}
          onClick={() => {
            if (!selectedIds.length) return;
            // Ask for confirmation before restoring
            setConfirmAction({ open: true, type: 'restore', ids: selectedIds });
          }}
        >
          Restaurar
        </button>
        <span className="text-gray-400">|</span>
        <button
          className={`underline ${selectedIds.length ? 'text-red-600 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
          disabled={!selectedIds.length}
          onClick={() => {
            if (!selectedIds.length) return;
            setConfirmAction({ open: true, type: 'deletePermanent', ids: selectedIds });
          }}
        >
          Eliminar definitivamente
        </button>
      </div>

      <div className="overflow-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 w-10 text-center">
                  <input type="checkbox" className="cursor-pointer" checked={allSelected} onChange={toggleAll} />
                </th>
                <th className="p-2 text-left">Origen</th>
                <th className="p-2 text-left">Asunto</th>
                <th className="p-2 text-left">Eliminado</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-gray-500">Papelera vacía</td>
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
                    <td className="p-2 text-left">{msg.sender?.firstName} {msg.sender?.lastName}</td>
                    <td className="p-2 text-left">{msg.subject}</td>
                    <td className="p-2 text-left">{new Date(msg.createdAt).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between gap-3 text-sm mt-3">
        <div className="text-gray-600">
          {totalItems > 0 ? (
            <span>
              Mostrando {startIdx + 1}-{Math.min(endIdx, totalItems)} de {totalItems}
            </span>
          ) : (
            <span>Sin resultados</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Anterior
          </button>
          <span className="px-2">Página {safePage} de {totalPages}</span>
          <button
            className="px-3 py-1 border rounded cursor-pointer disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>

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
