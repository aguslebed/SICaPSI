# 📚 DOCUMENTACIÓN COMPLETA DEL SISTEMA DE CAPACITACIONES

## 🎯 Visión General del Flujo

Este sistema permite crear capacitaciones educativas con múltiples niveles, cada uno con bibliografía, clases magistrales y exámenes interactivos. El flujo va desde la creación inicial hasta la gestión completa de contenidos.

---

## 🗂️ ARQUITECTURA DEL PROYECTO

```
SICaPSI/
├── back/
│   ├── src/
│   │   ├── models/           # Esquemas de MongoDB
│   │   ├── controllers/      # Lógica de endpoints
│   │   ├── services/         # Lógica de negocio
│   │   ├── validators/       # Validaciones de datos
│   │   └── routes/           # Definición de rutas API
│   └── uploads/              # Archivos subidos (imágenes, videos, PDFs)
│
└── Front/
    └── src/
        ├── Pages/
        │   └── AdminPanel/
        │       └── GestionCapacitacion.jsx    # Página principal
        └── Components/
            └── Modals/
                └── CreateTrainingModal/       # Sistema de creación
```

---

## 🔧 BACKEND - MODELOS DE DATOS

### 📄 **Training.js** (Capacitación)
**Ubicación:** `back/src/models/Training.js`

```javascript
{
  title: String (max 500, required) - Título principal
  subtitle: String (max 750, required) - Subtítulo descriptivo
  description: String (max 5000, required) - Descripción detallada
  image: String (default: '__PENDING_UPLOAD__') - URL o ruta de imagen de portada
  isActive: Boolean (default: false) - Estado de habilitación (controlado por Directivo)
  pendingApproval: Boolean (default: false) - Indica si está pendiente de aprobación
  rejectedBy: ObjectId (ref: User, default: null) - ID del Directivo que rechazó
  rejectionReason: String (max 1000, default: '') - Motivo del rechazo
  createdBy: ObjectId (ref: User, required) - Administrador creador
  levels: [ObjectId] (ref: Level) - IDs de niveles asociados
  totalLevels: Number (default: 0) - Contador de niveles
  
  // Sistema de reportes por nivel
  report: [{
    level: Number - Número del nivel
    score: Number - Puntaje obtenido
    errorsCount: Number - Cantidad de errores
    videoUrl: String - Video de la escena final
    description: String - Descripción del resultado
  }],
  
  progressPercentage: Number (default: 0) - % de avance
  startDate: Date (default: null) - Fecha de inicio
  endDate: Date (default: null) - Fecha de finalización
  assignedTeacher: String (default: '') - ID del profesor asignado
}
```

**Características especiales:**
- El campo `image` usa `'__PENDING_UPLOAD__'` como valor por defecto para permitir guardar capacitaciones sin imagen inicialmente
- El campo `isActive` por defecto es `false` y solo puede ser modificado por usuarios con rol Directivo
- El campo `pendingApproval` indica si la capacitación ha sido enviada a aprobar y está esperando revisión
- Los campos `rejectedBy` y `rejectionReason` se utilizan cuando un Directivo rechaza una capacitación
- Timestamps automáticos (`createdAt`, `updatedAt`)

**Estados del ciclo de vida:**
- **Borrador**: `isActive: false`, `pendingApproval: false`, `rejectedBy: null` - En creación
- **Pendiente**: `isActive: false`, `pendingApproval: true`, `rejectedBy: null` - Esperando aprobación
- **Activa**: `isActive: true`, `pendingApproval: false`, `rejectedBy: null` - Aprobada y en curso
- **Rechazada**: `isActive: false`, `pendingApproval: false`, `rejectedBy: {ID}` - Rechazada por Directivo
- **Finalizada**: `isActive: false`, `pendingApproval: false`, `rejectedBy: null`, `endDate` vencida - Terminó por scheduler

**Índices:**
- `createdBy`: Para filtrar por administrador
- `isActive`: Para queries de capacitaciones activas
- `title`: Índice único para evitar capacitaciones con nombres duplicados

---

### 📄 **Level.js** (Nivel)
**Ubicación:** `back/src/models/Level.js`

```javascript
{
  trainingId: ObjectId (ref: Training, required) - Capacitación padre
  levelNumber: Number (min: 1, required) - Número secuencial del nivel
  title: String (max 500, default: '') - Título del nivel
  description: String (max 5000, default: '') - Descripción del nivel
  
  // Bibliografía (recursos adicionales)
  bibliography: [{
    title: String (max 500) - Título del recurso
    description: String (max 2500) - Descripción del recurso
    url: String - Enlace o ruta del archivo
    createdAt: Date (default: now)
  }],
  
  // Clase magistral (video educativo)
  training: {
    title: String (max 500, default: '') - Título de la clase
    description: String (max 5000, default: '') - Descripción del contenido
    url: String (default: '') - URL del video
    duration: Number (default: 0) - Duración en minutos
    createdAt: Date (default: now)
  },
  
  // Examen interactivo
  test: {
    title: String (max 500, default: '') - Título del examen
    description: String (max 5000, default: '') - Descripción del examen
    imageUrl: String (default: '') - Imagen de portada del examen
    isActive: Boolean (default: true) - Estado del examen
    createdAt: Date (default: now),
    
    // Escenas del examen (grafo de decisiones)
    scenes: [{
      idScene: Number (required) - ID único de la escena
      videoUrl: String (required) - Video de la escena
      description: String (max 2500, required) - Descripción de la situación
      lastOne: Boolean (default: false) - Marca escena final
      bonus: Number (default: 0) - Puntos extra
      
      // Opciones de navegación
      options: [{
        description: String (max 500, required) - Texto de la opción
        points: Number (required) - Puntos asignados
        next: Number (nullable, default: null) - ID de la próxima escena
      }]
    }]
  }
}
```

**Características especiales:**
- Campos opcionales con valores por defecto para permitir guardado en modo borrador
- Timestamps automáticos (`createdAt`, `updatedAt`)
- Las escenas forman un grafo de navegación interactivo

**Índices únicos:**
- `{ trainingId, levelNumber }`: Un training no puede tener niveles duplicados
- `{ trainingId, title }`: Un training no puede tener títulos de nivel repetidos (sparse: true)
- `isActive`: Para queries de niveles activos

---

### 📄 **User.js** (Usuario)
**Ubicación:** `back/src/models/User.js`

```javascript
{
  email: String (unique) - Correo electrónico
  password: String (hashed) - Contraseña encriptada
  firstName: String - Nombre
  lastName: String - Apellido
  role: String (enum: ['Administrador', 'Capacitador', 'Directivo', 'Alumno']) - Rol
  
  // Capacitaciones asignadas (para profesores y alumnos)
  assignedTraining: [ObjectId] (ref: Training) - IDs de capacitaciones
  
  status: String (enum: ['available', 'disabled', 'pendiente']) - Estado de la cuenta
}
```

---

## ⏰ SCHEDULER AUTOMÁTICO - trainingScheduler.js

**Ubicación:** `back/src/utils/trainingScheduler.js`

**Propósito:**
Mantener el estado de las capacitaciones coherente respecto a sus fechas de vigencia. **IMPORTANTE:** El scheduler NO auto-habilita capacitaciones, solo las deshabilita cuando vencen.

**Comportamiento:**
- Se ejecuta automáticamente al iniciar la aplicación
- Luego se programa para ejecutarse diariamente a medianoche (00:00)
- Solo consulta capacitaciones con `isActive: true` y `endDate` definido
- Si la fecha actual es mayor a `endDate`, deshabilita la capacitación:
  - Establece `isActive: false`
  - Establece `pendingApproval: false`
  - Estado resultante: **Finalizada**

**Funciones exportadas:**
```javascript
// Actualiza capacitaciones activas que hayan vencido
export async function updateTrainingsActiveStatus()
// Retorna: { success: boolean, updated: number }

// Inicia el scheduler con ejecución inmediata y programación diaria
export function startTrainingScheduler()
```

**Lógica de deshabilitación:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const trainings = await Training.find({ 
  endDate: { $ne: null }, 
  isActive: true 
});

