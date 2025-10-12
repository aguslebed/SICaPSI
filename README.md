# SICaPSI
Repositorio creado para la organizacion, desarrollo y control del software SICaPSI, realizado por los alumnos de tercer año de la carrera de Técnico Superior en Análisis de Sistemas en el Instituto Superior Juan XXIII

## Desarrollo (local)

- Backend
	- Variables de entorno: crear un archivo `.env` en `back/` con `MONGODB_URI` apuntando a tu base de datos.
	- Instalar dependencias: ejecutar en PowerShell desde `back/`:
		- `npm install`
	- Ejecutar en desarrollo:
		- `npm run dev`

- Frontend
	- Instalar dependencias: ejecutar en PowerShell desde `Front/`:
		- `npm install`
	- Correr en desarrollo (Vite):
		- `npm run dev`

## Migración: backfill de trainingId en Mensajería

Se introdujo el campo `trainingId` como requerido en `PrivateMessage` para que cada curso (training) tenga su propia bandeja. Para mensajes antiguos que no tienen este campo, hay un script de migración que intenta inferir y completar el `trainingId` basándose en el/los trainings asignados de emisor y destinatario.

Pasos (Windows PowerShell):

1) Configurar `.env` en `back/` con `MONGODB_URI` válido.
2) Instalar dependencias en `back/` (si no lo hiciste): `npm install`
3) Ejecutar la migración:
	 - `npm run migrate:backfill-trainingId`

El script mostrará cuántos mensajes fueron actualizados y cuántos omitidos por no poder inferir el curso. Los omitidos permanecerán visibles en todas las bandejas por compatibilidad temporal.

Sugerencia posterior a la migración:
- Revisar y asociar manualmente los omitidos si es necesario.
- Una vez no existan mensajes sin `trainingId`, se puede eliminar el fallback de compatibilidad del Front (mostrarlos en todos los trainings) y filtrar estrictamente por `trainingId`.

