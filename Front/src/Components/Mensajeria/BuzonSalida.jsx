import { useEffect, useMemo, useState } from "react";
import ModalWrapper from "../Modals/ModalWrapper";
import MessageDetail from "./MessageDetail";
import ComposeModal from "./ComposeModal";
import { sendMessage, getMe } from "../../API/Request";
import { useUser } from "../../context/UserContext";
import { useParams } from "react-router-dom";
import ErrorModal from "../Modals/ErrorModal";
import SucessModal from "../Modals/SucessModal";

export default function BuzonSalida() {
  const { userData, setUserData } = useUser();
  const { idTraining } = useParams();

  // Mensajes en salida (carpeta 'outbox')
  const outbox = useMemo(
    () => (userData?.messages?.items || []).filter((m) => m.folder === "outbox"),
    [userData]
  );

  const [messages, setMessages] = useState(outbox);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
        <button className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded" onClick={() => setComposeOpen(true)}>Redactar</button>
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
          <MessageDetail message={selected} onClose={closeDetail} />
        </div>
      </div>

      {open && selected && (
        <ModalWrapper onClose={closeDetail} panelClassName="md:max-w-[720px]">
          <MessageDetail message={selected} onClose={closeDetail} />
        </ModalWrapper>
      )}

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        trainingId={idTraining}
        onSend={async (payload) => {
          try {
            await sendMessage({ to: payload.to, subject: payload.subject, body: payload.body, attachments: payload.attachments, trainingId: idTraining, recipientEmails: payload.recipientEmails, recipientIds: payload.recipientIds });
            // Parent will refresh data; ComposeModal will display inline success and close itself
            setTimeout(() => setSuccessMessage('Mensaje enviado correctamente'), 0);
            getMe().then(setUserData).catch((e) => console.error('getMe() fallo tras enviar:', e));
          } catch (e) {
            console.error(e);
            setErrorMessage(e?.message || 'Error al enviar mensaje');
          }
        }}
        onSuccess={() => setSuccessMessage('Mensaje enviado correctamente')}
      />
      {errorMessage && <ErrorModal mensaje={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && (
        <SucessModal titulo={'Mensaje enviado'} mensaje={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  );
}