for (const training of trainings) {
  const endDate = new Date(training.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  if (endDate < today) {
    training.isActive = false;
    training.pendingApproval = false; // Marca como finalizada
    await training.save();
  }
}
```

**Notas de implementación:**
- No usa `console.log` para evitar ruido en producción (solo `console.error` para errores)
- La habilitación de capacitaciones es responsabilidad exclusiva de usuarios con rol Directivo
- El scheduler solo realiza operaciones de deshabilitación automática

---

## 🛣️ RUTAS Y ENDPOINTS DEL BACKEND

### 🟢 **Trainings** (Capacitaciones)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/api/training/createTraining` | Crea una nueva capacitación | Body: `{ title, subtitle, description, image, isActive, createdBy, startDate, endDate }` |
| `GET` | `/api/training/getAllTrainings` | Obtiene todas las capacitaciones | - |
| `GET` | `/api/training/getAllActiveTrainings` | Obtiene capacitaciones activas | - |
| `GET` | `/api/training/:id` | Obtiene una capacitación por ID | Params: `id` |
| `PATCH` | `/api/training/:id` | Actualiza una capacitación | Params: `id`, Body: campos a actualizar |
| `DELETE` | `/api/training/:id` | Elimina una capacitación y su carpeta de archivos | Params: `id` |
| `POST` | `/api/training/upload-image` | Sube imagen a carpeta temporal | FormData: `image` |
| `POST` | `/api/training/upload-file` | Sube archivo multimedia a carpeta temporal | FormData: `file` |
| `DELETE` | `/api/training/delete-file` | Elimina un archivo del servidor | Body: `{ filePath }` |
| `POST` | `/api/training/replace-file` | Reemplaza archivo existente con uno nuevo | FormData: `file`, Body: `{ trainingId, oldFilePath }` |
| `POST` | `/api/training/move-temp-files` | Mueve archivos de carpeta temporal a definitiva | Body: `{ trainingId, tempFiles: [array de rutas] }` |

**Controlador:** `back/src/controllers/trainingController.js`  
**Servicio:** `back/src/services/TrainingService.js`  
**Validador:** `back/src/validators/trainingValidator.js`

**Configuración de Multer:**
- Límites: 100MB para archivos, 25MB para campos de texto (HTML con formato)
- Almacenamiento: `/uploads/temp/` para archivos nuevos, `/uploads/trainings/{trainingId}/` para archivos permanentes
- Tipos de archivo permitidos: videos (mp4, avi, mov, mkv, webm, etc.), documentos (pdf, doc, docx, etc.), imágenes (jpg, png, gif, svg, webp, etc.), audio, comprimidos y otros

---

### 🟢 **Levels** (Niveles)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/api/level/addLevelsToTraining` | Agrega niveles a una capacitación | Body: `{ trainingId, levels: [array de niveles] }` |
| `POST` | `/api/level/getAlllevelsInTraining` | Obtiene todos los niveles de una capacitación | Body: `{ trainingId }` |
| `PUT` | `/api/level/updateLevelsInTraining` | Actualiza niveles de una capacitación | Body: `{ trainingId, levels: [array de niveles] }` |

**Controlador:** `back/src/controllers/levelController.js`  
**Servicio:** `back/src/services/levelServices.js`

**Nota:** El endpoint `getAlllevelsInTraining` usa POST porque espera `trainingId` en el body

---

### 🟢 **Enrollments** (Inscripciones)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/api/enrollments/enrollStudent` | Inscribe estudiantes a una capacitación | Body: `{ userIds: [array de IDs], trainingId }` |
| `POST` | `/api/enrollments/unenrollStudent` | Desinscribe estudiantes de una capacitación | Body: `{ userIds: [array de IDs], trainingId }` |
| `POST` | `/api/enrollments/enrollTrainer` | Asigna un profesor a una capacitación | Body: `{ userIds: [array con 1 ID], trainingId }` |
| `GET` | `/api/enrollments/getUsersNotEnrolledInTraining` | Obtiene usuarios no inscritos | Query: `?trainingId=xxx` |
| `GET` | `/api/enrollments/getUsersEnrolledInTraining` | Obtiene usuarios inscritos | Query: `?trainingId=xxx` |
| `GET` | `/api/enrollments/getTrainenrsNotEnrolledInTraining` | Obtiene profesores no asignados | Query: `?trainingId=xxx` |

**Controlador:** `back/src/controllers/enrollmentController.js`  
**Servicio:** `back/src/services/EnrollmentService.js`

---

### 🟢 **Users** (Usuarios)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/api/users` | Obtiene todos los usuarios | Query: `?role=Alumno` o `?role=Capacitador` |
| `GET` | `/api/users/:id` | Obtiene un usuario por ID | Params: `id` |

**Controlador:** `back/src/controllers/userController.js`  
**Servicio:** `back/src/services/UserService.js`

---

## 🎨 FRONTEND - ESTRUCTURA DE COMPONENTES

### 📄 **GestionCapacitacion.jsx** (Página Principal)
**Ubicación:** `Front/src/Pages/AdminPanel/GestionCapacitacion.jsx`

**Responsabilidades:**
1. **Listar todas las capacitaciones** desde `/api/trainings/getAllTrainings`
2. **Filtrar capacitaciones** por nivel, estado, búsqueda
3. **Abrir modal** para crear/editar capacitaciones
4. **Eliminar capacitaciones** con confirmación

**Estados principales:**
```javascript
const [trainings, setTrainings] = useState([]);          // Lista de capacitaciones
const [loading, setLoading] = useState(false);           // Estado de carga
const [openCreateTraining, setOpenCreateTraining] = useState(false); // Modal abierto/cerrado
const [editingTraining, setEditingTraining] = useState(null);        // Training en edición
const [deleteConfirmData, setDeleteConfirmData] = useState(null);    // Modal de confirmación
```

**Funciones clave:**
```javascript
// Refresca la lista de capacitaciones
const refreshTrainings = async () => {
  const response = await Request.get('/api/trainings/getAllTrainings');
  setTrainings(response.data);
};

// Crea una nueva capacitación
const handleCreateTraining = async (trainingData, levels, additionalData) => {
  // 1. Crear el Training
  const trainingResponse = await Request.post('/api/trainings/createTraining', trainingData);
  const trainingId = trainingResponse.data._id;
  
  // 2. Agregar niveles
  if (levels.length > 0) {
    await Request.post('/api/levels/addLevelsToTraining', { trainingId, levels });
  }
  
  // 3. Inscribir estudiantes
  if (additionalData.selectedStudents?.length > 0) {
    await Request.post('/api/enrollments/enrollStudent', {
      userIds: additionalData.selectedStudents,
      trainingId
    });
  }
  
  // 4. Asignar profesor
  if (additionalData.assignedTeacher) {
    await Request.post('/api/enrollments/enrollTrainer', {
      userIds: [additionalData.assignedTeacher],
      trainingId
    });
  }
  
  refreshTrainings();
};

// Abre el modal de edición
const handleEditTraining = async (trainingId) => {
  const response = await Request.get(`/api/trainings/${trainingId}`);
  setEditingTraining(response.data);
  setOpenCreateTraining(true);
};

// Elimina una capacitación
const confirmDeleteTraining = async () => {
  await Request.delete(`/api/trainings/${deleteConfirmData.id}`);
  refreshTrainings();
};
```

**Flujo de creación:**
```
Usuario hace click en "Nueva Capacitación"
  ↓
Se abre CreateTrainingModal con editingTraining = null
  ↓
Usuario llena formularios
  ↓
Usuario hace click en "Guardar Capacitación"
  ↓
handleCreateTraining() ejecuta 4 pasos:
  1. POST /api/trainings/createTraining
  2. POST /api/levels/addLevelsToTraining
  3. POST /api/enrollments/enrollStudent
  4. POST /api/enrollments/enrollTrainer
  ↓
refreshTrainings() actualiza la lista
  ↓
Modal se cierra
```

---

### 📄 **CreateTrainingModal.jsx** (Modal Principal)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal.jsx`

**Responsabilidades:**
1. **Gestionar el estado completo** de una capacitación en creación/edición
2. **Renderizar diferentes secciones** (Presentación, Niveles, Inscripción, Asignación)
3. **Validar datos** antes de guardar
4. **Subir archivos** al servidor

**Estados principales:**
```javascript
// Datos de Training
const [title, setTitle] = useState('');
const [subtitle, setSubtitle] = useState('');
const [description, setDescription] = useState('');
const [image, setImage] = useState('');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [isActive, setIsActive] = useState(false);

// Datos de niveles
const [levels, setLevels] = useState([{
  levelNumber: 1,
  title: '',
  description: '',
  bibliography: [],
  training: { title: '', description: '', url: '', duration: 0 },
  test: { title: '', description: '', imageUrl: '', scenes: [] }
}]);
const [selectedLevel, setSelectedLevel] = useState(0);

// Datos de inscripción
const [students, setStudents] = useState([]);
const [selectedStudents, setSelectedStudents] = useState([]);
const [teachers, setTeachers] = useState([]);
const [assignedTeacher, setAssignedTeacher] = useState('');

// Control de UI
const [activeSection, setActiveSection] = useState('training'); // 'training', 'levels', 'enroll', 'assign'
const [expandedSubsection, setExpandedSubsection] = useState(null);
const [selectedScene, setSelectedScene] = useState(null);
const [selectedOption, setSelectedOption] = useState(null);

// Archivos pendientes
const [pendingImageFile, setPendingImageFile] = useState(null);
const [pendingLevelFiles, setPendingLevelFiles] = useState({});
const [uploadingFiles, setUploadingFiles] = useState({});
```

**Estructura del modal:**
```jsx
<div className="modal">
  {/* Sidebar de navegación */}
  <div className="sidebar">
    <button onClick={() => setActiveSection('training')}>Capacitación</button>
    <button onClick={() => setActiveSection('levels')}>Niveles</button>
    <button onClick={() => setActiveSection('enroll')}>Inscripción</button>
    <button onClick={() => setActiveSection('assign')}>Asignar Profesor</button>
  </div>
  
  {/* Área de edición */}
  <div className="editor">
    {activeSection === 'training' && (
      <PresentationForm 
        title={title}
        setTitle={setTitle}
        {...otherProps}
      />
    )}
    
    {activeSection === 'levels' && (
      <LevelsEditor
        levels={levels}
        selectedLevel={selectedLevel}
        {...otherProps}
      />
    )}
    
    {activeSection === 'enroll' && (
      <EnrollStudents
        students={students}
        selectedStudents={selectedStudents}
        {...otherProps}
      />
    )}
    
    {activeSection === 'assign' && (
      <AssignTeacher
        teachers={teachers}
        assignedTeacher={assignedTeacher}
        {...otherProps}
      />
    )}
  </div>
  
  {/* Vista previa en tiempo real */}
  <div className="preview">
    <TrainingPreview
      activeSection={activeSection}
      title={title}
      subtitle={subtitle}
      levels={levels}
      {...otherProps}
    />
  </div>
  
  {/* Botones de acción */}
  <div className="actions">
    <button onClick={handleCancel}>Cancelar</button>
    <button 
      onClick={handleSendForApproval}
      disabled={pendingApproval}
      className={pendingApproval ? 'disabled' : ''}
    >
      Enviar a aprobar
    </button>
    <button onClick={handleSave}>
      {isEditing ? 'Actualizar' : 'Guardar'} Capacitación
    </button>
  </div>
</div>
```

**Función para enviar a aprobar:**
```javascript
const handleSendForApproval = () => {
  // Validar antes de enviar a aprobar
  const validation = validateTrainingForApproval();

  if (!validation.isValid) {
    // Mostrar modal de errores
    setErrorMessages(validation.errors);
    setErrorModalTitle('No se puede enviar a aprobar');
    setErrorModalMessageText('Complete los siguientes requisitos antes de enviar a aprobar:');
    setShowErrorModal(true);
    return false;
  }
  
  // Si la validación pasa, marcar como pendiente de aprobación
  setPendingApproval(true);
  return true;
};
```

**Función de guardado:**
```javascript
const handleSave = async () => {
  // 1. Validar campos obligatorios
  const errors = validateTrainingForApproval();
  if (errors.length > 0) {
    setErrorMessages(errors);
    setShowErrorModal(true);
    return;
  }
  
  // 2. Subir imagen pendiente
  let finalImagePath = image;
  if (pendingImageFile) {
    const formData = new FormData();
    formData.append('file', pendingImageFile);
    formData.append('type', 'image');
    const response = await Request.post('/api/trainings/upload-image', formData);
    finalImagePath = response.data.filePath;
  }
  
  // 3. Subir archivos de niveles
  const processedLevels = await Promise.all(
    levels.map(async (level, index) => {
      // Subir video de training
      if (pendingLevelFiles[`training-${index}`]) {
        const formData = new FormData();
        formData.append('file', pendingLevelFiles[`training-${index}`]);
        const response = await Request.post('/api/trainings/upload-file', formData);
        level.training.url = response.data.filePath;
      }
      
      // Subir imagen del test
      if (pendingLevelFiles[`test-${index}`]) {
        const formData = new FormData();
        formData.append('file', pendingLevelFiles[`test-${index}`]);
        const response = await Request.post('/api/trainings/upload-file', formData);
        level.test.imageUrl = response.data.filePath;
      }
      
      // Subir videos de escenas
      // ... similar para cada escena
      
      return level;
    })
  );
  
  // 4. Preparar datos finales
  const trainingData = {
    title: sanitizeRichTextValue(title),
    subtitle: sanitizeRichTextValue(subtitle),
    description: sanitizeRichTextValue(description),
    image: finalImagePath,
    startDate,
    endDate,
    isActive,
    createdBy: user._id
  };
  
  // 5. Llamar a la función del padre
  await onSave(trainingData, processedLevels, {
    selectedStudents,
    assignedTeacher
  });
  
  // 6. Cerrar modal
  onClose();
};
```

---

### 📄 **PresentationForm.jsx** (Formulario de Presentación)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/PresentationForm.jsx`

**Responsabilidades:**
1. **Capturar datos básicos** de la capacitación
2. **Permitir subir imagen** de portada
3. **Configurar fechas** de inicio y fin
4. **Habilitar/deshabilitar** la capacitación

**Campos del formulario:**
- **Título**: Editor de texto rico con máximo 100 caracteres
- **Subtítulo**: Editor de texto rico con máximo 150 caracteres
- **Descripción**: Editor de texto rico con máximo 1000 caracteres
- **Imagen**: Input de URL o selector de archivo local (max 5MB, formatos: JPG, PNG, GIF, WebP)
- **Fechas**: Inputs de tipo date para inicio y fin

**Validaciones:**
- Contador de caracteres en tiempo real para todos los campos de texto
- Validación de tamaño de archivo (5MB máximo)
- Vista previa de imagen usando FileReader
- Los archivos se mantienen en estado pendiente hasta guardar

**Nota:** El campo `isActive` (habilitación) ya no es visible en este formulario. La capacitación se envía a aprobar mediante el botón "Enviar a aprobar" en el footer del modal, y solo un Directivo puede habilitarla posteriormente.

---

### 📄 **LevelsEditor.jsx** (Editor de Niveles)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/LevelsEditor.jsx`

**Responsabilidades:**
1. **Listar todos los niveles** creados
2. **Permitir agregar/eliminar** niveles
3. **Expandir subsecciones** (Bibliografía, Clase, Examen)
4. **Delegar edición** a componentes especializados

**Estructura:**
```jsx
<div className="levels-editor">
  {/* Lista de niveles */}
  <div className="levels-list">
    {levels.map((level, index) => (
      <div key={index} className={selectedLevel === index ? 'active' : ''}>
        <h3 onClick={() => setSelectedLevel(index)}>
          Nivel {level.levelNumber}: {level.title}
        </h3>
        
        {selectedLevel === index && (
          <div className="subsections">
            {/* Subsección de bibliografía */}
            <button onClick={() => setExpandedSubsection('bibliografia')}>
              Bibliografía
            </button>
            {expandedSubsection === 'bibliografia' && (
              <LevelBibliography
                bibliography={level.bibliography}
                levelIndex={index}
                updateLevelField={updateLevelField}
              />
            )}
            
            {/* Subsección de clase magistral */}
            <button onClick={() => setExpandedSubsection('training')}>
              Clase Magistral
            </button>
            {expandedSubsection === 'training' && (
              <LevelTraining
                level={level}
                levelIndex={index}
                updateLevelField={updateLevelField}
              />
            )}
            
            {/* Subsección de examen */}
            <button onClick={() => setExpandedSubsection('test')}>
              Examen
            </button>
            {expandedSubsection === 'test' && (
              <LevelTestEditor
                level={level}
                levelIndex={index}
                selectedScene={selectedScene}
                setSelectedScene={setSelectedScene}
                updateLevelField={updateLevelField}
              />
            )}
          </div>
        )}
      </div>
    ))}
  </div>
  
  {/* Botones de acción */}
  <button onClick={addLevel}>+ Agregar Nivel</button>
  <button onClick={() => removeLevel(selectedLevel)}>- Eliminar Nivel</button>
</div>
```

**Función para actualizar campos:**
```javascript
const updateLevelField = (levelIndex, fieldPath, value) => {
  setLevels(prevLevels => {
    const newLevels = [...prevLevels];
    
    // Usar lodash set para paths anidados
    // Ejemplo: 'training.title', 'test.scenes[0].videoUrl'
    _.set(newLevels[levelIndex], fieldPath, value);
    
    return newLevels;
  });
};
```

---

### 📄 **LevelBibliography.jsx** (Editor de Bibliografía)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/LevelBibliography.jsx`

**Props recibidas:**
```javascript
{
  bibliography: Array - Array de recursos bibliográficos del nivel
  levelIndex: Number - Índice del nivel actual
  updateLevelField: Function - Función para actualizar campos del nivel
  uploadingFiles: Object - Estado de archivos en proceso de subida
  handleFileUpload: Function - Función para manejar subida de archivos
  handleFileDelete: Function - Función para eliminar archivos
  showWarningModal: Function - Función para mostrar modal de advertencia
  onTempDataChange: Function - Callback para notificar cambios temporales al preview
}
```

**Responsabilidades:**
1. **Listar recursos bibliográficos** del nivel
2. **Agregar/editar/eliminar** recursos
3. **Subir archivos PDF/enlaces** externos
4. **Notificar cambios temporales** al preview para visualización en tiempo real

**Estados locales:**
```javascript
const [tempBibTitle, setTempBibTitle] = useState('');
const [tempBibDescription, setTempBibDescription] = useState('');
const [tempBibUrl, setTempBibUrl] = useState('');
const [editingIndex, setEditingIndex] = useState(null);
```

**Funcionalidades:**
- Formulario para agregar/editar recursos bibliográficos con RichTextInput
- Soporte para URLs externas o archivos locales (PDF, documentos)
- Lista de recursos existentes con opciones de editar/eliminar
- Validación de campos antes de guardar
- Notificación de cambios temporales al componente padre para preview en tiempo real
- Reset automático del formulario después de guardar ediciones
- Uso de `useCallback` para optimizar rendimiento y evitar loops infinitos

---

### 📄 **LevelTraining.jsx** (Editor de Clase Magistral)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/LevelTraining.jsx`

**Props recibidas:**
```javascript
{
  level: Object - Objeto del nivel actual
  levelIndex: Number - Índice del nivel
  updateLevelField: Function - Función para actualizar campos del nivel
  uploadingFiles: Object - Estado de archivos en proceso de subida
  handleFileUpload: Function - Función para manejar subida de archivos
  handleFileDelete: Function - Función para eliminar archivos
  showWarningModal: Function - Función para mostrar modal de advertencia
}
```

**Responsabilidades:**
1. **Configurar el video** de la clase magistral
2. **Agregar título y descripción** de la clase con RichTextInput
3. **Especificar duración** del video en minutos
4. **Gestionar archivos de video** (subida, reemplazo, eliminación)

**Campos:**
- **Título de la clase**: RichTextInput (max 500 caracteres)
- **Descripción de la clase**: RichTextInput (max 5000 caracteres)
- **URL del video**: Input de texto o selector de archivo
- **Duración**: Input numérico (minutos)

**Soporte:**
- URLs de YouTube, Vimeo, u otros servicios
- Subida de archivos de video locales (MP4, MOV, AVI, MKV, WebM, OGG)
- Límite de 100MB por archivo
- Vista previa del video en TrainingPreview
- Botón para limpiar/eliminar video seleccionado

---

### 📄 **LevelTestEditor.jsx** (Editor de Examen)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/LevelTestEditor.jsx`

**Props recibidas:**
```javascript
{
  level: Object - Objeto del nivel actual
  levelIndex: Number - Índice del nivel
  updateLevelField: Function - Función para actualizar campos del nivel
  selectedScene: Number|null - Índice de la escena seleccionada
  setSelectedScene: Function - Función para cambiar escena seleccionada
  selectedOption: Number|null - Índice de la opción seleccionada
  setSelectedOption: Function - Función para cambiar opción seleccionada
  handleFileUpload: Function - Función para manejar subida de archivos
  handleFileDelete: Function - Función para eliminar archivos
  showWarningModal: Function - Función para mostrar modal de advertencia
  setActiveSection: Function - Función para cambiar sección activa del preview
}
```

**Responsabilidades:**
1. **Configurar datos generales** del examen con RichTextInput
2. **Crear/editar escenas** interactivas con videos
3. **Definir opciones de navegación** entre escenas
4. **Gestionar preview automático** según campo enfocado

**Estructura del examen:**

**Datos generales:**
- Título del examen (RichTextInput, max 500 caracteres)
- Descripción del examen (RichTextInput, max 5000 caracteres)
- Imagen de portada del examen (URL o archivo local)
- Checkbox de estado activo (isActive)

**Escenas:**
Cada escena contiene:
- **ID de escena**: Número único identificador
- **Video de la escena**: URL o archivo local (MP4, MOV, AVI, MKV, WebM, OGG - max 100MB)
- **Descripción**: RichTextInput que describe la situación (max 2500 caracteres)
- **Es escena final**: Checkbox que marca si es la última escena
- **Puntos bonus**: Puntos adicionales por llegar a esta escena

**Opciones de decisión:**
Cada escena puede tener múltiples opciones (máximo 2), cada una con:
- **Descripción de la opción**: Texto que ve el usuario (max 500 caracteres)
- **Puntos**: Puntaje asignado por elegir esta opción
- **Próxima escena**: ID de la escena a la que lleva esta opción (null si es final)

**Funcionalidades:**
- Agregar/eliminar escenas con IDs autoincrementales
- Agregar/eliminar opciones dentro de cada escena
- Navegación entre escenas mediante dropdown
- Sistema de preview automático:
  - Focus en campos del test → muestra preview del test
  - Focus en campos de escena → muestra preview de esa escena
- Validación de grafo de navegación
- Contador de caracteres en tiempo real
- Gestión de archivos de video para cada escena

---

### 📄 **EnrollStudents.jsx** (Inscripción de Estudiantes)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/EnrollStudents.jsx`

**Props recibidas:**
```javascript
{
  loadingStudents: Boolean - Indicador de carga de estudiantes
  students: Array - Lista de estudiantes disponibles
  searchStudent: String - Valor actual del campo de búsqueda
  setSearchStudent: Function - Función para actualizar búsqueda
  handleSearch: Function - Función para aplicar filtro de búsqueda
  handleClearSearch: Function - Función para limpiar búsqueda
  selectedStudents: Array - IDs de estudiantes seleccionados
  handleStudentSelection: Function - Función para seleccionar/deseleccionar estudiante
  selectAllStudents: Function - Función para seleccionar todos
  deselectAllStudents: Function - Función para deseleccionar todos
  getFilteredStudents: Function - Función que retorna estudiantes filtrados
}
```

**Responsabilidades:**
1. **Listar todos los estudiantes** disponibles con rol 'Alumno'
2. **Permitir seleccionar múltiples** estudiantes mediante checkboxes
3. **Filtrar por búsqueda** (nombre completo o email)
4. **Acciones masivas** de selección

**Funcionalidades:**
- Buscador con filtro aplicado por botón "Buscar"
- Botón "Limpiar" para resetear búsqueda
- Acciones masivas: 
  - "Seleccionar todos" (solo los filtrados)
  - "Deseleccionar todos"
- Lista de estudiantes con checkboxes individuales
- Contador de estudiantes seleccionados: "X estudiante(s) seleccionado(s)"
- Indicador de carga mientras se obtienen los datos del backend
- Muestra nombre completo y email de cada estudiante

**Estructura de datos:**
```javascript
// Cada estudiante tiene:
{
  _id: String - ID del estudiante
  firstName: String - Nombre
  lastName: String - Apellido
  email: String - Correo electrónico
  role: String - "Alumno"
}
```

---

### 📄 **AssignTeacher.jsx** (Asignación de Profesor)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/AssignTeacher.jsx`

**Props recibidas:**
```javascript
{
  teachers: Array - Lista de profesores disponibles
  loadingTeachers: Boolean - Indicador de carga de profesores
  assignedTeacher: String - ID del profesor asignado
  setAssignedTeacher: Function - Función para cambiar profesor asignado
}
```

**Responsabilidades:**
1. **Listar todos los profesores** disponibles con rol 'Capacitador'
2. **Permitir seleccionar UN profesor** mediante dropdown
3. **Mostrar estado de asignación** con badges visuales

**Estructura:**
- Dropdown (select) con lista de profesores
- Opción por defecto: "-- Seleccione un profesor --"
- Contador de profesores disponibles: "X profesor(es) disponible(s)"
- Badge verde si hay profesor asignado: "✓ ASIGNADO"
- Badge amarillo si no hay profesor: "⚠ Sin profesor asignado"
- Muestra nombre completo y email del profesor en cada opción
- Indicador de carga mientras se obtienen datos del backend

**Estructura de datos:**
```javascript
// Cada profesor tiene:
{
  _id: String - ID del profesor
  firstName: String - Nombre
  lastName: String - Apellido
  email: String - Correo electrónico
  role: String - "Capacitador"
}
```

---

### 📄 **TrainingPreview.jsx** (Vista Previa)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/TrainingPreview.jsx`

**Responsabilidades:**
1. **Renderizar en tiempo real** cómo se verá la capacitación
2. **Mostrar diferentes vistas** según la sección activa
3. **Permitir navegación** entre niveles y escenas

**Subcomponentes:**

**PreviewPresentacion:**
- Muestra la portada con imagen de fondo
- Título y subtítulo superpuestos
- Barra de progreso simulada al 0%
- Descripción de la capacitación

**PreviewNiveles:**
- Lista de niveles creados
- Botones para ver Bibliografía, Clase Magistral, Examen
- Indicadores de completitud por nivel

**PreviewBibliografia:**
- Lista de recursos bibliográficos
- Títulos, descripciones y enlaces clickeables
- Opción de editar desde la vista previa

**PreviewTraining:**
- Video incrustado de la clase magistral
- Detección automática de YouTube para embed
- Título y descripción de la clase
- Duración estimada

**PreviewTest:**
- Portada del examen con imagen
- Navegación entre escenas
- Videos de escenas
- Opciones de decisión con puntos
- Indicador de escena final

**PreviewInscripcion:**
- Lista de estudiantes seleccionados
- Contador total de inscritos

**Características:**
- Actualización en tiempo real mientras se edita
- Sanitización de HTML para seguridad
- Estilos consistentes con el diseño final
- Navegación interactiva entre secciones

---

### 📄 **RichTextInput.jsx** (Editor de Texto Rico)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/RichTextInput.jsx`

**Props recibidas:**
```javascript
{
  value: String - Valor HTML del contenido
  onChange: Function - Callback al cambiar el contenido
  maxLength: Number (default: 500) - Límite de caracteres
  placeholder: String (default: '') - Texto placeholder
  onFocus: Function (opcional) - Callback al hacer focus
}
```

**Responsabilidades:**
1. **Permitir formateo de texto** (negritas, cursivas, subrayado)
2. **Cambiar colores** de texto
3. **Ajustar tamaño** de fuente
4. **Sanitizar HTML** antes de guardar
5. **Contador de caracteres** en tiempo real

**Características:**
```javascript
// Paleta de colores predefinida
const COLOR_PALETTE = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  // ... más colores (aproximadamente 70 colores)
];

// Límites de tamaño de fuente
const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 36;
```

**Interfaz:**
- Barra de herramientas con botones de formato
- Botón de negrita (B)
- Botón de cursiva (I)
- Botón de subrayado (U)
- Selector de tamaño de fuente
- Selector de color
- Área de edición contentEditable
- Contador de caracteres en tiempo real
- Placeholder personalizable

**Funciones principales:**
```javascript
// Aplicar negrita
const applyBold = () => {
  document.execCommand('bold', false, null);
};

// Aplicar tamaño de fuente
const applyFontSize = (size) => {
  const clampedSize = clampFontSizeValue(parseFloat(size));
  document.execCommand('fontSize', false, `${clampedSize}px`);
};

// Aplicar color
const applyColor = (color) => {
  const normalizedColor = normalizeColor(color);
  if (normalizedColor) {
    document.execCommand('foreColor', false, normalizedColor);
  }
};

// Sanitizar HTML
const sanitizeRichTextValue = (value) => {
  // Eliminar etiquetas peligrosas (script, iframe, etc.)
  // Normalizar colores y tamaños de fuente
  // Eliminar estilos inline no permitidos
  return cleanedHtml;
};

// Obtener texto plano
const getPlainTextFromRichText = (value) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value;
  return tempDiv.textContent || tempDiv.innerText || '';
};
```

**Funciones exportadas:**
- `sanitizeRichTextValue(value)`: Limpia y normaliza HTML
- `getPlainTextFromRichText(value)`: Extrae texto plano
- `normalizeRichTextValue(value)`: Normaliza formato HTML

---

### 📄 **Sistema de Preview Automático**

**Funcionalidad:** Cambio automático de vista previa según el campo enfocado

**Implementado en:** `LevelTestEditor.jsx`

**Comportamiento:**
- Al hacer focus en **campos del test** (título, descripción, URL imagen, checkbox estado): muestra preview del test completo
- Al hacer focus en **campos de escena** (ID, descripción, video, lastOne, bonus, opciones): muestra preview de esa escena específica

**Funciones helper:**
```javascript
// Cambiar a vista previa del test
const handleFocusTest = () => {
  setSelectedScene(null);
  setActiveSection('test');
};

// Cambiar a vista previa de una escena específica
const handleFocusScene = (sceneIndex) => {
  setSelectedScene(sceneIndex);
  setActiveSection('test');
};
```

**Campos con auto-preview del test:**
- Título del test (RichTextInput)
- Descripción del test (RichTextInput)
- URL de imagen del test (input)
- Checkbox estado activo del test

**Campos con auto-preview de escena:**
- ID de escena (input number)
- Descripción de escena (RichTextInput)
- Video de escena (input URL)
- Checkbox "Última escena"
- Campo Bonus (input number)
- Descripción del botón/opción (input text)
- Puntos del botón (input number)
- ID de siguiente escena (input number)

---

## 🔄 FLUJO COMPLETO DE CREACIÓN

### **Flujo de Aprobación de Capacitaciones**

**Workflow completo implementado:**

#### **1. Administrador crea capacitación (Estado: Borrador)**
   - Completa todos los campos requeridos (título, subtítulo, descripción, imagen, fechas)
   - Agrega niveles con bibliografía, clases magistrales y evaluaciones
   - Inscribe estudiantes y asigna profesor
   - Guarda la capacitación (estado: `isActive: false`, `pendingApproval: false`, `rejectedBy: null`)
   - **Badge:** ⚪ Gris - "Borrador"

#### **2. Administrador envía a aprobar (Estado: Pendiente)**
   - Una vez cumplidos todos los requisitos, hace clic en "Enviar a aprobar"
   - El botón permanece deshabilitado hasta que se cumplan todas las validaciones
   - Al enviar, se actualiza: `pendingApproval: true`
   - Aparece modal de éxito indicando que fue enviada a aprobación
   - **Badge:** 🟡 Amarillo - "Pendiente"

#### **3. Directivo revisa la capacitación** *(implementación futura)*
   - Los Directivos ven las capacitaciones con `pendingApproval: true`
   - Revisan el contenido completo (niveles, bibliografía, exámenes, etc.)
   - Tienen dos opciones:

   **Opción A: Aprobar (Estado: Activa)**
   - Actualiza: `isActive: true`, `pendingApproval: false`, `rejectedBy: null`
   - La capacitación queda disponible para los estudiantes
   - **Badge:** 🟢 Verde - "Activa"

   **Opción B: Rechazar (Estado: Rechazada)**
   - Actualiza: `isActive: false`, `pendingApproval: false`, `rejectedBy: {DirectivoId}`
   - Ingresa `rejectionReason` explicando el motivo del rechazo
   - El Administrador puede corregir y reenviar a aprobar
   - **Badge:** 🔴 Rojo - "Rechazada"

#### **4. Finalización automática (Estado: Finalizada)**
   - El scheduler (`trainingScheduler.js`) revisa diariamente a medianoche
   - Si `endDate < fecha actual` y `isActive: true`:
     - Actualiza: `isActive: false`, `pendingApproval: false`
   - La capacitación ya no está disponible para nuevas inscripciones
   - **Badge:** 🟣 Violeta - "Finalizada"

#### **5. Reenvío después de rechazo**
   - El Administrador puede corregir una capacitación rechazada
   - Al hacer clic en "Enviar a aprobar" nuevamente:
     - Actualiza: `pendingApproval: true`, `rejectedBy: null`, `rejectionReason: ''`
   - Vuelve al estado **Pendiente** para nueva revisión

#### **Validaciones para enviar a aprobar:**

El sistema valida exhaustivamente antes de permitir el envío a aprobación:

**Datos básicos de la capacitación:**
- ✅ Título completo (texto plano, no vacío)
- ✅ Subtítulo completo
- ✅ Descripción completa
- ✅ Imagen de portada cargada
- ✅ Fecha de inicio establecida
- ✅ Fecha de fin establecida
- ✅ Fecha de fin posterior a fecha de inicio

**Niveles y contenido:**
- ✅ Al menos un nivel creado
- ✅ Cada nivel debe tener:
  - Título del nivel
  - Al menos una bibliografía completa (título, descripción, URL/archivo)
  - Clase magistral completa:
    - Título de la clase
    - Descripción de la clase
    - Video (URL o archivo subido)
    - Duración en minutos
  - Evaluación/Test completo:
    - Título del examen
    - Descripción del examen
    - Imagen de portada del examen
    - Al menos una escena
    - Cada escena con al menos 2 opciones de navegación

**Asignaciones:**
- ✅ Al menos un estudiante inscrito (rol 'Alumno')
- ✅ Un profesor asignado (rol 'Capacitador')

**Comportamiento del botón "Enviar a aprobar":**
- Se deshabilita automáticamente si `pendingApproval: true` (ya enviada)
- Se deshabilita si falta alguna validación
- Muestra modal con lista detallada de errores si no pasa validaciones
- Solo permite enviar cuando todos los requisitos están cumplidos

---

## 🔄 FLUJO DETALLADO DE CREACIÓN (LEGACY)

### **1. Usuario hace click en "Nueva Capacitación"**
```
GestionCapacitacion.jsx
  ↓
setOpenCreateTraining(true)
setEditingTraining(null)
  ↓
CreateTrainingModal se abre
```

### **2. Usuario llena PresentationForm**
```javascript
// Estados se actualizan en tiempo real
setTitle('Introducción a la Seguridad')
setSubtitle('Conceptos básicos de seguridad industrial')
setDescription('Este curso cubre los fundamentos...')
setImage('/uploads/training-image.jpg')
setStartDate('2025-01-01')
setEndDate('2025-12-31')
setIsActive(false) // Deshabilitado hasta completar
```

### **3. Usuario crea niveles**
```javascript
// Agrega Nivel 1
addLevel()
  ↓
levels = [{
  levelNumber: 1,
  title: 'Equipos de protección personal',
  description: 'Aprende sobre EPP...',
  bibliography: [],
  training: {
    title: 'Video explicativo de EPP',
    url: '/uploads/epp-video.mp4',
    duration: 15
  },
  test: {
    title: 'Evaluación de EPP',
    scenes: [
      {
        idScene: 1,
        videoUrl: '/uploads/scene1.mp4',
        description: '¿Qué EPP usarías?',
        options: [
          { description: 'Casco', points: 10, next: 2 },
          { description: 'Gafas', points: 5, next: 3 }
        ]
      }
    ]
  }
}]
```

### **4. Usuario inscribe estudiantes**
```javascript
// Selecciona estudiantes
setSelectedStudents([
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439012'
])
```

### **5. Usuario asigna profesor**
```javascript
setAssignedTeacher('507f1f77bcf86cd799439013')
```

### **6. Usuario hace click en "Guardar Capacitación"**
```javascript
handleSave()
  ↓
// Subir archivos pendientes
uploadPendingFiles()
  ↓
// Crear Training
const trainingData = {
  title: sanitizeRichTextValue(title),
  subtitle: sanitizeRichTextValue(subtitle),
  description: sanitizeRichTextValue(description),
  image: '/uploads/training-image.jpg',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  isActive: false,
  createdBy: user._id
};

const trainingResponse = await Request.post('/api/trainings/createTraining', trainingData);
const trainingId = trainingResponse.data._id;
  ↓
// Agregar niveles
await Request.post('/api/levels/addLevelsToTraining', {
  trainingId,
  levels: processedLevels
});
  ↓
// Inscribir estudiantes
await Request.post('/api/enrollments/enrollStudent', {
  userIds: selectedStudents,
  trainingId
});
  ↓
// Asignar profesor
await Request.post('/api/enrollments/enrollTrainer', {
  userIds: [assignedTeacher],
  trainingId
});
  ↓
// Refrescar lista
refreshTrainings()
  ↓
// Cerrar modal
onClose()
```

---

## 📊 DIAGRAMA DE FLUJO DE ESTADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ESTADOS                             │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────┐
                         │ Borrador │  ⚪ Gris
                         └────┬─────┘
                              │
                              │ Administrador:
                              │ "Enviar a aprobar"
                              ▼
                      ┌───────────────┐
               ┌──────┤   Pendiente   │  🟡 Amarillo
               │      └───────────────┘
               │              │
        Directivo:      Directivo:
        "Rechazar"     "Aprobar"
               │              │
               ▼              ▼
         ┌──────────┐    ┌─────────┐
         │Rechazada │    │ Activa  │  🟢 Verde
         └────┬─────┘    └────┬────┘
         🔴 Rojo               │
               │               │ Scheduler:
        Administrador:         │ endDate vencida
        Corrige y              │ (medianoche diaria)
        reenvía                ▼
               │          ┌────────────┐
               │          │ Finalizada │  🟣 Violeta
               │          └────────────┘
               │
               └──────────────┐
                              │
                              ▼
                      ┌───────────────┐
                      │   Pendiente   │  (reenvío)
                      └───────────────┘
```

**Leyenda de colores:**
- ⚪ **Borrador**: Gris (#6b7280) - En construcción
- 🟡 **Pendiente**: Amarillo/Naranja (#f59e0b) - Esperando revisión
- 🟢 **Activa**: Verde (#10b981) - Aprobada y funcionando
- 🔴 **Rechazada**: Rojo (#ef4444) - No aprobada, requiere correcciones
- 🟣 **Finalizada**: Violeta (#8b5cf6) - Completada por vencimiento

---

## 📊 DIAGRAMA DE SECUENCIA

```
Usuario                    Frontend                   Backend                   MongoDB
  |                           |                          |                         |
  |--[Click "Nueva"]--------->|                          |                         |
  |                           |--[Cargar estudiantes]--->|                         |
  |                           |                          |--[Query users]--------->|
  |                           |<-[Lista estudiantes]-----|<-[Resultado]------------|
  |                           |--[Cargar profesores]---->|                         |
  |                           |                          |--[Query users]--------->|
  |                           |<-[Lista profesores]------|<-[Resultado]------------|
  |                           |                          |                         |
  |<-[Modal abierto]----------|                          |                         |
  |                           |                          |                         |
  |--[Llenar formularios]---->|                          |                         |
  |--[Subir archivos]-------->|                          |                         |
  |                           |--[Preview en tiempo real]|                         |
  |                           |                          |                         |
  |--[Click "Guardar"]------->|                          |                         |
  |                           |--[Subir imágenes]------->|--[Guardar archivos]---->|
  |                           |<-[URLs de archivos]------|                         |
  |                           |                          |                         |
  |                           |--[POST createTraining]-->|                         |
  |                           |                          |--[Insert Training]----->|
  |                           |                          |<-[Training ID]----------|
  |                           |<-[Training creado]-------|                         |
  |                           |                          |                         |
  |                           |--[POST addLevels]------->|                         |
  |                           |                          |--[Insert Levels]------->|
  |                           |                          |<-[Levels IDs]-----------|
  |                           |                          |--[Update Training]----->|
  |                           |<-[Niveles agregados]-----|<-[OK]-------------------|
  |                           |                          |                         |
  |                           |--[POST enrollStudent]--->|                         |
  |                           |                          |--[Update Users]-------->|
  |                           |<-[Inscritos]-------------|<-[OK]-------------------|
  |                           |                          |                         |
  |                           |--[POST enrollTrainer]--->|                         |
  |                           |                          |--[Update User]--------->|
  |                           |<-[Profesor asignado]-----|<-[OK]-------------------|
  |                           |                          |                         |
  |<-[Modal cerrado]----------|                          |                         |
  |<-[Lista actualizada]------|                          |                         |
```

---

## 🔄 FLUJO DETALLADO DE GESTIÓN DE ARCHIVOS

### **Creación de capacitación (nuevo training)**

**1. Usuario sube archivos durante creación:**
```javascript
// Frontend: CreateTrainingModal.jsx
const handleFileUpload = async (file, levelIndex, fileType, subIndex = null) => {
  // 1. Subir a carpeta temporal
  const formData = new FormData();
  formData.append('file', file);
  const response = await Request.post('/training/upload-file', formData);
  
  // 2. Guardar ruta temporal en estado pendiente
  const tempPath = response.data.filePath; // "/uploads/temp/filename-123456.ext"
  
  // 3. Añadir a pendingLevelFiles con key única
  const fileKey = fileType === 'scene' 
    ? `scene-${levelIndex}-${subIndex}`
    : `${fileType}-${levelIndex}`;
  
  setPendingLevelFiles(prev => ({
    ...prev,
    [fileKey]: { path: tempPath, originalName: file.name }
  }));
};
```

**2. Usuario guarda la capacitación:**
```javascript
// Frontend: CreateTrainingModal.jsx - handleSave()
const handleSave = async () => {
  // 1. Crear el training (con imagen temporal si hay)
  const trainingData = {
    title, subtitle, description,
    image: pendingImageFile ? '/uploads/temp/image.jpg' : '',
    // ... otros campos
  };
  const trainingResponse = await Request.post('/training/createTraining', trainingData);
  const trainingId = trainingResponse.data._id;
  
  // 2. Recopilar todas las rutas temporales
  const tempFiles = [];
  if (pendingImageFile) tempFiles.push(image);
  
  Object.values(pendingLevelFiles).forEach(file => {
    if (file.path.startsWith('/uploads/temp/')) {
      tempFiles.push(file.path);
    }
  });
  
  // 3. Mover todos los archivos de temp a carpeta definitiva
  const moveResponse = await Request.post('/training/move-temp-files', {
    trainingId,
    tempFiles
  });
  
  // 4. Actualizar rutas en los niveles
  const movedFiles = moveResponse.data.movedFiles; // [{ oldPath, newPath }, ...]
  const updatedLevels = levels.map(level => {
    // Reemplazar rutas temporales por definitivas
    // ...
  });
  
  // 5. Guardar niveles con rutas definitivas
  await Request.post('/level/addLevelsToTraining', {
    trainingId,
    levels: updatedLevels
  });
};
```

**3. Backend mueve archivos:**
```javascript
// Backend: trainingRoutes.js - POST /move-temp-files
router.post("/move-temp-files", (req, res) => {
  const { trainingId, tempFiles } = req.body;
  
  const tempFolder = path.resolve(__dirname, "..", "..", "uploads", "temp");
  const finalFolder = path.resolve(__dirname, "..", "..", "uploads", "trainings", trainingId);
  
  // Crear carpeta final
  if (!fs.existsSync(finalFolder)) {
    fs.mkdirSync(finalFolder, { recursive: true });
  }
  
  const movedFiles = [];
  
  // Mover cada archivo
  for (const tempPath of tempFiles) {
    const filename = path.basename(tempPath);
    const sourcePath = path.join(tempFolder, filename);
    const destPath = path.join(finalFolder, filename);
    
    fs.renameSync(sourcePath, destPath);
    
    movedFiles.push({
      oldPath: tempPath,
      newPath: `/uploads/trainings/${trainingId}/${filename}`
    });
  }
  
  res.json({ movedFiles });
});
```

---

### **Edición de capacitación (training existente)**

**1. Usuario reemplaza un archivo:**
```javascript
// Frontend: CreateTrainingModal.jsx
const handleFileUpload = async (file, levelIndex, fileType, subIndex = null) => {
  // Si editingTraining existe, usar endpoint de reemplazo
  if (editingTraining && editingTraining._id) {
    const trainingId = editingTraining._id;
    
    // Obtener ruta del archivo antiguo
    const oldFilePath = getOldFilePath(levelIndex, fileType, subIndex);
    
    // Llamar a replace-file
    const response = await Request.post('/training/replace-file', {
      file,
      trainingId,
      oldFilePath
    });
    
    // Actualizar con la nueva ruta definitiva
    const newFilePath = response.data.filePath; // "/uploads/trainings/{id}/new-file.ext"
    
    // Actualizar el campo correspondiente
    updateLevelField(levelIndex, fieldPath, newFilePath);
    
    // Actualizar originalFiles para tracking
    setOriginalFiles(prev => {
      const updated = { ...prev };
      // Actualizar la referencia del archivo en la estructura
      return updated;
    });
  }
};
```

**2. Backend reemplaza archivo:**
```javascript
// Backend: trainingRoutes.js - POST /replace-file
router.post("/replace-file", upload.single('file'), (req, res) => {
  const { oldFilePath, trainingId } = req.body;
  
  // 1. Eliminar archivo antiguo si existe
  if (oldFilePath && oldFilePath.startsWith('/uploads/')) {
    const oldAbsolutePath = path.resolve(__dirname, "..", "..", 
      oldFilePath.replace('/uploads/', 'uploads/'));
    
    if (fs.existsSync(oldAbsolutePath)) {
      fs.unlinkSync(oldAbsolutePath);
    }
  }
  
  // 2. Mover archivo nuevo de temp a carpeta definitiva
  const tempPath = req.file.path;
  const finalFolder = path.resolve(__dirname, "..", "..", "uploads", "trainings", trainingId);
  
  if (!fs.existsSync(finalFolder)) {
    fs.mkdirSync(finalFolder, { recursive: true });
  }
  
  const finalPath = path.join(finalFolder, req.file.filename);
  fs.renameSync(tempPath, finalPath);
  
  const newFilePath = `/uploads/trainings/${trainingId}/${req.file.filename}`;
  
  res.json({ filePath: newFilePath });
});
```

**3. Usuario guarda cambios:**
```javascript
// Frontend: CreateTrainingModal.jsx - handleSave() en modo edición
const handleSave = async () => {
  // Los archivos ya están en su ubicación definitiva (reemplazados uno a uno)
  // Solo actualizar los datos del training y niveles
  
  await Request.patch(`/training/${editingTraining._id}`, trainingData);
  await Request.put('/level/updateLevelsInTraining', {
    trainingId: editingTraining._id,
    levels: processedLevels
  });
};
```

---

### **Eliminación de capacitación**

```javascript
// Frontend: GestionCapacitacion.jsx
const confirmDeleteTraining = async () => {
  await Request.delete(`/training/${trainingId}`);
  // El backend automáticamente elimina toda la carpeta
};

// Backend: TrainingService.js
async deleteTraining(trainingId) {
  // 1. Eliminar carpeta de archivos
  const uploadsFolder = path.resolve(__dirname, "..", "..", "uploads", "trainings", trainingId);
  
  if (fs.existsSync(uploadsFolder)) {
    fs.rmSync(uploadsFolder, { recursive: true, force: true });
  }
  
  // 2. Eliminar niveles de la BD
  await this.level.deleteMany({ trainingId });
  
  // 3. Eliminar training de la BD
  await this.training.findByIdAndDelete(trainingId);
}
```

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### **1. Modo borrador con validación flexible**
✅ **Implementado:**
- Las capacitaciones se crean con `isActive: false` y `pendingApproval: false` por defecto
- Los campos son opcionales durante creación (valores por defecto en modelos)
- Validación exhaustiva solo al intentar enviar a aprobar
- Modal de errores muestra lista detallada de requisitos faltantes
- Sistema de validación parcial con `isPartialUpdate` en el validador
- El botón "Enviar a aprobar" permanece deshabilitado hasta cumplir todos los requisitos

### **2. Botón contextual "Guardar", "Actualizar" y "Enviar a aprobar"**
✅ **Implementado:**
```jsx
// En CreateTrainingModal.jsx - Footer con 3 botones
<button onClick={handleCancel}>Cancelar</button>
<button 
  onClick={handleSendForApproval}
  disabled={pendingApproval}
>
  Enviar a aprobar
</button>
<button onClick={handleSave}>
  {isEditing ? 'Actualizar Capacitación' : 'Guardar Capacitación'}
</button>
```

### **3. Sistema completo de gestión de archivos**
✅ **Implementado:**
- Carpeta temporal `/uploads/temp/` para archivos durante creación
- Carpeta definitiva `/uploads/trainings/{trainingId}/` para cada capacitación
- Endpoint `/replace-file` para reemplazo atómico con eliminación automática del archivo antiguo
- Endpoint `/move-temp-files` para mover archivos de temp a definitiva
- Eliminación en cascada de carpeta completa al borrar capacitación
- Límites configurables (100MB archivos, 25MB campos de texto)
- Tracking de archivos con `originalFiles` para detectar cambios
- Sistema de archivos pendientes con `pendingLevelFiles`

### **4. Editor de texto rico (RichTextInput)**
✅ **Implementado:**
- Formato de texto (negrita, cursiva, subrayado)
- Selector de tamaño de fuente (10-36px)
- Paleta de colores (70+ colores)
- Contador de caracteres en tiempo real
- Sanitización de HTML para seguridad
- Funciones de utilidad exportadas

### **5. Sistema de preview en tiempo real**
✅ **Implementado:**
- Vista previa actualizada en tiempo real mientras se edita
- Preview automático según campo enfocado (test vs escena específica)
- Navegación interactiva entre niveles y escenas
- Detección de YouTube para embedder videos correctamente
- Preview de bibliografía editable desde la vista previa

### **5. Sistema de envío a aprobación**
✅ **Implementado:**
```javascript
// Validaciones exhaustivas antes de enviar a aprobar:
- Título, subtítulo, descripción obligatorios
- Fechas de inicio y fin obligatorias
- Fecha de fin > fecha de inicio
- Al menos un nivel creado
- Cada nivel con título, clase magistral y examen
- Cada examen con al menos una escena
- Al menos un estudiante inscrito
- Un profesor asignado

// El botón "Enviar a aprobar" se deshabilita automáticamente cuando:
- Ya se envió a aprobar (pendingApproval: true)
- Falta algún requisito de la validación

// Estados del training:
- Borrador: isActive: false, pendingApproval: false, rejectedBy: null
- Pendiente: isActive: false, pendingApproval: true, rejectedBy: null
- Activa: isActive: true, pendingApproval: false, rejectedBy: null (solo Directivo)
- Rechazada: isActive: false, pendingApproval: false, rejectedBy: {ID} (solo Directivo)
- Finalizada: isActive: false, pendingApproval: false, rejectedBy: null, endDate vencida (scheduler)
```

### **6. Gestión de inscripciones**
✅ **Implementado:**
- Búsqueda y filtrado de estudiantes
- Selección múltiple con acciones masivas
- Asignación de un profesor
- Contador de inscritos
- Estados visuales con badges

### **7. Panel de Directivos para aprobación/rechazo**
⏳ **Pendiente de implementación:**

**Vista de capacitaciones pendientes:**
- Vista especial para usuarios con rol 'Directivo'
- Listado filtrado de capacitaciones con `pendingApproval: true`
- Previsualización completa del contenido:
  - Datos básicos (título, subtítulo, descripción, fechas)
  - Todos los niveles con bibliografía, clases y exámenes
  - Estudiantes inscritos y profesor asignado

**Botón "Aprobar":**
- Actualiza la capacitación:
  ```javascript
  {
    isActive: true,
    pendingApproval: false,
    rejectedBy: null,
    rejectionReason: ''
  }
  ```
- Envía notificación al Administrador creador
- Capacitación queda disponible según fechas establecidas

**Botón "Rechazar":**
- Muestra modal para ingresar motivo del rechazo
- Actualiza la capacitación:
  ```javascript
  {
    isActive: false,
    pendingApproval: false,
    rejectedBy: directivoId,
    rejectionReason: 'Motivo ingresado...'
  }
  ```
- Envía notificación al Administrador con el motivo
- Administrador puede ver el motivo, corregir y reenviar

**Historial de revisiones:**
- Registro de quién aprobó/rechazó
- Fecha de aprobación/rechazo
- Motivos de rechazo previos (si aplica)

---

## ⚠️ ÁREAS DE MEJORA Y PROPUESTAS

### **MEJORA 1: Sincronización bidireccional de assignedTeacher**

**Estado actual:**
- `Training.assignedTeacher` se actualiza desde el frontend
- `User.assignedTraining` se actualiza desde EnrollmentService
- No hay sincronización automática entre ambos

**Propuesta de mejora:**
```javascript
// En EnrollmentService.js
async enrollTrainerToTraining(userId, trainingId) {
  const user = await this.user.findById(userId);
  if (!user || user.role !== "Capacitador") {
    throw new Error("Usuario no válido como capacitador");
  }

  const training = await this.training.findById(trainingId);
  if (!training) throw new Error("Capacitación no encontrada");

  // Sincronización bidireccional
  if (!user.assignedTraining.includes(trainingId)) {
    user.assignedTraining.push(trainingId);
    await user.save();
  }
  
  training.assignedTeacher = userId;
  await training.save();

  return { message: "Inscripción exitosa", training };
}
```

---

### **MEJORA 2: Indicadores visuales de completitud**

**Propuesta:**
- Agregar iconos de checkmark/warning en cada nivel según completitud
- Barra de progreso mostrando % de campos completados
- Tooltip indicando qué falta por completar al pasar mouse sobre indicadores

---

### **MEJORA 3: Validación de grafo de navegación del test**

**Propuesta:**
- Validar que no haya escenas huérfanas (sin opciones que apunten a ellas)
- Validar que los IDs de escenas sean únicos
- Validar que las opciones apunten a IDs de escenas existentes
- Advertir si hay escenas sin salida (sin opción que lleve a otra escena o marque final)

---

### **PROBLEMA 5: Sistema de validación flexible**

**Estado actual:**
- ✅ El validador `trainingValidator.js` soporta validación parcial con `isPartialUpdate`
- ✅ Los campos pueden ser opcionales durante creación (modo borrador)
- ✅ Validación completa solo se ejecuta al intentar activar la capacitación
- ✅ El frontend valida exhaustivamente antes de permitir activar `isActive`

**Implementación actual:**
```javascript
// En trainingValidator.js
validate(data = {}, options = {}) {
  const errors = [];
  const { isUpdate = false, isPartialUpdate = false } = options;

  // Si es actualización parcial, solo validar campos presentes
  if (isPartialUpdate) {
    if (data.hasOwnProperty('title') && !title) {
      errors.push({ field: "title", message: "Título requerido" });
    }
    // ... validaciones condicionales por campo
  } else {
    // Validación completa
    if (!title) errors.push({ field: "title", message: "Título requerido" });
    if (!subtitle) errors.push({ field: "subtitle", message: "Subtítulo requerido" });
    // ... todas las validaciones
  }

  // Validación del array de reportes
  if (Array.isArray(data.report)) {
    data.report.forEach((r, i) => {
      if (typeof r.level !== "number") {
        errors.push({ field: `report[${i}].level`, message: "Nivel debe ser numérico" });
      }
      // ... más validaciones de report
    });
  }

  if (errors.length) {
    throw new AppError("Datos inválidos", 400, "TRAINING_400", errors);
  }

  return { isValid: errors.length === 0, errors };
}
```

**Validación en el frontend:**
```javascript
// En CreateTrainingModal.jsx
const validateTrainingForActivation = () => {
  const errors = [];
  
  // Validar datos básicos
  if (!title || getPlainTextFromRichText(title).trim() === '') {
    errors.push('El título es obligatorio');
  }
  
  if (!startDate || !endDate) {
    errors.push('Las fechas de inicio y fin son obligatorias');
  }
  
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    errors.push('La fecha de fin debe ser posterior a la de inicio');
  }
  
  // Validar que haya al menos un nivel
  if (levels.length === 0) {
    errors.push('Debe agregar al menos un nivel');
  }
  
  // Validar completitud de cada nivel
  levels.forEach((level, index) => {
    if (!level.training.url) {
      errors.push(`El nivel ${index + 1} no tiene video de clase magistral`);
    }
    
    if (level.test.scenes.length === 0) {
      errors.push(`El nivel ${index + 1} no tiene escenas en el examen`);
    }
  });
  
  // Validar inscripciones
  if (selectedStudents.length === 0) {
    errors.push('Debe inscribir al menos un estudiante');
  }
  
  if (!assignedTeacher) {
    errors.push('Debe asignar un profesor');
  }
  
  return errors;
};

