# 📬 DOCUMENTACIÓN COMPLETA DEL SISTEMA DE MENSAJERÍA

## 🎯 Visión General del Sistema

El sistema de mensajería permite la comunicación interna entre usuarios de la plataforma (estudiantes, capacitadores, directivos y administradores) dentro del contexto de una capacitación específica. Cada mensaje se envía en el contexto de un training particular y se gestiona mediante carpetas (bandeja de entrada, enviados, papelera).

---

## 🗂️ ARQUITECTURA DEL PROYECTO

```
SICaPSI/
├── back/
│   ├── src/
│   │   ├── models/
│   │   │   └── PrivateMessage.js     # Esquema de mensajes privados
│   │   ├── controllers/
│   │   │   └── messageController.js   # Lógica de endpoints
│   │   ├── services/
│   │   │   └── MessageService.js      # Lógica de negocio de mensajes
│   │   ├── formatters/
│   │   │   └── MessageResponseFormatter.js  # Formato de respuesta
│   │   └── routes/
│   │       └── messageRoutes.js       # Rutas de la API
│   └── uploads/                       # Archivos adjuntos
│
└── Front/
    └── src/
        ├── Pages/
        │   └── UserPanel/
        │       └── Student/
        │           └── Mensajeria.jsx  # Página principal de mensajería
        ├── Components/
        │   └── Mensajeria/
        │       ├── BuzonEntrada.jsx    # Bandeja de entrada
        │       ├── BuzonEnviados.jsx   # Mensajes enviados
        │       ├── BuzonEliminados.jsx # Papelera
        │       ├── ComposeModal.jsx    # Modal para redactar mensajes
        │       ├── MessageDetail.jsx   # Vista de detalle del mensaje
        │       └── EmojiPicker.jsx     # Selector de emojis
        └── API/
            └── Request.js              # Funciones de peticiones HTTP
```

---

## 🔧 BACKEND - MODELOS DE DATOS

### 📄 **PrivateMessage.js** (Mensaje Privado)
**Ubicación:** `back/src/models/PrivateMessage.js`

```javascript
{
  sender: ObjectId (ref: User, required) - Usuario remitente
  recipient: ObjectId (ref: User, required) - Usuario destinatario
  trainingId: ObjectId (ref: Training, required) - Capacitación asociada
  subject: String (required, trim) - Asunto del mensaje
  message: String (required) - Cuerpo del mensaje
  
  attachments: [{ - Array de adjuntos
    filename: String - Nombre del archivo en servidor
    originalName: String - Nombre original del archivo
    url: String - URL o path del archivo
    size: Number - Tamaño en bytes
    uploadedAt: Date (default: Date.now) - Fecha de subida
  }]
  
  status: String (enum: ['sent', 'received', 'deleted'], default: 'sent') - Estado del mensaje
  isRead: Boolean (default: false) - Si fue leído
  folder: String (enum: ['inbox', 'sent', 'trash'], default: 'sent') - Carpeta actual
}
```

**Características especiales:**
- **Sistema de dos copias**: Cada envío crea DOS documentos:
  - Una copia para el remitente (folder: 'sent', isRead: true)
  - Una copia para el destinatario (folder: 'inbox', isRead: false)
- Timestamps automáticos (`createdAt`, `updatedAt`)
- Los adjuntos se almacenan en `/uploads/` con nombres únicos

**Índices:**
- `{ sender: 1, folder: 1 }`: Para queries de mensajes del remitente por carpeta
- `{ recipient: 1, folder: 1 }`: Para queries de mensajes del destinatario por carpeta
- `{ trainingId: 1 }`: Para filtrar por capacitación
- `{ createdAt: -1 }`: Para ordenar por fecha descendente

---

## 🛣️ RUTAS Y ENDPOINTS DEL BACKEND

### 🟢 **Messages** (Mensajes)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/api/messages` | Envía un mensaje nuevo | Body: `{ to, subject, body, attachments, recipientId, trainingId }` |
| `PATCH` | `/api/messages/:id/read` | Marca mensaje como leído/no leído | Params: `id`, Body: `{ isRead }` |
| `POST` | `/api/messages/:id/trash` | Mueve mensaje a papelera | Params: `id` |
| `POST` | `/api/messages/:id/restore` | Restaura mensaje desde papelera | Params: `id` |
| `DELETE` | `/api/messages/:id` | Elimina mensaje permanentemente (solo desde papelera) | Params: `id` |
| `POST` | `/api/messages/attachments` | Sube archivos adjuntos | FormData: `files` (hasta 10 archivos) |
| `GET` | `/api/messages/:id/attachments/:index/download` | Descarga un adjunto específico | Params: `id`, `index` |

**Controlador:** `back/src/controllers/messageController.js`  
**Servicio:** `back/src/services/MessageService.js`  
**Rutas:** `back/src/routes/messageRoutes.js`

**Configuración de Multer para adjuntos:**
- Almacenamiento: `/uploads/`
- Naming: `{base}-{timestamp}-{random}{ext}`
- Límite: 10 archivos por request
- Los nombres se sanitizan (solo a-z, 0-9, _, -)

---

### 🟢 **Lógica de Carpetas**

**Sistema de carpetas por usuario:**

1. **inbox (Bandeja de entrada)**: 
   - Mensajes recibidos donde el usuario es el destinatario
   - Solo mensajes con `folder: 'inbox'` y `recipient: userId`

2. **sent (Enviados)**: 
   - Mensajes enviados donde el usuario es el remitente
   - Solo mensajes con `folder: 'sent'` y `sender: userId`

3. **trash (Papelera)**: 
   - Mensajes eliminados (tanto enviados como recibidos)
   - Solo mensajes con `folder: 'trash'` y (`sender: userId` O `recipient: userId`)

**Flujo de carpetas:**
```
ENVÍO:
  Remitente → Crea mensaje con folder: 'sent'
  Destinatario → Crea copia con folder: 'inbox'

ELIMINACIÓN:
  Desde inbox/sent → Cambia folder a 'trash'

RESTAURACIÓN:
  Desde trash → Vuelve a 'inbox' (si eres destinatario) o 'sent' (si eres remitente)

ELIMINACIÓN PERMANENTE:
  Desde trash → Borra el documento de MongoDB
```

---

## 🎨 FRONTEND - ESTRUCTURA DE COMPONENTES

### 📄 **Mensajeria.jsx** (Página Principal)
**Ubicación:** `Front/src/Pages/UserPanel/Student/Mensajeria.jsx`

