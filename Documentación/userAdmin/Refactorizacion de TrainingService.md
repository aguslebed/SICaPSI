# Refactorización SOLID de TrainingService

## Patrones SOLID Implementados

### 1. **Single Responsibility Principle (SRP)**

Cada componente tiene una única responsabilidad bien definida:

#### **TrainingValidator** (`back/src/utils/TrainingValidator.js`)
- **Responsabilidad única**: Validación de capacitaciones
- **Funciones puras** sin dependencias externas:
  - `titleExists(existingTraining)` - Verifica si un título ya existe
  - `isValidObjectId(value)` - Valida formato de ObjectId
  - `determineUserSearchStrategy(assignedValue)` - Estrategia de búsqueda de usuario
  - `createDuplicateTitleError()` - Mensaje de error para título duplicado
  - `createDuplicateTitleOnUpdateError()` - Mensaje para actualización duplicada
  - `createTrainingNotFoundError()` - Mensaje de capacitación no encontrada
  - `createGetTrainerError()` - Mensaje de error al obtener capacitador
  - `mergeTrainingData(training, trainingData)` - Merge de datos

#### **TrainingService** (`back/src/services/TrainingService.js`)
- **Responsabilidad única**: Orquestar lógica de negocio de capacitaciones
- Ya NO valida títulos duplicados directamente
- Ya NO construye queries de populate manualmente
- Solo coordina repositorios y usa funciones puras

---

### 2. **Dependency Inversion Principle (DIP)**

Las clases de alto nivel (TrainingService) ya no dependen de implementaciones concretas (Mongoose models), sino de abstracciones (Repositories).

#### **Repositorios extendidos/creados**:

##### **TrainingRepository** (`back/src/repositories/TrainingRepository.js`)
Métodos nuevos agregados:
- `create(trainingData)` - Crea capacitación
- `findWithPopulate(filter, populateOptions, sortOptions)` - Busca con filtros
- `findByIdWithPopulate(id, populateOptions)` - Busca por ID con populate
- `findByTitle(title)` - Busca por título
- `findByTitleExcludingId(title, excludeId)` - Busca excluyendo ID
- `findByIdDocument(id)` - Obtiene documento sin lean
- `deleteById(id)` - Elimina por ID
- `findByIdWithSelect(id, selectFields)` - Busca con campos específicos

##### **UserRepository** (`back/src/repositories/UserRepository.js`)
Métodos nuevos agregados:
- `findByIdWithTrainings(userId, populateOptions)` - Busca con populate de trainings
- `findByEmail(email, selectFields)` - Busca por email
- `findByIdOrEmail(value, selectFields)` - Búsqueda flexible

##### **LevelRepository** (`back/src/repositories/LevelRepository.js`)
Ya existente, usado para populate de niveles.

#### **Inyección de dependencias en TrainingService**:

```javascript
class TrainingService extends ITrainingService {
  constructor(dependencies = {}) {
    super();
    // Retrocompatibilidad con modelos directos
    this.User = dependencies.UserModel;
    this.Level = dependencies.LevelModel;
    this.Training = dependencies.TrainingModel;
    
    // DIP: Inyección de repositorios (con defaults para producción)
    this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.levelRepo = dependencies.levelRepo || new LevelRepository();
  }
}
```

Esto permite:
- **Testing fácil**: inyectar mocks de repositorios
- **Bajo acoplamiento**: cambiar implementación de BD sin tocar el servicio
- **Flexibilidad**: intercambiar repositorios según contexto
- **Retrocompatibilidad**: mantener modelos directos para operaciones específicas

---

## Beneficios Obtenidos

### ✅ **Testabilidad**
- TrainingValidator es puro → tests unitarios sin BD
- TrainingService puede usar repos mockeados → tests sin BD real
- Validación de ObjectId testable sin Mongoose

### ✅ **Mantenibilidad**
- Código más claro y enfocado
- Cambios en validación no tocan la BD
- Queries complejas centralizadas en repositorios
- Mensajes de error consistentes

