import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2, Image, Type, Palette, Target } from 'lucide-react';
import * as api from '../services/api';

interface BrandAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    clientName: string;
}

const TABS = [
    { id: 'identity', label: 'Identidad', icon: Target },
    { id: 'values', label: 'Valores', icon: Type },
    { id: 'style', label: 'Estilo', icon: Palette },
    { id: 'assets', label: 'Activos', icon: Image },
];

export const BrandAdminModal: React.FC<BrandAdminModalProps> = ({ isOpen, onClose, clientId, clientName }) => {
    const [activeTab, setActiveTab] = useState('identity');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<any>({
        mission: '',
        vision: '',
        archetype: '',
        values: [],
        colors: { primary: '#000000', secondary: '#000000', background: '#FFFFFF' },
        logo_url: '',
        stationery_url: ''
    });

    useEffect(() => {
        if (isOpen && clientId) {
            loadBrand();
        }
    }, [isOpen, clientId]);

    const loadBrand = async () => {
        setIsLoading(true);
        try {
            const res = await api.getBrand(clientId);
            if (res.status === 'success' && res.data) {
                setFormData({
                    ...res.data,
                    colors: res.data.colors || { primary: '', secondary: '', background: '' },
                    values: res.data.values || []
                });
            } else {
                // Initialize empty if new
                setFormData({
                    mission: '',
                    vision: '',
                    archetype: '',
                    values: [],
                    colors: { primary: '#000000', secondary: '#000000', background: '#FFFFFF' },
                    logo_url: '',
                    stationery_url: ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateBrand(clientId, formData);
            onClose();
            // Optional: Trigger a refresh or toast
        } catch (e) {
            alert('Error al guardar la marca');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleColorChange = (key: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            colors: { ...prev.colors, [key]: value }
        }));
    };

    // Values Logic
    const addValue = () => {
        setFormData((prev: any) => ({
            ...prev,
            values: [...(prev.values || []), { title: '', desc: '' }]
        }));
    };

    const updateValue = (index: number, key: string, val: string) => {
        const newValues = [...formData.values];
        newValues[index] = { ...newValues[index], [key]: val };
        setFormData((prev: any) => ({ ...prev, values: newValues }));
    };

    const removeValue = (index: number) => {
        const newValues = [...formData.values];
        newValues.splice(index, 1);
        setFormData((prev: any) => ({ ...prev, values: newValues }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Editar Marca: {clientName}</h2>
                        <p className="text-xs text-gray-400 font-mono mt-1">ID: {clientId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 pt-2 gap-1 bg-white">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-2" /> Cargando datos...
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">

                            {/* --- TAB: IDENTITY --- */}
                            {activeTab === 'identity' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Arquetipo</label>
                                            <input
                                                type="text"
                                                value={formData.archetype || ''}
                                                onChange={e => handleChange('archetype', e.target.value)}
                                                className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-primary-500"
                                                placeholder="Ej. El Mago, El Héroe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Misión</label>
                                        <textarea
                                            value={formData.mission || ''}
                                            onChange={e => handleChange('mission', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-primary-500"
                                            placeholder="Propósito principal de la marca..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Visión</label>
                                        <textarea
                                            value={formData.vision || ''}
                                            onChange={e => handleChange('vision', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-primary-500"
                                            placeholder="Aspiración a futuro..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: VALUES --- */}
                            {activeTab === 'values' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    {formData.values?.map((val: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    placeholder="Título del Valor"
                                                    value={val.title}
                                                    onChange={e => updateValue(idx, 'title', e.target.value)}
                                                    className="w-full font-bold border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-300"
                                                />
                                                <input
                                                    placeholder="Descripción corta..."
                                                    value={val.desc}
                                                    onChange={e => updateValue(idx, 'desc', e.target.value)}
                                                    className="w-full text-sm text-gray-500 border-none p-0 focus:ring-0 placeholder-gray-300"
                                                />
                                            </div>
                                            <button onClick={() => removeValue(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addValue}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                                    >
                                        <Plus size={16} /> Añadir Valor
                                    </button>
                                </div>
                            )}

                            {/* --- TAB: STYLE --- */}
                            {activeTab === 'style' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color Primario</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={formData.colors?.primary || '#000000'}
                                                    onChange={e => handleColorChange('primary', e.target.value)}
                                                    className="h-10 w-10 rounded overflow-hidden cursor-pointer border-none p-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.colors?.primary || ''}
                                                    onChange={e => handleColorChange('primary', e.target.value)}
                                                    className="w-full rounded-lg border-gray-200 text-sm font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Secundario</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={formData.colors?.secondary || '#000000'}
                                                    onChange={e => handleColorChange('secondary', e.target.value)}
                                                    className="h-10 w-10 rounded overflow-hidden cursor-pointer border-none p-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.colors?.secondary || ''}
                                                    onChange={e => handleColorChange('secondary', e.target.value)}
                                                    className="w-full rounded-lg border-gray-200 text-sm font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fondo</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={formData.colors?.background || '#FFFFFF'}
                                                    onChange={e => handleColorChange('background', e.target.value)}
                                                    className="h-10 w-10 rounded overflow-hidden cursor-pointer border-none p-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.colors?.background || ''}
                                                    onChange={e => handleColorChange('background', e.target.value)}
                                                    className="w-full rounded-lg border-gray-200 text-sm font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: ASSETS --- */}
                            {activeTab === 'assets' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-xs flex items-center gap-2">
                                        <Image size={16} />
                                        <span>Pega aquí las URLs públicas de tus imágenes (Google Drive, Imgur, CDN, etc).</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">URL del Logotipo (SVG Preferido)</label>
                                        <input
                                            type="text"
                                            value={formData.logo_url || ''}
                                            onChange={e => handleChange('logo_url', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 p-3 text-sm font-mono text-gray-600 focus:ring-2 focus:ring-primary-500"
                                            placeholder="https://..."
                                        />
                                        {formData.logo_url && (
                                            <div className="mt-2 p-4 border border-gray-100 rounded-xl flex justify-center bg-white">
                                                <img src={formData.logo_url} alt="Logo Preview" className="h-20 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">URL de Papelería (PNG/JPG)</label>
                                        <input
                                            type="text"
                                            value={formData.stationery_url || ''}
                                            onChange={e => handleChange('stationery_url', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 p-3 text-sm font-mono text-gray-600 focus:ring-2 focus:ring-primary-500"
                                            placeholder="https://..."
                                        />
                                        {formData.stationery_url && (
                                            <div className="mt-2 p-4 border border-gray-100 rounded-xl flex justify-center bg-gray-100">
                                                <img src={formData.stationery_url} alt="Stationery Preview" className="h-40 object-cover shadow-lg rounded-lg transform rotate-[-2deg]" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-sm shadow-lg shadow-black/20 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};