// Solo validar al intentar activar
const handleIsActiveChange = (checked) => {
  if (checked) {
    const errors = validateTrainingForActivation();
    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorModal(true);
      return; // No permite activar
    }
  }
  setIsActive(checked);
};
```

---

## 🎯 RESUMEN EJECUTIVO

### **Funcionalidades completas del sistema:**

**✅ Gestión de capacitaciones:**
1. Crear capacitaciones con datos básicos (título, subtítulo, descripción, imagen, fechas)
2. Modo borrador: capacitaciones se crean con `isActive: false` por defecto
3. Validación exhaustiva antes de activar (bloquea activación si falta información)
4. Botón contextual "Guardar" vs "Actualizar" según modo creación/edición
5. Actualizar capacitaciones existentes
6. Eliminar capacitaciones (con eliminación en cascada de archivos)

**✅ Gestión de niveles:**
1. Agregar múltiples niveles a una capacitación
2. Cada nivel con título, descripción y número secuencial
3. Bibliografía con múltiples recursos (PDFs, documentos, enlaces)
4. Clase magistral con video, título, descripción y duración
5. Examen interactivo con múltiples escenas y navegación tipo "elige tu aventura"

**✅ Sistema de archivos multimedia:**
1. Carpeta temporal durante creación (`/uploads/temp/`)
2. Carpeta definitiva por capacitación (`/uploads/trainings/{trainingId}/`)
3. Reemplazo atómico de archivos con eliminación automática del antiguo
4. Movimiento masivo de archivos de temp a definitiva al guardar
5. Eliminación completa de carpeta al borrar capacitación
6. Soporte para múltiples formatos (videos, documentos, imágenes, audio, etc.)
7. Límites configurables (100MB archivos, 25MB campos de texto)

**✅ Editor de contenido rico:**
1. Editor de texto con formato (negrita, cursiva, subrayado)
2. Selector de tamaño de fuente (10-36px)
3. Paleta de colores (70+ opciones)
4. Contador de caracteres en tiempo real
5. Sanitización de HTML para seguridad
6. Placeholder personalizable

**✅ Sistema de inscripciones:**
1. Inscribir múltiples estudiantes (rol 'Alumno')
2. Búsqueda y filtrado de estudiantes por nombre/email
3. Selección masiva (seleccionar todos / deseleccionar todos)
4. Asignar un profesor (rol 'Capacitador')
5. Contador de inscritos y badges visuales de estado

**✅ Vista previa en tiempo real:**
1. Preview actualizado mientras se edita
2. Cambio automático de vista según campo enfocado
3. Preview de test completo o escena específica
4. Navegación interactiva entre niveles y escenas
5. Detección automática de YouTube para embed
6. Preview de bibliografía editable

**✅ Validación y UX:**
1. Validación completa antes de permitir activar capacitación
2. Modal de errores con lista detallada de requisitos faltantes
3. Modal de éxito tras guardar/actualizar
4. Modal de advertencias para acciones no válidas
5. Confirmación antes de eliminar capacitaciones
6. Indicadores de carga durante operaciones asíncronas

### **Áreas de mejora identificadas:**
1. 🔧 Sincronización bidireccional de `assignedTeacher` entre Training y User
2. 🔧 Indicadores visuales de completitud por nivel
3. 🔧 Validación de grafo de navegación del test (escenas huérfanas, IDs únicos)
4. 🔧 Barra de progreso de completitud
5. 🔧 Tooltips informativos sobre campos obligatorios

### **Archivos principales del sistema:**

**Backend:**
- `back/src/models/Training.js` - Modelo de capacitación
- `back/src/models/Level.js` - Modelo de nivel
- `back/src/models/User.js` - Modelo de usuario
- `back/src/controllers/trainingController.js` - Controlador de capacitaciones
- `back/src/controllers/levelController.js` - Controlador de niveles
- `back/src/controllers/enrollmentController.js` - Controlador de inscripciones
- `back/src/services/TrainingService.js` - Lógica de negocio de capacitaciones
- `back/src/services/levelServices.js` - Lógica de negocio de niveles
- `back/src/services/EnrollmentService.js` - Lógica de negocio de inscripciones
- `back/src/validators/trainingValidator.js` - Validador de capacitaciones
- `back/src/routes/trainingRoutes.js` - Rutas de capacitaciones
- `back/src/routes/levelRoutes.js` - Rutas de niveles
- `back/src/routes/enrollmentRoutes.js` - Rutas de inscripciones
- `back/src/utils/trainingScheduler.js` - Scheduler automático para deshabilitar capacitaciones vencidas

**Frontend:**
- `Front/src/Pages/AdminPanel/GestionCapacitacion.jsx` - Página principal
- `Front/src/Components/Modals/CreateTrainingModal.jsx` - Modal principal de creación
- `Front/src/Components/Modals/CreateTrainingModal/PresentationForm.jsx` - Formulario de presentación
- `Front/src/Components/Modals/CreateTrainingModal/LevelsEditor.jsx` - Editor de niveles
- `Front/src/Components/Modals/CreateTrainingModal/LevelBibliography.jsx` - Editor de bibliografía
- `Front/src/Components/Modals/CreateTrainingModal/LevelTraining.jsx` - Editor de clase magistral
- `Front/src/Components/Modals/CreateTrainingModal/LevelTestEditor.jsx` - Editor de examen
- `Front/src/Components/Modals/CreateTrainingModal/EnrollStudents.jsx` - Inscripción de estudiantes
- `Front/src/Components/Modals/CreateTrainingModal/AssignTeacher.jsx` - Asignación de profesor
- `Front/src/Components/Modals/CreateTrainingModal/TrainingPreview.jsx` - Vista previa
- `Front/src/Components/Modals/CreateTrainingModal/RichTextInput.jsx` - Editor de texto rico

---

## 📝 NOTAS ADICIONALES

### **Convenciones de nomenclatura:**
- **Modelos**: PascalCase (Training, Level, User)
- **Servicios**: PascalCase con sufijo "Service" (TrainingService)
- **Controladores**: camelCase con sufijo "Controller" (trainingController)
- **Componentes**: PascalCase (GestionCapacitacion, CreateTrainingModal)
- **Funciones**: camelCase (handleCreateTraining, validateTrainingForActivation)
- **Variables de estado**: camelCase (isActive, selectedStudents)

### **Patrón de arquitectura:**
- **Backend**: Arquitectura en capas (Rutas → Controladores → Servicios → Modelos)
- **Frontend**: Componentes funcionales con React Hooks
- **Comunicación**: API REST con JSON
- **Base de datos**: MongoDB con Mongoose ODM

### **Sistema de gestión de archivos multimedia:**

**Estructura de carpetas:**
```
back/uploads/
├── temp/                          # Archivos temporales durante creación/edición
└── trainings/
    └── {trainingId}/              # Carpeta única por capacitación
        ├── imagen-portada.jpg
        ├── video-nivel1.mp4
        ├── documento-bibliografia.pdf
        └── ...
