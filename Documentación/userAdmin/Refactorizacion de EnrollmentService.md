# Refactorización SOLID de EnrollmentService

## Patrones SOLID Implementados

### 1. **Single Responsibility Principle (SRP)**

Cada componente tiene una única responsabilidad bien definida:

#### **EnrollmentValidator** (`back/src/utils/EnrollmentValidator.js`)
- **Responsabilidad única**: Validación de inscripciones y roles
- **Funciones puras** sin dependencias externas:
  - `isAlreadyEnrolled(assignedTraining, trainingId)` - Verifica si está inscrito
  - `isNotEnrolled(assignedTraining, trainingId)` - Verifica si NO está inscrito
  - `removeTrainingFromList(assignedTraining, trainingId)` - Filtra IDs
  - `isTrainer(role)` - Valida rol de Capacitador
  - `isStudent(role)` - Valida rol de Alumno
  - `hasUsers(users)` - Verifica array de usuarios
  - Funciones de mensajes de error consistentes (13 funciones)

#### **EnrollmentService** (`back/src/services/EnrollmentService.js`)
- **Responsabilidad única**: Orquestar lógica de negocio de inscripciones
- Ya NO valida roles directamente
- Ya NO verifica inscripciones con `.includes()`
- Ya NO filtra arrays inline
- Solo coordina repositorios y usa funciones puras

---

### 2. **Dependency Inversion Principle (DIP)**

Las clases de alto nivel (EnrollmentService) ya no dependen de implementaciones concretas (Mongoose models), sino de abstracciones (Repositories).

#### **Repositorios extendidos**:

##### **UserRepository** (`back/src/repositories/UserRepository.js`)
Métodos nuevos agregados para EnrollmentService:
- `findByIdDocument(userId)` - Obtiene documento sin lean (para usar `.save()`)
- `findByRoleNotEnrolled(role, trainingId)` - Busca usuarios por rol NO inscritos
- `findByRoleEnrolled(role, trainingId)` - Busca usuarios por rol inscritos

##### **TrainingRepository** (`back/src/repositories/TrainingRepository.js`)
Métodos reutilizados:
- `exists(id)` - Verifica existencia de capacitación
- `findById(id)` - Obtiene capacitación para respuestas

#### **Inyección de dependencias en EnrollmentService**:

```javascript
class EnrollmentService extends IEnrollmentService {
  constructor(dependencies = {}) {
    super();
    // Retrocompatibilidad con modelos directos
    this.user = dependencies.UserModel;
    this.training = dependencies.TrainingModel;
    
    // DIP: Inyección de repositorios (con defaults para producción)
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
  }
}
```

Esto permite:
- **Testing fácil**: inyectar mocks de repositorios
- **Bajo acoplamiento**: cambiar implementación de BD sin tocar el servicio
- **Flexibilidad**: intercambiar repositorios según contexto
- **Retrocompatibilidad**: mantener modelos directos si se necesitan

---

## Beneficios Obtenidos

### ✅ **Testabilidad**
- EnrollmentValidator es puro → tests unitarios triviales
- Validaciones de roles testables sin BD
- Filtrado de arrays testeable con datos simples
- EnrollmentService puede usar repos mockeados

### ✅ **Mantenibilidad**
- Código más claro y enfocado
- Cambios en validación de inscripción no tocan la BD
- Lógica de roles centralizada
- Mensajes de error consistentes y modificables en un lugar

### ✅ **Reusabilidad**
- `isAlreadyEnrolled` reutilizable para cualquier verificación
- `removeTrainingFromList` reutilizable para desinscripciones
- Validadores de rol reutilizables en otros servicios
- UserRepository extensible para otros casos de uso

### ✅ **Extensibilidad (Open/Closed)**
- Agregar nuevas validaciones: nuevas funciones en EnrollmentValidator
- Agregar nuevos roles: extender funciones de validación
- Cambiar lógica de inscripción: modificar funciones puras sin tocar BD

---

## Ejemplo de Uso

### Antes (código acoplado):
```javascript
// Validación inline con modelo directo
const user = await this.user.findById(userId);
if (!user) throw new Error("Alumno no encontrado");

const training = await this.training.findById(trainingId);
if (!training) throw new Error("Capacitacion no encontrado");

if (user.assignedTraining.includes(trainingId)) {
  throw new Error("El alumno ya está inscrito en la capacitacion");
}

user.assignedTraining.push(trainingId);
await user.save(trainingId);

// Filtrado inline
user.assignedTraining = user.assignedTraining.filter(
  id => id.toString() !== trainingId.toString()
);

// Búsqueda con query manual
const users = await this.user.find({
  role: "Alumno", 
  assignedTraining: { $ne: trainingId } 
}).exec();
```

