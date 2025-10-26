# Refactorización SOLID de ProgressService

## Patrones SOLID Implementados

### 1. **Single Responsibility Principle (SRP)**

Cada componente tiene una única responsabilidad bien definida:

#### **ScoreCalculator** (`back/src/utils/ScoreCalculator.js`)
- **Responsabilidad única**: Cálculos puros de puntajes
- **Funciones puras** sin dependencias externas:
  - `calculateMaxPossibleScore(scenes)` - Calcula puntaje máximo de un nivel
  - `calculateUserScore(dbScenes, userScenes)` - Calcula puntos ganados por usuario
  - `isApproved(earned, total, threshold)` - Determina si aprobó
  - `compareAttempts(attempt1, attempt2)` - Compara dos intentos

#### **PathFinder** (`back/src/utils/PathFinder.js`)
- **Responsabilidad única**: Algoritmo de camino óptimo
- **Función pura** sin side effects:
  - `findOptimalPath(scenes)` - Recorre grafo y encuentra camino con máximo puntaje

#### **ProgressService** (`back/src/services/ProgressService.js`)
- **Responsabilidad única**: Orquestar lógica de negocio de progreso
- Ya NO calcula puntajes ni recorre grafos (delegado a utils)
- Solo coordina repositorios y transformaciones de datos

---

### 2. **Dependency Inversion Principle (DIP)**

Las clases de alto nivel (ProgressService) ya no dependen de implementaciones concretas (Mongoose models), sino de abstracciones (Repositories).

#### **Repositorios creados**:

##### **LevelRepository** (`back/src/repositories/LevelRepository.js`)
Abstrae acceso a datos de `Level`:
- `findById(id)`
- `findByTrainingId(trainingId)`
- `findByTrainingAndNumber(trainingId, levelNumber)`
- `countByTrainingId(trainingId)`
- `aggregateTotalsByTraining()`

##### **UserRepository** (`back/src/repositories/UserRepository.js`)
Abstrae acceso a datos de `User`:
- `findById(id, selectFields)`
- `countStudentsByTraining(trainingId)`

##### **ProgressRepository** (`back/src/repositories/ProgressRepository.js`)
Abstrae acceso a datos de `UserLevelProgress`:
- `create(data)`
- `findByUserAndLevel(userId, levelId)`
- `findByUserAndTraining(userId, trainingId)`
- `findCompletedByTrainingAndLevel(trainingId, levelId)`
- `findRecentCompletedWithUser(trainingId, levelId, limit)`
- `countCompletedAndApproved(userId, trainingId)`
- `deleteByUserAndLevel(userId, levelId)`
- Métodos de agregación

#### **Inyección de dependencias en ProgressService**:

```javascript
class ProgressService {
  constructor(dependencies = {}) {
    this.levelRepo = dependencies.levelRepo || new LevelRepository();
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.progressRepo = dependencies.progressRepo || new ProgressRepository();
  }
}
```

Esto permite:
- **Testing fácil**: inyectar mocks de repositorios
- **Bajo acoplamiento**: cambiar implementación de BD sin tocar el servicio
- **Flexibilidad**: intercambiar repositorios según contexto

---

## Beneficios Obtenidos

### ✅ **Testabilidad**
- ScoreCalculator y PathFinder son funciones puras → tests unitarios triviales
- ProgressService puede usar repos mockeados → tests sin BD real

### ✅ **Mantenibilidad**
- Código más claro y enfocado
- Cambios en lógica de scoring no tocan la BD
- Cambios en BD no tocan lógica de negocio

### ✅ **Reusabilidad**
- ScoreCalculator puede usarse en otros servicios
- PathFinder puede reutilizarse para análisis o visualizaciones

### ✅ **Extensibilidad (Open/Closed)**
- Agregar nuevos tipos de cálculo: crear nuevas funciones en ScoreCalculator
- Cambiar fuente de datos: crear nuevo repositorio e inyectarlo

---

## Ejemplo de Uso

### Antes (código acoplado):
```javascript
// Lógica de scoring mezclada con acceso a BD
const level = await Level.findById(levelId);
let totalPossible = 0;
for (const scene of level.test.scenes) {
  // ... 15 líneas de cálculo inline ...
}
```

### Después (separación de responsabilidades):
```javascript
// Obtener datos (repositorio)
const level = await this.levelRepo.findById(levelId);

// Calcular (función pura)
const totalPossible = calculateMaxPossibleScore(level.test.scenes);

// Obtener camino óptimo (función pura)
const pathResult = findOptimalPath(scenes);
```

---

## Testing Ejemplo

```javascript
// Test de ScoreCalculator (sin BD)
import { calculateMaxPossibleScore } from '../utils/ScoreCalculator.js';

test('calcula puntaje máximo correctamente', () => {
  const scenes = [
    { idScene: 1, options: [{ points: 10 }, { points: 5 }], bonus: 2 },
    { idScene: 2, options: [{ points: 8 }], bonus: 0 }
  ];
  
  expect(calculateMaxPossibleScore(scenes)).toBe(20); // (10+2) + 8
});

// Test de ProgressService (con repos mockeados)
test('obtiene progreso de usuario', async () => {
  const mockLevelRepo = { countByTrainingId: jest.fn(() => 5) };
  const mockProgressRepo = { countCompletedAndApproved: jest.fn(() => 3) };
  
  const service = new ProgressService({
    levelRepo: mockLevelRepo,
    progressRepo: mockProgressRepo
  });
  
  const result = await service.getProgressForSingleTraining('userId', 'trainingId');
  expect(result.progressPercent).toBe(60); // 3/5 = 60%
});
```

---

## Archivos Modificados

### Nuevos archivos:
- `back/src/utils/ScoreCalculator.js` ✨
- `back/src/utils/PathFinder.js` ✨
- `back/src/repositories/LevelRepository.js` ✨
- `back/src/repositories/UserRepository.js` ✨
- `back/src/repositories/ProgressRepository.js` ✨

### Archivos refactorizados:
- `back/src/services/ProgressService.js` ♻️

### Sin cambios (retrocompatibles):
- `back/src/controllers/progressController.js` (usa ProgressService con defaults)
- Todos los endpoints siguen funcionando igual

---

## Próximos Pasos Sugeridos

1. **Agregar tests unitarios** para ScoreCalculator y PathFinder
2. **Agregar tests de integración** para ProgressService con repos reales
3. **Implementar cache** en repositorios para queries frecuentes
4. **Aplicar mismo patrón** a otros servicios (TrainingService, UserService)
5. **Documentar APIs** con JSDoc o Swagger