```

**Flujo de archivos:**

1. **Durante creación de capacitación:**
   - Archivos se suben a `/uploads/temp/` con `POST /training/upload-file`
   - Frontend mantiene referencias temporales (`/uploads/temp/filename.ext`)
   - Al guardar, se mueve todo a `/uploads/trainings/{trainingId}/` con `POST /training/move-temp-files`

2. **Durante edición de capacitación:**
   - Archivos nuevos van a `/uploads/temp/`
   - Al reemplazar, se usa `POST /training/replace-file` que:
     - Elimina el archivo antiguo de `/uploads/trainings/{trainingId}/`
     - Mueve el nuevo archivo de temp a `/uploads/trainings/{trainingId}/`
     - Retorna la nueva ruta definitiva

3. **Al eliminar capacitación:**
   - El backend elimina toda la carpeta `/uploads/trainings/{trainingId}/` con `fs.rmSync()`

**Tracking de archivos en el frontend:**
- `pendingImageFile`: Archivo de portada pendiente de subir
- `pendingLevelFiles`: Objeto con archivos pendientes por nivel (`{ 'training-0': File, 'test-1': File, 'scene-0-2': File, 'bib-1-3': File }`)
- `originalFiles`: Tracking de archivos originales para detectar cambios y eliminar antiguos al reemplazar

**Límites y validaciones:**
- Tamaño máximo de archivo: 100MB
- Tamaño máximo de campo de texto: 25MB (para HTML con formato extenso)
- Tipos permitidos: videos, documentos, imágenes, audio, archivos comprimidos, etc.
- Las rutas se guardan en la base de datos como `/uploads/trainings/{trainingId}/nombre-archivo.ext`
- El frontend accede a los archivos mediante `${VITE_API_URL}${filePath}`

### **Seguridad:**
- Sanitización de HTML en el editor de texto rico
- Validación de tipos de archivo en el servidor
- Validación de tamaño de archivo (5MB para imágenes, 100MB para otros)
- Autenticación requerida para crear/editar capacitaciones

---

---

## 📡 API FRONTEND - REQUEST.JS

**Ubicación:** `Front/src/API/Request.js`

### **Funciones de capacitaciones:**

```javascript
// Listar todas las capacitaciones
export async function getAllTrainings()