### Después (separación de responsabilidades):
```javascript
// Validación con repositorio y funciones puras
const user = await this.userRepo.findByIdDocument(userId);
if (!user) throw new Error(createStudentNotFoundError());

const trainingExists = await this.trainingRepo.exists(trainingId);
if (!trainingExists) throw new Error(createTrainingNotFoundError());

if (isAlreadyEnrolled(user.assignedTraining, trainingId)) {
  throw new Error(createAlreadyEnrolledError());
}

user.assignedTraining.push(trainingId);
await user.save();

// Filtrado con función pura
user.assignedTraining = removeTrainingFromList(user.assignedTraining, trainingId);

// Búsqueda con repositorio
const users = await this.userRepo.findByRoleNotEnrolled("Alumno", trainingId);
```

---

## Testing Ejemplo

```javascript
// Test de EnrollmentValidator (sin BD)
import { 
  isAlreadyEnrolled, 
  isNotEnrolled, 
  removeTrainingFromList,
  isTrainer,
  isStudent,
  hasUsers
} from '../utils/EnrollmentValidator.js';

test('detecta inscripción existente', () => {
  const trainings = ['id1', 'id2', 'id3'];
  expect(isAlreadyEnrolled(trainings, 'id2')).toBe(true);
  expect(isAlreadyEnrolled(trainings, 'id999')).toBe(false);
});

test('filtra capacitación correctamente', () => {
  const trainings = ['id1', 'id2', 'id3'];
  const result = removeTrainingFromList(trainings, 'id2');
  expect(result).toEqual(['id1', 'id3']);
  expect(result).toHaveLength(2);
});

test('valida roles correctamente', () => {
  expect(isTrainer('Capacitador')).toBe(true);
  expect(isTrainer('Alumno')).toBe(false);
  expect(isStudent('Alumno')).toBe(true);
  expect(isStudent('Capacitador')).toBe(false);
});

test('verifica presencia de usuarios', () => {
  expect(hasUsers([{ id: 1 }])).toBe(true);
  expect(hasUsers([])).toBe(false);
  expect(hasUsers(null)).toBe(false);
});

// Test de EnrollmentService (con repos mockeados)
test('inscribe usuario correctamente', async () => {
  const mockUser = {
    _id: 'user123',
    assignedTraining: ['training1'],
    save: jest.fn()
  };
  
  const mockUserRepo = {
    findByIdDocument: jest.fn(() => Promise.resolve(mockUser))
  };
  
  const mockTrainingRepo = {
    exists: jest.fn(() => Promise.resolve(true)),
    findById: jest.fn(() => Promise.resolve({ _id: 'training2', title: 'Test' }))
  };

  const service = new EnrollmentService({
    userRepo: mockUserRepo,
    trainingRepo: mockTrainingRepo,
    UserModel: {},
    TrainingModel: {}
  });

  const result = await service.enrollUserToTraining('user123', 'training2');
  
  expect(mockUser.assignedTraining).toContain('training2');
  expect(mockUser.save).toHaveBeenCalled();
  expect(result.message).toBe('Inscripción exitosa');
});

test('rechaza inscripción duplicada', async () => {
  const mockUser = {
    _id: 'user123',
    assignedTraining: ['training1'] // Ya inscrito
  };
  
  const mockUserRepo = {
    findByIdDocument: jest.fn(() => Promise.resolve(mockUser))
  };
  
  const mockTrainingRepo = {
    exists: jest.fn(() => Promise.resolve(true))
  };

  const service = new EnrollmentService({
    userRepo: mockUserRepo,
    trainingRepo: mockTrainingRepo,
    UserModel: {},
    TrainingModel: {}
  });

  await expect(service.enrollUserToTraining('user123', 'training1'))
    .rejects.toThrow('El alumno ya está inscrito en la capacitacion');
});
```

---

## Archivos Modificados

### Nuevos archivos:
- `back/src/utils/EnrollmentValidator.js` ✨

### Archivos extendidos:
- `back/src/repositories/UserRepository.js` ⚡ (3 métodos nuevos)

### Archivos refactorizados:
- `back/src/services/EnrollmentService.js` ♻️

### Sin cambios (retrocompatibles):
- Controladores que usan EnrollmentService (siguen funcionando igual)
- Todos los endpoints siguen funcionando igual

---

## Métodos Refactorizados

### `enrollUserToTraining(userId, trainingId)`
- ✅ Usa `userRepo.findByIdDocument()` para obtener usuario
- ✅ Usa `trainingRepo.exists()` para validar capacitación
- ✅ Usa `isAlreadyEnrolled()` para validación pura
- ✅ Usa `createStudentNotFoundError()`, `createTrainingNotFoundError()`, `createAlreadyEnrolledError()`
- ✅ Usa `createEnrollmentSuccessMessage()` para respuesta consistente

### `unenrollUserToTraining(userId, trainingId)`
- ✅ Usa `userRepo.findByIdDocument()` para obtener usuario
- ✅ Usa `trainingRepo.exists()` para validar capacitación
- ✅ Usa `isNotEnrolled()` para validación pura
- ✅ Usa `removeTrainingFromList()` para filtrado puro
- ✅ Usa mensajes de error consistentes
- ✅ Usa `createUnenrollmentSuccessMessage()` para respuesta