**Responsabilidades:**
1. **Orquestrar la interfaz** de mensajería
2. **Gestionar pestañas** (Recibidos, Enviados, Papelera)
3. **Mostrar contadores** de mensajes por carpeta
4. **Abrir modal de composición** global

**Estados principales:**
```javascript
const [tab, setTab] = useState("entrada");           // Pestaña activa
const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar móvil
const [composeOpen, setComposeOpen] = useState(false); // Modal de redacción
const [successMessage, setSuccessMessage] = useState(null); // Mensaje de éxito
const [sortBy, setSortBy] = useState('fecha');        // Criterio de orden
```

**Función de conteo:**
```javascript
const counts = useMemo(() => {
  const items = userData?.messages?.items || [];
  const matchTraining = (m) => {
    const t = m?.trainingId;
    const tid = (t && (t._id || t)) || undefined;
    if (!tid) return true; // Legacy sin trainingId
    return tid === idTraining;
  };
  const scoped = items.filter(matchTraining);
  return {
    inbox: scoped.filter((m) => m.folder === "inbox").length,
    sent: scoped.filter((m) => m.folder === "sent").length,
    trash: scoped.filter((m) => m.folder === "trash").length,
  };
}, [userData, idTraining]);
```

**Estructura de la UI:**
```jsx
<div className="mensajeria">
  {/* Header con título y botón "Redactar" */}
  <div className="header">
    <h1>Mensajería</h1>
    <button onClick={() => setComposeOpen(true)}>📝 Redactar</button>
  </div>

  {/* Selector de orden por defecto */}
  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
    <option value="fecha">Fecha</option>
    <option value="unread">No leídos primero</option>
    <option value="remitente">Remitente A-Z</option>
  </select>

  {/* Pestañas */}
  <div className="tabs">
    <button onClick={() => setTab("entrada")}>Recibidos ({counts.inbox})</button>
    <button onClick={() => setTab("enviados")}>Enviados ({counts.sent})</button>
    <button onClick={() => setTab("eliminados")}>Papelera ({counts.trash})</button>
  </div>

  {/* Contenido según pestaña activa */}
  {tab === "entrada" && <BuzonEntrada trainingId={idTraining} sortBy={sortBy} />}
  {tab === "enviados" && <BuzonEnviados trainingId={idTraining} sortBy={sortBy} />}
  {tab === "eliminados" && <BuzonEliminados trainingId={idTraining} sortBy={sortBy} />}

  {/* Modal global de composición */}
  <ComposeModal
    open={composeOpen}
    onClose={() => setComposeOpen(false)}
    trainingId={idTraining}
    onSend={async (payload) => { /* enviar mensaje */ }}
    onSuccess={() => setSuccessMessage('Mensaje enviado correctamente')}
  />
</div>
```

---

### 📄 **BuzonEntrada.jsx** (Bandeja de Entrada)
**Ubicación:** `Front/src/Components/Mensajeria/BuzonEntrada.jsx`

**Props recibidas:**
```javascript
{
  hideCompose: Boolean (default: false) - Ocultar botón "Redactar"
  trainingId: String - ID de la capacitación actual
  sortBy: String (default: 'fecha') - Criterio de orden ('fecha', 'unread', 'remitente')
}
```

**Responsabilidades:**
1. **Listar mensajes recibidos** (folder: 'inbox')
2. **Filtrar por búsqueda** (asunto y remitente)
3. **Ordenar mensajes** según criterio seleccionado
4. **Seleccionar mensajes** con checkboxes
5. **Acciones masivas** (eliminar, marcar como leído/no leído)
6. **Paginación** (10 mensajes por página)
7. **Abrir detalle** de mensaje al hacer click

**Estados principales:**
```javascript
const [messages, setMessages] = useState(inbox);      // Mensajes filtrados/ordenados
const [query, setQuery] = useState("");               // Búsqueda
const [selected, setSelected] = useState(null);       // Mensaje seleccionado para detalle
const [selectedIds, setSelectedIds] = useState([]);   // IDs de mensajes marcados
const [currentPage, setCurrentPage] = useState(1);    // Página actual
const [open, setOpen] = useState(false);              // Modal de detalle abierto
const [composeOpen, setComposeOpen] = useState(false); // Modal de composición
const [replyInitial, setReplyInitial] = useState(null); // Datos iniciales para respuesta
```

**Función de ordenamiento:**
```javascript
useEffect(() => {
  const q = query.trim().toLowerCase();
  let list = inbox;
  
  // Filtro por búsqueda
  if (q) {
    list = inbox.filter((m) => {
      const subject = (m.subject || '').toLowerCase();
      const senderName = `${m.sender?.firstName || ''} ${m.sender?.lastName || ''}`.toLowerCase();
      return subject.includes(q) || senderName.includes(q);
    });
  }
  
  // Orden
  if (sortBy === 'unread') {
    list = [...list].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1; // No leídos primero
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  } else if (sortBy === 'remitente') {
    list = [...list].sort((a, b) => {
      const an = `${a.sender?.lastName || ''} ${a.sender?.firstName || ''}`.toLowerCase();
      const bn = `${b.sender?.lastName || ''} ${b.sender?.firstName || ''}`.toLowerCase();
      return an.localeCompare(bn);
    });
  } else {
    // fecha desc por defecto
    list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  setMessages(list);
}, [inbox, query, sortBy]);
```

**Función de apertura de mensaje:**
```javascript
const openDetail = (msg) => {
  // Update optimista: marcar como leído inmediatamente en la UI
  const optimistic = msg.isRead ? msg : { ...msg, isRead: true };
  setSelected(optimistic);
  setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
  setOpen(true);

  // Marcar como leído en backend (en segundo plano)
  if (!msg.isRead) {
    (async () => {
      try {
        await setMessageRead({ id: msg._id, isRead: true });
        const fresh = await getMe();
        setUserData(fresh);
      } catch (e) {
        console.error('Error marcando como leído:', e);
      }
    })();
  }
};
```

**Acciones masivas:**
```javascript
// Eliminar mensajes seleccionados
const handleBulkDelete = async () => {
  setConfirmAction({ open: true, type: 'moveToTrash', ids: selectedIds });
  // Al confirmar:
  await bulkMoveToTrash(selectedIds);
  const fresh = await getMe();
  setUserData(fresh);
};

// Marcar como leído
const handleBulkMarkRead = async () => {
  await bulkSetMessageRead(selectedIds, true);
  const fresh = await getMe();
  setUserData(fresh);
};

// Marcar como no leído
const handleBulkMarkUnread = async () => {
  await bulkSetMessageRead(selectedIds, false);
  const fresh = await getMe();
  setUserData(fresh);
};
```

