import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../Context/UserContext";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import ComposeModal from "./ComposeModal";

export default function BuzonSalida() {
  const { userData } = useUser();

  // Mensajes en salida (carpeta 'outbox')
  const outbox = useMemo(
    () => (userData?.messages?.items || []).filter((m) => m.folder === "outbox"),
    [userData]
  );

  const [messages, setMessages] = useState(outbox);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    setMessages(outbox);
  }, [outbox]);

  const openDetail = (msg) => {
    setSelected(msg);
    setOpen(true);
  };

  const closeDetail = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">📤 Bandeja de salida</h3>
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setComposeOpen(true)}>Redactar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="overflow-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2">Destino</th>
                <th className="p-2">Asunto</th>
                <th className="p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-2 text-center text-gray-500">No hay elementos en salida</td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className="border-t cursor-pointer hover:bg-gray-50"
                    onDoubleClick={() => openDetail(msg)}
                    onClick={() => setSelected(msg)}
                    title="Doble click para ver"
                  >
                    <td className="p-2">{msg.recipient?.firstName} {msg.recipient?.lastName}</td>
                    <td className="p-2">{msg.subject}</td>
                    <td className="p-2 text-yellow-600">Pendiente</td>
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
        onSend={(payload) => console.log("Enviar mensaje:", payload)}
      />
    </div>
  );
}
