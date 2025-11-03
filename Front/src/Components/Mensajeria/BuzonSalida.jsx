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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-xl font-semibold">📤 Bandeja de salida</h3>
        <button 
          className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto" 
          onClick={() => setComposeOpen(true)}
        >
          📝 Redactar
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3">📬</div>
          <p className="text-lg">No hay elementos en salida</p>
        </div>
      ) : (
        <>
          {/* Vista desktop con tabla y preview lateral */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-4">
            <div className="overflow-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-semibold">Destinatario</th>
                    <th className="p-3 text-left font-semibold">Asunto</th>
                    <th className="p-3 text-left font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className={`border-t cursor-pointer hover:bg-gray-50 transition-colors ${
                        selected?._id === msg._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelected(msg)}
                    >
                      <td className="p-3">{msg.recipient?.firstName} {msg.recipient?.lastName}</td>
                      <td className="p-3">
                        <span className="truncate block max-w-[25ch]" title={msg.subject}>{msg.subject}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">⏳ Pendiente</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border rounded-lg overflow-hidden min-h-[400px] bg-gray-50">
              {selected ? (
                <MessageDetail message={selected} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📧</div>
                    <p>Selecciona un mensaje</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vista tablet: solo tabla, modal para detalles */}
          <div className="hidden md:block lg:hidden">
            <div className="overflow-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-semibold">Destinatario</th>
                    <th className="p-3 text-left font-semibold">Asunto</th>
                    <th className="p-3 text-left font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className="border-t cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => openDetail(msg)}
                    >
                      <td className="p-3">{msg.recipient?.firstName} {msg.recipient?.lastName}</td>
                      <td className="p-3">
                        <span className="truncate block max-w-[35ch]" title={msg.subject}>{msg.subject}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">⏳ Pendiente</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista móvil: cards */}
          <div className="md:hidden space-y-2">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                onClick={() => openDetail(msg)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-gray-900 truncate flex-1">
                    {msg.recipient?.firstName} {msg.recipient?.lastName}
                  </span>
                  <span className="text-xs px-2 py-1 bg-yellow-600 text-white rounded-full whitespace-nowrap">⏳ Pendiente</span>
                </div>
                <div className="text-sm text-gray-700 truncate">{msg.subject}</div>
              </div>
            ))}
          </div>
        </>
      )}

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