**Estructura de la tabla:**
```jsx
<table>
  <thead>
    <tr>
      <th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
      <th>Remitente</th>
      <th>Asunto</th>
      <th>📎</th> {/* Indicador de adjuntos */}
      <th>Fecha</th>
    </tr>
  </thead>
  <tbody>
    {pageMessages.map((msg) => (
      <tr 
        key={msg._id}
        className={!msg.isRead ? 'bg-yellow-100' : ''} 
        onClick={() => openDetail(msg)}
      >
        <td><input type="checkbox" checked={selectedIds.includes(msg._id)} /></td>
        <td>{msg.sender?.firstName} {msg.sender?.lastName}</td>
        <td>{msg.subject}</td>
        <td>{msg.attachments?.length > 0 && <Paperclip />}</td>
        <td>{new Date(msg.createdAt).toLocaleDateString('es-AR')}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Características especiales:**
- **Mensajes no leídos** se resaltan con fondo amarillo
- **Indicador de adjuntos** (📎) si el mensaje tiene archivos
- **Click en fila** abre el detalle del mensaje
- **Update optimista** al marcar como leído (no espera al backend)
- **Sistema de supresión temporal** para evitar parpadeos en la UI durante operaciones

---

### 📄 **BuzonEnviados.jsx** (Mensajes Enviados)
**Ubicación:** `Front/src/Components/Mensajeria/BuzonEnviados.jsx`

**Props recibidas:**
```javascript
{
  hideCompose: Boolean (default: false) - Ocultar botón "Redactar"
  trainingId: String - ID de la capacitación actual
  sortBy: String (default: 'fecha') - Criterio de orden
}
```

**Responsabilidades:**
1. **Listar mensajes enviados** (folder: 'sent')
2. **Ordenar por fecha o destinatario**
3. **Seleccionar mensajes** con checkboxes
4. **Acción masiva de eliminación**
5. **Paginación** (10 mensajes por página)
6. **Abrir detalle** de mensaje

**Diferencias con BuzonEntrada:**
- No tiene búsqueda por texto
- No tiene estado "leído/no leído" (todos los enviados se marcan como leídos)
- Solo tiene una acción masiva: eliminar
- Muestra el destinatario en lugar del remitente

**Estructura de la tabla:**
```jsx
<table>
  <thead>
    <tr>
      <th><input type="checkbox" /></th>
      <th>Destino</th>
      <th>Asunto</th>
      <th>Fecha</th>
    </tr>
  </thead>
  <tbody>
    {pageMessages.map((msg) => (
      <tr key={msg._id} onClick={() => openDetail(msg)}>
        <td><input type="checkbox" /></td>
        <td>{msg.recipient?.firstName} {msg.recipient?.lastName}</td>
        <td>{msg.subject}</td>
        <td>{new Date(msg.createdAt).toLocaleDateString('es-AR')}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### 📄 **BuzonEliminados.jsx** (Papelera)
**Ubicación:** `Front/src/Components/Mensajeria/BuzonEliminados.jsx`

**Props recibidas:**
```javascript
{
  trainingId: String - ID de la capacitación actual
  sortBy: String (default: 'fecha') - Criterio de orden
}
```

**Responsabilidades:**
1. **Listar mensajes eliminados** (folder: 'trash')
2. **Ordenar por fecha o remitente**
3. **Seleccionar mensajes** con checkboxes
4. **Acciones masivas**:
   - Restaurar mensajes
   - Eliminar permanentemente
5. **Paginación** (10 mensajes por página)
6. **Abrir detalle** de mensaje

**Acciones especiales:**
```javascript
// Restaurar mensajes
const handleBulkRestore = async () => {
  await bulkRestoreMessages(selectedIds);
  const fresh = await getMe();
  setUserData(fresh);
  setSuccessMessage('Mensajes restaurados correctamente');
};

// Eliminar permanentemente (no se puede deshacer)
const handleBulkDeletePermanent = async () => {
  setConfirmAction({ 
    open: true, 
    type: 'deletePermanent', 
    ids: selectedIds,
    message: '¿Eliminar permanentemente? Esta acción no se puede deshacer.'
  });
  // Al confirmar:
  await bulkDeleteMessagesPermanent(selectedIds);
  const fresh = await getMe();
  setUserData(fresh);
};
```

**Estructura de la tabla:**
```jsx
<table>
  <thead>
    <tr>
      <th><input type="checkbox" /></th>
      <th>Origen</th>
      <th>Asunto</th>
      <th>Eliminado</th>
    </tr>
  </thead>
  <tbody>
    {pageMessages.map((msg) => (
      <tr key={msg._id} onClick={() => openDetail(msg)}>
        <td><input type="checkbox" /></td>
        <td>{msg.sender?.firstName} {msg.sender?.lastName}</td>
        <td>{msg.subject}</td>
        <td>{new Date(msg.createdAt).toLocaleDateString('es-AR')}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### 📄 **ComposeModal.jsx** (Modal de Redacción)
**Ubicación:** `Front/src/Components/Mensajeria/ComposeModal.jsx`

**Props recibidas:**
```javascript
{
  open: Boolean - Si el modal está abierto
  onClose: Function - Callback para cerrar el modal
  onSend: Function - Callback para enviar el mensaje
  onSuccess: Function - Callback de éxito
  initialTo: String - Destinatario inicial (para respuestas)
  initialSubject: String - Asunto inicial (para respuestas)
  initialBody: String - Cuerpo inicial (para respuestas)
  trainingId: String - ID de la capacitación actual
}
```

**Responsabilidades:**
1. **Permitir redactar mensajes** nuevos o respuestas
2. **Seleccionar destinatarios** múltiples
3. **Buscar usuarios** por email, nombre o rol
4. **Adjuntar archivos** (hasta 10)
5. **Insertar emojis** en el mensaje
6. **Enviar a múltiples destinatarios** en paralelo
7. **Validar campos** antes de enviar

**Estados principales:**
```javascript
const [toInput, setToInput] = useState('');               // Input de destinatarios
const [subject, setSubject] = useState('');               // Asunto
const [body, setBody] = useState('');                     // Cuerpo del mensaje
const [users, setUsers] = useState([]);                   // Lista de usuarios disponibles
const [showUserList, setShowUserList] = useState(false);  // Mostrar overlay de búsqueda
const [selectedRoleFilter, setSelectedRoleFilter] = useState(null); // Filtro de rol
const [recipientQuery, setRecipientQuery] = useState(''); // Búsqueda de destinatarios
const [selectedRecipients, setSelectedRecipients] = useState([]); // Destinatarios seleccionados (chips)
const [attachments, setAttachments] = useState([]);       // Adjuntos
const [isSending, setIsSending] = useState(false);        // Estado de envío
const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Mostrar selector de emojis
```

**Función de envío:**
```javascript
const handleSend = useCallback(async () => {
  // 1. Validar campos
  const typed = (toInput || '').split(',').map(s => s.trim()).filter(Boolean);
  const selected = selectedRecipients.map(r => r.email).filter(Boolean);
  const combined = Array.from(new Set([...typed, ...selected]));
  
  if (!combined.length) {
    setInlineError('Agrega al menos un destinatario');
    return;
  }
  
  // Validación de emails
  const invalid = combined.filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (invalid.length) {
    setInlineError('Algunos destinatarios no son emails válidos: ' + invalid.join(', '));
    return;
  }
  
  if (!subject?.trim()) {
    setInlineError('El asunto es requerido');
    return;
  }
  
  if (!body?.trim()) {
    setInlineError('El mensaje no puede estar vacío');
    return;
  }
  
  // 2. Preparar payload
  const recipientIds = selectedRecipients.map(r => r._id || r.id || r.email);
  const recipientEmails = combined;
  const toString = recipientEmails.join(', ');
  const payload = { 
    to: toString, 
    subject, 
    body, 
    attachments, 
    recipientIds, 
    recipientEmails, 
    trainingId 
  };
  
  // 3. Enviar
  try {
    setIsSending(true);
    await onSend?.(payload);
    setInlineSuccess('Mensaje enviado correctamente');
    setTimeout(() => {
      setInlineSuccess('');
      onClose?.();
    }, 1100);
  } catch (e) {
    setInlineError(e?.message || 'Error al enviar el mensaje');
  } finally {
    setIsSending(false);
  }
}, [toInput, selectedRecipients, subject, body, attachments, trainingId, onSend, onClose]);
```

**Sistema de selección de destinatarios:**
```jsx
{/* Búsqueda de usuarios con overlay */}
<button onClick={() => setShowUserList(v => !v)}>Buscar</button>

{showUserList && (
  <div className="user-list-overlay">
    {/* Filtros de rol */}
    <div className="role-filters">
      <button onClick={() => setSelectedRoleFilter('todos')}>Todos</button>
      <button onClick={() => setSelectedRoleFilter('administrator')}>Administradores</button>
      <button onClick={() => setSelectedRoleFilter('trainer')}>Capacitador</button>
      <button onClick={() => setSelectedRoleFilter('manager')}>Directivo</button>
      <button onClick={() => setSelectedRoleFilter('student')}>Alumno</button>
    </div>
    
    {/* Búsqueda por nombre/email */}
    <input 
      placeholder="Buscar usuario" 
      value={recipientQuery} 
      onChange={(e) => setRecipientQuery(e.target.value)} 
    />
    
    {/* Lista de usuarios */}
    {filteredUsers.map(u => (
      <div key={u._id} onClick={() => toggleRecipient(u)}>
        <div>{u.firstName} {u.lastName}</div>
        <div>{u.email}</div>
        <input type="checkbox" checked={selectedRecipients.includes(u)} />
      </div>
    ))}
  </div>
)}

{/* Chips de destinatarios seleccionados */}
<div className="recipient-chips">
  {selectedRecipients.map(r => (
    <div key={r._id} className="chip">
      <div className="avatar">{(r.firstName || r.email)[0].toUpperCase()}</div>
      <div>{r.firstName} {r.lastName}</div>
      <button onClick={() => removeRecipient(r)}>✕</button>
    </div>
  ))}
</div>
```

**Sistema de adjuntos:**
```javascript
// Subir archivos
const onFilesSelected = async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  try {
    const uploaded = await uploadMessageAttachments(files);
    setAttachments(prev => [...prev, ...uploaded]);
  } catch (err) {
    setInlineError('No se pudieron subir algunos adjuntos.');
  }
};

// Eliminar adjunto
const removeAttachment = (idx) => {
  setAttachments(prev => prev.filter((_, i) => i !== idx));
};
```

**Selector de emojis:**
```jsx
<button onClick={() => setShowEmojiPicker(v => !v)}>
  <Smile size={14} /> Emoji
</button>

{showEmojiPicker && (
  <div className="emoji-picker">
    <EmojiPicker onSelect={(em) => {
      // Insertar emoji en posición del cursor
      const el = bodyRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? start;
      setBody(prev => prev.slice(0, start) + em + prev.slice(end));
      setShowEmojiPicker(false);
    }} />
  </div>
)}
```

**Características especiales:**
- **Auto-resize del textarea** para evitar scrollbars internos
- **Envío con Ctrl+Enter** desde cualquier parte del modal
- **Validación de emails** con regex
- **Cierre automático de overlays** al hacer click fuera
- **Contador de destinatarios** en el footer
- **Mensaje de éxito inline** antes de cerrar el modal
- **Soporte para respuestas** con datos pre-cargados

---

### 📄 **MessageDetail.jsx** (Detalle del Mensaje)
**Ubicación:** `Front/src/Components/Mensajeria/MessageDetail.jsx`

**Props recibidas:**
```javascript
{
  message: Object - Mensaje completo a mostrar
  onReply: Function - Callback para responder
  onDelete: Function - Callback para eliminar
  onClose: Function - Callback para cerrar el modal
}
```

**Responsabilidades:**
1. **Mostrar información completa** del mensaje
2. **Mostrar adjuntos** con enlaces de descarga
3. **Permitir responder** al mensaje
4. **Permitir eliminar** el mensaje
5. **Mostrar avatar** del contraparte

**Estructura:**
```jsx
<div className="message-detail">
  {/* Header con avatar y metadatos */}
  <div className="header">
    <img src={avatarUser?.profileImage} alt={avatarName} />
    <div>
      <div>Fecha: {formatDateTime(message.createdAt)}</div>
      <div>De: {senderName}</div>
      <div>Para: {recipientName}</div>
      <div>Asunto: {message.subject}</div>
    </div>
    <button onClick={onClose}>✕</button>
  </div>

  {/* Cuerpo del mensaje */}
  <div className="content">
    <div className="message-body">{message.message}</div>
    
    {/* Adjuntos */}
    {message.attachments?.length > 0 && (
      <div className="attachments">
        <h4>Adjuntos</h4>
        {message.attachments.map((a, idx) => {
          const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
          const href = `${API_BASE}/messages/${message._id}/attachments/${idx}/download`;
          return (
            <div key={idx}>
              <div>📎</div>
              <a href={href} target="_blank">{a.originalName}</a>
              <a href={href} download>Descargar</a>
            </div>
          );
        })}
      </div>
    )}
  </div>

  {/* Footer con acciones */}
  <div className="footer">
    <button onClick={onDelete}>Eliminar</button>
    <button onClick={onReply}>Responder</button>
  </div>
</div>
```

**Función de respuesta:**
```javascript
const handleReply = () => {
  // Preparar datos para ComposeModal
  const subj = message.subject?.trim()?.toLowerCase()?.startsWith('re:')
    ? message.subject
    : `Re: ${message.subject || ''}`;
    
  const original = `
--- Respuesta ---
En respuesta a: ${message.subject || ''}
De: ${message.sender?.firstName || ''} ${message.sender?.lastName || ''} <${message.sender?.email || ''}>
Fecha: ${new Date(message.createdAt).toLocaleString('es-AR')}

${message.message || ''}`;

  onReply({
    to: message.sender?.email || '',
    subject: subj,
    body: original,
  });
};
```

**Sistema de descarga seguro:**
- Los adjuntos se descargan mediante endpoint autenticado: `/messages/:id/attachments/:index/download`
- El backend verifica que el usuario sea remitente o destinatario del mensaje
- Se previene path traversal sanitizando nombres de archivo
- Se establece header `Content-Disposition: attachment` para forzar descarga

---

### 📄 **EmojiPicker.jsx** (Selector de Emojis)
**Ubicación:** `Front/src/Components/Mensajeria/EmojiPicker.jsx`

**Props recibidas:**
```javascript
{
  onSelect: Function - Callback al seleccionar un emoji
}
```

**Responsabilidades:**
1. **Mostrar paleta de emojis** comunes
2. **Permitir seleccionar** con click
3. **Cerrar automáticamente** después de selección

**Categorías de emojis:**
```javascript
const emojis = [
  // Caras
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  
  // Gestos
  '👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '👐', '🤲',
  
  // Objetos
  '📚', '✏️', '📝', '📖', '📑', '📊', '📈', '📉', '🗂️', '📅',
  
  // Símbolos
  '✅', '❌', '⚠️', '❗', '❓', '💡', '🔔', '⏰', '📌', '🔖'
];
```

---

## 🔄 FLUJO COMPLETO DE MENSAJERÍA

### **1. Envío de Mensaje**

```
Usuario hace click en "Redactar"
  ↓
ComposeModal se abre
  ↓
Usuario selecciona destinatarios (búsqueda con filtros de rol)
  ↓
Usuario escribe asunto y mensaje (con soporte de emojis)
  ↓
Usuario adjunta archivos (opcional)
  ↓
Usuario hace click en "Enviar" o presiona Ctrl+Enter
  ↓
Frontend valida campos (emails, asunto, cuerpo)
  ↓
Frontend llama a sendMessage() con múltiples destinatarios
  ↓
Backend crea DOS documentos por cada destinatario:
  1. Copia para remitente (folder: 'sent', isRead: true)
  2. Copia para destinatario (folder: 'inbox', isRead: false)
  ↓
Frontend refresca datos con getMe()
  ↓
ComposeModal muestra mensaje de éxito inline
  ↓
Modal se cierra automáticamente después de 1.1 segundos
```

---

### **2. Lectura de Mensaje**

```
Usuario ve lista de mensajes en BuzonEntrada
  ↓
Mensajes no leídos se resaltan con fondo amarillo
  ↓
Usuario hace click en un mensaje
  ↓
Frontend hace update optimista (marca como leído en UI inmediatamente)
  ↓
MessageDetail se abre con el contenido del mensaje
  ↓
En segundo plano, frontend llama a setMessageRead()
  ↓
Backend actualiza isRead: true
  ↓
Frontend refresca datos con getMe()
  ↓
UI se mantiene consistente (sin parpadeos)
```

---

### **3. Eliminación de Mensaje**

```
Usuario selecciona uno o más mensajes con checkboxes
  ↓
Usuario hace click en "Eliminar"
  ↓
Frontend muestra modal de confirmación
  ↓
Usuario confirma
  ↓
Frontend hace update optimista (remueve de lista inmediatamente)
  ↓
Frontend llama a bulkMoveToTrash()
  ↓
Backend cambia folder: 'trash' para cada mensaje
  ↓
Frontend refresca datos con getMe()
  ↓
Mensaje ahora aparece en la Papelera
```

---

### **4. Restauración de Mensaje**

```
Usuario va a la pestaña "Papelera"
  ↓
Usuario selecciona mensajes eliminados
  ↓
Usuario hace click en "Restaurar"
  ↓
Frontend muestra modal de confirmación
  ↓
Usuario confirma
  ↓
Frontend llama a bulkRestoreMessages()
  ↓
Backend determina carpeta destino:
  - Si eres destinatario → folder: 'inbox'
  - Si eres remitente → folder: 'sent'
  ↓
Frontend refresca datos con getMe()
  ↓
Mensaje vuelve a su carpeta original
```

---

### **5. Eliminación Permanente**

```
Usuario va a la pestaña "Papelera"
  ↓
Usuario selecciona mensajes
  ↓
Usuario hace click en "Eliminar definitivamente"
  ↓
Frontend muestra modal de confirmación con advertencia
  "Esta acción no se puede deshacer"
  ↓
Usuario confirma
  ↓
Frontend llama a bulkDeleteMessagesPermanent()
  ↓
Backend verifica que folder === 'trash'
  ↓
Backend elimina documento de MongoDB permanentemente
  ↓
Frontend refresca datos con getMe()
  ↓
Mensaje desaparece completamente del sistema
```

---

### **6. Respuesta a Mensaje**

```
Usuario abre detalle de mensaje
  ↓
Usuario hace click en "Responder"
  ↓
Frontend prepara datos iniciales:
  - to: email del remitente original
  - subject: "Re: " + asunto original
  - body: texto citado con metadata del mensaje original
  ↓
ComposeModal se abre con datos pre-cargados
  ↓
Usuario edita y envía (flujo normal de envío)
```

---

## 📊 DIAGRAMA DE SECUENCIA COMPLETO

```
Usuario          Frontend           Backend          MongoDB
  |                 |                  |                |
  |-- Click "Redactar" -------------->|                |
  |<-- ComposeModal abierto -----------|                |
  |                 |                  |                |
  |-- Buscar usuarios --------------->|                |
  |                 |-- GET /users/recipients?trainingId=xxx -->|
  |                 |                  |-- Query users -------->|
  |                 |                  |<-- User list ----------|
  |<-- Lista usuarios ----------------|                |
  |                 |                  |                |
  |-- Selecciona destinatarios ------>|                |
  |-- Escribe asunto y mensaje ------>|                |
  |-- Adjunta archivos -------------->|                |
  |                 |-- POST /messages/attachments ---->|
  |                 |                  |-- Save to /uploads/ -->|
  |                 |                  |<-- URLs --------------|
  |<-- Adjuntos subidos --------------|                |
  |                 |                  |                |
  |-- Click "Enviar" ---------------->|                |
  |                 |-- Validar campos |                |
  |                 |-- POST /messages (x N destinatarios) -->|
  |                 |                  |-- Create 2 docs/destinatario ->|
  |                 |                  |   1. sender copy (sent) ->|
  |                 |                  |   2. recipient copy (inbox) ->|
  |                 |                  |<-- Created docs -------|
  |<-- Mensaje enviado --------------|                |
  |                 |-- GET /users/connect/me -------->|
  |                 |                  |-- Query messages ----->|
  |                 |                  |<-- Messages + metadata |
  |<-- Datos actualizados ------------|                |
  |                 |                  |                |
  |-- Ve BuzonEntrada --------------->|                |
  |<-- Lista mensajes inbox -----------|                |
  |                 |                  |                |
  |-- Click mensaje ----------------->|                |
  |<-- MessageDetail abierto (optimista) -------------|
  |                 |-- PATCH /messages/:id/read ----->|
  |                 |                  |-- Update isRead: true ->|
  |                 |                  |<-- Updated doc -------|
  |                 |-- GET /users/connect/me -------->|
  |                 |                  |<-- Fresh data --------|
  |<-- UI sincronizada ---------------|                |
```

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### **1. Sistema de dos copias por mensaje**
✅ **Implementado:**
- Cada envío crea DOS documentos en MongoDB
- Una copia para el remitente (folder: 'sent', isRead: true)
- Una copia para el destinatario (folder: 'inbox', isRead: false)
- Cada usuario solo ve sus propias copias en sus carpetas

### **2. Carpetas independientes por usuario**
✅ **Implementado:**
- **inbox**: Solo mensajes donde eres destinatario
- **sent**: Solo mensajes donde eres remitente
- **trash**: Mensajes eliminados (tanto enviados como recibidos)

### **3. Ordenamiento flexible**
✅ **Implementado:**
- Por fecha (más recientes primero)
- Por no leídos primero (luego por fecha)
- Por remitente A-Z (orden alfabético)

### **4. Búsqueda de mensajes**
✅ **Implementado:**
- Búsqueda en tiempo real por asunto
- Búsqueda por nombre del remitente
- Solo en bandeja de entrada

### **5. Acciones masivas**
✅ **Implementado:**
- Selección múltiple con checkboxes
- Seleccionar/deseleccionar todos (por página)
- Eliminar mensajes en lote
- Marcar como leído/no leído en lote
- Restaurar mensajes en lote
- Eliminar permanentemente en lote

### **6. Sistema de adjuntos**
✅ **Implementado:**
- Subida de hasta 10 archivos por mensaje
- Almacenamiento en `/uploads/`
- Descarga segura mediante endpoint autenticado
- Validación de permisos (solo remitente o destinatario)
- Prevención de path traversal

### **7. Selección de destinatarios avanzada**
✅ **Implementado:**
- Búsqueda por nombre, apellido o email
- Filtros por rol (Alumno, Capacitador, Directivo, Administrador)
- Chips visuales de destinatarios seleccionados
- Soporte para múltiples destinatarios
- Envío paralelo a todos los destinatarios

### **8. Sistema de respuestas**
✅ **Implementado:**
- Botón "Responder" en detalle del mensaje
- Pre-carga de destinatario, asunto y cuerpo citado
- Formato de citado con metadata del mensaje original
- Prefijo "Re: " en asunto si no existe

### **9. Updates optimistas en UI**
✅ **Implementado:**
- Marcar como leído sin esperar respuesta del backend
- Eliminar de lista inmediatamente al mover a papelera
- Sistema de supresión temporal para evitar parpadeos
- Referencias pendientes para evitar sobreescribir cambios

### **10. Paginación**
✅ **Implementado:**
- 10 mensajes por página
- Navegación anterior/siguiente
- Indicador de página actual y total
- Ajuste automático al cambiar filtros

### **11. Selector de emojis**
✅ **Implementado:**
- Paleta de emojis comunes
- Inserción en posición del cursor
- Cierre automático después de selección
- Categorías: caras, gestos, objetos, símbolos

### **12. Indicadores visuales**
✅ **Implementado:**
- Mensajes no leídos con fondo amarillo
- Icono de paperclip (📎) para mensajes con adjuntos
- Avatar del contraparte en detalle del mensaje
- Badges de estado en header del modal
- Contador de destinatarios seleccionados

### **13. Validaciones exhaustivas**
✅ **Implementado:**
- Validación de formato de email con regex
- Validación de campos requeridos (destinatarios, asunto, cuerpo)
- Mensajes de error inline específicos
- Prevención de envío con campos vacíos
- Validación de permisos en backend

### **14. Modales de confirmación**
✅ **Implementado:**
- Confirmación antes de eliminar mensajes
- Confirmación antes de eliminar permanentemente
- Advertencia específica para acciones irreversibles
- Confirmación antes de restaurar mensajes

### **15. Mensajes de éxito/error**
✅ **Implementado:**
- Mensaje de éxito inline en ComposeModal
- Modal de éxito después de acciones masivas
- Modal de error con mensaje específico
- Cierre automático de mensajes de éxito

---

## ⚠️ CONSIDERACIONES DE SEGURIDAD

### **1. Autenticación en todos los endpoints**
```javascript
// Todos los endpoints requieren authMiddleware
router.post('/', authMiddleware, controller.send);
router.patch('/:id/read', authMiddleware, controller.setRead);
router.post('/:id/trash', authMiddleware, controller.moveToTrash);
// etc.
```

### **2. Validación de permisos**
```javascript
// Solo el destinatario puede marcar como leído
if (msg.recipient?.toString() !== userId.toString()) {
  throw new Error('No autorizado');
}

// Solo remitente o destinatario pueden eliminar
const isOwner = [msg.sender?.toString(), msg.recipient?.toString()]
  .includes(userId.toString());
if (!isOwner) throw new Error('No autorizado');
```

### **3. Prevención de path traversal en adjuntos**
```javascript
// Sanitización de nombres de archivo
const safeName = path.basename(candidate); // elimina ../ y /
const filePath = path.join(uploadsDir, safeName);
```

### **4. Validación de carpeta en eliminación permanente**
```javascript
// Solo se puede eliminar permanentemente desde papelera
if (msg.folder !== 'trash') {
  throw new Error('Solo se pueden eliminar definitivamente los mensajes en papelera');
}
```

### **5. Límites de tasa (rate limiting)**
⚠️ **Pendiente de implementar:**
- Límite de mensajes por minuto/hora
- Límite de adjuntos por día
- Prevención de spam

---

## 🚀 MEJORAS PROPUESTAS

### **MEJORA 1: Sistema de notificaciones en tiempo real**
**Estado actual:** Los mensajes solo se actualizan al recargar con `getMe()`

**Propuesta:**
```javascript
// Implementar WebSocket o Server-Sent Events
const socket = io(API_BASE);

socket.on('new_message', (message) => {
  // Actualizar userData sin necesidad de getMe()
  setUserData(prev => ({
    ...prev,
    messages: {
      ...prev.messages,
      items: [message, ...prev.messages.items]
    }
  }));
  
  // Mostrar notificación push
  showNotification('Nuevo mensaje', {
    body: `${message.sender.firstName}: ${message.subject}`,
    icon: message.sender.profileImage
  });
});

### Nota sobre `getMe()` (por qué mejorarla)

Por defecto en el frontend la sincronización de datos de usuario después de operaciones de mensajería (envío, marcar como leído, mover a papelera, etc.) se hace llamando a la función `getMe()` del archivo `Front/src/API/Request.js`. Actualmente `getMe()` realiza una petición GET a `/users/connect/me` y devuelve el objeto `data` completo del usuario (perfil, trainings, y un subobjeto `messages` con los ítems cargados — por defecto los últimos mensajes del período configurado en backend). Esto funciona pero tiene las siguientes limitaciones:

- Carga completa: `getMe()` recupera todo el perfil del usuario y sus relaciones, lo que puede ser demasiado pesado si se invoca frecuentemente tras cada cambio en mensajería.
- Latencia y sobrecarga: las operaciones de mensajería en lote (bulkMoveToTrash, bulkSetMessageRead, envío a múltiples destinatarios) disparan llamadas repetidas a `getMe()`, lo que aumenta la latencia percibida y la carga en el backend.
- Falta de granularidad: no permite solicitar sólo la parte de mensajes (por carpeta, paginada o con filtros), con lo que el frontend no puede sincronizar incrementalmente.

Por estas razones recomiendo mejorar `getMe()` o complementar su uso con endpoints más específicos:

1. Crear endpoints específicos para mensajería paginada y parcelada (por ejemplo: `GET /api/messages?folder=inbox&page=1&limit=10&trainingId=...`) y usar `getMe()` únicamente para operaciones que realmente requieran todo el perfil.
2. Añadir un endpoint ligero `/users/connect/me/summary` que devuelva un objeto reducido (IDs, contadores por carpeta y un pequeño listado de los N mensajes más recientes) para refrescos rápidos.
3. Implementar invalidación o cache corto en el frontend: cuando se hace una operación local (optimistic update), sincronizar solo la porción afectada en vez de llamar a `getMe()` entero. Ejemplo: tras marcar como leído llamar a `PATCH /messages/:id/read` y después `GET /api/messages/:id` o `GET /api/messages?ids=...` para obtener solo los mensajes modificados.
4. Considerar WebSockets/SSE para recibir `new_message` y otros eventos y así evitar llamadas periódicas a `getMe()`.

### Polling (timer) en `UserContext`

Nota importante: además de las llamadas puntuales a `getMe()` que realizan componentes como los buzones o el modal de redacción, el frontend tiene un polling centralizado que ejecuta `getMe()` periódicamente desde `Front/src/context/UserContext.jsx`. Comportamiento resumido:

- Intervalo: `POLL_INTERVAL = 20000` (20 segundos).
- Llamada inicial: se ejecuta `runOnce()` al montarse para obtener el estado actual.
- Recurrente: se usa `setInterval(runOnce, POLL_INTERVAL)` para llamar a `getMe()` cada 20s.
- Comparación: para reducir re-renderes el código compara las versiones previas y nuevas (`JSON.stringify`) y solo actualiza `userData` si hay diferencias.
- Visibilidad: pausa el polling cuando la pestaña está oculta (`document.hidden`) y lo reanuda cuando vuelve a estar visible.
- Errores: si `getMe()` devuelve un error de autenticación (sesión expirada), el contexto limpia `userData`; otros errores se registran en consola.

Fragmento representativo (extracto del archivo):

```javascript
const POLL_INTERVAL = 20000; // 20 segundos
runOnce();
pollRef.current = setInterval(runOnce, POLL_INTERVAL);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearInterval(pollRef.current);
  else if (!pollRef.current) pollRef.current = setInterval(runOnce, POLL_INTERVAL);
});
```

Por eso verás llamadas repetidas a `getMe()` cada ~20 segundos en la aplicación. Recomendaciones: aumentar el intervalo, usar un endpoint `/users/connect/me/summary` más ligero para polling, o migrar a WebSockets/SSE para eventos en tiempo real.

Estas mejoras reducen latencia, bajan la carga del servidor y hacen la UI más reactiva sin la necesidad de recargar todo el perfil del usuario cada vez.

```

---

### **MEJORA 2: Paginación en backend**
**Estado actual:** Se cargan todos los mensajes (últimos 30 días, máximo 50)

**Propuesta:**
```javascript
// Endpoint con paginación
GET /api/messages?folder=inbox&page=1&limit=10&sortBy=createdAt&order=desc

// Response:
{
  items: [...],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 47,
    hasNext: true,
    hasPrev: false
  }
}
```

---

### **MEJORA 3: Búsqueda avanzada**
**Estado actual:** Solo búsqueda simple por asunto y remitente en frontend

**Propuesta:**
```javascript
// Endpoint de búsqueda
GET /api/messages/search?q=urgent&folder=inbox&dateFrom=2025-01-01&dateTo=2025-12-31&hasAttachments=true

// Búsqueda full-text en MongoDB
PrivateMessageSchema.index({ subject: 'text', message: 'text' });
```

---

### **MEJORA 4: Hilos de conversación**
**Estado actual:** Cada mensaje es independiente

**Propuesta:**
```javascript
// Agregar campo threadId al modelo
{
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageThread' },
  parentMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrivateMessage' }
}

// Agrupar respuestas en hilos conversacionales
const thread = await PrivateMessage.find({ threadId: messageId })
  .sort({ createdAt: 1 });
```

---

### **MEJORA 5: Borrador de mensajes**
**Estado actual:** Los mensajes no se pueden guardar como borrador

**Propuesta:**
```javascript
// Agregar campo draft al modelo
{
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'received', 'deleted'], 
    default: 'draft' 
  }
}

