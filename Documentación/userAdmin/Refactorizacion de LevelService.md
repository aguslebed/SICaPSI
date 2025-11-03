# Refactorización SOLID de LevelService

## Patrones SOLID Implementados

### 1. **Single Responsibility Principle (SRP)**

Cada componente tiene una única responsabilidad bien definida:

#### **LevelValidator** (`back/src/utils/LevelValidator.js`)
- **Responsabilidad única**: Validación y transformación de datos de niveles
- **Funciones puras** sin dependencias externas:
  - `extractLevelNumbers(levels)` - Extrae números de nivel de un array
  - `hasDuplicates(existingLevels)` - Verifica si hay duplicados
  - `createDuplicateErrorMessage(existingLevels)` - Crea mensaje de error descriptivo
  - `determineLevelOperation(level)` - Determina si actualizar o crear
  - `extractIds(documents)` - Extrae IDs de documentos

#### **LevelService** (`back/src/services/levelServices.js`)
- **Responsabilidad única**: Orquestar lógica de negocio de niveles
- Ya NO valida duplicados ni actualiza training directamente
- Solo coordina repositorios y transforma datos

---

### 2. **Dependency Inversion Principle (DIP)**

Las clases de alto nivel (LevelService) ya no dependen de implementaciones concretas (Mongoose models), sino de abstracciones (Repositories).

#### **Repositorios creados/utilizados**:

##### **TrainingRepository** (`back/src/repositories/TrainingRepository.js`)
Abstrae acceso a datos de `Training`:
- `findById(id)` - Busca capacitación por ID
- `findByIdAndUpdate(id, updateData, options)` - Actualiza capacitación
- `pushLevels(trainingId, levelIds)` - Agrega niveles al array
- `setLevels(trainingId, levelIds)` - Reemplaza array de niveles
- `exists(id)` - Verifica existencia

##### **LevelRepository** (`back/src/repositories/LevelRepository.js`)
Ya existía, ahora usado en LevelService:
- `findByTrainingId(trainingId)` - Busca niveles por capacitación
- `findByTrainingAndNumber(trainingId, levelNumber)` - Busca nivel específico
- `countByTrainingId(trainingId)` - Cuenta niveles

#### **Inyección de dependencias en LevelService**:

```javascript
class LevelService extends ILevelService {
  constructor(dependencies = {}) {
    super();
    // Retrocompatibilidad con modelos directos
    this.user = dependencies.UserModel;
    this.training = dependencies.TrainingModel;
    this.levels = dependencies.LevelModel;
    
    // DIP: Inyección de repositorios (con defaults para producción)
    this.levelRepo = dependencies.levelRepo || new LevelRepository();
    this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
  }
}
```

Esto permite:
- **Testing fácil**: inyectar mocks de repositorios
- **Bajo acoplamiento**: cambiar implementación de BD sin tocar el servicio
- **Flexibilidad**: intercambiar repositorios según contexto
- **Retrocompatibilidad**: mantener modelos directos para operaciones no migradas

---

## Beneficios Obtenidos

### ✅ **Testabilidad**
- LevelValidator es puro → tests unitarios triviales
- LevelService puede usar repos mockeados → tests sin BD real

### ✅ **Mantenibilidad**
- Código más claro y enfocado
- Cambios en validación no tocan la BD
- Cambios en BD no tocan lógica de negocio

### ✅ **Reusabilidad**
- LevelValidator puede usarse en otros servicios
- TrainingRepository puede reutilizarse en otros servicios

### ✅ **Extensibilidad (Open/Closed)**
- Agregar nuevas validaciones: crear nuevas funciones en LevelValidator
- Cambiar fuente de datos: crear nuevo repositorio e inyectarlo

---

## Ejemplo de Uso

### Antes (código acoplado):
```javascript
// Validación mezclada con acceso a BD
const training = await this.training.findById(trainingId);
if (!training) throw new Error("Capacitación no encontrada");

const levelNumbers = levels.map(lvl => lvl.levelNumber);
const existingLevels = await this.levels.find({
  trainingId: trainingId,
  levelNumber: { $in: levelNumbers }
});
if (existingLevels.length > 0) {
  throw new Error("Uno o más números de nivel ya existen");
}
```

### Después (separación de responsabilidades):
```javascript
// Verificar existencia (repositorio)
const trainingExists = await this.trainingRepo.exists(trainingId);
if (!trainingExists) throw new Error("Capacitación no encontrada");

// Extraer números (función pura)
const levelNumbers = extractLevelNumbers(levels);

// Buscar duplicados (modelo directo - operación específica de Mongoose)
const existingLevels = await this.levels.find({
  trainingId: trainingId,
  levelNumber: { $in: levelNumbers }
});

// Validar duplicados (función pura)
if (hasDuplicates(existingLevels)) {
  throw new Error(createDuplicateErrorMessage(existingLevels));
}
```

---

## Testing Ejemplo

