import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Shield, 
  Plus, 
  Trash2, 
  Search,
  Bot,
  Database,
  X,
  Loader2,
  Send,
  User,
  Edit,
  Upload,
  FileUp,
  CheckCircle,
  Play,
  RefreshCw
} from 'lucide-react';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// =============================================================================
// USER MANAGEMENT COMPONENT
// =============================================================================

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'analyst',
    tenant_name: 'Pixely HQ',
    logo_url: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editPassword, setEditPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper to render User Avatar
  const UserAvatar = ({ name }: { name: string }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = [
      'bg-red-100 text-red-600 border-red-200',
      'bg-blue-100 text-blue-600 border-blue-200',
      'bg-green-100 text-green-600 border-green-200',
      'bg-purple-100 text-purple-600 border-purple-200',
      'bg-orange-100 text-orange-600 border-orange-200',
      'bg-pink-100 text-pink-600 border-pink-200',
    ];
    // Simple hash for consistent color
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${colors[colorIndex]}`}>
        {initial}
      </div>
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // Prepare payload: remove tenant_name, ensure logo_url is string or null
      const payload = {
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.full_name,
        role: newUser.role,
        logo_url: newUser.logo_url || null
      };
      
      await api.createUser(payload);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'analyst', tenant_name: 'Pixely HQ', logo_url: '' });
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      alert(`Error al crear usuario: ${error.message || 'Verifica los datos.'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser({ ...user });
    setEditPassword(''); // Reset password field
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsUpdating(true);
    try {
      const updates: any = {
        full_name: editingUser.full_name,
        email: editingUser.email,
        role: editingUser.role,
        logo_url: editingUser.logo_url,
        is_active: editingUser.is_active
      };
      
      // Only send password if it was changed
      if (editPassword.trim()) {
        updates.password = editPassword;
      }

      await api.updateUser(editingUser.id, updates);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(`Error al actualizar usuario: ${error.message || 'Inténtalo de nuevo.'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await api.deleteUser(userId);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(`Error al eliminar usuario: ${error.message || 'Inténtalo de nuevo.'}`);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-primary-500" /> Gestión de Usuarios
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin text-primary-500" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 font-bold tracking-wider">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-800 flex items-center gap-2">
                    <UserAvatar name={u.full_name || u.email} />
                    {u.full_name || 'Sin Nombre'}
                  </td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {u.role === 'admin' ? 'Administrador' : u.role === 'analyst' ? 'Usuario' : u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(u)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Editar usuario"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Crear Nuevo Usuario</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newUser.full_name}
                  onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rol</label>
                <select 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="analyst">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
              >
                {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Editar Usuario</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={editingUser.full_name}
                  onChange={e => setEditingUser({...editingUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={editingUser.email}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Contraseña (Opcional)</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  placeholder="Dejar en blanco para mantener actual"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rol</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    value={editingUser.role}
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    <option value="analyst">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    value={editingUser.is_active ? 'active' : 'inactive'}
                    onChange={e => setEditingUser({...editingUser, is_active: e.target.value === 'active'})}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ORCHESTRATOR CARD COMPONENT
// =============================================================================

const OrchestratorCard = ({ clients, users }: { clients: api.Client[], users: any[] }) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Analysis progress state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedClient) return;
    
    setIsUploading(true);
    try {
      await api.ingestFile(selectedClient, uploadFile, 'General');
      setUploadStatus('success');
      setUploadFile(null);
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedClient) return;
    if (!window.confirm("¿Iniciar análisis completo? Esto puede tomar varios minutos.")) return;
    
    // Reset state
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(0);
    
    // Simulated phases for UX feedback (actual analysis runs server-side)
    const phases = [
      { name: "Conectando con Gemini...", progress: 5 },
      { name: "Q1 - Analizando Emociones (Plutchik)", progress: 15 },
      { name: "Q2 - Evaluando Personalidad de Marca", progress: 25 },
      { name: "Q3 - Identificando Tópicos Principales", progress: 35 },
      { name: "Q4 - Detectando Marcos Narrativos", progress: 45 },
      { name: "Q5 - Mapeando Influenciadores", progress: 55 },
      { name: "Q6 - Descubriendo Oportunidades", progress: 65 },
      { name: "Q7 - Análisis de Sentimiento Detallado", progress: 75 },
      { name: "Q8 - Procesando Análisis Temporal", progress: 85 },
      { name: "Q9 - Generando Recomendaciones", progress: 92 },
      { name: "Q10 - Sintetizando Resumen Ejecutivo", progress: 98 },
    ];
    
    // Start phase animation
    let phaseIndex = 0;
    const phaseInterval = setInterval(() => {
      if (phaseIndex < phases.length) {
        setAnalysisPhase(phases[phaseIndex].name);
        setAnalysisProgress(phases[phaseIndex].progress);
        phaseIndex++;
      }
    }, 3000); // Update every 3 seconds
    
    try {
      setAnalysisPhase(phases[0].name);
      await api.runFullAnalysis(selectedClient);
      
      clearInterval(phaseInterval);
      setAnalysisPhase("✅ Análisis completado exitosamente");
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisPhase('');
        setAnalysisProgress(0);
      }, 3000);
      
    } catch (error: any) {
      clearInterval(phaseInterval);
      console.error("Analysis error:", error);
      setAnalysisError(error.message || "Error desconocido al ejecutar el análisis");
      setAnalysisPhase("❌ Error en el análisis");
      setAnalysisProgress(0);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisError(null);
      }, 5000);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center">
            <Bot className="text-primary-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Orquestador Semántico</h2>
            <p className="text-xs text-gray-400">Gestión de contexto y ejecución</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Selectors */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Cliente</label>
            <select 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Seleccionar Cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content - Only show if Client is selected */}
        {!selectedClient ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4">
            <User size={32} className="mb-2 opacity-50" />
            <p className="text-sm text-center px-4">Selecciona un cliente para habilitar el orquestador</p>
          </div>
        ) : (
          <>
            {/* Upload Section */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Upload size={14} /> Cargar Contexto (XLS/XLSX)
              </h3>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input 
                    type="file" 
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white file:text-primary-500 hover:file:bg-gray-100 cursor-pointer"
                    disabled={!selectedClient || isUploading}
                  />
                </div>
                {uploadFile && (
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold hover:bg-primary-600 transition-colors flex items-center gap-2"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    Cargar
                  </button>
                )}
              </div>
              {uploadStatus === 'success' && (
                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-green-600 animate-fade-in">
                  <CheckCircle size={14} /> Archivo cargado y procesado correctamente
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3 mt-4">
              {/* Analysis Progress Section */}
              {isAnalyzing && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-2">
                      <Loader2 className="animate-spin text-primary-500" size={14} />
                      Ejecutando Análisis Q1-Q10
                    </span>
                    <span className="text-xs font-bold text-primary-600">{analysisProgress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  
                  {/* Current Phase */}
                  <p className="text-xs text-gray-500 font-medium truncate">
                    {analysisPhase}
                  </p>
                  
                  {/* Error Message */}
                  {analysisError && (
                    <p className="text-xs text-red-600 font-bold bg-red-50 px-3 py-2 rounded-lg">
                      ⚠️ {analysisError}
                    </p>
                  )}
                </div>
              )}
              
              <button 
                onClick={handleRunAnalysis}
                disabled={!selectedClient || isAnalyzing}
                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Analizando...
                  </>
                ) : (
                  <>
                    <Play size={18} /> Ejecutar Análisis Completo
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// CHAT CARD COMPONENT
// =============================================================================

const ChatCard = ({ clients, users }: { clients: api.Client[], users: any[] }) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hola, selecciona un cliente y usuario para comenzar.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions when client changes
  useEffect(() => {
    if (selectedClient) {
      loadSessions(selectedClient);
    } else {
      setSessions([]);
    }
  }, [selectedClient]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    }
  }, [currentSessionId]);

  const loadSessions = async (clientId: string) => {
    try {
      const data = await api.getChatSessions(clientId);
      setSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const data = await api.getChatMessages(sessionId);
      // Map backend messages to UI format if needed
      const formatted = data.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
      setMessages(formatted);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedClient) return;
    try {
      const newSession = await api.createChatSession(selectedClient, "Nueva Conversación");
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
      setMessages([{ role: 'assistant', content: 'Hola, soy el asistente semántico. ¿En qué puedo ayudarte hoy?' }]);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedClient) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      // Create session on first message if not exists
      try {
        const newSession = await api.createChatSession(selectedClient, input.substring(0, 30) + "...");
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(newSession.id);
        sessionId = newSession.id;
      } catch (error) {
        console.error("Error creating session:", error);
        return;
      }
    }

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(selectedClient, sessionId!, input);
      const aiMsg = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error al procesar tu mensaje." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center">
            <MessageSquare className="text-primary-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Chat Semántico</h2>
            <p className="text-xs text-gray-400">Interacción con el contexto</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Cliente</label>
            <select 
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            >
            <option value="">Seleccionar Cliente...</option>
            {clients.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
            </select>
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Usuario</label>
            <select 
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            >
            <option value="">Seleccionar Usuario...</option>
            {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.role === 'admin' ? 'Admin' : 'Usuario'})</option>
            ))}
            </select>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar History */}
        <div className="w-1/3 border-r border-gray-100 pr-2 overflow-y-auto">
          <button 
            onClick={handleCreateSession}
            disabled={!selectedClient}
            className="w-full mb-3 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={14} /> Nuevo Chat
          </button>
          <div className="space-y-2">
            {sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => setCurrentSessionId(s.id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${currentSessionId === s.id ? 'bg-primary-50 border-primary-100' : 'hover:bg-gray-50 border-transparent'} border`}
              >
                <p className="text-xs font-bold text-gray-700 truncate">{s.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(s.last_message_at || s.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {sessions.length === 0 && selectedClient && (
              <p className="text-xs text-center text-gray-400 mt-4">No hay historial</p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 p-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-dark text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="mt-4 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedClient ? "Escribe tu mensaje..." : "Selecciona un cliente primero"}
              disabled={!selectedClient || isLoading}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SEMANTIC LAB & UPLOAD COMPONENT
// =============================================================================

const SemanticLab = () => {
  const [clients, setClients] = useState<api.Client[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, usersData] = await Promise.all([
          api.getClients(),
          api.getUsers()
        ]);
        setClients(clientsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading lab data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrchestratorCard clients={clients} users={users} />
      <ChatCard clients={clients} users={users} />
    </div>
  );
};

// =============================================================================
// CLIENT MANAGEMENT COMPONENT
// =============================================================================

const ClientManagement = () => {
  const [clients, setClients] = useState<api.Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClient, setNewClient] = useState({ brand_name: '', industry: '' });
  const [isCreating, setIsCreating] = useState(false);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.brand_name.trim()) return;
    
    setIsCreating(true);
    try {
      await api.createClient(newClient.brand_name, newClient.industry || undefined);
      setShowCreateModal(false);
      setNewClient({ brand_name: '', industry: '' });
      fetchClients();
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Error al crear cliente. Verifica los datos.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el cliente "${clientName}"? Esta acción eliminará todos sus datos.`)) return;
    try {
      await api.deleteClient(clientId);
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Error al eliminar cliente.");
    }
  };

  // Helper to render Client Avatar
  const ClientAvatar = ({ name }: { name: string }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = [
      'bg-indigo-100 text-indigo-600 border-indigo-200',
      'bg-teal-100 text-teal-600 border-teal-200',
      'bg-amber-100 text-amber-600 border-amber-200',
      'bg-rose-100 text-rose-600 border-rose-200',
      'bg-cyan-100 text-cyan-600 border-cyan-200',
      'bg-violet-100 text-violet-600 border-violet-200',
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${colors[colorIndex]}`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Database className="text-primary-500" /> Gestión de Clientes
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin text-primary-500" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Database size={48} className="mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay clientes creados</p>
            <p className="text-xs mt-1">Crea tu primer cliente para comenzar</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 font-bold tracking-wider">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Industria</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-800 flex items-center gap-3">
                    <ClientAvatar name={c.nombre} />
                    {c.nombre}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{c.industry || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.is_active !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {c.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleDeleteClient(c.id, c.nombre)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Create Client */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Crear Nuevo Cliente</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Cliente/Marca *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Coca-Cola, Nike, etc."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newClient.brand_name}
                  onChange={e => setNewClient({...newClient, brand_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Industria</label>
                <input 
                  type="text" 
                  placeholder="Ej: Tecnología, Retail, Servicios..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newClient.industry}
                  onChange={e => setNewClient({...newClient, industry: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={isCreating || !newClient.brand_name.trim()}
                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Crear Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN ADMIN VIEW
// =============================================================================

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'clients' | 'chat'>('users');
  const [viewingClient, setViewingClient] = useState<string>('');
  const [clients, setClients] = useState<api.Client[]>([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await api.getClients();
        setClients(data);
      } catch (error) {
        console.error("Error loading clients for selector:", error);
      }
    };
    loadClients();
  }, []);

  return (
    <div className="h-full flex flex-col bg-brand-bg p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-8">
            <div>
                <h1 className="text-3xl font-black text-brand-dark tracking-tight mb-1">Panel de Administración</h1>
                <p className="text-gray-500 font-medium">Gestión de usuarios, clientes y herramientas internas</p>
            </div>
            
            {/* Global Interface Selector */}
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase px-2">Vista de Interfaz:</span>
                <select 
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
                    value={viewingClient}
                    onChange={(e) => setViewingClient(e.target.value)}
                >
                    <option value="">-- Seleccionar Cliente --</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
                {viewingClient && (
                    <button 
                        className="p-1.5 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                        title="Ver Interfaz"
                        onClick={() => alert(`Simulando vista de cliente: ${clients.find(c => c.id === viewingClient)?.nombre}`)}
                    >
                        <Play size={14} />
                    </button>
                )}
            </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'users' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'clients' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Clientes
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'chat' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Lab Semántico
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'clients' && <ClientManagement />}
        {activeTab === 'chat' && <SemanticLab />}
      </div>
    </div>
  );
};
