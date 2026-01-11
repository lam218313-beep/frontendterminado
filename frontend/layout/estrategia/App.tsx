import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NodeData, NodeType } from './types';
import {
    Plus,
    Target,
    Zap,
    FileText,
    MoreHorizontal,
    GripHorizontal,
    MousePointer2,
    Hand,
    Network,
    AlignLeft,
    Lightbulb,
    ArrowRight,
    Layers
} from 'lucide-react';
import * as api from '../services/api';

// --- Constants & Config ---
const MAX_MAIN_OBJECTIVES = 6;
const MAX_SECONDARY_PER_MAIN = 3;
const MAX_POSTS_PER_SECONDARY = 6;

// Initial Layout Config
const RADIUS_MAIN = 280;

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const getRadialPosition = (centerX: number, centerY: number, angleDeg: number, distance: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
        x: centerX + distance * Math.cos(angleRad),
        y: centerY + distance * Math.sin(angleRad)
    };
};

type InteractionMode = 'select' | 'pan';
type ViewMode = 'map' | 'list';

interface Recommendation {
    titulo: string;
    descripcion: string;
    prioridad: string;
    area: string;
    impacto: string;
}

const App: React.FC = () => {
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('map');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [showRecs, setShowRecs] = useState(true);

    // Interaction State
    const [mode, setMode] = useState<InteractionMode>('select');
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);

    // --- IMPROVED DRAG STATE ---
    const [isDraggingNodes, setIsDraggingNodes] = useState(false);
    const dragStartMouse = useRef<{ x: number, y: number } | null>(null);
    const initialNodePositions = useRef<{ [id: string]: { x: number, y: number } }>({});

    // Viewport State
    const [scale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const panStart = useRef({ x: 0, y: 0 });
    const panStartOffset = useRef({ x: 0, y: 0 });

    const CLIENT_ID = localStorage.getItem('clientId');

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!CLIENT_ID) return;
            try {
                const data = await api.getLatestAnalysis(CLIENT_ID);
                if (data && data.Q9 && data.Q9.results && data.Q9.results.lista_recomendaciones) {
                    const mapped: Recommendation[] = data.Q9.results.lista_recomendaciones.map((r: api.Q9Recommendation) => ({
                        titulo: r.recomendacion,
                        descripcion: r.descripcion,
                        prioridad: r.urgencia,
                        area: r.area_estrategica,
                        impacto: r.score_impacto.toString()
                    }));
                    setRecommendations(mapped);
                }
            } catch (e) {
                console.error("Error fetching analysis for strategy:", e);
            }
        };
        fetchAnalysis();
    }, [CLIENT_ID]);

    // --- Logic: Data Management ---
    const updateNodeData = (id: string, field: keyof NodeData, value: any) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));
    };

    const deleteSelectedNodes = useCallback(() => {
        if (selectedNodeIds.size === 0) return;
        const nodesToDelete = new Set(selectedNodeIds);
        let addedCount = 0;
        do {
            addedCount = 0;
            nodes.forEach(node => {
                if (!nodesToDelete.has(node.id) && node.parentId && nodesToDelete.has(node.parentId)) {
                    nodesToDelete.add(node.id);
                    addedCount++;
                }
            });
        } while (addedCount > 0);
        setNodes(prev => prev.filter(n => !nodesToDelete.has(n.id)));
        setSelectedNodeIds(new Set());
    }, [nodes, selectedNodeIds]);

    // --- Interaction Handlers (Map View) ---

    const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if ((e.button !== 0 && e.button !== 1) || mode === 'pan') return;

        const newSelected = new Set(selectedNodeIds);
        if (e.shiftKey) {
            if (newSelected.has(id)) newSelected.delete(id);
            else newSelected.add(id);
        } else {
            if (!newSelected.has(id)) {
                newSelected.clear();
                newSelected.add(id);
            }
        }
        setSelectedNodeIds(newSelected);
        setIsDraggingNodes(true);
        dragStartMouse.current = { x: e.clientX, y: e.clientY };
        const positions: { [id: string]: { x: number, y: number } } = {};
        nodes.forEach(n => {
            if (newSelected.has(n.id)) {
                positions[n.id] = { x: n.x, y: n.y };
            }
        });
        initialNodePositions.current = positions;
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 && e.button !== 1) return;
        if (mode === 'pan' || e.button === 1) {
            setIsPanning(true);
            panStart.current = { x: e.clientX, y: e.clientY };
            panStartOffset.current = { x: pan.x, y: pan.y };
        } else {
            if (!e.shiftKey) setSelectedNodeIds(new Set());
            const rect = canvasRef.current!.getBoundingClientRect();
            const startX = (e.clientX - rect.left - pan.x) / scale;
            const startY = (e.clientY - rect.top - pan.y) / scale;
            setSelectionBox({
                startX,
                startY,
                currentX: startX,
                currentY: startY
            });
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (viewMode !== 'map') return;
        if (isDraggingNodes && dragStartMouse.current) {
            const dx = (e.clientX - dragStartMouse.current.x) / scale;
            const dy = (e.clientY - dragStartMouse.current.y) / scale;
            setNodes(prev => prev.map(n => {
                if (initialNodePositions.current[n.id]) {
                    return {
                        ...n,
                        x: initialNodePositions.current[n.id].x + dx,
                        y: initialNodePositions.current[n.id].y + dy
                    };
                }
                return n;
            }));
        } else if (isPanning) {
            const dx = e.clientX - panStart.current.x;
            const dy = e.clientY - panStart.current.y;
            setPan({
                x: panStartOffset.current.x + dx,
                y: panStartOffset.current.y + dy
            });
        } else if (selectionBox && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const currentX = (e.clientX - rect.left - pan.x) / scale;
            const currentY = (e.clientY - rect.top - pan.y) / scale;
            setSelectionBox(prev => prev ? { ...prev, currentX, currentY } : null);
        }
    }, [isDraggingNodes, isPanning, selectionBox, pan, scale, viewMode]);

    const handleMouseUp = useCallback(() => {
        if (selectionBox) {
            const x1 = Math.min(selectionBox.startX, selectionBox.currentX);
            const x2 = Math.max(selectionBox.startX, selectionBox.currentX);
            const y1 = Math.min(selectionBox.startY, selectionBox.currentY);
            const y2 = Math.max(selectionBox.startY, selectionBox.currentY);
            const newSelection = new Set(selectedNodeIds);
            nodes.forEach(node => {
                if (node.x > x1 && node.x < x2 && node.y > y1 && node.y < y2) {
                    newSelection.add(node.id);
                }
            });
            setSelectedNodeIds(newSelection);
            setSelectionBox(null);
        }
        setIsDraggingNodes(false);
        setIsPanning(false);
        dragStartMouse.current = null;
        initialNodePositions.current = {};
    }, [selectionBox, nodes, selectedNodeIds]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && viewMode === 'map') {
                if (document.activeElement === document.body || document.activeElement?.tagName === 'BUTTON') {
                    deleteSelectedNodes();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteSelectedNodes, viewMode]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    // --- Node Creation ---
    const addMainObjective = (overrideData?: Partial<NodeData>) => {
        const mainNodes = nodes.filter(n => n.type === 'main');
        if (mainNodes.length >= MAX_MAIN_OBJECTIVES) return;
        const count = mainNodes.length;

        const angleStep = 360 / Math.max(MAX_MAIN_OBJECTIVES, 3);
        const angle = -90 + (count * angleStep);
        const viewportCenterX = (window.innerWidth / 2 - pan.x) / scale;
        const viewportCenterY = (window.innerHeight / 2 - pan.y) / scale;
        const { x, y } = getRadialPosition(viewportCenterX, viewportCenterY, angle, RADIUS_MAIN);

        const newNode: NodeData = {
            id: generateId(),
            type: 'main',
            label: `Nuevo Objetivo`,
            description: '',
            parentId: null,
            x: count === 0 ? viewportCenterX : x,
            y: count === 0 ? viewportCenterY : y,
            ...overrideData
        };
        setNodes(prev => [...prev, newNode]);
    };

    const addChildNode = (parentId: string) => {
        const parent = nodes.find(n => n.id === parentId);
        if (!parent) return;
        let newType: NodeType;
        let limit = 0;
        if (parent.type === 'main') {
            newType = 'secondary';
            limit = MAX_SECONDARY_PER_MAIN;
        } else if (parent.type === 'secondary') {
            newType = 'post';
            limit = MAX_POSTS_PER_SECONDARY;
        } else { return; }

        const siblings = nodes.filter(n => n.parentId === parentId);
        if (siblings.length >= limit) return;

        const childDist = parent.type === 'main' ? 240 : 180;
        const offsetAngle = siblings.length * 25 + 15;
        const newNode: NodeData = {
            id: generateId(),
            type: newType,
            label: newType === 'secondary' ? `Estrategia` : `Post`,
            description: '',
            parentId,
            x: parent.x + childDist,
            y: parent.y + (siblings.length % 2 === 0 ? offsetAngle : -offsetAngle),
        };
        setNodes(prev => [...prev, newNode]);
    };

    const getPath = (source: NodeData, target: NodeData) => {
        const midX = (source.x + target.x) / 2;
        return `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;
    };

    const renderMapNode = (node: NodeData) => {
        const isMain = node.type === 'main';
        const isSec = node.type === 'secondary';
        const isPost = node.type === 'post';
        const isSelected = selectedNodeIds.has(node.id);
        const childrenCount = nodes.filter(n => n.parentId === node.id).length;
        let canAdd = false;
        if (isMain && childrenCount < MAX_SECONDARY_PER_MAIN) canAdd = true;
        if (isSec && childrenCount < MAX_POSTS_PER_SECONDARY) canAdd = true;

        let baseClasses = "relative flex items-center gap-4 p-5 rounded-[24px] border transition-all duration-300 backdrop-blur-md";
        let typeClasses = "";
        let iconClasses = "";

        if (isMain) {
            typeClasses = `w-[280px] glass-dark text-white border-white/10 ${isSelected ? 'ring-2 ring-accent-500 shadow-glow' : 'hover:border-white/20'}`;
            iconClasses = "bg-accent-500 text-white shadow-lg shadow-accent-600/30";
        } else if (isSec) {
            typeClasses = `w-[240px] glass-panel text-gray-800 border-white/60 ${isSelected ? 'ring-2 ring-accent-500 shadow-lg' : 'hover:shadow-float'}`;
            iconClasses = "bg-accent-50 text-accent-600";
        } else {
            typeClasses = `w-[200px] bg-white text-gray-600 border-gray-100 shadow-sm ${isSelected ? 'ring-2 ring-accent-400' : 'hover:shadow-md'}`;
            iconClasses = "bg-gray-50 text-gray-400";
        }

        return (
            <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 hover:z-20 ${isSelected ? 'z-30' : ''}`}
                style={{ left: node.x, top: node.y }}
            >
                <div className={`${baseClasses} ${typeClasses} group cursor-grab active:cursor-grabbing pointer-events-auto`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${iconClasses}`}>
                        {isMain && <Target size={20} />}
                        {isSec && <Zap size={18} fill="currentColor" className="opacity-90" />}
                        {isPost && <FileText size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isMain ? 'text-gray-400' : 'text-gray-400'}`}>
                            {isMain ? 'Objetivo' : isSec ? 'Estrategia' : 'Contenido'}
                        </p>
                        <div className={`font-bold truncate leading-tight ${isMain ? 'text-lg' : 'text-sm'}`}>
                            {node.label}
                        </div>
                    </div>
                    {canAdd && (
                        <button
                            onClick={(e) => { e.stopPropagation(); addChildNode(node.id); }}
                            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0
                    ${isMain ? 'bg-white text-brand-dark hover:bg-gray-50' : 'bg-brand-dark text-white hover:bg-gray-800'}`}
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    )}
                    <button className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${isMain ? 'text-gray-500' : 'text-gray-300'}`}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
        );
    };

    const renderListView = () => {
        const mainNodes = nodes.filter(n => n.type === 'main');
        if (mainNodes.length === 0) return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Layers size={32} className="opacity-30 text-gray-900" />
                </div>
                <p className="text-xl font-bold text-gray-900">Tu plan está vacío</p>
                <p className="text-sm text-gray-500 mt-2">Cambia a la vista de Mapa para empezar.</p>
            </div>
        );

        // Same list view as before, abbreviated for brevity...
        return (
            <div className="max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-40 space-y-12 overflow-y-auto h-full custom-scrollbar">
                {mainNodes.map(main => {
                    const secondaryNodes = nodes.filter(n => n.parentId === main.id);
                    return (
                        <div key={main.id} className="group relative">
                            <div className="relative z-10 glass-dark rounded-[32px] p-8 text-white shadow-float mb-8">
                                <input type="text" value={main.label} onChange={(e) => updateNodeData(main.id, 'label', e.target.value)} className="w-full bg-transparent text-3xl font-bold border-b border-white/10 pb-2 focus:border-accent-500 focus:outline-none" />
                                <textarea value={main.description || ''} onChange={(e) => updateNodeData(main.id, 'description', e.target.value)} className="w-full bg-black/20 rounded-xl p-4 mt-4 text-sm text-white/80 focus:outline-none" />
                            </div>
                            {/* Simplified List View Children Rendering */}
                            <div className="pl-6 space-y-4">
                                {secondaryNodes.map(sec => (
                                    <div key={sec.id} className="pl-6 border-l-2 border-gray-100">
                                        <div className="bg-white p-4 rounded-xl shadow-sm">
                                            <div className="font-bold text-lg">{sec.label}</div>
                                            <div className="text-sm text-gray-500">{sec.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    }

    // --- DRAG AND DROP HANDLERS (New) ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dataStr = e.dataTransfer.getData("application/json");
        if (!dataStr) return;

        try {
            const data = JSON.parse(dataStr);
            if (data.type === 'recommendation') {
                const rect = canvasRef.current!.getBoundingClientRect();
                const dropX = (e.clientX - rect.left - pan.x) / scale;
                const dropY = (e.clientY - rect.top - pan.y) / scale;

                addMainObjective({
                    label: data.title,
                    description: data.description,
                    x: dropX,
                    y: dropY
                });
            }
        } catch (err) {
            console.error("Drop Error", err);
        }
    };

    return (
        <div className="relative flex h-full min-h-[600px] bg-brand-bg font-sans overflow-hidden text-brand-dark selection:bg-accent-100 selection:text-accent-700">
            <main className="flex-1 relative overflow-hidden flex flex-col">

                {/* Header Toggle */}
                <header className="absolute top-6 left-1/2 -translate-x-1/2 h-16 glass-panel rounded-full shadow-float flex items-center gap-4 px-2 z-40">
                    <div className="flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
                        <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Mapa</button>
                        <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Lista</button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 relative h-full bg-brand-bg">
                    {/* MAP VIEW */}
                    <div
                        ref={canvasRef}
                        onMouseDown={handleCanvasMouseDown}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`absolute inset-0 w-full h-full overflow-hidden bg-white ${viewMode === 'map' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'} ${mode === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                    >
                        <div className="absolute inset-0 w-full h-full origin-center transition-transform duration-75 ease-out will-change-transform pointer-events-none"
                            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>

                            {/* Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                {nodes.map(node => {
                                    if (!node.parentId) return null;
                                    const parent = nodes.find(n => n.id === node.parentId);
                                    if (!parent) return null;
                                    return <path key={`edge-${node.id}`} d={getPath(parent, node)} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" className="opacity-60" />;
                                })}
                            </svg>

                            {/* Empty State Placeholder */}
                            {nodes.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <div className="text-center">
                                        <h2 className="text-4xl font-extrabold text-gray-200 tracking-tight mb-3">
                                            Lienzo Infinito
                                        </h2>
                                        <p className="text-gray-300 text-sm">
                                            Haz clic en "Nuevo Objetivo" para comenzar
                                        </p>
                                    </div>
                                </div>
                            )}

                            {nodes.map(node => renderMapNode(node))}

                            {/* Selection Box Overlay */}
                            {selectionBox && (
                                <div
                                    className="absolute border border-accent-500 bg-accent-500/10 pointer-events-none z-50 rounded-sm"
                                    style={{
                                        left: Math.min(selectionBox.startX, selectionBox.currentX),
                                        top: Math.min(selectionBox.startY, selectionBox.currentY),
                                        width: Math.abs(selectionBox.currentX - selectionBox.startX),
                                        height: Math.abs(selectionBox.currentY - selectionBox.startY)
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* LIST VIEW */}
                    <div className={`absolute inset-0 w-full h-full overflow-hidden bg-brand-bg ${viewMode === 'list' ? 'opacity-100 visible z-10' : 'opacity-0 invisible pointer-events-none'}`}>
                        {renderListView()}
                    </div>
                </div>

                {/* BOTTOM TOOLBAR */}
                {viewMode === 'map' && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
                        <div className="glass-panel rounded-2xl p-2 shadow-float flex items-center gap-3 pr-6">
                            <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl mr-2">
                                <button
                                    onClick={() => setMode('select')}
                                    className={`p-2.5 rounded-lg transition-all ${mode === 'select' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Seleccionar (V)"
                                >
                                    <MousePointer2 size={18} />
                                </button>
                                <button
                                    onClick={() => setMode('pan')}
                                    className={`p-2.5 rounded-lg transition-all ${mode === 'pan' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Mover Lienzo (H)"
                                >
                                    <Hand size={18} />
                                </button>
                            </div>
                            <div className="w-px h-8 bg-gray-200 mx-2"></div>
                            <button onClick={() => addMainObjective()} className="group flex items-center gap-3 bg-accent-500 text-white pl-5 pr-6 py-3.5 rounded-xl hover:bg-accent-600 transition-all shadow-lg">
                                <Plus size={16} /> <span className="font-bold text-sm">Nuevo Objetivo</span>
                            </button>
                            <button onClick={() => setShowRecs(!showRecs)} className={`p-3.5 rounded-xl border transition-all ${showRecs ? 'bg-accent-50 border-accent-200 text-accent-700' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                                <Lightbulb size={20} className={showRecs ? 'fill-accent-500 text-accent-600' : 'text-gray-400'} />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* RECOMMENDATIONS SIDEBAR */}
            <aside
                className={`absolute right-6 top-6 bottom-6 w-80 glass-panel border border-white/40 shadow-2xl rounded-[32px] p-6 flex flex-col transition-all duration-300 transform z-50 
                ${showRecs ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-black text-lg text-brand-dark flex items-center gap-2">
                            <Lightbulb size={18} className="text-yellow-500 fill-yellow-500" />
                            Insights
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">Arrastra al lienzo para crear objetivos</p>
                    </div>
                    <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                        {recommendations.length}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-3">
                    {recommendations.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No hay recomendaciones disponibles aún.
                        </div>
                    ) : (
                        recommendations.map((rec, i) => (
                            <div
                                key={i}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("application/json", JSON.stringify({
                                        type: 'recommendation',
                                        title: rec.titulo,
                                        description: rec.descripcion
                                    }));
                                }}
                                className="group relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-accent-200 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-1"
                            >
                                <div className="absolute top-4 right-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={14} />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full 
                                        ${rec.prioridad === 'Alta' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {rec.prioridad}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{rec.area}</span>
                                </div>
                                <h4 className="font-bold text-sm text-gray-800 leading-tight mb-1">{rec.titulo}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2">{rec.descripcion}</p>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </div>
    );
};

export default App;