// Guardar borradores automáticamente cada 30 segundos
useEffect(() => {
  if (!subject && !body) return;
  const timer = setTimeout(() => {
    saveDraft({ to, subject, body, attachments });
  }, 30000);
  return () => clearTimeout(timer);
}, [subject, body, to, attachments]);
```

---

### **MEJORA 6: Mensajes grupales**
**Estado actual:** Se envía una copia individual a cada destinatario

**Propuesta:**
```javascript
// Agregar modelo GroupMessage
{
  sender: ObjectId,
  recipients: [ObjectId], // Array de destinatarios
  subject: String,
  message: String,
  isGroup: true,
  readBy: [ObjectId] // Array de usuarios que leyeron
}

// UI mostrando lista de lecturas
<div className="read-by">
  Leído por: {message.readBy.map(u => u.firstName).join(', ')}
</div>
```

---

### **MEJORA 7: Archivos grandes con streaming**
**Estado actual:** Límite de 10MB por archivo (dependiendo de configuración)

**Propuesta:**
```javascript
// Usar multer con streaming para archivos grandes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsDir, 'temp'));
  }
});

// Procesamiento en chunks con progress
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  onFileUpload: (file, uploadedBytes, totalBytes) => {
    const progress = (uploadedBytes / totalBytes) * 100;
    // Enviar progreso al cliente via WebSocket
    socket.emit('upload_progress', { fileId: file.id, progress });
  }
});
```

---

### **MEJORA 8: Vista previa de adjuntos**
**Estado actual:** Solo se muestran enlaces de descarga

**Propuesta:**
```javascript
// Generar thumbnails para imágenes y PDFs
const generateThumbnail = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (['.jpg', '.png', '.gif', '.webp'].includes(ext)) {
    // Usar sharp para generar thumbnail
    await sharp(filePath)
      .resize(200, 200, { fit: 'cover' })
      .toFile(filePath + '.thumb.jpg');
  } else if (ext === '.pdf') {
    // Usar pdf-thumbnail para generar imagen
    await pdfThumbnail(filePath, filePath + '.thumb.jpg');
  }
};

