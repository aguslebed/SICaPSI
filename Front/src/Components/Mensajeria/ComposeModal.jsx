import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import ModalWrapper from "../Modals/ModalWrapper";
import { listUsers, uploadMessageAttachments } from "../../API/Request";
import { X, Paperclip, Send, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { useUser } from '../../context/UserContext';

const ROLE_KEY_TO_VALUE = {
  administrator: 'administrador',
  trainer: 'capacitador',
  manager: 'directivo',
  student: 'alumno'
};

const ROLE_FILTER_OPTIONS = [
  { key: 'todos', label: 'Todos' },
  { key: 'administrator', label: 'Administradores' },
  { key: 'trainer', label: 'Capacitador' },
  { key: 'manager', label: 'Directivo' },
  { key: 'student', label: 'Alumno' },
];

export default function ComposeModal({ open, onClose, onSend, onSuccess, initialTo, initialSubject, initialBody, trainingId, prefilledRecipient }) {
  const { userData } = useUser();
  const senderRole = userData?.user?.role;
  const senderRoleLower = (senderRole || '').toLowerCase();
  const allowedRoles = useMemo(() => {
    if (senderRoleLower === 'alumno') {
      return new Set(['alumno', 'capacitador']);
    }
    if (senderRoleLower === 'capacitador') {
      return new Set(['alumno']);
    }
    return null;
  }, [senderRoleLower]);
  const roleFilterOptions = useMemo(() => {
    return ROLE_FILTER_OPTIONS.filter(opt => {
      if (opt.key === 'todos') return true;
      if (!allowedRoles) return true;
      const mapped = ROLE_KEY_TO_VALUE[opt.key];
      return mapped ? allowedRoles.has(mapped) : false;
    });
  }, [allowedRoles]);
  const [toInput, setToInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(null);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [inlineSuccess, setInlineSuccess] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const bodyRef = useRef(null);
  const emojiRef = useRef(null);
  const userListRef = useRef(null);

  useEffect(() => {
    if (!allowedRoles) return;
    if (selectedRoleFilter && selectedRoleFilter !== 'todos') {
      const mapped = ROLE_KEY_TO_VALUE[selectedRoleFilter] || selectedRoleFilter.toLowerCase();
      if (!allowedRoles.has(mapped)) {
        setSelectedRoleFilter(null);
      }
    }
  }, [allowedRoles, selectedRoleFilter]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listUsers(trainingId ? { trainingId } : {});
        const list = Array.isArray(data) ? data : (data?.items || []);
        setUsers(list);
      } catch (e) {
        console.warn('No se pudieron listar usuarios', e);
      }
    })();
  }, [trainingId]);

  useEffect(() => {
    if (!open) return;
    setToInput('');
    setSubject(initialSubject || '');
    setBody(initialBody || '');
    setAttachments([]);
    setRecipientQuery('');
    setShowUserList(false);
    setInlineError('');

    const normalizeRecipients = (input) => {
      if (!input) return [];
      if (typeof input === 'string') return input.split(',').map(s => s.trim()).filter(Boolean).map(email => ({ email }));
      if (Array.isArray(input)) return input.map(r => (typeof r === 'string' ? { email: r } : r)).filter(Boolean);
      return [];
    };
    
    // Si hay prefilledRecipient (alumno seleccionado), usarlo
    let recipientsToSet = [];
    if (prefilledRecipient) {
      recipientsToSet = [prefilledRecipient];
      setToInput(prefilledRecipient.email || '');
    } else {
      const pre = normalizeRecipients(initialTo);
      const byEmail = (email) => users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
      recipientsToSet = pre.map(r => (r.email ? (byEmail(r.email) || r) : r));
    }
    
    setSelectedRecipients(recipientsToSet);

    queueMicrotask?.(() => bodyRef.current?.focus());
  }, [open, initialTo, initialSubject, initialBody, users, prefilledRecipient]);

  // Auto-resize textarea to avoid inner scrollbars
  const autoResizeBody = () => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 800) + 'px';
  };
  useEffect(() => { autoResizeBody(); }, [body]);

  const filteredUsers = useMemo(() => {
    const q = (recipientQuery || '').toLowerCase();
    const resolveRole = (user) => (user.role || user.roles || user.roleName || user.type || user.role_label || '').toString().toLowerCase();
    let list = users;
    if (allowedRoles) {
      list = list.filter(u => allowedRoles.has(resolveRole(u)));
    }
    if (selectedRoleFilter && selectedRoleFilter !== 'todos') {
      const mapped = ROLE_KEY_TO_VALUE[selectedRoleFilter] || selectedRoleFilter.toLowerCase();
      list = list.filter(u => resolveRole(u) === mapped);
    }
    if (!q) return list.slice(0, 100);
    return list.filter(u => {
      return (u.email || '').toLowerCase().includes(q) || (`${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q));
    }).slice(0, 200);
  }, [recipientQuery, users, selectedRoleFilter, allowedRoles]);

  const handleSend = useCallback(async () => {
    setInlineError('');
    setInlineSuccess('');
    // Gather recipient emails from typed input and chips
    const typed = (toInput || '').split(',').map(s => s.trim()).filter(Boolean);
    const selected = selectedRecipients.map(r => r.email).filter(Boolean);
    const combined = Array.from(new Set([...typed, ...selected]));
    if (!combined.length) {
      setInlineError('Agrega al menos un destinatario');
      return;
    }
    // basic email validation
    const invalid = combined.filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (invalid.length) {
      setInlineError('Algunos destinatarios no son emails válidos: ' + invalid.join(', '));
      return;
    }
    if (!subject || !subject.trim()) {
      setInlineError('El asunto es requerido');
      return;
    }
    // Body must not be empty
    if (!body || !body.trim()) {
      setInlineError('El mensaje no puede estar vacío');
      return;
    }

    const recipientIds = selectedRecipients.map(r => r._id || r.id || r.email);
    const recipientEmails = combined;
    const toString = recipientEmails.join(', ');
    const payload = { to: toString, subject, body, attachments, recipientIds, recipientEmails, trainingId };
    try {
      setIsSending(true);
      await onSend?.(payload);
      setInlineSuccess('Mensaje enviado correctamente');
      try { onSuccess?.(payload); } catch (err) { /* ignore */ }
      setTimeout(() => {
        setInlineSuccess('');
        onClose?.();
      }, 1100);
    } catch (e) {
      console.error('Error enviando mensaje', e);
      setInlineError(e?.message || 'Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  }, [toInput, selectedRecipients, subject, body, attachments, trainingId, onSend, onSuccess, onClose]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSend]);

  // Close emoji popover when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const onDown = (ev) => {
      const node = emojiRef.current;
      if (!node) return;
      if (!node.contains(ev.target)) setShowEmojiPicker(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [showEmojiPicker]);

  // Close user list overlay when clicking outside
  useEffect(() => {
    if (!showUserList) return;
    const onDown = (ev) => {
      const node = userListRef.current;
      if (!node) return;
      if (!node.contains(ev.target)) setShowUserList(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('touchstart', onDown);
    return () => { window.removeEventListener('mousedown', onDown); window.removeEventListener('touchstart', onDown); };
  }, [showUserList]);

  if (!open) return null;

  // Recipient addition is now handled only via the Buscar overlay. Manual "Agregar" by typing was removed.

  const normalizeEmail = (e) => (e || '').toString().trim();
  const addEmailToString = (current, email) => {
    if (!email) return current || '';
    const parts = (current || '').split(',').map(s => s.trim()).filter(Boolean);
    const lower = email.toLowerCase();
    if (parts.map(p => p.toLowerCase()).includes(lower)) return current;
    return parts.length ? parts.concat(email).join(', ') : email;
  };
  const removeEmailFromString = (current, email) => {
    if (!current) return '';
    const parts = (current || '').split(',').map(s => s.trim()).filter(Boolean);
    const lower = (email || '').toLowerCase();
    const filtered = parts.filter(p => p.toLowerCase() !== lower);
    return filtered.join(', ');
  };

  const toggleRecipient = (u) => {
    const id = u._id || u.id || u.email;
    setSelectedRecipients(prev => {
      const exists = prev.some(r => (r._id || r.id || r.email) === id);
      if (exists) {
        // remove
        setToInput(curr => removeEmailFromString(curr, u.email));
        return prev.filter(r => (r._id || r.id || r.email) !== id);
      } else {
        // add
        setToInput(curr => addEmailToString(curr, u.email));
        return [...prev, u];
      }
    });
  };

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Validar tamaños antes de subir
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const oversized = files.filter(f => f.size > maxSize);
    if (oversized.length > 0) {
      const names = oversized.map(f => f.name).join(', ');
      const sizeMB = (oversized[0].size / (1024 * 1024)).toFixed(2);
      setInlineError(`❌ Archivo${oversized.length > 1 ? 's' : ''} demasiado grande${oversized.length > 1 ? 's' : ''}: ${names}. Tamaño máximo permitido: 10 MB por archivo.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    // Validar tipos de archivo
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip', 'application/x-zip-compressed'
    ];
    const invalidFiles = files.filter(f => !allowedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      const names = invalidFiles.map(f => `${f.name} (${f.type || 'desconocido'})`).join(', ');
      setInlineError(`Tipos de archivo no permitidos: ${names}. Solo se aceptan imágenes, PDF, documentos de Office y archivos ZIP.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    try {
      const uploaded = await uploadMessageAttachments(files);
      setAttachments(prev => [...prev, ...uploaded]);
    } catch (err) {
      console.error('Error subiendo adjuntos', err);
      const errorMsg = err?.message || 'No se pudieron subir algunos adjuntos.';
      setInlineError(errorMsg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  return (
    <ModalWrapper onClose={onClose} showCloseButton={false} panelClassName="max-w-[92vw] sm:max-w-[720px]">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col max-h-[85vh]">
  <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-[#007BFF] to-[#0056D6] text-white">
          <div className="flex items-center gap-3">
            <div className="text-xl font-semibold">Redactar mensaje</div>
            <div className="text-sm opacity-80">Enviar comunicación interna</div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Cerrar" onClick={onClose} className="cursor-pointer p-2 rounded hover:bg-white/10">
              <X size={18} />
            </button>
          </div>
        </div>

  <style>{`.compose-scroll::-webkit-scrollbar{width:10px}.compose-scroll::-webkit-scrollbar-track{background:#f3f4f6;border-radius:9999px}.compose-scroll::-webkit-scrollbar-thumb{background:#007BFF;border-radius:9999px}.compose-scroll::-webkit-scrollbar-thumb:hover{background:#0056D6}.compose-scroll{scrollbar-width:thin;scrollbar-color:#007BFF #f3f4f6;}`}</style>
        <div className="p-5 flex-1 overflow-y-auto pr-3 sm:pr-4 compose-scroll">
          <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Para</label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Agregar destinatarios (separar por comas o buscar)"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); /* Enter does nothing - use Buscar */ } }}
                />
                <button type="button" onClick={() => setShowUserList(v => !v)} className="px-3 py-2 bg-blue-50 text-blue-600 border rounded cursor-pointer" title="Seleccionar usuarios">Buscar</button>
              </div>

              {showUserList && (
                <div ref={userListRef} className="absolute left-0 top-full mt-2 z-50 w-[min(680px,calc(100%-1rem))] border rounded shadow-lg bg-white max-h-72 overflow-auto cursor-default">
                  <div className="p-3 border-b bg-gray-50">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-gray-700 font-medium">Grupos:</span>
                      {roleFilterOptions.map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          className={`px-2 py-1 text-sm rounded-full border ${selectedRoleFilter === opt.key ? 'bg-blue-600 text-white' : 'text-blue-600 bg-blue-50'} cursor-pointer`}
                          onClick={() => { setSelectedRoleFilter(prev => prev === opt.key ? null : opt.key); setRecipientQuery(''); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                      <div className="ml-auto flex items-center gap-2">
                        <input className="flex-1 border rounded px-2 py-1" placeholder="Buscar usuario" value={recipientQuery} onChange={(e) => setRecipientQuery(e.target.value)} />
                        <button className="cursor-pointer px-3 py-1 text-sm border rounded bg-blue-600 text-white" onClick={() => setShowUserList(false)}>Cerrar</button>
                      </div>
                    </div>
                  </div>
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-gray-500">Sin resultados</div>
                  ) : (
                    <div className="divide-y">
                      {filteredUsers.map(u => {
                        const id = u._id || u.id || u.email;
                        const checked = selectedRecipients.some(x => (x._id || x.email) === id);
                        return (
                          <div key={id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => toggleRecipient(u)}>
                            <div>
                              <div className="font-medium">{(u.firstName || '') + ' ' + (u.lastName || '')}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                            <div>
                              <input type="checkbox" checked={checked} onChange={(e) => { e.stopPropagation(); toggleRecipient(u); }} onClick={(e) => e.stopPropagation()} className="cursor-pointer" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedRecipients.map((r, i) => (
                <div key={(r._id || r.email || i)} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm cursor-pointer">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">{((r.firstName || r.email || '')[0] || '').toUpperCase()}</div>
                  <div className="truncate max-w-[18ch]">{(r.firstName || '') + ' ' + (r.lastName || '') || r.email}</div>
                  <button onClick={() => { const id = (r._id || r.email); setSelectedRecipients(prev => prev.filter(x => (x._id || x.email) !== id)); }} className="text-gray-500 hover:text-gray-700 px-1 cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Asunto</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Asunto" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mensaje</label>
            <div className="flex items-center gap-2 mb-2 relative">
              {/* Adjuntar */}
              <button type="button" className="px-3 py-1 border rounded text-sm flex items-center gap-2 bg-blue-50 text-blue-600 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Paperclip size={14} /> Adjuntar
              </button>
              <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />

              {/* Emoji picker toggle */}
              <button
                type="button"
                className="px-3 py-1 border rounded text-sm flex items-center gap-2 bg-blue-50 text-blue-600 cursor-pointer"
                onClick={() => setShowEmojiPicker(v => !v)}
                title="Insertar emoji"
              >
                <Smile size={14} /> Emoji
              </button>

                  {showEmojiPicker && (
                    <div ref={emojiRef} className="absolute left-0 top-full mt-2 z-50 bg-white border rounded shadow p-2 max-w-[min(90vw,420px)] max-h-60 overflow-auto">
                  <EmojiPicker onSelect={(em) => {
                    // insert emoji at caret position in textarea
                    const el = bodyRef.current;
                    if (!el) {
                      setBody(prev => prev + em);
                    } else {
                      const start = el.selectionStart ?? el.value.length;
                      const end = el.selectionEnd ?? start;
                      setBody(prev => prev.slice(0, start) + em + prev.slice(end));
                      // restore caret after next render
                      queueMicrotask(() => {
                        try { el.selectionStart = el.selectionEnd = start + em.length; el.focus(); } catch (err) { /* ignore */ }
                      });
                    }
                    setShowEmojiPicker(false);
                  }} />
                </div>
              )}
            </div>
            <textarea
              ref={bodyRef}
              rows={8}
              value={body}
              onChange={(e) => { setBody(e.target.value); queueMicrotask?.(autoResizeBody); }}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none overflow-hidden min-h-40"
              placeholder="Escribe tu mensaje aquí... (Ctrl+Enter para enviar)"
            />
            {attachments.length > 0 && (
              <div className="mt-3 border rounded p-2 bg-gray-50">
                <div className="font-medium text-sm mb-2">Adjuntos</div>
                <ul className="space-y-2">
                  {attachments.map((a, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Paperclip size={16} />
                        <div className="text-sm break-all">{a.originalName || a.filename}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeAttachment(idx)} className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {inlineError && <div className="text-sm text-red-600">{inlineError}</div>}
        </div>
        </div>

  <div className="flex items-center justify-between gap-3 px-5 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-100">Destinatarios: {(toInput ? toInput.split(',').map(s=>s.trim()).filter(Boolean).length : 0) + selectedRecipients.length}</div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-2 rounded border bg-white text-blue-600 font-medium ${isSending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              onClick={onClose}
              disabled={isSending}
            >
              Cancelar
            </button>
            <button
              className={`px-4 py-2 rounded flex items-center gap-2 text-white ${isSending ? 'bg-blue-400 cursor-not-allowed opacity-80' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
              onClick={handleSend}
              disabled={isSending}
            >
              <Send size={16} />
              <span>{isSending ? 'Enviando...' : 'Enviar'}</span>
            </button>
          </div>
        </div>

        {inlineSuccess && (
          <div className="px-5 py-3 bg-green-50 border-t text-sm text-green-700">{inlineSuccess}</div>
        )}
      </div>
    </ModalWrapper>
  );
}
