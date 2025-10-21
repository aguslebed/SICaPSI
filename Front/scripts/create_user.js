/*
Usage / Cómo usar el script

Descripción:
- Script Node.js que crea usuarios llamando al endpoint POST /users/register del backend.

Ejecución (PowerShell / Windows):
- Desde la raíz del repo:
  node .\Front\scripts\create_user.js --count 1
- Desde la carpeta Front\scripts:
  node .\create_user.js --count 1

Flags (opciones):
- --baseUrl <url>       Base URL del API. Por defecto usa la variable de entorno API_BASE o http://localhost:4000
- --count <n>          Cantidad de usuarios a crear (por defecto 1)
- --startIndex <n>     Índice inicial para sufijos numéricos (por defecto 1)
- --prefix <prefix>    Prefijo para los emails generados (por defecto 'auto')
- --domain <domain>    Dominio para los emails (por defecto 'example.com')
- --password <pwd>     Contraseña a usar (por defecto 'Pass1234!')
- --role <role>        Si se pasa, se incluye `role` en el payload (opcional)
- --random true|1      Si se pasa true, genera sufijos aleatorios en lugar de índices
- --email <pattern>    Plantilla de email que puede contener %i% como marcador del índice (ej: "user%i%@test.local")
- --count 0            Modo prueba: no hace peticiones (útil para validar sintaxis)

Ejemplos:
  node .\Front\scripts\create_user.js --count 3 --prefix test --domain local.test
  node .\Front\scripts\create_user.js --count 5 --random true --prefix demo
  node .\Front\scripts\create_user.js --count 4 --email "nuevo%i%@miempresa.test"

Notas importantes:
- El script envía POST a `${BASE}/users/register`. Si esa ruta permite registros públicos, funciona sin autenticación.
- Si necesitas crear usuarios protegidos por rol (solo admin), el script debe autenticarse primero (POST /auth/login) para obtener cookies o token — puedo añadir esa opción si lo quieres.
- El script usa axios; `axios` ya está listado en `Front/package.json`.
*/
import axios from 'axios';

function parseArgs() {
  const argv = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a) continue;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        opts[key] = next;
        i++;
      } else {
        opts[key] = 'true';
      }
    }
  }
  return opts;
}

const opts = parseArgs();

const BASE = opts.baseUrl || process.env.API_BASE || 'http://localhost:4000';
const COUNT = parseInt(opts.count || '1', 10);
const START = parseInt(opts.startIndex || '1', 10);
const PREFIX = opts.prefix || 'auto';
const PASSWORD = opts.password || 'Pass1234!';
const DOMAIN = opts.domain || 'example.com';
const ROLE = opts.role; // optional
const RANDOM = opts.random === 'true' || opts.random === '1';

function makeRandomString(len = 6) {
  return Math.random().toString(36).slice(2, 2 + len);
}

function makeUser(i) {
  const idx = START + i;
  const uniq = RANDOM ? makeRandomString(6) : String(idx);
  const email = (opts.email && opts.email.includes('%i%'))
    ? opts.email.replace(/%i%/g, uniq)
    : `${PREFIX}${uniq}@${DOMAIN}`;

  // Minimal payload matching Front/src/Pages/Register/Register.jsx
  const user = {
    firstName: `User${uniq}`,
    lastName: `Auto${uniq}`,
    documentType: opts.documentType || 'DNI',
    documentNumber: opts.documentNumber || String(10000000 + idx),
    birthDate: opts.birthDate || '1990-01-01',
    email,
    postalCode: opts.postalCode || '0000',
    address: opts.address || 'Generated Street',
    addressNumber: opts.addressNumber || '1',
    apartment: opts.apartment || '',
    province: opts.province || 'Buenos Aires',
    city: opts.city || 'Ciudad',
    areaCode: opts.areaCode || '11',
    phone: opts.phone || String(60000000 + idx),
    password: opts.password || PASSWORD,
  };

  if (ROLE) user.role = ROLE;

  return user;
}

async function createUser(user) {
  try {
    const url = `${BASE.replace(/\/$/, '')}/users/register`;
    const res = await axios.post(url, user, {
      headers: { 'Content-Type': 'application/json' },
      // Note: withCredentials used in the frontend; most public registration endpoints don't require cookies.
    });
    return { ok: true, data: res.data };
  } catch (err) {
    if (err.response) {
      return { ok: false, status: err.response.status, data: err.response.data };
    }
    return { ok: false, error: err.message };
  }
}

async function main() {
  if (COUNT <= 0) {
    console.log('COUNT <= 0: nothing to do.');
    return;
  }

  console.log(`Creating ${COUNT} user(s) against ${BASE}/users/register` + (ROLE ? ` as role=${ROLE}` : ''));

  const results = [];
  for (let i = 0; i < COUNT; i++) {
    const user = makeUser(i);
    // Print a brief preview (email) to know what's being created
    console.log(`-> Creating: ${user.email}`);
    const r = await createUser(user);
    if (r.ok) {
      console.log(`   ✓ Created: ${user.email}`);
    } else {
      console.log(`   ✗ Failed: ${user.email} ->`, r.status || r.error || r.data || r);
    }
    results.push({ user: user.email, result: r });
  }

  const success = results.filter(r => r.result.ok).length;
  const fail = results.length - success;
  console.log(`Done. success=${success} fail=${fail}`);
}

// Run
main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
