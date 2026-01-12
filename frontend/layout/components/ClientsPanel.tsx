import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Play, BarChart3, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../services/api';

interface Client {
    id: string;
    nombre: string;
    industry: string;
    plan: string;
    is_active: boolean;
    created_at: string;
}

interface ClientStatus {
    hasInterview: boolean;
    hasBrandIdentity: boolean;
    canExecuteAnalysis: boolean;
    lastAnalysisDate?: string;
    analysisStatus?: string;
}

const ClientsPanel: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientIndustry, setNewClientIndustry] = useState('');
    const [newClientPlan, setNewClientPlan] = useState('free_trial');

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await api.getClients();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createClient({
                brand_name: newClientName,
                industry: newClientIndustry,
                plan: newClientPlan
            });
            setShowCreateModal(false);
            setNewClientName('');
            setNewClientIndustry('');
            setNewClientPlan('free_trial');
            loadClients();
            alert('Cliente creado exitosamente');
        } catch (error: any) {
            console.error(error);
            alert('Error al crear cliente: ' + (error.message || 'Error desconocido'));
        }
    };

    const getPlanBadge = (plan: string) => {
        const plans: Record<string, { label: string; color: string }> = {
            free_trial: { label: 'Free Trial', color: 'bg-gray-100 text-gray-600' },
            lite: { label: 'Lite', color: 'bg-blue-100 text-blue-600' },
            basic: { label: 'Basic', color: 'bg-green-100 text-green-600' },
            pro: { label: 'Pro', color: 'bg-purple-100 text-purple-600' },
            premium: { label: 'Premium', color: 'bg-amber-100 text-amber-600' }
        };

        const planInfo = plans[plan] || plans.free_trial;
        return (
            <span className={`px-2 py-1 rounded-md text-xs font-bold ${planInfo.color}`}>
                {planInfo.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando clientes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Gestión de Clientes</h2>
                <Button primary onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> Nuevo Cliente
                </Button>
            </div>

            <Card>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Industria</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Entrevista</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Marca</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clients.map((client) => (
                            <ClientRow key={client.id} client={client} onUpdate={loadClients} />
                        ))}
                    </tbody>
                </table>

                {clients.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay clientes. Crea uno para comenzar.
                    </div>
                )}
            </Card>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
                    >
                        <h3 className="text-xl font-bold mb-4">Crear Nuevo Cliente</h3>
                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la Marca
                                </label>
                                <input
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Industria
                                </label>
                                <input
                                    type="text"
                                    value={newClientIndustry}
                                    onChange={(e) => setNewClientIndustry(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Deportes, Tecnología..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plan
                                </label>
                                <select
                                    value={newClientPlan}
                                    onChange={(e) => setNewClientPlan(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="free_trial">Free Trial</option>
                                    <option value="lite">Lite</option>
                                    <option value="basic">Basic</option>
                                    <option value="pro">Pro</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button onClick={() => setShowCreateModal(false)}>
                                    Cancelar
                                </Button>
                                <Button primary type="submit">
                                    Crear Cliente
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Componente separado para cada fila de cliente
const ClientRow: React.FC<{ client: Client; onUpdate: () => void }> = ({ client, onUpdate }) => {
    const [status, setStatus] = useState<ClientStatus | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await api.getClientStatus(client.id);
                setStatus(data);
            } catch (error) {
                console.error('Error loading status:', error);
            } finally {
                setLoadingStatus(false);
            }
        };

        fetchStatus();
    }, [client.id]);

    const handleEnterClient = () => {
        // TODO: Abrir ClientDetailModal
        alert(`Abrir detalle de ${client.nombre} - En desarrollo`);
    };

    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {client.nombre[0]}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{client.nombre}</div>
                        <div className="text-xs text-gray-500">{client.id.slice(0, 8)}...</div>
                    </div>
                </div>
            </td>
            <td className="p-4 text-sm text-gray-600">{client.industry || '-'}</td>
            <td className="p-4">
                {getPlanBadge(client.plan)}
            </td>
            <td className="p-4 text-center">
                {loadingStatus ? (
                    <span className="text-gray-400 text-xs">...</span>
                ) : status ? (
                    status.hasInterview ? (
                        <span className="text-green-600 text-xl">✅</span>
                    ) : (
                        <span className="text-red-600 text-xl">❌</span>
                    )
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )}
            </td>
            <td className="p-4 text-center">
                {loadingStatus ? (
                    <span className="text-gray-400 text-xs">...</span>
                ) : status ? (
                    status.hasBrandIdentity ? (
                        <span className="text-green-600 text-xl">✅</span>
                    ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                    )
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )}
            </td>
            <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={handleEnterClient}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        title="Entrar"
                    >
                        Entrar
                    </button>
                </div>
            </td>
        </tr>
    );
};

function getPlanBadge(plan: string) {
    const plans: Record<string, { label: string; color: string }> = {
        free_trial: { label: 'Free Trial', color: 'bg-gray-100 text-gray-600' },
        lite: { label: 'Lite', color: 'bg-blue-100 text-blue-600' },
        basic: { label: 'Basic', color: 'bg-green-100 text-green-600' },
        pro: { label: 'Pro', color: 'bg-purple-100 text-purple-600' },
        premium: { label: 'Premium', color: 'bg-amber-100 text-amber-600' }
    };

    const planInfo = plans[plan] || plans.free_trial;
    return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${planInfo.color}`}>
            {planInfo.label}
        </span>
    );
}

export default ClientsPanel;
