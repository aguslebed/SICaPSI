import { useState } from 'react';
import ModalWrapper from "../Modals/ModalWrapper";

export default function ComposeModal({ open, onClose, onSend, initialTo, initialSubject, initialBody }) {
  const [to, setTo] = useState(initialTo || "");
  const [subject, setSubject] = useState(initialSubject || "");
  const [body, setBody] = useState(initialBody || "");

  if (!open) return null;

  const handleSend = () => {
    // onSend es un callback externo; acá solo devolvemos los datos
    onSend?.({ to, subject, body });
    onClose?.();
  };

  return (
    <ModalWrapper onClose={onClose} panelClassName="md:max-w-[720px]">
      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-semibold">Redactar mensaje</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Para</label>
            <input
              type="email"
              placeholder="correo@destinatario.com"
              className="w-full border rounded px-3 py-2"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Asunto</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Mensaje</label>
            <textarea
              rows={10}
              className="w-full border rounded px-3 py-2"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSend}>Enviar</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
