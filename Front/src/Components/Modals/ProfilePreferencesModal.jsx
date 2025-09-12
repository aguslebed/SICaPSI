import { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { useUser } from '../../Context/UserContext';
import { updateUser, getMe, uploadProfileImage, resolveImageUrl, changePassword } from '../../API/Request';
import { User as UserIcon, Settings as SettingsIcon, ChevronDown, ChevronUp } from 'lucide-react';

// Modal de Perfil y Preferencias del Alumno
// Secciones: Datos principales, Contacto, Generales
const ProfilePreferencesModal = ({ open, onClose }) => {
  const { userData, setUserData } = useUser();
  if (!open) return null;

  const user = userData?.user || userData; // fallback si la forma varía
  const userId = user?._id;

  // Tabs: 'perfil', 'datos', 'contacto', 'generales'
  const [activeTab, setActiveTab] = useState('datos');
  const [perfilOpen, setPerfilOpen] = useState(true);
  const [prefsOpen, setPrefsOpen] = useState(true);

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

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

  const fileInputId = 'profile-image-input';
  const onPickImage = () => {
    const input = document.getElementById(fileInputId);
    if (input) input.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      // Optimistic preview
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      await uploadProfileImage(userId, file);
      const fresh = await getMe();
      setUserData(fresh);
      setSuccess('Imagen actualizada');
    } catch (err) {
      setError(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setError('Completá todos los campos de contraseña');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setError('La confirmación no coincide');
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      setPwdSaving(true);
      await changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
        confirmPassword: pwdForm.confirmPassword
      });
      setSuccess('Contraseña actualizada');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} overlayClassName="" panelClassName="p-0">
      {/* Header */}
      <div className="bg-[#0a82b6] text-white px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold flex items-center justify-between">
        <span>Perfil y preferencias</span>
      </div>

      <div className="flex flex-col md:flex-row bg-white" style={{ minHeight: 420 }}>
        {/* Sidebar (oculta en mobile) */}
        <aside className="hidden md:block md:w-72 bg-gray-50 border-r">
          {/* Avatar y nombre */}
          <div className="flex flex-col items-center gap-2 p-4 border-b">
            <img
              src={previewUrl || resolveImageUrl(user?.profileImage) || '/images/alumno-avatar.png'}
              alt={user?.firstName || 'Usuario'}
              className="w-24 h-24 rounded-full border object-cover"
            />
            <div className="font-semibold text-gray-800 text-sm sm:text-base">{user?.firstName || 'Juan'}</div>
            <button
              type="button"
              onClick={onPickImage}
              className={`mt-1 text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-200 cursor-pointer ${uploading ? 'opacity-60 cursor-wait' : ''}`}
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : 'Cambiar imagen'}
            </button>
          </div>

          {/* Menú de secciones */}
          <nav className="p-2 space-y-2">
            {/* Grupo Perfil */}
            <div>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
                onClick={() => setPerfilOpen(v => !v)}
                aria-expanded={perfilOpen}
              >
                <span className="inline-flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Perfil
                </span>
                {perfilOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {perfilOpen && (
                <div className="mt-2 space-y-1">
                  <button
                    className={`cursor-pointer w-full text-left px-4 py-2 text-sm ${activeTab === 'datos' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'} transition rounded-md`}
                    onClick={() => setActiveTab('datos')}
                  >
                    Datos principales
                  </button>
                  <button
                    className={`cursor-pointer w-full text-left px-4 py-2 text-sm ${activeTab === 'contacto' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'} transition rounded-md`}
                    onClick={() => setActiveTab('contacto')}
                  >
                    Contacto
                  </button>
                </div>
              )}
            </div>

            {/* Grupo Preferencias */}
            <div className="mt-4">
              <button
                type="button"
                className="cursor-pointer  w-full flex items-center justify-between px-3 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
                onClick={() => setPrefsOpen(v => !v)}
                aria-expanded={prefsOpen}
              >
                <span className="inline-flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Preferencias
                </span>
                {prefsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {prefsOpen && (
                <div className="mt-2 space-y-1">
                  <button
                    className={`cursor-pointer  w-full text-left px-4 py-2 text-sm ${activeTab === 'generales' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'} transition rounded-md`}
                    onClick={() => setActiveTab('generales')}
                  >
                    Generales
                  </button>
                  <button
                    className={`cursor-pointer  w-full text-left px-4 py-2 text-sm ${activeTab === 'seguridad' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'} transition rounded-md`}
                    onClick={() => setActiveTab('seguridad')}
                  >
                    Seguridad
                  </button>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Contenido */}
        <section className="flex-1 p-4 sm:p-6">
          {/* Barra de título de sección */}
          <div className="bg-[#0a82b6] text-white px-3 sm:px-4 py-2 rounded-md mb-4 text-sm sm:text-base font-semibold flex items-center gap-2">
            {activeTab === 'datos' && <UserIcon className="w-4 h-4" />}
            {activeTab === 'contacto' && <UserIcon className="w-4 h-4" />}
            {activeTab === 'generales' && <SettingsIcon className="w-4 h-4" />}
            {activeTab === 'seguridad' && <SettingsIcon className="w-4 h-4" />}
            <span>
              {activeTab === 'datos' && 'Datos principales'}
              {activeTab === 'contacto' && 'Contacto'}
              {activeTab === 'generales' && 'Generales'}
              {activeTab === 'seguridad' && 'Seguridad'}
            </span>
          </div>

          {/* Input de archivo único (oculto) */}
          <input id={fileInputId} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

          {/* Avatar móvil (solo visible en pantallas pequeñas) */}
          <div className="md:hidden flex items-center gap-4 mb-4">
            <img
              src={previewUrl || resolveImageUrl(user?.profileImage) || '/images/alumno-avatar.png'}
              alt={user?.firstName || 'Usuario'}
              className="w-16 h-16 rounded-full border object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">{user?.firstName || 'Usuario'}</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPickImage}
                  className={`text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer ${uploading ? 'opacity-60 cursor-wait' : ''}`}
                  disabled={uploading}
                >
                  {uploading ? 'Subiendo...' : 'Cambiar imagen'}
                </button>
              </div>
            </div>
          </div>

          {/* Navegación de tabs en mobile */}
          <div className="md:hidden flex gap-2 mb-4">
            <button className={`px-3 py-2 rounded-md text-sm ${activeTab === 'datos' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`} onClick={() => setActiveTab('datos')}>Datos</button>
            <button className={`px-3 py-2 rounded-md text-sm ${activeTab === 'contacto' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`} onClick={() => setActiveTab('contacto')}>Contacto</button>
            <button className={`px-3 py-2 rounded-md text-sm ${activeTab === 'generales' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`} onClick={() => setActiveTab('generales')}>Generales</button>
            <button className={`px-3 py-2 rounded-md text-sm ${activeTab === 'seguridad' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`} onClick={() => setActiveTab('seguridad')}>Seguridad</button>
          </div>

          {/* Campos según sección */}
          {activeTab === 'datos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <label className="block">
                <span className="text-sm text-gray-700">Nombre</span>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.firstName} onChange={e => setField('firstName', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Apellido</span>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.lastName} onChange={e => setField('lastName', e.target.value)} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-gray-700">Email</span>
                <input type="email" className="mt-1 w-full border rounded-md px-3 py-2" value={form.email} onChange={e => setField('email', e.target.value)} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-gray-700">Fecha de nacimiento</span>
                <input type="date" className="mt-1 w-full border rounded-md px-3 py-2" value={form.birthDate} onChange={e => setField('birthDate', e.target.value)} />
              </label>
            </div>
          )}

          {activeTab === 'contacto' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <label className="block">
                <span className="text-sm text-gray-700">Localidad</span>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.city} onChange={e => setField('city', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Provincia</span>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.province} onChange={e => setField('province', e.target.value)} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-gray-700">País</span>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.country} onChange={e => setField('country', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Código Postal</span>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.postalCode} onChange={e => setField('postalCode', e.target.value)} />
              </label>
            </div>
          )}

          {activeTab === 'generales' && (
            <div className="space-y-6">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4" checked={form.showMyData} onChange={e => setField('showMyData', e.target.checked)} />
                <span>Mostrar todos mis datos al resto de los usuarios</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-sm text-gray-700">Idioma preferido</span>
                  <select className="mt-1 w-full border rounded-md px-3 py-2" value={form.preferredLanguage} onChange={e => setField('preferredLanguage', e.target.value)}>
                    <option>Español</option>
                    <option>Inglés</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">Zona horaria</span>
                  <select className="mt-1 w-full border rounded-md px-3 py-2" value={form.timezone} onChange={e => setField('timezone', e.target.value)}>
                    <option value="America/Argentina/Buenos_Aires">Argentina, Buenos Aires</option>
                    <option value="America/Santiago">Chile, Santiago</option>
                    <option value="America/Bogota">Colombia, Bogotá</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-gray-700">Resaltar contenido no leído</span>
                <select className="mt-1 w-full border rounded-md px-3 py-2" value={form.unreadHighlight} onChange={e => setField('unreadHighlight', e.target.value)}>
                  <option>Desde el último acceso</option>
                  <option>Desde siempre</option>
                </select>
              </label>
            </div>
          )}

          {(error || success) && (
            <div className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
              {error || success}
            </div>
          )}

          {/* Contenido Seguridad */}
          {activeTab === 'seguridad' && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700">Contraseña actual</span>
                <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" value={pwdForm.currentPassword} onChange={e => setPwdForm(v => ({ ...v, currentPassword: e.target.value }))} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Nueva contraseña</span>
                <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" value={pwdForm.newPassword} onChange={e => setPwdForm(v => ({ ...v, newPassword: e.target.value }))} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Confirmar nueva contraseña</span>
                <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" value={pwdForm.confirmPassword} onChange={e => setPwdForm(v => ({ ...v, confirmPassword: e.target.value }))} />
              </label>
              <div className="flex justify-end">
                <button
                  className={`px-5 py-2 rounded-full text-white ${pwdSaving ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} cursor-pointer`}
                  onClick={handleChangePassword}
                  disabled={pwdSaving}
                >
                  {pwdSaving ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </div>
          )}

          {/* Footer con botón Guardar verde (solo si no es seguridad) */}
          {activeTab !== 'seguridad' && (
            <div className="mt-6 sm:mt-8 flex justify-end">
              <button
                className={`px-5 py-2 rounded-full text-white ${saving ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} cursor-pointer`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </section>
      </div>
    </ModalWrapper>
  );
};

export default ProfilePreferencesModal;