// Listar solo capacitaciones activas
export async function getAllActiveTrainings()

// Obtener una capacitación por ID (con timestamp para evitar caché)
export async function getTrainingById(trainingId)

// Crear nueva capacitación
export async function createTraining(trainingData)

// Actualizar capacitación existente
export async function updateTraining(trainingId, trainingData)

// Eliminar capacitación (elimina training, niveles y carpeta de archivos)
export async function deleteTraining(trainingId)
```

### **Funciones de niveles:**

```javascript
// Obtener todos los niveles de una capacitación
export async function getAllLevelsInTraining(trainingId)

// Agregar niveles a una capacitación
export async function addLevelsToTraining(trainingId, levels)

// Actualizar niveles de una capacitación
export async function updateLevelsInTraining(trainingId, levels)
```

### **Funciones de archivos:**

```javascript
// Subir imagen a carpeta temporal
export async function uploadTrainingImage(file)

// Subir archivo multimedia a carpeta temporal
export async function uploadTrainingFile(file)

// Eliminar archivo del servidor
export async function deleteTrainingFile(filePath)

// Reemplazar archivo existente con uno nuevo
// - Elimina el archivo antiguo
// - Mueve el nuevo de temp a /uploads/trainings/{trainingId}/
// - Retorna la nueva ruta
export async function replaceTrainingFile(file, trainingId, oldFilePath)

// Mover múltiples archivos de temp a carpeta definitiva
export async function moveTempFiles(trainingId, tempFiles)
```

### **Funciones de inscripciones:**

```javascript
// Inscribir estudiantes a una capacitación
export async function enrollStudentsToTraining(trainingId, studentIds)

// Obtener usuarios inscritos en una capacitación
export async function getUsersEnrolledInTraining(trainingId)

// Obtener estudiantes (filtrar por rol 'Alumno')
export async function getStudents(role = 'Alumno')

// Obtener lista de profesores
export async function listTeachers()
```

### **Funciones de utilidad:**

```javascript
// Resolver URLs de imágenes (prefija host del backend si es ruta relativa)
export function resolveImageUrl(url)
// Ejemplo: "/uploads/image.jpg" → "http://localhost:4000/uploads/image.jpg"
```

---

**Fecha de documentación:** Octubre 2025  
**Versión del sistema:** 1.0  
**Estado:** Producción
