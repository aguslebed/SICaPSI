import { useEffect, useMemo, useRef, useState } from 'react';
import ModalWrapper from "../Modals/ModalWrapper";
import { listUsers, uploadMessageAttachments } from "../../API/Request";

export default function ComposeModal({ open, onClose, onSend, initialTo, initialSubject, initialBody, trainingId }) {
  const [to, setTo] = useState(initialTo || "");
  const [subject, setSubject] = useState(initialSubject || "");
  const [body, setBody] = useState(initialBody || "");
  const [showPicker, setShowPicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]); // array of user objects
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const bodyRef = useRef(null);

  // Hooks must be called unconditionally and before any early returns
  useEffect(() => {
    // Cargar usuarios para el selector "Para"
    (async () => {
      try {
        const data = await listUsers(trainingId ? { trainingId } : {});
        // data puede venir con { items } o array directo; normalizamos a array de usuarios
        const list = Array.isArray(data) ? data : (data?.items || []);
        setUsers(list);
      } catch (e) {
        console.log('No se pudieron listar usuarios', e);
      }
    })();
  }, [trainingId]);

  // Al abrir el modal, sincronizamos los valores iniciales (para respuestas/reenvíos)
  useEffect(() => {
    if (open) {
      // Basic fields
      setTo(initialTo || "");
      setSubject(initialSubject || "");
      setBody(initialBody || "");
      setAttachments([]);
      setShowUserList(false);
      setShowPicker(false);
      setRecipientQuery('');
      setSelectedRoleFilter(null);

      // Pre-fill selected recipients from initialTo when available
      // Accepts: string email, array of user objects, or array of emails
      const normalizeRecipients = (input) => {
        if (!input) return [];
        if (typeof input === 'string') {
          // split by comma just in case
          return input.split(',').map(s => s.trim()).filter(Boolean).map(email => ({ email }));
        }
        if (Array.isArray(input)) {
          return input.map(r => (typeof r === 'string' ? { email: r } : r)).filter(Boolean);
        }
        return [];
      };
      const pre = normalizeRecipients(initialTo);
      // If users list is already loaded, try to map emails to full user objects
      const byEmail = (email) => users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
      const resolved = pre.map(r => (r.email ? (byEmail(r.email) || r) : r));
      setSelectedRecipients(resolved);

      // Focus the body textarea on open and place caret at the start
      queueMicrotask?.(() => {
        if (bodyRef.current) {
          bodyRef.current.focus();
          try {
            // Place caret at the start of the text
            bodyRef.current.setSelectionRange(0, 0);
          } catch {}
        }
      });
    }
  }, [open, initialTo, initialSubject, initialBody, users]);

  const filteredUsers = useMemo(() => {
    const q = (recipientQuery || '').toLowerCase();
    let list = users;
    // Apply role filter if selected
    if (selectedRoleFilter) {
      const roleKey = selectedRoleFilter.toLowerCase();
      list = list.filter(u => {
        // Try several possible role fields
        const r = (u.role || u.roles || u.roleName || u.type || u.role_label || '').toString().toLowerCase();
        const display = (`${u.firstName || ''} ${u.lastName || ''} ${u.email || ''}`).toLowerCase();
        return r.includes(roleKey) || display.includes(roleKey);
      });
    }
    if (!q) return list.slice(0, 100);
    return list.filter(u =>
      (u.email?.toLowerCase()?.includes(q)) ||
      (`${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q))
    ).slice(0, 200);
  }, [recipientQuery, users, selectedRoleFilter]);

  if (!open) return null;

  const insertEmoji = (emoji) => {
    setBody(prev => prev + emoji);
    setShowPicker(false);
  };

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const uploaded = await uploadMessageAttachments(files);
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('Error subiendo adjuntos', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
  <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-[90vw] sm:max-w-[500px] md:max-w-[520px] lg:max-w-[560px]">
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold">Redactar mensaje</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">Para</label>
            <div className="flex flex-col gap-2">
              {/* Selected recipients as pills */}
              <div className="flex flex-wrap gap-2">
                {selectedRecipients.map(r => {
                  const key = r._id || r.email || Math.random().toString(36);
                  const labelName = `${r.firstName || ''} ${r.lastName || ''}`.trim();
                  const label = labelName || r.email || 'destinatario';
                  return (
                    <div key={key} className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                      <span>{label}</span>
                      <button type="button" className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setSelectedRecipients(prev => prev.filter(x => (x._id || x.email) !== (r._id || r.email)))}>✕</button>
                    </div>
                  );
                })}
              </div>

              <div className="relative w-full">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Buscar destinatarios por nombre o email"
                    className="flex-1 border rounded px-3 py-2"
                    value={recipientQuery}
                    onFocus={() => setShowUserList(true)}
                    onChange={(e) => setRecipientQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="cursor-pointer px-3 py-2 border rounded bg-gray-50"
                    onClick={() => setShowUserList(v => !v)}
                    title="Seleccionar destinatarios"
                  >
                    PARA
                  </button>
                </div>

                {/* Anchored dropdown panel */}
                {showUserList && (
                  <div className="absolute left-0 right-0 mt-2 z-40 bg-white border rounded shadow-lg max-h-72 overflow-y-auto">
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-gray-600">Acceso rápido:</span>
                        {[
                          { key: 'administrator', label: 'Administradores' },
                          { key: 'trainer', label: 'Capacitador' },
                          { key: 'manager', label: 'Directivo' },
                          { key: 'student', label: 'Alumno' },
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            className={`px-2 py-1 text-sm rounded-full border ${selectedRoleFilter === opt.key ? 'bg-blue-600 text-white' : 'text-blue-600 bg-blue-50'}`}
                            onClick={() => { setSelectedRoleFilter(opt.key); setRecipientQuery(''); }}
                          >
                            {opt.label}
                          </button>
                        ))}
                        <div className="ml-auto flex items-center gap-2">
                          <button type="button" className="px-3 py-1 text-sm bg-white border rounded cursor-pointer" onClick={() => { setShowUserList(false); setSelectedRoleFilter(null); setRecipientQuery(''); }}>Cancelar</button>
                          <button type="button" className="px-3 py-1 text-sm bg-green-50 border rounded cursor-pointer" onClick={() => { setShowUserList(false); }}>Aceptar</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      {filteredUsers.length === 0 ? (
                        <div className="p-3 text-gray-500">Sin resultados</div>
                      ) : (
                        <div className="divide-y">
                          {filteredUsers.map(u => {
                            const id = u._id || u.id || u.email;
                            const checked = selectedRecipients.some(x => (x._id || x.email) === id);
                            return (
                              <div key={id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 min-h-[44px]">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">{(u.firstName || '') + ' ' + (u.lastName || '')}</div>
                                  <div className="text-xs text-gray-500">{u.email}</div>
                                </div>
                                <input type="checkbox" className="cursor-pointer" checked={checked} onChange={() => {
                                  if (checked) setSelectedRecipients(prev => prev.filter(x => (x._id || x.email) !== id));
                                  else setSelectedRecipients(prev => [...prev, u]);
                                }} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">Asunto</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">Mensaje</label>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" className="cursor-pointer px-3 py-1 border rounded" onClick={() => setShowPicker(v => !v)}>
                😊 Emojis
              </button>
              <button type="button" className="cursor-pointer px-3 py-1 border rounded" onClick={() => fileInputRef.current?.click()}>
                📎 Adjuntar
              </button>
              <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />
            </div>
            {showPicker && (
              <div className="mb-2 flex flex-wrap gap-1 p-2 border rounded">
                {['😀','😂','😍','👍','🙏','🎉','🔥','💡','✅','❗'].map(e => (
                  <button key={e} type="button" className="cursor-pointer px-2" onClick={() => insertEmoji(e)}>{e}</button>
                ))}
              </div>
            )}
            <textarea
              rows={6}
              className="w-full border rounded px-3 py-2 text-sm"
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            {attachments.length > 0 && (
              <div className="mt-2 text-sm">
                <div className="font-medium mb-1">Adjuntos:</div>
                <ul className="list-disc list-inside space-y-1">
                  {attachments.map((a, idx) => (
                    <li key={idx} className="break-all">
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{a.originalName || a.filename}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Única barra de acciones (evitamos duplicados) */}
        <div className="sticky bottom-0 bg-white flex justify-between items-center gap-2 pt-2 pb-2 border-t">
          <div className="text-sm text-gray-600">Destinatarios: {selectedRecipients.length}</div>
          <div className="flex justify-end gap-2">
            <button className="text-sm px-3 py-2 rounded border cursor-pointer" onClick={onClose}>Cancelar</button>
            <button className="text-sm px-3 py-2 rounded bg-blue-600 text-white cursor-pointer" onClick={() => {
              // Compose payload: keep backward-compatible `to` string and add recipientIds array
              const recipientIds = selectedRecipients.map(r => r._id || r.id || r.email);
              const recipientEmails = selectedRecipients.map(r => r.email).filter(Boolean);
              const toString = recipientEmails.length ? recipientEmails.join(', ') : to;
              onSend?.({ to: toString, subject, body, attachments, recipientIds, recipientEmails, trainingId });
            }}>Enviar</button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
