import React, { useState } from 'react';
import RichTextInput, { getPlainTextFromRichText } from './RichTextInput';
import LevelTraining from './LevelTraining';
import LevelBibliography from './LevelBibliography';
import LevelTestEditor from './LevelTestEditor';
import ConfirmActionModal from '../ConfirmActionModal';
import ErrorListModal from '../ErrorListModal';

export default function LevelsEditor(props) {
  const {
    levels,
    selectedLevel,
    setSelectedLevel,
    addLevel,
    removeLevel,
    expandedSubsection,
    setExpandedSubsection,
    activeSection,
    setActiveSection,
    updateLevelField,
    uploadingFiles,
    handleFileUpload,
    handleFileDelete,
    selectedScene,
    setSelectedScene,
    selectedOption,
    setSelectedOption,
    isLevelComplete, // Nueva prop para verificar completitud del nivel
    showWarningModal, // Nueva prop para mostrar modal de advertencia
    onBibliographyTempChange, // Nueva prop para pasar valores temporales al preview
    editingBibliographyIndex,
    setEditingBibliographyIndex,
    bibResetTrigger
  } = props;

  const [showConfirmDeleteLevel, setShowConfirmDeleteLevel] = useState(false);
  const [showErrorList, setShowErrorList] = useState(false);
  const [errorList, setErrorList] = useState([]);

  // Handler local para crear nivel con validación rápida (evita duplicar lógica en CreateTrainingModal)
  const handleAddLevelClick = () => {
    if (!levels || levels.length === 0) {
      addLevel();
      return;
    }

    const lastLevel = levels[levels.length - 1];

    // Extract sub-sections
    const training = lastLevel.training || {};
    const test = lastLevel.test || {};
    const bib = lastLevel.bibliography || [];

    // Helper to get plain text from possible rich text HTML
    const titleText = getPlainTextFromRichText(lastLevel.title || '').trim();
    const isDefaultTitle = titleText && /^nivel\s*\d+/i.test(titleText);
    const hasTitle = titleText && !isDefaultTitle;

    // Bibliography: at least one item
    const hasBibliography = Array.isArray(bib) && bib.length > 0;

    // Training: title, description, url/file, duration
    const trainingTitle = getPlainTextFromRichText(training.title || '').trim();
    const trainingDesc = getPlainTextFromRichText(training.description || '').trim();
    const trainingUrl = training.url && String(training.url).trim();
    const trainingDuration = Number(training.duration) > 0;

    // Test: title, description, url/file
    const testTitle = getPlainTextFromRichText(test.title || '').trim();
    const testDesc = getPlainTextFromRichText(test.description || '').trim();
    const testUrl = test.imageUrl && String(test.imageUrl).trim();

    // Scenes: at least one with id, description and url/file
    const scenes = Array.isArray(test.scenes) ? test.scenes : [];
    const hasCompleteScene = scenes.some(s => {
      const idOk = s && (Number(s.idScene) > 0 || (typeof s.idScene === 'string' && s.idScene.trim() !== '' && !isNaN(Number(s.idScene))));
      const descOk = s && getPlainTextFromRichText(s.description || '').trim();
      const vidOk = s && s.videoUrl && String(s.videoUrl).trim();
      return idOk && descOk && vidOk;
    });

    // Collect missing fields
    const missing = [];
    if (!hasTitle) missing.push('Título del nivel');
    if (!hasBibliography) missing.push('Al menos 1 bibliografía');

    if (!trainingTitle) missing.push('Clase magistral: Título');
    if (!trainingDesc) missing.push('Clase magistral: Descripción');
    if (!trainingUrl) missing.push('Clase magistral: URL o archivo adjunto');
    if (!trainingDuration) missing.push('Clase magistral: Duración (min)');

    if (!testTitle) missing.push('Evaluación: Título');
    if (!testDesc) missing.push('Evaluación: Descripción');
    if (!testUrl) missing.push('Evaluación: URL o archivo adjunto');
    if (!hasCompleteScene) missing.push('Evaluación: Al menos 1 escena completa (id, descripción, url/archivo)');

    if (missing.length > 0) {
      // Preferir ErrorListModal si está disponible en este componente
      setErrorList(missing);
      setShowErrorList(true);
      return;
    }

    addLevel();
  };

  // (Removed debug logs) - previously logged level data for debugging

  return (
    <div className="p-2 md:p-3 bg-white">
      {/* Mostrar título con transición suave */}
      <div 
        className="mb-2 md:mb-3 overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: !expandedSubsection && levels[selectedLevel] ? '200px' : '0',
          opacity: !expandedSubsection && levels[selectedLevel] ? '1' : '0',
          marginBottom: !expandedSubsection && levels[selectedLevel] ? '' : '0'
        }}
      >
        {levels[selectedLevel] && (
          <table className="w-full border-collapse text-xs md:text-sm">
            <tbody>
              <tr>
                <td className="bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 text-xs md:text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
                  Título nivel {levels[selectedLevel].levelNumber}
                </td>
                <td className="px-1.5 md:px-2 py-0.5 md:py-1 border border-gray-300">
                  <RichTextInput
                    value={levels[selectedLevel].title}
                    onChange={(html) => updateLevelField(selectedLevel, 'title', html)}
                    maxLength={100}
                    placeholder="Ingrese el título del nivel (Max caracteres: 100)"
                  />
                  <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 text-right">{getPlainTextFromRichText(levels[selectedLevel].title).length}/100 caracteres</p>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      <ConfirmActionModal
        open={showConfirmDeleteLevel}
        onClose={() => setShowConfirmDeleteLevel(false)}
        title="Eliminar nivel"
        message="¿Confirma que desea eliminar este nivel? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          // Ejecutar la función removeLevel pasada como prop
          try {
            removeLevel();
          } catch (err) {
            console.error('Error eliminando nivel:', err);
          } finally {
            setShowConfirmDeleteLevel(false);
          }
        }}
      />

      <ErrorListModal
        show={showErrorList}
        onClose={() => setShowErrorList(false)}
        errors={errorList}
        title="No puede crear un nuevo nivel"
        messageText="Complete los siguientes campos del nivel anterior:"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3 mb-2 md:mb-3 p-1.5 md:p-2 bg-gray-100 border border-gray-300">
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            <select 
              className="border-1 border-green-600 rounded-sm px-1.5 md:px-2 py-0.5 md:py-1 text-xs md:text-sm font-medium focus:ring-1 focus:ring-green-200 focus:border-green-500 cursor-pointer bg-white hover:border-green-700 transition-colors w-[80px] md:w-[90px]" 
              value={selectedLevel} 
              onChange={(e) => {
                setSelectedLevel(Number(e.target.value));
                setActiveSection('niveles');
              }}
            >
              {levels.map((l, idx) => (
                <option key={idx} value={idx}>{`Nivel ${l.levelNumber}`}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={handleAddLevelClick} className="bg-white hover:bg-gray-50 text-gray-700 border border-green-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm text-xs md:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">+ Nuevo</button>
            <button
              type="button"
              onClick={() => {
                if (levels.length > 1) {
                  setShowConfirmDeleteLevel(true);
                }
              }}
              disabled={levels.length <= 1}
              className={`py-0.5 md:py-1 rounded-sm text-xs md:text-sm font-medium transition-colors border w-[70px] md:w-[80px] flex-shrink-0 ${
                levels.length > 1
                  ? 'bg-white hover:bg-red-50 text-red-600 border-red-600 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
            >
              - Eliminar
            </button>
          </div>
        </div>

        <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setExpandedSubsection('bibliografia');
              setActiveSection('bibliografia');
            }}
            className={`px-1.5 md:px-2 py-0.5 md:py-1 text-xs md:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border-r border-gray-300 ${
              expandedSubsection === 'bibliografia'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Bibliografía
          </button>
          <button
            type="button"
            onClick={() => {
              setExpandedSubsection('training');
              setActiveSection('training');
              if (setEditingBibliographyIndex) {
                setEditingBibliographyIndex(null);
              }
            }}
            className={`px-1.5 md:px-2 py-0.5 md:py-1 text-xs md:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border-r border-gray-300 ${
              expandedSubsection === 'training'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Clase magistral
          </button>
          <button
            type="button"
            onClick={() => {
              setExpandedSubsection('test');
              setActiveSection('test');
              if (setEditingBibliographyIndex) {
                setEditingBibliographyIndex(null);
              }
            }}
            className={`px-1.5 md:px-2 py-0.5 md:py-1 text-xs md:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expandedSubsection === 'test'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Evaluación
          </button>
        </div>
      </div>

      <div>
        {expandedSubsection === 'training' && levels[selectedLevel] && (
          <LevelTraining
            level={levels[selectedLevel]}
            levelIndex={selectedLevel}
            updateLevelField={updateLevelField}
            uploadingFiles={uploadingFiles}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            showWarningModal={showWarningModal}
          />
        )}

        {expandedSubsection === 'bibliografia' && (
          <LevelBibliography
            bibliography={levels[selectedLevel]?.bibliography || []}
            updateLevelField={(fieldVal) => updateLevelField(selectedLevel, 'bibliography', fieldVal)}
            levelIndex={selectedLevel}
            uploadingFiles={uploadingFiles}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            showWarningModal={showWarningModal}
            onTempValuesChange={onBibliographyTempChange}
            editingIndex={editingBibliographyIndex}
            setEditingIndex={setEditingBibliographyIndex}
            resetTrigger={bibResetTrigger}
          />
        )}

        {expandedSubsection === 'test' && levels[selectedLevel] && (
          <LevelTestEditor
            level={levels[selectedLevel]}
            levelIndex={selectedLevel}
            updateLevelField={updateLevelField}
            selectedScene={selectedScene}
            setSelectedScene={setSelectedScene}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            showWarningModal={showWarningModal}
            setActiveSection={setActiveSection}
          />
        )}
      </div>
    </div>
  );
}
