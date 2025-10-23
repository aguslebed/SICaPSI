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
  title: String (max 500) - Título principal
  subtitle: String (max 750) - Subtítulo descriptivo
  description: String (max 5000) - Descripción detallada
  image: String - URL o ruta de imagen de portada
  isActive: Boolean (default: true) - Estado de habilitación
  createdBy: ObjectId (ref: User) - Administrador creador
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
  startDate: Date (nullable) - Fecha de inicio
  endDate: Date (nullable) - Fecha de finalización
  assignedTeacher: String - ID del profesor asignado
}
```

**Métodos especiales:**
- `updateActiveStatusByDates()`: Actualiza automáticamente `isActive` según las fechas
- **Pre-save middleware**: Ejecuta la validación de fechas antes de guardar

**Índices:**
- `createdBy`: Para filtrar por administrador
- `isActive`: Para queries de capacitaciones activas

---

### 📄 **Level.js** (Nivel)
**Ubicación:** `back/src/models/Level.js`

```javascript
{
  trainingId: ObjectId (ref: Training) - Capacitación padre
  levelNumber: Number (min: 1) - Número secuencial del nivel
  title: String (max 500) - Título del nivel
  description: String (max 5000, auto-generada) - Descripción del nivel
  
  // Bibliografía (recursos adicionales)
  bibliography: [{
    title: String (max 500) - Título del recurso
    description: String (max 2500) - Descripción del recurso
    url: String - Enlace o ruta del archivo
    createdAt: Date (default: now)
  }],
  
  // Clase magistral (video educativo)
  training: {
    title: String (max 500) - Título de la clase
    description: String (max 5000) - Descripción del contenido
    url: String (required) - URL del video
    duration: Number - Duración en minutos
    createdAt: Date (default: now)
  },
  
  // Examen interactivo
  test: {
    title: String (max 500) - Título del examen
    description: String (max 5000) - Descripción del examen
    imageUrl: String - Imagen de portada del examen
    isActive: Boolean (default: true) - Estado del examen
    createdAt: Date (default: now),
    
    // Escenas del examen (grafo de decisiones)
    scenes: [{
      idScene: Number (required) - ID único de la escena
      videoUrl: String (required) - Video de la escena
      description: String (max 2500) - Descripción de la situación
      lastOne: Boolean (default: false) - Marca escena final
      bonus: Number (default: 0) - Puntos extra
      
      // Opciones de navegación
      options: [{
        description: String (max 500) - Texto de la opción
        points: Number (required) - Puntos asignados
        next: Number (nullable) - ID de la próxima escena
      }]
    }]
  }
}
```

**Índices únicos:**
- `{ trainingId, levelNumber }`: Un training no puede tener niveles duplicados
- `{ trainingId, title }`: Un training no puede tener títulos de nivel repetidos
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

## 🛣️ RUTAS Y ENDPOINTS DEL BACKEND

### 🟢 **Trainings** (Capacitaciones)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/api/trainings/createTraining` | Crea una nueva capacitación | Body: `{ title, subtitle, description, image, isActive, createdBy, startDate, endDate }` |
| `GET` | `/api/trainings/getAllTrainings` | Obtiene todas las capacitaciones | - |
| `GET` | `/api/trainings/getAllActiveTrainings` | Obtiene capacitaciones activas | - |
| `GET` | `/api/trainings/:id` | Obtiene una capacitación por ID | Params: `id` |
| `PATCH` | `/api/trainings/:id` | Actualiza una capacitación | Params: `id`, Body: campos a actualizar |
| `DELETE` | `/api/trainings/:id` | Elimina una capacitación | Params: `id` |
| `POST` | `/api/trainings/upload-image` | Sube imagen de capacitación | FormData: `image` |
| `POST` | `/api/trainings/upload-file` | Sube archivo multimedia | FormData: `file` |
| `DELETE` | `/api/trainings/delete-file` | Elimina un archivo del servidor | Body: `{ filePath }` |

**Controlador:** `back/src/controllers/trainingController.js`  
**Servicio:** `back/src/services/TrainingService.js`  
**Validador:** `back/src/validators/trainingValidator.js`

---

### 🟢 **Levels** (Niveles)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `POST` | `/api/levels/addLevelsToTraining` | Agrega niveles a una capacitación | Body: `{ trainingId, levels: [array de niveles] }` |
| `GET` | `/api/levels/getAlllevelsInTraining` | Obtiene todos los niveles de una capacitación | Body: `{ trainingId }` |
| `PUT` | `/api/levels/updateLevelsInTraining` | Actualiza niveles de una capacitación | Body: `{ trainingId, levels: [array de niveles] }` |

