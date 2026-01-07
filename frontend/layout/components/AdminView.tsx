import React, { useState, useEffect } from 'react';
import {
  Users, Database, Plus, Trash2, Search,
  Shield, Activity, Play, FileText, CheckCircle,
  AlertCircle, Loader2, X, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/50 backdrop-blur-xl border border-white/60 shadow-xl rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  className?: string
}> = ({ children, onClick, primary, danger, disabled, className = '' }) => {
  let baseClass = "px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2";
  if (primary) baseClass += " bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-900/10";
  else if (danger) baseClass += " bg-red-50 text-red-600 hover:bg-red-100 border border-red-200";
  else baseClass += " bg-white border border-gray-200 text-gray-600 hover:bg-gray-50";

  if (disabled) baseClass += " opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${className}`}>
      {disabled ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
};

// =============================================================================
// MAIN VIEW
// =============================================================================

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'orchestrator'>('users');

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
            Panel de Administración
          </h1>
          <p className="text-gray-500 font-medium">Gestiona accesos y configuara el orquestador.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100/50 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <span className="flex items-center gap-2"><Users size={16} /> Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab('orchestrator')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'orchestrator'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <span className="flex items-center gap-2"><Activity size={16} /> Orquestador</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <UsersPanel key="users" />
          ) : (
            <OrchestratorPanel key="orc" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =============================================================================
// USERS PANEL
// =============================================================================

const UsersPanel: React.FC = () => {
  const [users, setUsers] = useState<api.UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('client');
  const [createLoading, setCreateLoading] = useState(false);

  const [clients, setClients] = useState<api.Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Password Reset State
  const [showResetPass, setShowResetPass] = useState<string | null>(null);
  const [resetPassValue, setResetPassValue] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load clients immediately
  useEffect(() => {
    loadUsers();
    api.getClients().then(setClients).catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar usuario permanentemente?")) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.createUser({
        email: newUserEmail,
        password: newUserPass,
        full_name: newUserName,
        role: 'client',
        client_id: selectedClientId || undefined
      });
      setIsCreateModalOpen(false);
      setNewUserEmail('');
      setNewUserPass('');
      setNewUserName('');
      setNewUserRole('client');
      setSelectedClientId('');
      loadUsers();
    } catch (error) {
      alert("Error al crear usuario");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col"
    >
      <div className="flex justify-end mb-4">
        <Button primary onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} /> Nuevo Usuario
        </Button>
      </div>

      <Card className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rol</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Cargando...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {user.full_name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{user.full_name || 'Sin nombre'}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Activo
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowResetPass(user.id)}
                      className="p-2 hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 rounded-lg transition-colors"
                      title="Cambiar Contraseña"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal Create User */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6">Nuevo Usuario</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nombre Completo</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-gray-900 transition-all font-medium" placeholder="Ej. Juan Pérez" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                  <input required type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-gray-900 transition-all font-medium" placeholder="juan@empresa.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Contraseña</label>
                  <input required type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-gray-900 transition-all font-medium" placeholder="••••••••" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} />
                </div>
                <div>
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Asignar Cliente (Empresa)</label>
                    <div className="relative">
                      <select
                        required
                        className="w-full bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3 outline-none focus:border-blue-500 transition-all font-bold appearance-none"
                        value={selectedClientId}
                        onChange={e => setSelectedClientId(e.target.value)}
                      >
                        <option value="">Seleccionar Cliente (Requerido)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                        <Database size={16} />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                  <Button primary disabled={createLoading} className="flex-1">
                    Crear Usuario
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Reset Password */}
      <AnimatePresence>
        {showResetPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Key className="text-yellow-500" /> Nuevo Password
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Establece una nueva contraseña manualmente.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nueva Contraseña</label>
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-3 outline-none focus:border-yellow-500 transition-all font-bold"
                    placeholder="Ej. pixely123"
                    value={resetPassValue}
                    onChange={e => setResetPassValue(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={() => { setShowResetPass(null); setResetPassValue(''); }}>Cancelar</Button>
                  <Button primary disabled={resetLoading || !resetPassValue} className="flex-1 !bg-yellow-500 hover:!bg-yellow-600 border-yellow-600" onClick={async () => {
                    if (!showResetPass) return;
                    setResetLoading(true);
                    try {
                      await api.resetPassword(showResetPass, resetPassValue);
                      alert("Contraseña actualizada correctamente");
                      setShowResetPass(null);
                      setResetPassValue('');
                    } catch (e) {
                      alert("Error al actualizar: " + String(e));
                    } finally {
                      setResetLoading(false);
                    }
                  }}>
                    {resetLoading ? 'Guardando...' : 'Cambiar Pass'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// =============================================================================
// ORCHESTRATOR PANEL
// =============================================================================

const OrchestratorPanel: React.FC = () => {
  const [clients, setClients] = useState<api.Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Client State
  const [showCreate, setShowCreate] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Analysis State
  const [showAnalyze, setShowAnalyze] = useState<string | null>(null); // client_id
  const [instaUrl, setInstaUrl] = useState('');
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.createClient(newClientName, newClientIndustry);
      setShowCreate(false);
      setNewClientName('');
      setNewClientIndustry('');
      loadClients();
    } catch (error) {
      alert("Error al crear cliente");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAnalyze) return;
    setAnalyzeLoading(true);
    try {
      await api.startPipeline(showAnalyze, instaUrl);
      alert("🚀 Análisis iniciado. Puedes ver el progreso en el Dashboard.");
      setShowAnalyze(null);
      setInstaUrl('');
    } catch (error) {
      alert("Error al iniciar análisis");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      className="h-full flex flex-col gap-6"
    >
      {/* Action Bar */}
      <Card className="p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-gray-500">
          <Database size={20} />
          <span className="font-bold text-sm">{clients.length} Clientes activos</span>
        </div>
        <Button primary onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Nuevo Cliente
        </Button>
      </Card>

      {/* Clients Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full h-32 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          ) : clients.map(client => (
            <div key={client.id} className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">

              {/* Decorative grad */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-gray-900/20">
                  {client.nombre.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{client.nombre}</h3>
                <p className="text-sm text-gray-400 font-medium mb-6">{client.industry || 'General'}</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowAnalyze(client.id)}
                    className="w-full py-3 rounded-xl bg-gray-50 text-gray-900 font-bold text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Play size={14} className="group-hover/btn:fill-current" />
                    Ejecutar Análisis
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle size={12} /> Persistente
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono">ID: {client.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Client */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2">Nuevo Cliente</h2>
              <p className="text-gray-500 text-sm mb-6">Se creará un espacio de trabajo persistente.</p>

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre de Marca</label>
                  <input autoFocus required className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-900 rounded-xl p-3 font-bold outline-none transition-colors" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej. Nike" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Industria</label>
                  <input className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-900 rounded-xl p-3 font-bold outline-none transition-colors" value={newClientIndustry} onChange={e => setNewClientIndustry(e.target.value)} placeholder="Ej. Deporte" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                  <Button primary disabled={createLoading} className="flex-1">Crear</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Run Analysis */}
      <AnimatePresence>
        {showAnalyze && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Bg */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

              <button onClick={() => setShowAnalyze(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Configurar Orquestador</h2>
                <p className="text-gray-500 text-sm">Define la fuente de datos para el motor de agregación.</p>
              </div>

              <form onSubmit={handleStartAnalysis} className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 text-blue-700 text-sm">
                  <div className="shrink-0 pt-0.5"><Activity size={18} /></div>
                  <div>
                    <p className="font-bold mb-1">Pipeline v2.0</p>
                    <p className="opacity-80">Se ejecutará: Scraping Apify → Clasificación Gemini → Agrupación Matemática.</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase ml-1 block mb-2">Instagram URL</label>
                  <div className="relative">
                    <input
                      required
                      type="url"
                      className="w-full pl-10 bg-gray-50 border-2 border-transparent focus:border-pink-500 rounded-xl p-3 font-medium outline-none transition-colors text-gray-600"
                      value={instaUrl}
                      onChange={e => setInstaUrl(e.target.value)}
                      placeholder="https://instagram.com/marca..."
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={18} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 ml-1">El scraping puede tardar hasta 5 minutos dependiendo del volumen.</p>
                </div>

                <Button primary disabled={analyzeLoading} className="w-full py-4 text-base shadow-xl shadow-pink-500/20 !bg-gray-900">
                  {analyzeLoading ? 'Inicializando...' : 'Lanzar Pipeline'} <Play size={18} fill="currentColor" />
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
