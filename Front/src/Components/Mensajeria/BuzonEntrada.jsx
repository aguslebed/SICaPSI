import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../Context/UserContext";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import ComposeModal from "./ComposeModal";

export default function BuzonEntrada() {
  const { userData } = useUser();

  // Solo mensajes de entrada (carpeta inbox)
  const inbox = useMemo(() => (userData?.messages?.items || []).filter((m) => m.folder === "inbox"), [userData]);
  const [messages, setMessages] = useState(inbox);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    setMessages(inbox);
  }, [inbox]);

  const openDetail = (msg) => {
    setSelected(msg);
    setOpen(true);
    // Marcar como leído localmente para feedback inmediato
    if (!msg.isRead) {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
    }
  };

  const closeDetail = () => {
    setOpen(false);
    setSelected(null);
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
      <div className="flex justify-between items-center">
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setComposeOpen(true)}>Redactar</button>
        <input
          type="text"
          placeholder="Buscar..."
          className="border px-3 py-2 rounded w-1/3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="overflow-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2">✔</th>
                <th className="p-2">Remitente</th>
                <th className="p-2">Asunto</th>
                <th className="p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-gray-500">No hay mensajes</td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`border-t cursor-pointer hover:bg-gray-50 ${!msg.isRead ? 'bg-yellow-100' : ''}`}
                    onDoubleClick={() => openDetail(msg)}
                    onClick={() => setSelected(msg)}
                    title="Doble click para ver"
                  >
                    <td className="p-2 text-center">{msg.isRead ? '✔' : ''}</td>
                    <td className="p-2">{msg.sender.firstName} {msg.sender.lastName}</td>
                    <td className="p-2">{msg.subject}</td>
                    <td className="p-2">{new Date(msg.createdAt).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border rounded min-h-[300px]">
          <MessageDetail message={selected} />
        </div>
      </div>

      {open && selected && (
        <ModalWrapper onClose={closeDetail} panelClassName="md:max-w-[720px]">
          <MessageDetail message={selected} />
        </ModalWrapper>
      )}

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={(payload) => {
          // Convencional: por ahora solo log, luego se integra con API
          console.log("Enviar mensaje:", payload);
        }}
      />
    </div>
  );
}
