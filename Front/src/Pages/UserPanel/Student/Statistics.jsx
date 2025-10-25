import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTotalTrainingProgress, getAllLevelsInTraining, getLevelStatistics } from '../../../API/Request';
import { useUser } from '../../../context/UserContext';
import { BarChart2, Users, BookOpen, TrendingUp, Award, ChevronDown, ChevronUp, Target, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function Statistics() {
    const { idTraining } = useParams();
    const { userData } = useUser();
    const [progressData, setProgressData] = useState(null);
    const [levels, setLevels] = useState([]);
    const [levelStats, setLevelStats] = useState({});
    const [expandedLevels, setExpandedLevels] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener la capacitación actual del contexto
    const training = userData?.training?.find(c => c._id === idTraining);

    useEffect(() => {
        if (idTraining && userData?.user?._id) {
            fetchStatistics();
        }
    }, [idTraining, userData?.user?._id]);

    const fetchStatistics = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('📊 Fetching statistics for trainingId:', idTraining);
            
            // Obtener datos de progreso de la capacitación actual
            const response = await getTotalTrainingProgress(idTraining, userData.user._id);
            const data = response?.data || response || {};
            setProgressData(data);
            console.log('✅ Progress data loaded:', data);

            // Intentar obtener niveles del training actual desde userData
            const trainingLevels = training?.levels || [];
            
            if (Array.isArray(trainingLevels) && trainingLevels.length > 0) {
                console.log('✅ Levels loaded from training context:', trainingLevels);
                setLevels(trainingLevels);
            } else {
                // Fallback: intentar obtener niveles desde el backend
                console.log('📚 Fetching levels from backend for trainingId:', idTraining);
                try {
                    const levelsResponse = await getAllLevelsInTraining(idTraining);
                    console.log('📦 Levels response:', levelsResponse);
                    
                    // Manejar diferentes formatos de respuesta
                    const levelsData = Array.isArray(levelsResponse) 
                        ? levelsResponse 
                        : (levelsResponse?.levels || levelsResponse?.data || []);
                    
                    console.log('✅ Levels data:', levelsData);
                    setLevels(levelsData);
                } catch (levelsError) {
                    console.warn('⚠️ No se pudieron cargar niveles desde backend:', levelsError.message);
                    // No fallar completamente si no se pueden cargar los niveles
                    setLevels([]);
                }
            }
        } catch (err) {
            console.error('❌ Error obteniendo estadísticas:', err);
            console.error('❌ Error details:', {
                message: err.message,
                stack: err.stack
            });
            setError(err.message || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const toggleLevel = async (levelId) => {
        setExpandedLevels(prev => ({
            ...prev,
            [levelId]: !prev[levelId]
        }));

        // Si no tenemos las estadísticas de este nivel, cargarlas
        if (!levelStats[levelId] && !expandedLevels[levelId]) {
            try {
                const stats = await getLevelStatistics(idTraining, levelId);
                setLevelStats(prev => ({
                    ...prev,
                    [levelId]: stats?.data || stats
                }));
            } catch (err) {
                console.error('Error cargando estadísticas del nivel:', err);
            }
        }
    };

    // Extraer datos del progreso
    const totalStudents = progressData?.totalUsers || 0;
    const totalLevels = progressData?.totalLevels || 0;
    const totalLevelsCompleted = progressData?.totalLevelsCompleted || 0;
    const averagePercent = progressData?.averagePercent || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <p className="text-red-800 font-semibold">Error al cargar estadísticas</p>
                    <p className="text-red-600 mt-2">{error}</p>
                    <button
                        onClick={fetchStatistics}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!training) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Capacitación no encontrada</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    Estadísticas de la Capacitación
                </h1>
                <p className="text-gray-600 mt-2">
                    {training.title || 'Capacitación actual'}
                </p>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Users className="text-blue-600" size={32} />}
                    title="Estudiantes Inscritos"
                    value={totalStudents}
                    bgColor="bg-blue-50"
                />
                <StatCard
                    icon={<BookOpen className="text-green-600" size={32} />}
                    title="Total Niveles"
                    value={totalLevels}
                    bgColor="bg-green-50"
                />
                <StatCard
                    icon={<Award className="text-purple-600" size={32} />}
                    title="Niveles Completados por alumnos"
                    value={totalLevelsCompleted}
                    bgColor="bg-purple-50"
                />
                <StatCard
                    icon={<TrendingUp className="text-orange-600" size={32} />}
                    title="Promedio de Progreso"
                    value={`${averagePercent}%`}
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Gráfico de progreso detallado */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Progreso General
                </h2>
                
                {totalLevels === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>Esta capacitación aún no tiene niveles</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Barra de progreso grande */}
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progreso promedio de todos los estudiantes</span>
                                <span className="font-semibold text-lg">{averagePercent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                    style={{ width: `${Math.min(averagePercent, 100)}%` }}
                                >
                                    {averagePercent > 10 && (
                                        <span className="text-sm text-white font-bold">{averagePercent}%</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de barras comparativo */}
                     

                        {/* Información adicional */}
                        <div className="pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoCard
                                label="Tasa de Completitud"
                                value={totalLevels > 0 ? `${Math.round((totalLevelsCompleted / (totalLevels * totalStudents)) * 100)}%` : '0%'}
                                description="Porcentaje total de niveles completados vs posibles"
                            />
                            <InfoCard
                                label="Niveles por Estudiante"
                                value={totalStudents > 0 ? (totalLevelsCompleted / totalStudents).toFixed(1) : '0'}
                                description="Promedio de niveles completados por alumno"
                            />
                            <InfoCard
                                label="Pendientes"
                                value={Math.max(0, (totalLevels * totalStudents) - totalLevelsCompleted)}
                                description="Total de niveles aún por completar"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Estadísticas por nivel */}
            {levels.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Estadísticas por Nivel
                    </h2>
                    <div className="space-y-4">
                        {levels.map((level) => (
                            <LevelStatisticsAccordion
                                key={level._id}
                                level={level}
                                stats={levelStats[level._id]}
                                isExpanded={expandedLevels[level._id]}
                                onToggle={() => toggleLevel(level._id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente de tarjeta estadística
function StatCard({ icon, title, value, bgColor }) {
    return (
        <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="ml-4">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// Componente de barra individual
function BarItem({ label, value, maxValue, color }) {
    const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
    
    return (
        <div className="flex-1 flex flex-col items-center max-w-xs">
            <div className="w-full flex items-end justify-center h-32 mb-2">
                <div
                    className={`w-full ${color} rounded-t-lg transition-all duration-500 flex items-start justify-center pt-2`}
                    style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '30px' : '0' }}
                >
                    <span className="text-sm text-white font-bold">{value}</span>
                </div>
            </div>
            <p className="text-sm text-gray-700 font-medium text-center">{label}</p>
        </div>
    );
}

// Componente de tarjeta informativa
function InfoCard({ label, value, description }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    );
}

// Componente acordeón para estadísticas de nivel
function LevelStatisticsAccordion({ level, stats, isExpanded, onToggle }) {
    const isLoading = isExpanded && !stats;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header del acordeón */}
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <BookOpen className="text-blue-600" size={24} />
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                            Nivel {level.levelNumber}: {level.title || 'Sin título'}
                        </h3>
                        {stats && (
                            <p className="text-sm text-gray-600 mt-1">
                                {stats.studentsCompleted} de {stats.totalStudents} completaron • {stats.approvalRate}% aprobación
                            </p>
                        )}
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="text-gray-600" size={24} />
                ) : (
                    <ChevronDown className="text-gray-600" size={24} />
                )}
            </button>

            {/* Contenido expandible */}
            {isExpanded && (
                <div className="px-6 py-6 bg-white border-t border-gray-200">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : stats ? (
                        <div className="space-y-6">
                            {/* Métricas principales */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <MetricCard
                                    icon={<Users size={20} />}
                                    label="Completaron"
                                    value={stats.studentsCompleted}
                                    total={stats.totalStudents}
                                    color="text-blue-600"
                                />
                                <MetricCard
                                    icon={<CheckCircle2 size={20} />}
                                    label="Aprobados"
                                    value={stats.studentsApproved}
                                    total={stats.studentsCompleted}
                                    color="text-green-600"
                                />
                                <MetricCard
                                    icon={<XCircle size={20} />}
                                    label="Desaprobados"
                                    value={stats.studentsCompleted - stats.studentsApproved}
                                    total={stats.studentsCompleted}
                                    color="text-red-600"
                                />
                                <MetricCard
                                    icon={<Target size={20} />}
                                    label="Promedio"
                                    value={`${stats.averagePercentage}%`}
                                    subtitle={`${stats.averageScore}/${stats.maxPossibleScore} pts`}
                                    color="text-purple-600"
                                />
                                <MetricCard
                                    icon={<TrendingUp size={20} />}
                                    label="Tasa Aprobación"
                                    value={`${stats.approvalRate}%`}
                                    color="text-orange-600"
                                />
                            </div>

                            {/* Visualización aprobados vs desaprobados */}
                            {stats.totalStudents > 0 && (
                                <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 rounded-lg p-6 border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-4">Distribución de Resultados (sobre total de estudiantes)</h4>
                                    <div className="space-y-4">
                                        {/* Barra aprobados */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 size={18} className="text-green-600" />
                                                    <span className="text-sm font-medium text-gray-700">Aprobados</span>
                                                </div>
                                                <span className="text-sm font-bold text-green-700">
                                                    {stats.studentsApproved} de {stats.totalStudents} ({Math.round((stats.studentsApproved / stats.totalStudents) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-end pr-2"
                                                    style={{ width: `${(stats.studentsApproved / stats.totalStudents) * 100}%` }}
                                                >
                                                    {stats.studentsApproved > 0 && (
                                                        <span className="text-xs font-bold text-white">{stats.studentsApproved}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Barra desaprobados */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <XCircle size={18} className="text-red-600" />
                                                    <span className="text-sm font-medium text-gray-700">Desaprobados</span>
                                                </div>
                                                <span className="text-sm font-bold text-red-700">
                                                    {stats.studentsCompleted - stats.studentsApproved} de {stats.totalStudents} ({Math.round(((stats.studentsCompleted - stats.studentsApproved) / stats.totalStudents) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-end pr-2"
                                                    style={{ width: `${((stats.studentsCompleted - stats.studentsApproved) / stats.totalStudents) * 100}%` }}
                                                >
                                                    {(stats.studentsCompleted - stats.studentsApproved) > 0 && (
                                                        <span className="text-xs font-bold text-white">{stats.studentsCompleted - stats.studentsApproved}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Barra sin completar */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={18} className="text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-700">Sin completar</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">
                                                    {stats.totalStudents - stats.studentsCompleted} de {stats.totalStudents} ({Math.round(((stats.totalStudents - stats.studentsCompleted) / stats.totalStudents) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-end pr-2"
                                                    style={{ width: `${((stats.totalStudents - stats.studentsCompleted) / stats.totalStudents) * 100}%` }}
                                                >
                                                    {(stats.totalStudents - stats.studentsCompleted) > 0 && (
                                                        <span className="text-xs font-bold text-white">{stats.totalStudents - stats.studentsCompleted}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Barra de progreso */}
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Completitud del nivel</span>
                                    <span className="font-semibold">{stats.completionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Estadísticas de puntajes */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Distribución de Puntajes</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-gray-600">Mínimo</p>
                                        <p className="text-lg font-bold text-red-600">{stats.minScore}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Promedio</p>
                                        <p className="text-lg font-bold text-blue-600">{stats.averageScore}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Máximo</p>
                                        <p className="text-lg font-bold text-green-600">{stats.maxScore}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas por escena */}
                            {stats.scenesStatistics && stats.scenesStatistics.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-4">Respuestas por Escena</h4>
                                    <div className="space-y-4">
                                        {stats.scenesStatistics.map((scene, idx) => (
                                            <SceneStatistics key={scene.idScene || idx} scene={scene} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Últimos intentos */}
                            {stats.lastAttempts && stats.lastAttempts.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-4">Últimos Intentos</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puntaje</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {stats.lastAttempts.map((attempt, idx) => (
                                                    <tr key={attempt.userId || idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{attempt.userName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(attempt.completedAt).toLocaleDateString('es-AR')}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{attempt.score}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{attempt.percentage}%</td>
                                                        <td className="px-4 py-3">
                                                            {attempt.approved ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    <CheckCircle2 size={14} />
                                                                    Aprobado
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    <XCircle size={14} />
                                                                    Desaprobado
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                    )}
                </div>
            )}
        </div>
    );
}

// Componente de métrica individual con ícono
function MetricCard({ icon, label, value, total, subtitle, color }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`flex items-center gap-2 mb-2 ${color}`}>
                {icon}
                <p className="text-xs text-gray-600">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${color}`}>
                {value}
                {total !== undefined && <span className="text-sm text-gray-500"> / {total}</span>}
            </p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
}

// Componente de estadísticas por escena
function SceneStatistics({ scene }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3">
                Escena {scene.idScene}: {scene.description?.substring(0, 100)}
                {scene.description?.length > 100 && '...'}
            </h5>
            <div className="space-y-2">
                {scene.optionsStatistics?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{opt.description}</span>
                                <span className="text-gray-600 font-medium">
                                    {opt.timesSelected} ({opt.percentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        opt.points > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${opt.percentage}%` }}
                                />
                            </div>
                        </div>
                        <span
                            className={`text-sm font-bold px-2 py-1 rounded ${
                                opt.points > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {opt.points > 0 ? '+' : ''}{opt.points}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}