### ✅ **Reusabilidad**
- TrainingValidator puede usarse en otros servicios
- TrainingRepository reutilizable (usado por LevelService también)
- UserRepository extensible para múltiples casos de uso

### ✅ **Extensibilidad (Open/Closed)**
- Agregar nuevas validaciones: nuevas funciones en TrainingValidator
- Cambiar fuente de datos: crear nuevo repositorio e inyectarlo
- Agregar nuevas queries: extender repositorio sin tocar servicio

---

## Ejemplo de Uso

### Antes (código acoplado):
```javascript
// Creación con validación inline
const training = await this.Training.findOne({ title: trainingData.title });
if (training) {
  throw new Error("El título de la capacitación ya existe");
}
const newTraining = new this.Training(trainingData);
await newTraining.save();

// Búsqueda con populate manual
const trainings = await this.Training.find({ isActive: true })
  .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
  .populate({ path: 'rejectedBy', select: 'firstName lastName email', model: this.User })
  .populate({ path: 'levels', select: 'levelNumber title description', model: this.Level })
  .exec();
```

### Después (separación de responsabilidades):
```javascript
// Creación con validación pura
const training = await this.trainingRepo.findByTitle(trainingData.title);
if (titleExists(training)) {
  throw new Error(createDuplicateTitleError());
}
const newTraining = await this.trainingRepo.create(trainingData);

// Búsqueda con repositorio
const populateOptions = [
  { path: 'createdBy', select: 'firstName lastName email', model: this.User },
  { path: 'rejectedBy', select: 'firstName lastName email', model: this.User },
  { path: 'levels', select: 'levelNumber title description', model: this.Level }
];
const trainings = await this.trainingRepo.findWithPopulate(
  { isActive: true },
  populateOptions
);
```

---

## Testing Ejemplo

```javascript
// Test de TrainingValidator (sin BD)
import { titleExists, isValidObjectId } from '../utils/TrainingValidator.js';

test('detecta título existente', () => {
  expect(titleExists({ title: 'Capacitación' })).toBe(true);
  expect(titleExists(null)).toBe(false);
});

test('valida ObjectId correctamente', () => {
  expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
  expect(isValidObjectId('invalid-id')).toBe(false);
  expect(isValidObjectId(null)).toBe(false);
});

// Test de TrainingService (con repos mockeados)
test('crea capacitación correctamente', async () => {
  const mockTrainingRepo = {
    findByTitle: jest.fn(() => Promise.resolve(null)),
    create: jest.fn((data) => Promise.resolve({ _id: '123', ...data }))
  };

  const service = new TrainingService({
    trainingRepo: mockTrainingRepo,
    userRepo: {},
    levelRepo: {},
    UserModel: {},
    LevelModel: {},
    TrainingModel: {}
  });

  const result = await service.createTraining({ title: 'Nueva Capacitación' });
  
  expect(result.title).toBe('Nueva Capacitación');
  expect(mockTrainingRepo.findByTitle).toHaveBeenCalledWith('Nueva Capacitación');
  expect(mockTrainingRepo.create).toHaveBeenCalled();
});

test('rechaza título duplicado', async () => {
  const mockTrainingRepo = {
    findByTitle: jest.fn(() => Promise.resolve({ title: 'Existente' }))
  };

  const service = new TrainingService({
    trainingRepo: mockTrainingRepo,
    UserModel: {},
    LevelModel: {},
    TrainingModel: {}
  });

  await expect(service.createTraining({ title: 'Existente' }))
    .rejects.toThrow('El título de la capacitación ya existe');
});
```

---

## Archivos Modificados

### Nuevos archivos:
- `back/src/utils/TrainingValidator.js` ✨

### Archivos extendidos:
- `back/src/repositories/TrainingRepository.js` ⚡ (9 métodos nuevos)
- `back/src/repositories/UserRepository.js` ⚡ (3 métodos nuevos)

### Archivos refactorizados:
- `back/src/services/TrainingService.js` ♻️

### Sin cambios (retrocompatibles):
- Controladores que usan TrainingService (siguen funcionando igual)
- Todos los endpoints siguen funcionando igual