// UI con previsualizaciones
<div className="attachment-preview">
  <img src={attachment.thumbnailUrl} alt={attachment.originalName} />
</div>
```

---

### **MEJORA 9: Filtro de mensajes por capacitación**
**Estado actual:** El filtro por trainingId es básico y se aplica en frontend

**Propuesta:**
```javascript
// Selector de capacitación en UI
<select value={selectedTraining} onChange={(e) => setSelectedTraining(e.target.value)}>
  <option value="all">Todas las capacitaciones</option>
  {userTrainings.map(t => (
    <option key={t._id} value={t._id}>{t.title}</option>
  ))}
</select>

// Backend con índice compuesto
PrivateMessageSchema.index({ recipient: 1, trainingId: 1, folder: 1 });
```

---

### **MEJORA 10: Estadísticas de mensajes**
**Estado actual:** No hay métricas ni estadísticas

**Propuesta:**
```javascript
// Dashboard de mensajería
const stats = await MessageService.getStats(userId);

// Response:
{
  totalSent: 45,
  totalReceived: 89,
  unreadCount: 12,
  avgResponseTime: '2.5 horas',
  topCorrespondents: [
    { user: {...}, messageCount: 15 },
    { user: {...}, messageCount: 12 }
  ],
  messagesByDay: [
    { date: '2025-01-15', count: 5 },
    { date: '2025-01-16', count: 8 }
  ]
}
```

---

## 📝 NOTAS FINALES

### **Convenciones de código**
- Nombres de componentes en PascalCase
- Nombres de funciones en camelCase
- Constantes en UPPER_SNAKE_CASE
- Archivos de componentes con extensión `.jsx`
- Archivos de servicios con extensión `.js`

### **Estructura de commits**
```
feat: Agregar selector de emojis al ComposeModal
fix: Corregir paginación en BuzonEnviados
refactor: Mejorar performance de filtrado de mensajes
docs: Actualizar documentación de API de mensajes
```

### **Testing recomendado**
```javascript
// Unit tests
describe('MessageService', () => {
  it('should create two copies when sending message', async () => {
    const result = await messageService.send({ ... });
    const senderCopy = await PrivateMessage.findOne({ sender: senderId });
    const recipientCopy = await PrivateMessage.findOne({ recipient: recipientId });
    expect(senderCopy.folder).toBe('sent');
    expect(recipientCopy.folder).toBe('inbox');
  });
});

