# SICaPSI - Sistema de Capacitación Psicoeducativa

SICaPSI es una plataforma integral para la gestión, desarrollo y control de capacitaciones educativas. Diseñada para operar con múltiples roles de usuario, la aplicación permite un flujo detallado desde la creación de contenido educativo hasta su aprobación, distribución y análisis de progreso.

El sistema se destaca por su capacidad de crear **evaluaciones interactivas basadas en video**, permitiendo experiencias de aprendizaje inmersivas y ramificadas.

---

## Perfiles de Usuario y Funcionalidades

El sistema está diseñado para 4 perfiles principales, cada uno con un set específico de permisos y responsabilidades:

### 1. Administrador
Es el encargado de la gestión operativa del contenido y los usuarios.
- **Gestión de Usuarios**: Puede dar de alta, modificar y gestionar alumnos y profesores.
- **Creación de Capacitaciones**: Diseña los cursos, define sus niveles, carga la bibliografía y configura los exámenes interactivos.
- **Inscripciones**: Asigna profesores a cargo y matricula grupos de alumnos a las capacitaciones.
- **Solicitud de Aprobación**: Los cursos creados nacen como "Borradores" y deben ser enviados a los Directivos para su revisión.

### 2. Directivo
Es el rol de supervisión y control de calidad.
- **Aprobación de Contenidos**: Revisa las capacitaciones que están en estado "Pendiente". Tiene la potestad de **Aprobarlas** (haciéndolas visibles para los alumnos) o **Rechazarlas** (devolviéndolas al administrador con un motivo de rechazo para su corrección).
- **Estadísticas Globales**: Accede a reportes generales sobre el rendimiento de las capacitaciones y el uso del sistema.
- **Control de Vigencia**: Puede deshabilitar capacitaciones manualmente si es necesario.

### 3. Capacitador (Profesor)
Es el responsable del seguimiento pedagógico.
- **Seguimiento de Alumnos**: Puede ver el progreso detallado de sus alumnos en las capacitaciones asignadas.
- **Corrección y Feedback**: (Funcionalidad según implementación) Supervisa los resultados de las evaluaciones.
- **Acceso a Contenidos**: Puede visualizar el contenido de los cursos que imparte para dar soporte.

### 4. Alumno
El usuario final del sistema de aprendizaje.
- **Cursada**: Accede a sus capacitaciones asignadas.
- **Desarrollo de Niveles**: Avanza progresivamente accediendo a:
    1. **Bibliografía**: Material de lectura.
    2. **Clase Magistral**: Video educativo principal.
    3. **Examen Interactivo**: Evaluación práctica para aprobar el nivel.
- **Historial**: Consulta sus calificaciones y progresos.

---

## Workflow del Sistema

El ciclo de vida de una capacitación sigue un flujo riguroso para asegurar la calidad del contenido:

1.  **Fase de Diseño (Administrador)**:
    *   El Admin crea una capacitación en estado **Borrador**.
    *   Carga la información general, imagen de portada y fechas de vigencia.
    *   Diseña los **Niveles** (Bibliografía + Video + Examen).
    *   Al terminar, selecciona "Enviar a Aprobar".

2.  **Fase de Validación (Directivo)**:
    *   El curso pasa a estado **Pendiente**.
    *   El Directivo recibe la notificación y revisa el contenido.
    *   *Si rechaza*: El curso vuelve a estado **Rechazado** con una nota explicativa. El Admin debe corregir y reenviar.
    *   *Si aprueba*: El curso pasa a estado **Activa**.

3.  **Fase de Ejecución (Alumno/Capacitador)**:
    *   Los alumnos matriculados ven el curso en su panel.
    *   Comienzan a cursar nivel por nivel.
    *   El Capacitador monitorea el avance.

4.  **Fase de Finalización**:
    *   Un sistema automático (Scheduler) deshabilita las capacitaciones cuya fecha de fin ha expirado, pasándolas a estado **Finalizada**.

---

## Sistema de Evaluaciones Interactivas (Videos Cortos)

Una de las características más potentes de SICaPSI es su motor de evaluaciones. A diferencia de un examen tradicional de preguntas y respuestas, SICaPSI utiliza un **Grafo de Escenas de Video**.

### ¿Cómo funciona?

Cada examen dentro de un nivel se compone de una red de **Escenas**.
1.  **La Escena**: Es la unidad mínima. Contiene un video corto (que plantea una situación, un problema o un diálogo) y una descripción.
2.  **Toma de Decisiones**: Al finalizar el video de la escena, al alumno se le presentan **Opciones**.
3.  **Ramificación**:
    *   Cada opción elegida lleva a una **Escena Siguiente** diferente. Esto permite crear historias no lineales.
    *   *Ejemplo*: Si el alumno elige "Llamar al supervisor", ve el video A. Si elige "Ignorar el problema", ve el video B (que puede mostrar una consecuencia negativa).
4.  **Puntaje**: Cada opción tiene asociado un puntaje. El camino que el alumno elija determinará su nota final.
5.  **Bonus y Final**: Algunas escenas pueden otorgar puntos extra ("Bonus") o marcar el fin de la evaluación ("Last One").

Este sistema permite evaluar no solo conocimientos teóricos, sino **criterio, resolución de problemas y habilidades blandas** en situaciones simuladas realistas.

---

## Aspectos Técnicos

El proyecto fue desarrollado por alumnos de tercer año de la carrera de Técnico Superior en Análisis de Sistemas en el Instituto Superior Juan XXIII.

### Stack Tecnológico
*   **Frontend**: React + Vite (Single Page Application rápida y reactiva).
*   **Backend**: Node.js + Express.
*   **Base de Datos**: MongoDB (NoSQL para flexibilidad en los esquemas de exámenes y usuarios).
*   **Multimedia**: Sistema de gestión de archivos para soporte de imágenes, documentos y videos.

---

## Instalación y Desarrollo (Local)

### Requisitos previos
*   Node.js instalado.
*   MongoDB corriendo localmente o una URI de conexión remota.

### Backend
1.  Navegar a la carpeta `back/`.
2.  Crear un archivo `.env` con la variable `MONGODB_URI` apuntando a tu base de datos.
3.  Instalar dependencias:
    ```powershell
    npm install
    ```
4.  Iniciar servidor:
    ```powershell
    npm run dev
    ```

### Frontend
1.  Navegar a la carpeta `Front/`.
2.  Instalar dependencias:
    ```powershell
    npm install
    ```
3.  Iniciar cliente Vite:
    ```powershell
    npm run dev
    ```

### Migraciones (Si aplica)
Si necesitas actualizar bases de datos antiguas (ej. campo `trainingId` en mensajería):
1.  En `back/`, ejecutar:
    ```powershell
    npm run migrate:backfill-trainingId
    ```
