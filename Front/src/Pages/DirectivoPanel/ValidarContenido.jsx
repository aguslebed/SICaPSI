import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/Student/NavBar';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import { getPendingContent, resolveImageUrl, updateTraining } from '../../API/Request';
import { FiEye } from 'react-icons/fi';
import './DirectivoPanel.css';

export default function ValidarContenido() {
  const [loading, setLoading] = useState(false);
  const [contenidos, setContenidos] = useState([]);
  const [error, setError] = useState('');
  const [selectedContenido, setSelectedContenido] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadPendingContent();
  }, []);

  const loadPendingContent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingContent();
      const items = Array.isArray(data) ? data : (data?.items || []);
      setContenidos(items || []);
    } catch (error) {
      console.error('Error cargando contenidos:', error);
      setError('Error al cargar el contenido pendiente');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevisualizar = (contenido) => {
    setSelectedContenido(contenido);
    setShowModal(true);
  };

  const handleAprobar = async () => {
    try {
      setLoading(true);
      // Approving: mark active and clear pendingApproval and any previous rejection info
      await updateTraining(selectedContenido._id, { isActive: true, pendingApproval: false, rejectedBy: null, rejectionReason: '' });
      setToast({ show: true, message: 'Capacitación aprobada exitosamente', type: 'success' });
      setSelectedContenido(null);
      await loadPendingContent();
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      setToast({ show: true, message: 'Error al aprobar la capacitación', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setToast({ show: true, message: 'Debe colocar un motivo para rechazar', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }
    try {
      setLoading(true);
      // Send rejectionReason field to match backend model and clear pendingApproval
      await updateTraining(selectedContenido._id, { isActive: false, pendingApproval: false, rejectionReason: rejectReason });
      setToast({ show: true, message: 'Capacitación rechazada exitosamente', type: 'success' });
      setShowModal(false);
      setShowRejectModal(false);
      setRejectReason('');
      await loadPendingContent();
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error rechazando capacitación:', error);
      setToast({ show: true, message: 'Error al rechazar la capacitación', type: 'error' });
      setError('Error al rechazar la capacitación');
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowModal(false);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedContenido(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAuthorName = (author) => {
    if (!author) return 'Usuario desconocido';
    return `${author.firstName} ${author.lastName}`;
  };

  const renderHtml = (value) => ({ __html: value || '' });

  return (
    <>
      <NavBar />
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#4caf50' : '#f44336',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
        }}>
          {toast.message}
        </div>
      )}
      <main className="admin-container">
        <div className="admin-content-wrapper">
          <h1 className="admin-title">Contenidos</h1>
          <div style={{ background: '#1976d2', borderRadius: 0, color: 'white', display: 'flex', padding: '0.7rem 0.5rem', marginBottom: '-1px' }}>
            <div style={{ flex: 2, textAlign: 'left', paddingLeft: '1rem' }}>Título</div>
            <div style={{ flex: 2, textAlign: 'left' }}>Subtítulo / Descripción</div>
            <div style={{ flex: 2, textAlign: 'left' }}>Creado por</div>
            <div style={{ flex: 1, textAlign: 'left' }}>Fecha</div>
            <div style={{ flex: 1, textAlign: 'left' }}>Estado</div>
            <div style={{ flex: 1, textAlign: 'left' }}>Acciones</div>
          </div>
          <div className="admin-table-wrapper registros-table" style={{ background: 'white', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minHeight: '60px' }}>
            {contenidos.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#757575' }}>No hay contenidos pendientes de validación</div>
              ) : (
              contenidos.map((contenido, idx) => (
                <div key={contenido._id} className="registros-row" style={{ display: 'flex', alignItems: 'center', padding: '1rem 0.5rem', borderBottom: idx === contenidos.length - 1 ? 'none' : '1px solid #e0e0e0' }}>
                  <div style={{ flex: 2, paddingLeft: '1rem' }} dangerouslySetInnerHTML={renderHtml(contenido.title)} />
                  <div style={{ flex: 2 }} dangerouslySetInnerHTML={renderHtml(contenido.subtitle || contenido.description)} />
                  <div style={{ flex: 2 }}>{getAuthorName(contenido.createdBy)}</div>
                  <div style={{ flex: 1 }}>{formatDate(contenido.createdAt)}</div>
                  <div style={{ flex: 1 }}>
                      <span style={{ 
                        background: contenido.pendingApproval ? '#ffa726' : (contenido.isActive ? '#1976d2' : '#757575'),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}>
                        {contenido.pendingApproval ? 'Pendiente' : (contenido.isActive ? 'Activo' : 'Inactivo')}
                      </span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedContenido(contenido)}
                      style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FiEye style={{ fontSize: '1.2rem' }} /> Previsualizar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Modal de previsualización o rechazo */}
        {showRejectModal ? (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '16px', maxWidth: 480, width: '95%', padding: '2rem 2rem 1.5rem 2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.12)', position: 'relative', textAlign: 'center' }}>
              <h2 style={{ color: '#f44336', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Clase rechazada</h2>
              <div style={{ color: '#757575', fontSize: '1rem', marginBottom: '1.2rem' }}>Contenido · Asignación de clase rechazada</div>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Ingrese el motivo del rechazo..."
                style={{ width: '100%', minHeight: '80px', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '0.7rem', fontSize: '1rem', marginBottom: '1.5rem', resize: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  style={{ background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '24px', padding: '0.7rem 2.2rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!rejectReason.trim()) {
                      setToast({ show: true, message: 'Debe colocar un motivo para rechazar', type: 'error' });
                      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
                      return;
                    }
                    setLoading(true);
                    try {
                      // Use rejectionReason field name expected by the backend
                      await updateTraining(selectedContenido._id, { isActive: false, pendingApproval: false, rejectionReason: rejectReason });
                      setToast({ show: true, message: 'Capacitación rechazada exitosamente', type: 'success' });
                      setShowRejectModal(false);
                      setSelectedContenido(null);
                      setRejectReason('');
                      await loadPendingContent();
                      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
                    } catch (error) {
                      console.error('Error en enviar rechazo:', error);
                      setToast({ show: true, message: 'Error al rechazar la capacitación', type: 'error' });
                      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{ background: '#4caf50', color: 'white', border: 'none', borderRadius: '24px', padding: '0.7rem 2.2rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        ) : selectedContenido && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '16px', maxWidth: 500, width: '95%', padding: '2rem 2rem 1.5rem 2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.12)', position: 'relative' }}>
              {/* Botón Volver */}
              <button
                onClick={() => setSelectedContenido(null)}
                style={{ position: 'absolute', top: 18, left: 18, background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '8px', padding: '0.4rem 1.2rem', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '90px' }}
              >
                Volver
              </button>
              {/* Imagen/video de la capacitación */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem', marginTop: '2.2rem' }}>
                {selectedContenido.image && (
                  <img
                    src={resolveImageUrl(selectedContenido.image)}
                    alt={selectedContenido.title}
                    style={{ width: '320px', height: '180px', borderRadius: '12px', objectFit: 'cover', background: '#eee' }}
                    onError={e => { e.target.onerror = null; e.target.src = '/images/default-image.png'; }}
                  />
                )}
                {selectedContenido.videoUrl && (
                  <video
                    src={selectedContenido.videoUrl}
                    controls
                    style={{ width: '320px', height: '180px', borderRadius: '12px', background: '#eee', objectFit: 'cover' }}
                  />
                )}
              </div>
              {/* Estado */}
              <div style={{ textAlign: 'center', marginBottom: '0.7rem' }}>
                <span style={{ 
                  background: selectedContenido.pendingApproval ? '#ffa726' : (selectedContenido.isActive ? '#1976d2' : '#757575'), 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  fontWeight: 'bold'
                }}>
                  {selectedContenido.pendingApproval ? 'Pendiente' : (selectedContenido.isActive ? 'Activo' : 'Inactivo')}
                </span>
              </div>
              {/* Título */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                <span dangerouslySetInnerHTML={renderHtml(selectedContenido.title)} />
              </div>
              {/* Subtítulo/Descripción corta */}
              <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#757575', fontSize: '1.1rem', marginBottom: '1rem' }}>
                <span dangerouslySetInnerHTML={renderHtml(selectedContenido.subtitle || selectedContenido.shortDescription)} />
              </div>
              {/* Descripción larga */}
              <div style={{ textAlign: 'center', color: '#333', fontSize: '1rem', marginBottom: '1.5rem' }}>
                <span dangerouslySetInnerHTML={renderHtml(selectedContenido.description)} />
              </div>
              {/* Botones de acción */}
              {selectedContenido.pendingApproval && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.2rem' }}>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '24px', padding: '0.7rem 2.2rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    Rechazar &rarr;
                  </button>
                  <button
                    onClick={async () => {
                      await handleAprobar();
                      setSelectedContenido(null);
                    }}
                    style={{ background: '#4caf50', color: 'white', border: 'none', borderRadius: '24px', padding: '0.7rem 2.2rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    Aprobar &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      {loading && <LoadingOverlay />}
    </>
  );
}