---

## Métodos Refactorizados

### `getCoursesForUser(userId)`
- ✅ Usa `userRepo.findByIdWithTrainings()` con populate configurado
- ✅ Centraliza opciones de populate en variables

### `createTraining(trainingData)`
- ✅ Usa `trainingRepo.findByTitle()` para validar
- ✅ Usa `titleExists()` para validación pura
- ✅ Usa `createDuplicateTitleError()` para mensajes consistentes
- ✅ Usa `trainingRepo.create()` para crear

### `getAllActiveTrainings()` / `getAllTrainings()` / `getPendingContent()`
- ✅ Usan `trainingRepo.findWithPopulate()` con filtros
- ✅ Centralizan opciones de populate
- ✅ Ordenamiento configurable

### `getTrainingById(trainingId)`
- ✅ Usa `trainingRepo.findByIdWithPopulate()`
- ✅ Opciones de populate reutilizables

### `getTrainerByTrainingId(trainingId)`
- ✅ Usa `trainingRepo.findByIdWithSelect()` para campo específico
- ✅ Usa `determineUserSearchStrategy()` para lógica de búsqueda
- ✅ Usa `isValidObjectId()` para validación
- ✅ Usa `userRepo.findById()` y `userRepo.findByIdOrEmail()`
- ✅ Usa `createGetTrainerError()` para manejo de errores

### `updateTraining(trainingId, trainingData)`
- ✅ Usa `trainingRepo.findByTitleExcludingId()` para validar duplicados
- ✅ Usa `titleExists()` para validación pura
- ✅ Usa `trainingRepo.findByIdDocument()` para obtener documento
- ✅ Usa `createTrainingNotFoundError()` para mensajes consistentes
- ✅ Usa `trainingRepo.findByIdWithPopulate()` para retornar

### `deleteTraining(trainingId)`
- ✅ Usa `trainingRepo.findById()` para validar
- ✅ Usa `trainingRepo.deleteById()` para eliminar
- ✅ Mantiene modelo directo para `Level.deleteMany()` (operación específica)

---

## Comparación con Otros Servicios

Todos los servicios refactorizados siguen el mismo patrón:

| Aspecto | ProgressService | LevelService | TrainingService |
|---------|----------------|--------------|-----------------|
| **SRP** | ScoreCalculator + PathFinder | LevelValidator | TrainingValidator |
| **DIP** | 3 repositorios | 2 repositorios | 3 repositorios |
| **Utils** | Cálculos + Grafos | Validación + Transformación | Validación + Mensajes |
| **Testabilidad** | ✅ Pura | ✅ Pura | ✅ Pura |
| **Retrocompat** | ✅ Modelos directos | ✅ Modelos directos | ✅ Modelos directos |

---

## Decisiones de Diseño

### ¿Por qué funciones de mensajes en TrainingValidator?

```javascript
// En vez de strings hardcoded
throw new Error("Capacitación no encontrada");

// Usamos funciones puras
throw new Error(createTrainingNotFoundError());
```

**Ventajas**:
1. **Consistencia**: mismo mensaje en todo el sistema
2. **Testeable**: mensajes verificables en tests
3. **i18n ready**: fácil agregar internacionalización
4. **Refactoring seguro**: cambiar mensaje en un solo lugar

### ¿Por qué mantener modelo directo para Level.deleteMany()?

```javascript
// Se mantiene modelo directo para:
await this.Level.deleteMany({ trainingId: trainingId });
```

**Razones**:
1. **Operación específica**: `deleteMany` con filtro complejo
2. **Usado una sola vez**: no justifica método en repositorio
3. **Pragmatismo**: evitar sobre-abstracción

---

## Próximos Pasos Sugeridos

1. **Agregar tests unitarios** para TrainingValidator
2. **Agregar tests de integración** para TrainingService con repos reales
3. **Internacionalización** usando funciones de mensajes como base
4. **Cache de queries** frecuentes en repositorios
5. **Validación de permisos** centralizada en utils
6. **Agregar JSDoc** detallado en métodos de repositorio