```javascript
// Test de LevelValidator (sin BD)
import { extractLevelNumbers, hasDuplicates } from '../utils/LevelValidator.js';

test('extrae números de nivel correctamente', () => {
  const levels = [
    { levelNumber: 1, title: 'Nivel 1' },
    { levelNumber: 2, title: 'Nivel 2' },
    { other: 'data' } // Sin levelNumber
  ];
  
  expect(extractLevelNumbers(levels)).toEqual([1, 2]);
});

test('detecta duplicados', () => {
  const existingLevels = [{ levelNumber: 1 }];
  expect(hasDuplicates(existingLevels)).toBe(true);
  expect(hasDuplicates([])).toBe(false);
});

// Test de LevelService (con repos mockeados)
test('obtiene todos los niveles de una capacitación', async () => {
  const mockTrainingRepo = { 
    exists: jest.fn(() => Promise.resolve(true)) 
  };
  const mockLevelRepo = { 
    findByTrainingId: jest.fn(() => Promise.resolve([
      { _id: '1', levelNumber: 1 },
      { _id: '2', levelNumber: 2 }
    ])) 
  };
  
  const service = new LevelService({
    trainingRepo: mockTrainingRepo,
    levelRepo: mockLevelRepo,
    LevelModel: {},
    UserModel: {},
    TrainingModel: {}
  });
  
  const result = await service.getAllLevelsInTraining('training123');
  expect(result).toHaveLength(2);
  expect(mockTrainingRepo.exists).toHaveBeenCalledWith('training123');
  expect(mockLevelRepo.findByTrainingId).toHaveBeenCalledWith('training123');
});
```

---

## Archivos Modificados

### Nuevos archivos:
- `back/src/repositories/TrainingRepository.js` ✨
- `back/src/utils/LevelValidator.js` ✨

### Archivos refactorizados:
- `back/src/services/levelServices.js` ♻️

### Archivos reutilizados:
- `back/src/repositories/LevelRepository.js` (ya existente)

### Sin cambios (retrocompatibles):
- Controladores que usan LevelService (siguen funcionando igual con defaults)
- Todos los endpoints siguen funcionando igual

---

## Comparación con ProgressService

Ambos servicios ahora siguen el mismo patrón arquitectónico:

| Aspecto | ProgressService | LevelService |
|---------|----------------|--------------|
| **SRP** | ScoreCalculator + PathFinder | LevelValidator |
| **DIP** | 3 repositorios (Level, User, Progress) | 2 repositorios (Level, Training) |
| **Testabilidad** | Funciones puras + mocks | Funciones puras + mocks |
| **Retrocompat** | Defaults en constructor | Defaults en constructor + modelos directos |

---

## Decisiones de Diseño

### ¿Por qué mantener modelos directos en algunas operaciones?

```javascript
// Se mantiene modelo directo para:
const newLevels = await this.levels.insertMany(levels);
const existing = await this.levels.find({ trainingId, levelNumber: { $in: levelNumbers } });
```

**Razones**:
1. **insertMany** es una operación específica de Mongoose no disponible en repo básico
2. **Queries complejas** con operadores ($in, $push, etc.) son más claras con modelo directo
3. **Migración gradual**: permite refactorizar sin romper funcionalidad existente
4. **Balance pragmático**: 100% abstracción vs. complejidad innecesaria

### ¿Cuándo usar repositorio vs. modelo directo?

- **Usar repositorio**: Queries simples, operaciones reutilizables, testeo con mocks
- **Usar modelo directo**: Operaciones específicas de Mongoose, queries complejas únicas

---

## Métodos Refactorizados

### `getAllLevelsInTraining(trainingId)`
- ✅ Usa `trainingRepo.exists()` para validar
- ✅ Usa `levelRepo.findByTrainingId()` para obtener niveles

### `addLevelsToTraining(trainingId, levels)`
- ✅ Usa `trainingRepo.exists()` para validar
- ✅ Usa `extractLevelNumbers()` para extraer datos
- ✅ Usa `hasDuplicates()` para validar
- ✅ Usa `createDuplicateErrorMessage()` para mensajes consistentes
- ✅ Usa `extractIds()` para transformar datos
- ✅ Usa `trainingRepo.pushLevels()` para actualizar

### `updateLevelsInTraining(trainingId, levels)`
- ✅ Usa `trainingRepo.exists()` para validar
- ✅ Usa `determineLevelOperation()` para lógica de negocio
- ✅ Usa `levelRepo.findByTrainingAndNumber()` para búsquedas
- ✅ Usa `extractIds()` para transformar datos
- ✅ Usa `trainingRepo.setLevels()` para actualizar

---

## Próximos Pasos Sugeridos

1. **Agregar tests unitarios** para LevelValidator
2. **Agregar tests de integración** para LevelService con repos reales
3. **Migrar operaciones de modelo directo** a repositorio si se vuelven comunes
4. **Aplicar mismo patrón** a otros servicios pendientes
5. **Agregar JSDoc** más detallado en repositorios
6. **Considerar cache** en repositorios para queries frecuentes

