import React from 'react';
import LevelTraining from './LevelTraining';
import LevelBibliography from './LevelBibliography';
import LevelTestEditor from './LevelTestEditor';

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
    onBibliographyTempChange // Nueva prop para pasar valores temporales al preview
  } = props;

  // Log para debug
  React.useEffect(() => {
    if (levels && levels[selectedLevel]) {
      console.log(`🔍 LevelsEditor - Nivel ${selectedLevel} bibliografía:`, levels[selectedLevel].bibliography);
      console.log(`🔍 LevelsEditor - Nivel ${selectedLevel} completo:`, levels[selectedLevel]);
    }
  }, [levels, selectedLevel]);

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
                  <input
                    value={levels[selectedLevel].title}
                    onChange={(e) => updateLevelField(selectedLevel, 'title', e.target.value)}
                    maxLength={50}
                    className="w-full border-0 px-0 py-0.5 md:py-1 text-xs md:text-sm placeholder:text-xs md:placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                    placeholder="Ingrese el titulo del nivel (Max caracter: 50)"
                  />
                  <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 text-right">{levels[selectedLevel].title.length}/50 caracteres</p>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

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
            <button onClick={addLevel} className="bg-white hover:bg-gray-50 text-gray-700 border border-green-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm text-xs md:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">+ Nuevo</button>
            <button
              type="button"
              onClick={() => {
                if (levels.length > 1) {
                  removeLevel();
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
          />
        )}
      </div>
    </div>
  );
}
