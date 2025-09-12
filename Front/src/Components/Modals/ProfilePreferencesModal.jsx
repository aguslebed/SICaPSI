import { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { useUser } from '../../Context/UserContext';
import { updateUser, getMe } from '../../API/Request';

// Modal de Perfil y Preferencias del Alumno
// Secciones: Datos principales, Contacto, Generales
const ProfilePreferencesModal = ({ open, onClose }) => {
  const { userData, setUserData } = useUser();
  if (!open) return null;

  const user = userData?.user || userData; // fallback si la forma varía
  const userId = user?._id;

  // Tabs: 'perfil', 'datos', 'contacto', 'generales'
  const [activeTab, setActiveTab] = useState('datos');

  // Formularios locales
  const [form, setForm] = useState({
    // Datos principales
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    birthDate: user?.birthDate ? String(user.birthDate).substring(0,10) : '',
    // Contacto
    city: user?.city || '',
    province: user?.province || '',
    country: user?.country || '',
    postalCode: user?.postalCode || '',
    // Generales (preferencias locales; no hay campos en backend explícitos)
    showMyData: Boolean(user?.showMyData) || false,
    preferredLanguage: user?.preferredLanguage || 'Español',
    timezone: user?.timezone || 'America/Argentina/Buenos_Aires',
    unreadHighlight: user?.unreadHighlight || 'Desde el último acceso',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Patch para el backend solo de campos existentes en el modelo User
      // Ver `back/src/formatters/UserResponseFormatter.js` para los campos válidos
      const patch = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        birthDate: form.birthDate || null,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        // Nota: `country` y preferencias pueden no existir en el backend; si no existen, se pueden manejar solo localmente
      };

      if (!userId) throw new Error('No se encontró el identificador del usuario');

      await updateUser(userId, patch);

      // Actualizar contexto con datos frescos del backend
      const fresh = await getMe();
      setUserData(fresh);

      // Guardar preferencias locales en sessionStorage (o localStorage) si no hay backend
      const prefs = {
        showMyData: form.showMyData,
        preferredLanguage: form.preferredLanguage,
        timezone: form.timezone,
        unreadHighlight: form.unreadHighlight,
      };
      sessionStorage.setItem('user_prefs', JSON.stringify(prefs));

      setSuccess('Datos actualizados');
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Perfil y preferencias</h2>
        </div>

        <div className="flex gap-6">
          {/* Lado izquierdo: avatar y menú */}
          <aside className="w-48 border-r pr-4">
            <div className="flex flex-col items-center mb-6">
              <img
                src={user?.profileImage || '/images/alumno-avatar.png'}
                alt={user?.firstName || 'Usuario'}
                className="w-20 h-20 rounded-full border"
              />
              <div className="mt-2 text-center font-medium">
                {user?.firstName || 'Alumno'}
              </div>
            </div>

            <nav className="space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 ${activeTab === 'datos' ? 'bg-blue-100 font-medium' : ''}`}
                onClick={() => setActiveTab('datos')}
              >
                Datos principales
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 ${activeTab === 'contacto' ? 'bg-blue-100 font-medium' : ''}`}
                onClick={() => setActiveTab('contacto')}
              >
                Contacto
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 ${activeTab === 'generales' ? 'bg-blue-100 font-medium' : ''}`}
                onClick={() => setActiveTab('generales')}
              >
                Generales
              </button>
            </nav>
          </aside>

          {/* Contenido derecho */}
          <section className="flex-1">
            {activeTab === 'datos' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Datos principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-700">Nombre</span>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.firstName} onChange={e => setField('firstName', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-700">Apellido</span>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.lastName} onChange={e => setField('lastName', e.target.value)} />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm text-gray-700">Email</span>
                    <input type="email" className="mt-1 w-full border rounded px-3 py-2" value={form.email} onChange={e => setField('email', e.target.value)} />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm text-gray-700">Fecha de nacimiento</span>
                    <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={form.birthDate} onChange={e => setField('birthDate', e.target.value)} />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'contacto' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-700">Localidad</span>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.city} onChange={e => setField('city', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-700">Provincia</span>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.province} onChange={e => setField('province', e.target.value)} />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm text-gray-700">País</span>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.country} onChange={e => setField('country', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-700">Código Postal</span>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.postalCode} onChange={e => setField('postalCode', e.target.value)} />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'generales' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Generales</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="h-4 w-4" checked={form.showMyData} onChange={e => setField('showMyData', e.target.checked)} />
                    <span>Mostrar todos mis datos al resto de los usuarios</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm text-gray-700">Idioma preferido</span>
                      <select className="mt-1 w-full border rounded px-3 py-2" value={form.preferredLanguage} onChange={e => setField('preferredLanguage', e.target.value)}>
                        <option>Español</option>
                        <option>Inglés</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-700">Zona horaria</span>
                      <select className="mt-1 w-full border rounded px-3 py-2" value={form.timezone} onChange={e => setField('timezone', e.target.value)}>
                        <option value="America/Argentina/Buenos_Aires">Argentina, Buenos Aires</option>
                        <option value="America/Santiago">Chile, Santiago</option>
                        <option value="America/Bogota">Colombia, Bogotá</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm text-gray-700">Resaltar contenido no leído</span>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={form.unreadHighlight} onChange={e => setField('unreadHighlight', e.target.value)}>
                      <option>Desde el último acceso</option>
                      <option>Desde siempre</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {(error || success) && (
              <div className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
                {error || success}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer" onClick={onClose} disabled={saving}>Cancelar</button>
              <button className={`px-4 py-2 rounded text-white ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ProfilePreferencesModal;
