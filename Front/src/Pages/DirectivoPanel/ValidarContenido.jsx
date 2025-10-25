import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/Student/NavBar';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import { listPendingTrainingRevisions, approveTrainingRevision, rejectTrainingRevision, getTrainingById, resolveImageUrl } from '../../API/Request';
import { FiEye } from 'react-icons/fi';
import './DirectivoPanel.css';

export default function ValidarContenido() {
  const [loading, setLoading] = useState(false);
  const [contenidos, setContenidos] = useState([]);
  const [error, setError] = useState('');
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    console.log('🔁 ValidarContenido mounted - cargando revisiones pendientes...');
    loadPendingContent();
  }, []);

  const normalizeId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'object') {
      if (value._id) {
        return normalizeId(value._id);
      }
      if (typeof value.toHexString === 'function') {
        return value.toHexString();
      }
      if (typeof value.toString === 'function') {
        const str = value.toString();
        return str !== '[object Object]' ? str : '';
      }
    }
    return '';
  };

  const loadPendingContent = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 listPendingTrainingRevisions() -> petición al backend...');
      const items = await listPendingTrainingRevisions();
      // Mostrar estructura recibida para debugging
      console.log('📥 Revisiones pendientes recibidas (raw):', items);
      try {
        // si viene envuelto en { items } o { data }
        if (!items) {
          console.warn('⚠️ listPendingTrainingRevisions devolvió falsy:', items);
        }
        setContenidos(items || []);
      } catch (parseErr) {
        console.error('❌ Error procesando items de revisiones:', parseErr, items);
        setContenidos([]);
      }
    } catch (error) {
      console.error('Error cargando contenidos:', error, 'responseData:', error?.response?.data);
      setError('Error al cargar el contenido pendiente');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevisualizar = async (revision) => {
    setSelectedRevision(revision);
    setShowRejectModal(false);
    setRejectReason('');
    setCurrentTraining(null);

    const normalizedTrainingId = normalizeId(revision?.trainingId);

    console.log('🔎 handlePrevisualizar - revision seleccionada:', revision);
    console.log('🔎 normalizedTrainingId:', normalizedTrainingId);

    if (!normalizedTrainingId) {
      console.warn('⚠️ Revisión sin trainingId válido:', revision);
      return;
    }

    try {
      setLoading(true);
      const current = await getTrainingById(normalizedTrainingId);
      console.log('📄 Capacitación vigente cargada (getTrainingById):', current);
      setCurrentTraining(current);
    } catch (error) {
      console.error('Error obteniendo capacitación vigente:', error, 'responseData:', error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!selectedRevision) return;
    try {
      setLoading(true);
      const trainingId = normalizeId(selectedRevision.trainingId);
      const revisionId = normalizeId(selectedRevision._id);
      if (!trainingId || !revisionId) {
        throw new Error('Identificadores inválidos para la revisión seleccionada');
      }
      console.log('✅ Enviando aprobación de revisión', {
        trainingId,
        revisionId,
        revision: selectedRevision
      });
      await approveTrainingRevision(trainingId, revisionId);
      setToast({ show: true, message: 'Cambios aprobados correctamente', type: 'success' });
      setSelectedRevision(null);
      setCurrentTraining(null);
      await loadPendingContent();
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error aprobando revisión:', error);
      const detailMessage = Array.isArray(error?.details) && error.details.length
        ? `${error.message}: ${error.details.map(d => d.message || '').filter(Boolean).join(' | ')}`
        : (error.message || 'Error al aprobar la revisión');
      setToast({ show: true, message: detailMessage, type: 'error' });
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
    if (!selectedRevision) return;
    try {
      setLoading(true);
      const trainingId = normalizeId(selectedRevision.trainingId);
      const revisionId = normalizeId(selectedRevision._id);
      if (!trainingId || !revisionId) {
        throw new Error('Identificadores inválidos para la revisión seleccionada');
      }
      console.log('🚫 Enviando rechazo de revisión', {
        trainingId,
        revisionId,
        reason: rejectReason,
        revision: selectedRevision
      });
      await rejectTrainingRevision(trainingId, revisionId, rejectReason);
      setToast({ show: true, message: 'Revisión rechazada', type: 'success' });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRevision(null);
      setCurrentTraining(null);
      await loadPendingContent();
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error rechazando revisión:', error);
      const detailMessage = Array.isArray(error?.details) && error.details.length
        ? `${error.message}: ${error.details.map(d => d.message || '').filter(Boolean).join(' | ')}`
        : (error.message || 'Error al rechazar la revisión');
      setToast({ show: true, message: detailMessage, type: 'error' });
      setError('Error al rechazar la revisión');
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedRevision(null);
    setCurrentTraining(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSubmittedByLabel = (revision) => {
    if (!revision) return 'Usuario desconocido';
    const metadataName = revision.metadata?.submittedByName;
    if (metadataName) return metadataName;

    const snapshotAuthor = revision.snapshot?.training?.createdByName;
    if (snapshotAuthor) return snapshotAuthor;

    const submittedBy = revision.submittedBy;
    if (submittedBy && typeof submittedBy === 'object') {
      const firstName = submittedBy.firstName ?? submittedBy.names ?? '';
      const lastName = submittedBy.lastName ?? submittedBy.surnames ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
      if (submittedBy.email) return submittedBy.email;
    }
    if (typeof submittedBy === 'string' && submittedBy.trim()) {
      return submittedBy;
    }
    return 'Usuario desconocido';
  };

  const snapshotTraining = selectedRevision?.snapshot?.training ?? {};
  const snapshotLevels = Array.isArray(selectedRevision?.snapshot?.levels)
    ? selectedRevision.snapshot.levels
    : [];

  const renderLevels = (levels) => {
    if (!Array.isArray(levels) || levels.length === 0) {
      return <div style={{ color: '#757575', fontStyle: 'italic' }}>Sin niveles cargados</div>;
    }
    return (
      <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0', color: '#424242' }}>
        {levels.map((level) => {
          const key = level._id || level.id || level.levelId || level.title || level.name;
          return (
            <li key={key} style={{ marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 'bold' }}>{level.title || level.name || 'Nivel'}</span>
              {level.description ? ` — ${level.description}` : ''}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderMedia = (training) => {
    if (!training) return null;
    const hasImage = Boolean(training.image);
    const hasVideo = Boolean(training.videoUrl);
    if (!hasImage && !hasVideo) return null;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1.2rem 0' }}>
        {hasImage && (
          <img
            src={resolveImageUrl(training.image)}
            alt={training.title || 'Capacitación'}
            style={{ width: '320px', height: '180px', borderRadius: '12px', objectFit: 'cover', background: '#eee' }}
            onError={e => { e.target.onerror = null; e.target.src = '/images/default-image.png'; }}
          />
        )}
        {hasVideo && (
          <video
            src={training.videoUrl}
            controls
            style={{ width: '320px', height: '180px', borderRadius: '12px', background: '#eee', objectFit: 'cover' }}
          />
        )}
      </div>
    );
  };

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: '1.5rem' }}>Contenidos</h2>
          {error && (
            <div style={{ background: '#fdecea', color: '#c62828', padding: '0.9rem 1.1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #f8bbd0' }}>
              {error}
            </div>
          )}
          <div style={{ background: '#1976d2', borderRadius: '8px 8px 0 0', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', padding: '0.7rem 0.5rem', marginBottom: '-1px' }}>
            <div style={{ flex: 2, textAlign: 'left', paddingLeft: '1rem' }}>Título</div>
            <div style={{ flex: 2, textAlign: 'left' }}>Subtítulo / Descripción</div>
            <div style={{ flex: 2, textAlign: 'left' }}>Creado por</div>
            <div style={{ flex: 1, textAlign: 'left' }}>Fecha</div>
            <div style={{ flex: 1, textAlign: 'left' }}>Estado</div>
            <div style={{ flex: 1, textAlign: 'left' }}>Acciones</div>
          </div>
          <div style={{ background: 'white', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minHeight: '60px' }}>
            {contenidos.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#757575' }}>No hay contenidos pendientes de validación</div>
            ) : (
              contenidos.map((revision, idx) => {
                const snapshot = revision.snapshot?.training ?? {};
                const title = snapshot.title || '(Sin título)';
                const description = snapshot.subtitle || snapshot.description || 'Sin descripción';
                const submittedAt = revision.submittedAt || revision.createdAt;
                const status = revision.status || 'pending';
                const statusLabel = status === 'approved' ? 'Aprobado' : status === 'rejected' ? 'Rechazado' : 'Pendiente';
                const statusColor = status === 'approved' ? '#4caf50' : status === 'rejected' ? '#f44336' : '#ff9800';

                return (
                  <div key={revision._id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 0.5rem', borderBottom: idx === contenidos.length - 1 ? 'none' : '1px solid #e0e0e0', fontSize: '1rem', background: 'white' }}>
                    <div style={{ flex: 2, paddingLeft: '1rem', fontWeight: 'bold' }}>{title}</div>
                    <div style={{ flex: 2 }}>{description}</div>
                    <div style={{ flex: 2 }}>{getSubmittedByLabel(revision)}</div>
                    <div style={{ flex: 1 }}>{submittedAt ? formatDate(submittedAt) : 'Sin fecha'}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ background: statusColor, color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 'bold' }}>{statusLabel}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handlePrevisualizar(revision)}
                        style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiEye style={{ fontSize: '1.2rem' }} /> Previsualizar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Modal de previsualización o rechazo */}
        {showRejectModal ? (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '16px', maxWidth: 480, width: '95%', padding: '2rem 2rem 1.5rem 2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.12)', position: 'relative', textAlign: 'center' }}>
              <h2 style={{ color: '#f44336', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Rechazar revisión</h2>
              <div style={{ color: '#757575', fontSize: '1rem', marginBottom: '1.2rem' }}>
                {selectedRevision?.snapshot?.training?.title || 'Capacitación'}
              </div>
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
                  onClick={handleConfirmReject}
                  style={{ background: '#4caf50', color: 'white', border: 'none', borderRadius: '24px', padding: '0.7rem 2.2rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        ) : selectedRevision && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', maxWidth: '960px', width: '96%', padding: '2.2rem 2rem 2.4rem 2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.12)', position: 'relative' }}>
              <button
                onClick={closeModals}
                style={{ position: 'absolute', top: 18, left: 18, background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '8px', padding: '0.45rem 1.4rem', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '96px' }}
              >
                Volver
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {snapshotTraining.title || 'Capacitación'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', color: '#616161', fontSize: '0.95rem' }}>
                  <span>Enviada por {getSubmittedByLabel(selectedRevision)}</span>
                  {selectedRevision.submittedAt && (
                    <span>Fecha: {formatDate(selectedRevision.submittedAt)}</span>
                  )}
                  {selectedRevision.metadata?.notes && (
                    <span>Notas: {selectedRevision.metadata.notes}</span>
                  )}
                </div>
              </div>

              {renderMedia(snapshotTraining)}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 320px', background: '#f5f5f5', borderRadius: '12px', padding: '1.4rem 1.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1976d2' }}>Versión propuesta</h3>
                  <div style={{ marginTop: '0.9rem', fontSize: '1rem' }}>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <span style={{ fontWeight: 'bold', color: '#424242' }}>Subtítulo:</span>
                      <div style={{ color: '#424242' }}>{snapshotTraining.subtitle || snapshotTraining.shortDescription || 'Sin subtítulo'}</div>
                    </div>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <span style={{ fontWeight: 'bold', color: '#424242' }}>Descripción:</span>
                      <div style={{ color: '#424242', whiteSpace: 'pre-wrap' }}>{snapshotTraining.description || 'Sin descripción'}</div>
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#424242' }}>Niveles:</span>
                      {renderLevels(snapshotLevels)}
                    </div>
                  </div>
                </div>

                <div style={{ flex: '1 1 320px', background: '#fafafa', borderRadius: '12px', padding: '1.4rem 1.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#424242' }}>Versión vigente</h3>
                  {currentTraining ? (
                    <div style={{ marginTop: '0.9rem', fontSize: '1rem' }}>
                      <div style={{ marginBottom: '0.8rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Subtítulo:</span>
                        <div>{currentTraining.subtitle || currentTraining.shortDescription || 'Sin subtítulo'}</div>
                      </div>
                      <div style={{ marginBottom: '0.8rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Descripción:</span>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{currentTraining.description || 'Sin descripción'}</div>
                      </div>
                      {renderMedia(currentTraining)}
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Niveles:</span>
                        {renderLevels(currentTraining.levels)}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.9rem', color: '#757575', fontStyle: 'italic' }}>
                      Esta capacitación aún no tiene una versión publicada.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowRejectModal(true)}
                  style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '24px', padding: '0.75rem 2.4rem', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                >
                  Rechazar revisión
                </button>
                <button
                  onClick={handleAprobar}
                  style={{ background: '#4caf50', color: 'white', border: 'none', borderRadius: '24px', padding: '0.75rem 2.4rem', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                >
                  Aprobar cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      {loading && <LoadingOverlay />}
    </>
  );
}