**Controlador:** `back/src/controllers/levelController.js`  
**Servicio:** `back/src/services/levelServices.js`

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
    <button onClick={handleSave}>
      {isEditing ? 'Actualizar' : 'Guardar'} Capacitación
    </button>
  </div>
</div>
```

**Función de guardado:**
```javascript
const handleSave = async () => {
  // 1. Validar campos obligatorios
  const errors = validateTrainingForActivation();
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
- **Estado**: Checkbox para habilitar/deshabilitar la capacitación

**Validaciones:**
- Contador de caracteres en tiempo real para todos los campos de texto
- Validación de tamaño de archivo (5MB máximo)
- Vista previa de imagen usando FileReader
- Los archivos se mantienen en estado pendiente hasta guardar

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

**Responsabilidades:**
1. **Listar recursos bibliográficos** del nivel
2. **Agregar/editar/eliminar** recursos
3. **Subir archivos PDF/enlaces** externos

**Estados locales:**
```javascript
const [tempBibTitle, setTempBibTitle] = useState('');
const [tempBibDescription, setTempBibDescription] = useState('');
const [tempBibUrl, setTempBibUrl] = useState('');
const [editingIndex, setEditingIndex] = useState(null);
```

**Funcionalidades:**
- Formulario para agregar/editar recursos bibliográficos
- Soporte para URLs externas o archivos locales
- Lista de recursos existentes con opciones de editar/eliminar
- Validación de campos antes de guardar
- Notificación de cambios temporales al componente padre para preview

---

### 📄 **LevelTraining.jsx** (Editor de Clase Magistral)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/LevelTraining.jsx`

**Responsabilidades:**
1. **Configurar el video** de la clase magistral
2. **Agregar título y descripción** de la clase
3. **Especificar duración** del video

**Campos:**
- **Título de la clase**: Editor de texto rico (max 100 caracteres)
- **Descripción de la clase**: Editor de texto rico (max 1000 caracteres)
- **URL del video**: Input de texto o selector de archivo
- **Duración**: Input numérico (minutos)

**Soporte:**
- URLs de YouTube, Vimeo, u otros servicios
- Subida de archivos de video locales
- Vista previa del video en TrainingPreview

---

### 📄 **LevelTestEditor.jsx** (Editor de Examen)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/LevelTestEditor.jsx`

**Responsabilidades:**
1. **Configurar datos generales** del examen
2. **Crear/editar escenas** interactivas
3. **Definir opciones de navegación** entre escenas

**Estructura del examen:**

**Datos generales:**
- Título del examen (max 100 caracteres)
- Descripción del examen (max 1000 caracteres)
- Imagen de portada del examen

**Escenas:**
Cada escena contiene:
- **ID de escena**: Número único identificador
- **Video de la escena**: URL o archivo local
- **Descripción**: Texto que describe la situación (max 500 caracteres)
- **Es escena final**: Checkbox que marca si es la última escena
- **Puntos bonus**: Puntos adicionales por llegar a esta escena

**Opciones de decisión:**
Cada escena puede tener múltiples opciones, cada una con:
- **Descripción de la opción**: Texto que ve el usuario (max 200 caracteres)
- **Puntos**: Puntaje asignado por elegir esta opción
- **Próxima escena**: ID de la escena a la que lleva esta opción (null si es final)

**Funcionalidades:**
- Agregar/eliminar escenas
- Agregar/eliminar opciones dentro de cada escena
- Navegación entre escenas seleccionadas
- Validación de grafo de navegación (no hay escenas huérfanas)

---

### 📄 **EnrollStudents.jsx** (Inscripción de Estudiantes)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/EnrollStudents.jsx`

**Responsabilidades:**
1. **Listar todos los estudiantes** disponibles
2. **Permitir seleccionar múltiples** estudiantes
3. **Filtrar por búsqueda** (nombre, email, etc.)

**Funcionalidades:**
- Buscador con filtro aplicado por botón
- Acciones masivas: seleccionar todos / deseleccionar todos
- Lista de estudiantes con checkboxes
- Contador de estudiantes seleccionados
- Indicador de carga mientras se obtienen los datos

**Funciones:**
```javascript
// Filtrar estudiantes por búsqueda
const getFilteredStudents = () => {
  if (!appliedFilter) return students;
  
  return students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email.toLowerCase();
    const search = appliedFilter.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });
};

// Seleccionar/deseleccionar un estudiante
const handleStudentSelection = (studentId, checked) => {
  if (checked) {
    setSelectedStudents(prev => [...prev, studentId]);
  } else {
    setSelectedStudents(prev => prev.filter(id => id !== studentId));
  }
};

// Seleccionar todos
const selectAllStudents = () => {
  const filteredIds = getFilteredStudents().map(s => s._id);
  setSelectedStudents(filteredIds);
};

// Deseleccionar todos
const deselectAllStudents = () => {
  setSelectedStudents([]);
};
```

---

### 📄 **AssignTeacher.jsx** (Asignación de Profesor)
**Ubicación:** `Front/src/Components/Modals/CreateTrainingModal/AssignTeacher.jsx`

**Responsabilidades:**
1. **Listar todos los profesores** disponibles
2. **Permitir seleccionar UN profesor**
3. **Mostrar el profesor asignado** actual

**Estructura:**
- Dropdown (select) con lista de profesores
- Opción por defecto: "-- Seleccione un profesor --"
- Contador de profesores disponibles
- Badge verde si hay profesor asignado: "✓ ASIGNADO"
- Badge amarillo si no hay profesor: "⚠ Sin profesor asignado"
- Muestra nombre completo y email del profesor en cada opción

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

**Responsabilidades:**
1. **Permitir formateo de texto** (negritas, cursivas, subrayado)
2. **Cambiar colores** de texto
3. **Ajustar tamaño** de fuente
4. **Sanitizar HTML** antes de guardar

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

## 🔄 FLUJO COMPLETO DE CREACIÓN

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

## ⚠️ PROBLEMAS ACTUALES Y PROPUESTA DE SOLUCIÓN

### **PROBLEMA 1: No hay modo "borrador"**

**Estado actual:**
- Se puede crear una capacitación sin niveles
- Se puede crear una capacitación sin estudiantes
- Se puede crear una capacitación sin profesor
- `isActive` se puede marcar como `true` sin validaciones

**Solución propuesta:**
```javascript
// En Training.js
{
  isDraft: { type: Boolean, default: true },
  isActive: { type: Boolean, default: false },
  completionChecklist: {
    hasLevels: { type: Boolean, default: false },
    hasStudents: { type: Boolean, default: false },
    hasTeacher: { type: Boolean, default: false },
    hasDates: { type: Boolean, default: false }
  }
}

// Método de validación
TrainingSchema.methods.isReadyToActivate = function() {
  return (
    this.completionChecklist.hasLevels &&
    this.completionChecklist.hasStudents &&
    this.completionChecklist.hasTeacher &&
    this.completionChecklist.hasDates
  );
};
```

---

### **PROBLEMA 2: Botón "Guardar" no cambia a "Actualizar"**

**Estado actual:**
- El botón siempre dice "Guardar Capacitación"

**Solución propuesta:**
```jsx
// En CreateTrainingModal.jsx
<button onClick={handleSave}>
  {isEditing ? 'Actualizar Capacitación' : 'Guardar Capacitación'}
</button>
```

---

### **PROBLEMA 3: No hay validación de completitud**

**Estado actual:**
- Se puede habilitar una capacitación sin completar todos los datos

**Solución propuesta:**
```javascript
// En CreateTrainingModal.jsx
const validateTrainingForActivation = () => {
  const errors = [];
  
  if (!title || getPlainTextFromRichText(title).trim() === '') {
    errors.push('El título es obligatorio');
  }
  
  if (!startDate || !endDate) {
    errors.push('Las fechas de inicio y fin son obligatorias');
  }
  
  if (levels.length === 0) {
    errors.push('Debe agregar al menos un nivel');
  }
  
  // Validar que cada nivel esté completo
  levels.forEach((level, index) => {
    if (!level.title || getPlainTextFromRichText(level.title).trim() === '') {
      errors.push(`El nivel ${index + 1} no tiene título`);
    }
    
    if (!level.training.url) {
      errors.push(`El nivel ${index + 1} no tiene video de clase magistral`);
    }
    
    if (!level.test.title) {
      errors.push(`El nivel ${index + 1} no tiene título de examen`);
    }
    
    if (level.test.scenes.length === 0) {
      errors.push(`El nivel ${index + 1} no tiene escenas en el examen`);
    }
  });
  
  if (selectedStudents.length === 0) {
    errors.push('Debe inscribir al menos un estudiante');
  }
  
  if (!assignedTeacher) {
    errors.push('Debe asignar un profesor');
  }
  
  return errors;
};

const handleIsActiveChange = (checked) => {
  if (checked) {
    const errors = validateTrainingForActivation();
    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorModal(true);
      return;
    }
  }
  setIsActive(checked);
};
```

---

### **PROBLEMA 4: Campo `assignedTeacher` no se sincroniza**

**Estado actual:**
- Existe `assignedTeacher` en Training.js
- Existe `assignedTraining` en User.js
- No están sincronizados

**Solución propuesta:**
```javascript
// En EnrollmentService.js
async enrollTrainerToTraining(userId, trainingId) {
  const user = await this.user.findById(userId);
  if (!user) throw new Error("Usuario no encontrado");
  
  if (user.role !== "Capacitador") {
    throw new Error("El usuario no es un capacitador");
  }

  const training = await this.training.findById(trainingId);
  if (!training) throw new Error("Capacitacion no encontrado");

  if (user.assignedTraining.includes(trainingId)) {
    throw new Error("El capacitador ya está inscrito en la capacitacion");
  }

  // Actualizar user.assignedTraining
  user.assignedTraining.push(trainingId);
  await user.save();
  
  // NUEVO: Sincronizar training.assignedTeacher
  training.assignedTeacher = userId;
  await training.save();

  return { message: "Inscripción exitosa", training };
}
```

---

### **PROBLEMA 5: Validación de fechas en el backend**

**Estado actual:**
- El validador `trainingValidator.js` NO valida `startDate` ni `endDate`
- El frontend los trata como obligatorios

**Solución propuesta:**
```javascript
// En trainingValidator.js
validate(data = {}, options = {}) {
  const errors = [];
  const { isUpdate = false } = options;

  // ... validaciones existentes ...
  
  // Validar fechas cuando isActive = true
  if (data.isActive === true) {
    if (!data.startDate) {
      errors.push({ field: "startDate", message: "Fecha de inicio requerida para capacitaciones activas" });
    }
    
    if (!data.endDate) {
      errors.push({ field: "endDate", message: "Fecha de fin requerida para capacitaciones activas" });
    }
    
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      
      if (end <= start) {
        errors.push({ field: "endDate", message: "La fecha de fin debe ser posterior a la fecha de inicio" });
      }
    }
  }

  if (errors.length) {
    throw new AppError("Datos inválidos", 400, "TRAINING_400", errors);
  }

  return { isValid: errors.length === 0, errors };
}
```

---

## 🎯 RESUMEN EJECUTIVO

### **Este sistema permite:**
1. ✅ Crear capacitaciones con datos básicos (título, subtítulo, descripción, imagen, fechas)
2. ✅ Agregar múltiples niveles con bibliografía, clases magistrales y exámenes interactivos
3. ✅ Inscribir estudiantes y asignar profesores
4. ✅ Vista previa en tiempo real de cómo se verá la capacitación
5. ✅ Subida de archivos multimedia (imágenes, videos, documentos)
6. ✅ Editor de texto rico con formato HTML

### **Lo que falta implementar:**
1. ❌ Sistema de borradores (capacitaciones incompletas)
2. ❌ Validación de completitud antes de activar
3. ❌ Sincronización correcta del campo assignedTeacher
4. ❌ Indicadores visuales de datos pendientes
5. ❌ Botón "Actualizar" diferenciado del botón "Guardar"
6. ❌ Validación de fechas en el backend
7. ❌ Checklist de completitud visible para el usuario

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

### **Manejo de archivos:**
- Los archivos se almacenan en `back/uploads/`
- Las rutas se guardan en la base de datos como `/uploads/nombre-archivo.ext`
- El frontend accede a los archivos mediante `${VITE_API_URL}${filePath}`
- Los archivos pendientes se mantienen en estado local hasta confirmar la operación

### **Seguridad:**
- Sanitización de HTML en el editor de texto rico
- Validación de tipos de archivo en el servidor
- Validación de tamaño de archivo (5MB para imágenes, 100MB para otros)
- Autenticación requerida para crear/editar capacitaciones

---

**Fecha de documentación:** Octubre 2025  
**Versión del sistema:** 1.0  
**Estado:** En desarrollo
