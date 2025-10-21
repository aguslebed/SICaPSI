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
    setSelectedOption
  } = props;

  return (
    <div className="p-3 bg-white">
      {levels[selectedLevel] && (
        <div className="mb-3">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
                  Título
                </td>
                <td className="px-2 py-1.5 border border-gray-300">
                  <input
                    value={levels[selectedLevel].title}
                    onChange={(e) => updateLevelField(selectedLevel, 'title', e.target.value)}
                    maxLength={50}
                    className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                    placeholder="Ingrese el titulo del nivel (Max caracter: 50)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 p-2 bg-gray-100 border border-gray-300">
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="border border-gray-300 rounded-sm px-2 py-1 text-sm font-medium focus:ring-1 focus:ring-green-200 focus:border-green-500 cursor-pointer bg-white hover:border-gray-400 transition-colors" 
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
          <button onClick={addLevel} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-sm text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">+ Nuevo</button>
          <button
            type="button"
            onClick={() => {
              if (levels.length > 1) {
                removeLevel();
              }
            }}
            disabled={levels.length <= 1}
            className={`px-2 py-1 rounded-sm text-sm font-medium whitespace-nowrap transition-colors ${
              levels.length > 1
                ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                : 'bg-gray-100 text-gray-400 border border-dashed border-gray-300 cursor-not-allowed'
            }`}
          >
            - Eliminar
          </button>
        </div>

        <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => {
              setExpandedSubsection('bibliografia');
              setActiveSection('bibliografia');
            }}
            className={`px-2 py-1 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border-r border-gray-300 ${
              expandedSubsection === 'bibliografia'
                ? 'bg-green-600 text-white'
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
            className={`px-2 py-1 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border-r border-gray-300 ${
              expandedSubsection === 'training'
                ? 'bg-green-600 text-white'
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
            className={`px-2 py-1 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expandedSubsection === 'test'
                ? 'bg-green-600 text-white'
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
          />
        )}
      </div>
    </div>
  );
}
