import React, { useState } from 'react';

const Contacto = () => {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    motivo: '',
    mensaje: '',
  });

  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Aquí podrías usar axios para enviar el formulario a tu backend
      // await axios.post('/api/contacto', form);

      setEnviado(true);
      setForm({ nombre: '', email: '', motivo: '', mensaje: '' });
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      alert('Hubo un problema al enviar el mensaje');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contacto</h2>

        {enviado ? (
          <div className="text-green-600 font-medium text-center">
            ¡Tu mensaje fue enviado correctamente!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Motivo</label>
              <select
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="consulta">Consulta general</option>
                <option value="soporte">Soporte técnico</option>
                <option value="sugerencia">Sugerencia</option>
              </select>
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Mensaje</label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows="4"
                className="w-full border rounded px-3 py-2"
                required
              ></textarea>
            </div>

            {/* Botón */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Enviar mensaje
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contacto;