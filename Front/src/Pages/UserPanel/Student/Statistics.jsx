import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTotalTrainingProgress } from '../../../API/Request';
import { useUser } from '../../../context/UserContext';
import { BarChart2, Users, BookOpen, TrendingUp, Award } from 'lucide-react';

export default function Statistics() {
    const { idTraining } = useParams();
    const { userData } = useUser();
    const [progressData, setProgressData] = useState(null);
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
            // Obtener datos de progreso de la capacitación actual
            const response = await getTotalTrainingProgress(idTraining, userData.user._id);
            const data = response?.data || response || {};
            
            setProgressData(data);
        } catch (err) {
            console.error('Error obteniendo estadísticas:', err);
            setError(err.message || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
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
                    title="Niveles Completados"
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
                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-lg font-semibold text-gray-700 mb-4">
                                Comparativa de Niveles
                            </p>
                            <div className="flex items-end justify-center gap-8 h-48">
                                <BarItem
                                    label="Total de Niveles"
                                    value={totalLevels}
                                    maxValue={Math.max(totalLevels, totalLevelsCompleted, 1)}
                                    color="bg-green-500"
                                />
                                <BarItem
                                    label="Niveles Completados"
                                    value={totalLevelsCompleted}
                                    maxValue={Math.max(totalLevels, totalLevelsCompleted, 1)}
                                    color="bg-purple-500"
                                />
                            </div>
                        </div>

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