import { useMemo, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import BuzonEntrada from "../../../Components/Mensajeria/BuzonEntrada";
import BuzonSalida from "../../../Components/Mensajeria/BuzonSalida";
import BuzonEliminados from "../../../Components/Mensajeria/BuzonEliminados";
import BuzonEnviados from "../../../Components/Mensajeria/BuzonEnviados";
import ComposeModal from "../../../Components/Mensajeria/ComposeModal";
import SucessModal from "../../../Components/Modals/SucessModal";
import { sendMessage, getMe } from "../../../API/Request";
import { useUser } from "../../../context/UserContext";
import { MailPlus } from "lucide-react";
import SideBar from "../../../Components/Student/SideBar";
import StudentFeedbackButton from "./StudentFeedbackButton";

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

export default function Mensajeria() {
  const { idTraining } = useParams();
  const location = useLocation();
  const [tab, setTab] = useState("entrada");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [prefilledRecipient, setPrefilledRecipient] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [sortBy, setSortBy] = useState('fecha');
  const { userData, setUserData } = useUser();

  // Detectar si venimos con un alumno seleccionado desde Students
  useEffect(() => {
    if (location.state?.composeOpen && location.state?.recipientStudent) {
      setPrefilledRecipient(location.state.recipientStudent);
      setComposeOpen(true);
      // Limpiar el state para que no se reabra si el usuario navega
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Realtime ahora está manejado globalmente por UserContext con Socket.IO,
  // por lo que esta pantalla no necesita su propio polling.

  const activeTrainingId = useMemo(() => (idTraining ? String(idTraining) : null), [idTraining]);

  const counts = useMemo(() => {
    const items = userData?.messages?.items || [];
    const scoped = items.filter((m) => {
      if (!activeTrainingId) return true;
      const messageTid = normalizeTrainingId(m?.trainingId);
      return !messageTid || messageTid === activeTrainingId;
    });
    return {
      inbox: scoped.filter((m) => m.folder === "inbox").length,
      sent: scoped.filter((m) => m.folder === "sent").length,
      trash: scoped.filter((m) => m.folder === "trash").length,
    };
  }, [userData, activeTrainingId]);

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* Sidebar (same rendering as other pages) */}
          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mensajería</h1>
                <button
                  className="lg:hidden ml-3 px-3 py-2 text-sm border rounded cursor-pointer"
                  onClick={() => setSidebarOpen(true)}
                  title="Abrir menú"
                >
                  Menú
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 cursor-pointer hover:bg-green-700"
                    onClick={() => setComposeOpen(true)}
                  >
                    <MailPlus size={18} />
                    <span>Redactar</span>
                  </button>
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <span className="font-semibold">Ordenar por defecto:</span>
                    <select
                      className="border rounded px-2 py-1 text-sm cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="fecha">Fecha</option>
                      <option value="unread">No leídos primero</option>
                      <option value="remitente">Remitente A-Z</option>
                    </select>
                  </div>
                </div>
                <div className="sm:hidden flex items-center gap-2 text-sm">
                  <span className="font-semibold">Ordenar:</span>
                  <select
                    className="border rounded px-2 py-1 text-sm cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="fecha">Fecha</option>
                    <option value="unread">No leídos primero</option>
                    <option value="remitente">Remitente A-Z</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-4 py-2 rounded-full text-sm cursor-pointer ${tab === "entrada" ? "bg-gray-200 font-semibold" : "bg-gray-100 hover:bg-gray-200"}`}
                    onClick={() => setTab("entrada")}
                  >
                    Recibidos ({counts.inbox})
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm cursor-pointer ${tab === "enviados" ? "bg-gray-200 font-semibold" : "bg-gray-100 hover:bg-gray-200"}`}
                    onClick={() => setTab("enviados")}
                  >
                    Enviados ({counts.sent})
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm cursor-pointer ${tab === "eliminados" ? "bg-gray-200 font-semibold" : "bg-gray-100 hover:bg-gray-200"}`}
                    onClick={() => setTab("eliminados")}
                  >
                    Papelera ({counts.trash})
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {tab === "entrada" && <BuzonEntrada hideCompose trainingId={activeTrainingId} sortBy={sortBy} />}
                {tab === "enviados" && <BuzonEnviados hideCompose trainingId={activeTrainingId} sortBy={sortBy} />}
                {tab === "eliminados" && <BuzonEliminados trainingId={activeTrainingId} sortBy={sortBy} />}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Sidebar móvil como drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-semibold">Menú</span>
              <button
                className="px-2 py-1 text-sm border rounded cursor-pointer"
                onClick={() => setSidebarOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="p-3">
              <SideBar />
            </div>
          </div>
        </>
      )}

      {/* Compose Modal global */}
      <ComposeModal
        open={composeOpen}
        onClose={() => {
          setComposeOpen(false);
          setPrefilledRecipient(null);
        }}
  trainingId={activeTrainingId}
        prefilledRecipient={prefilledRecipient}
        onSend={async (payload) => {
          try {
            await sendMessage({ to: payload.to, subject: payload.subject, body: payload.body, attachments: payload.attachments, trainingId: idTraining, recipientEmails: payload.recipientEmails, recipientIds: payload.recipientIds });
            const fresh = await getMe();
            setUserData(fresh);
            // Do not close here: ComposeModal shows inline success and will call onClose after a short delay
          } catch (e) {
            console.error('Error al enviar mensaje:', e);
          }
        }}
        onSuccess={() => setSuccessMessage('Mensaje enviado correctamente')}
      />

      {successMessage && (
        <SucessModal titulo={'Mensaje enviado'} mensaje={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
      <StudentFeedbackButton trainingId={idTraining} />
    </>
  );
}
