import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../Context/UserContext";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";

export default function BuzonEliminados() {
  const { userData } = useUser();

  // Mensajes eliminados (carpeta 'trash')
  const trash = useMemo(
    () => (userData?.messages?.items || []).filter((m) => m.folder === "trash"),
    [userData]
  );

  const [messages, setMessages] = useState(trash);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMessages(trash);
  }, [trash]);

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
      <h3 className="text-xl font-semibold">🗑️ Mensajes eliminados</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="overflow-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2">Origen</th>
                <th className="p-2">Asunto</th>
                <th className="p-2">Eliminado</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-2 text-center text-gray-500">Papelera vacía</td>
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
                    <td className="p-2">{msg.sender?.firstName} {msg.sender?.lastName}</td>
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

      <div className="flex gap-4">
        <button className="text-green-600 underline">Restaurar</button>
        <button className="text-red-600 underline">Eliminar definitivamente</button>
      </div>

      {open && selected && (
        <ModalWrapper onClose={closeDetail} panelClassName="md:max-w-[720px]">
          <MessageDetail message={selected} />
        </ModalWrapper>
      )}
    </div>
  );
}