### `getUsersNotEnrolledInTraining(trainingId)`
- ✅ Usa `userRepo.findByRoleNotEnrolled("Alumno", trainingId)`
- ✅ Query compleja centralizada en repositorio

### `getUserEnrollments(userId)`
- ✅ Usa `userRepo.findByIdWithTrainings()` con populate configurado
- ✅ Usa `createUserNotFoundError()` para mensajes consistentes

### `getUsersEnrolledInTraining(trainingId)`
- ✅ Usa `trainingRepo.exists()` para validar
- ✅ Usa `userRepo.findByRoleEnrolled("Alumno", trainingId)`
- ✅ Usa `hasUsers()` para validación pura
- ✅ Usa `createNoUsersEnrolledError()` para mensajes consistentes

### `enrollTrainerToTraining(userId, trainingId)`
- ✅ Usa `userRepo.findByIdDocument()` para obtener usuario
- ✅ Usa `trainingRepo.exists()` para validar capacitación
- ✅ Usa `isTrainer()` para validación de rol pura
- ✅ Usa `isAlreadyEnrolled()` para validación pura
- ✅ Usa `createInvalidRoleError()`, `createTrainerAlreadyEnrolledError()`

### `getTrainersNotEnrolledInTraining(trainingId)`
- ✅ Usa `userRepo.findByRoleNotEnrolled("Capacitador", trainingId)`
- ✅ Query compleja centralizada en repositorio

---

## Comparación con Otros Servicios

Todos los servicios refactorizados siguen el mismo patrón:

| Aspecto | ProgressService | LevelService | TrainingService | EnrollmentService |
|---------|----------------|--------------|-----------------|-------------------|
| **SRP** | ScoreCalculator + PathFinder | LevelValidator | TrainingValidator | EnrollmentValidator |
| **DIP** | 3 repositorios | 2 repositorios | 3 repositorios | 2 repositorios |
| **Utils** | Cálculos + Grafos | Validación | Validación + Mensajes | Validación + Filtrado + Roles |
| **Funciones Puras** | 8 funciones | 5 funciones | 8 funciones | 17 funciones |
| **Testabilidad** | ✅ | ✅ | ✅ | ✅ |
| **Retrocompat** | ✅ | ✅ | ✅ | ✅ |

---

## Decisiones de Diseño

### ¿Por qué tantas funciones de mensajes?

EnrollmentValidator tiene 13 funciones de mensajes (vs. TrainingValidator con 7).

**Razones**:
1. **Contextos variados**: Alumnos vs. Capacitadores requieren mensajes diferentes
2. **Estados múltiples**: Inscrito, no inscrito, rol inválido, etc.
3. **Consistencia**: Mismo mensaje para mismo error en todo el sistema
4. **Testeable**: Cada mensaje verificable en tests
5. **i18n ready**: Base para futura internacionalización

### ¿Por qué funciones de validación de rol separadas?

```javascript
// En vez de:
if (user.role === "Capacitador") { ... }

// Usamos:
if (isTrainer(user.role)) { ... }
```

**Ventajas**:
1. **Legibilidad**: `isTrainer(role)` es más expresivo
2. **Testeable**: función pura sin dependencias
3. **Extensible**: fácil agregar lógica (ej: múltiples roles)
4. **Reutilizable**: misma función en otros servicios

### ¿Por qué `removeTrainingFromList` como función pura?

```javascript
// Función pura testeable
export function removeTrainingFromList(assignedTraining, trainingId) {
  return assignedTraining.filter(
    id => id.toString() !== trainingId.toString()
  );
}
```

**Ventajas**:
1. **Testeable**: sin BD, solo lógica de arrays
2. **Reutilizable**: cualquier filtrado de trainings
3. **Inmutable**: no modifica array original
4. **Predecible**: mismo input → mismo output

---

## Casos de Uso Cubiertos

### Inscripción de Alumnos
- ✅ Validación de usuario existente
- ✅ Validación de capacitación existente
- ✅ Prevención de inscripciones duplicadas
- ✅ Mensajes de error consistentes

### Desinscripción de Alumnos
- ✅ Validación de inscripción previa
- ✅ Filtrado seguro de IDs
- ✅ Mensajes de éxito/error consistentes

### Listado de Usuarios
- ✅ Filtrado por rol (Alumno/Capacitador)
- ✅ Filtrado por estado de inscripción (inscrito/no inscrito)
- ✅ Queries complejas centralizadas

### Inscripción de Capacitadores
- ✅ Validación de rol específica
- ✅ Prevención de duplicados
- ✅ Mensajes de error diferenciados

---

## Próximos Pasos Sugeridos

1. **Agregar tests unitarios** para EnrollmentValidator (17 funciones)
2. **Agregar tests de integración** para EnrollmentService con repos reales
3. **Validar permisos** antes de inscribir (¿quién puede inscribir a quién?)
4. **Agregar logs** de auditoría para inscripciones/desinscripciones
5. **Notificaciones**: enviar email al inscribirse
6. **Límites de inscripción**: validar cupos máximos por capacitación
7. **Historial**: guardar registro de cambios de inscripción