// Integration tests
describe('POST /api/messages', () => {
  it('should send message to multiple recipients', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ to: 'user1@test.com,user2@test.com', subject: 'Test', body: 'Hello' });
    expect(res.status).toBe(201);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
  });
});

// E2E tests
describe('Messaging workflow', () => {
  it('should send, read, and delete message', async () => {
    await page.goto('/mensajeria');
    await page.click('button:has-text("Redactar")');
    await page.fill('input[placeholder*="destinatarios"]', 'test@example.com');
    await page.fill('input[placeholder*="Asunto"]', 'Test Message');
    await page.fill('textarea', 'This is a test');
    await page.click('button:has-text("Enviar")');
    await expect(page.locator('text=Mensaje enviado')).toBeVisible();
  });
});
```

---

## 📚 RECURSOS ADICIONALES

### **Documentación relacionada:**
- [Gestión de Capacitaciones (ABM)](./gestionCapacitaciones(ABM).md)
- [Arquitectura del Sistema](../arquitectura.md)
- [Guía de API](../api/endpoints.md)

### **Dependencias clave:**
- **Backend:**
  - `express`: Framework web
  - `mongoose`: ODM para MongoDB
  - `multer`: Manejo de archivos multipart
  - `jsonwebtoken`: Autenticación JWT

- **Frontend:**
  - `react`: Librería UI
  - `axios`: Cliente HTTP
  - `lucide-react`: Iconos
  - `react-router-dom`: Enrutamiento

---

**Última actualización:** Enero 2025  
**Versión del documento:** 1.0  
**Autor:** Sistema SICaPSI
