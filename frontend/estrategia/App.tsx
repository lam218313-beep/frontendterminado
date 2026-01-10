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
    ChevronRight,
    Layers
} from 'lucide-react';

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

const App: React.FC = () => {
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('map');

    // Interaction State
    const [mode, setMode] = useState<InteractionMode>('select');
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);

    // --- IMPROVED DRAG STATE ---
    const [isDraggingNodes, setIsDraggingNodes] = useState(false);
    // Store the initial mouse position when drag starts
    const dragStartMouse = useRef<{ x: number, y: number } | null>(null);
    // Store the snapshot of node positions when drag starts
    const initialNodePositions = useRef<{ [id: string]: { x: number, y: number } }>({});

    // Viewport State
    const [scale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const panStart = useRef({ x: 0, y: 0 });
    const panStartOffset = useRef({ x: 0, y: 0 });

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

    // --- Backend Integration ---
    const CLIENT_ID = "demo-client-123"; // TODO: Get from params/context
    const API_URL = "http://localhost:8000/strategy";
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // 1. Load on Mount
    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const res = await fetch(`${API_URL}/${CLIENT_ID}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setNodes(data);
                    }
                }
            } catch (e) {
                console.error("Failed to load strategy nodes:", e);
            }
        };
        fetchNodes();
    }, []);

    // 2. Auto-Save Logic (Debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (nodes.length === 0) return; // Don't save empty if initial load hasn't happened maybe? 
            // Better check: only save if dirtied? For now, simple auto-save is fine.

            setIsSaving(true);
            try {
                await fetch(`${API_URL}/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_id: CLIENT_ID,
                        nodes: nodes
                    })
                });
                setLastSaved(new Date());
            } catch (e) {
                console.error("Failed to save nodes:", e);
            } finally {
                setIsSaving(false);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [nodes]);

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

        // Initialize Drag
        setIsDraggingNodes(true);
        dragStartMouse.current = { x: e.clientX, y: e.clientY };

        // Snapshot positions of ALL nodes (or just selected ones if we only want to move selected)
        // We only move selected nodes, so let's snapshot those.
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

        // Check if clicked on background
        // With pointer-events interaction fix, this logic simplifies
        if (mode === 'pan' || e.button === 1) { // Middle click or Pan mode
            setIsPanning(true);
            panStart.current = { x: e.clientX, y: e.clientY };
            panStartOffset.current = { x: pan.x, y: pan.y };
        } else {
            if (!e.shiftKey) setSelectedNodeIds(new Set());
            const rect = canvasRef.current!.getBoundingClientRect();
            // Calculation for selection box relative to container, not scaled space yet
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

        // --- DRAGGING NODES (Improved Logic) ---
        if (isDraggingNodes && dragStartMouse.current) {
            const dx = (e.clientX - dragStartMouse.current.x) / scale;
            const dy = (e.clientY - dragStartMouse.current.y) / scale;

            setNodes(prev => prev.map(n => {
                // Only update nodes that were selected at start of drag
                if (initialNodePositions.current[n.id]) {
                    return {
                        ...n,
                        x: initialNodePositions.current[n.id].x + dx,
                        y: initialNodePositions.current[n.id].y + dy
                    };
                }
                return n;
            }));
        }
        // --- PANNING CANVAS ---
        else if (isPanning) {
            const dx = e.clientX - panStart.current.x;
            const dy = e.clientY - panStart.current.y;
            setPan({
                x: panStartOffset.current.x + dx,
                y: panStartOffset.current.y + dy
            });
        }
        // --- SELECTION BOX ---
        else if (selectionBox && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const currentX = (e.clientX - rect.left - pan.x) / scale;
            const currentY = (e.clientY - rect.top - pan.y) / scale;

            setSelectionBox(prev => prev ? { ...prev, currentX, currentY } : null);
        }
    }, [isDraggingNodes, isPanning, selectionBox, pan, scale, viewMode]);

    const handleMouseUp = useCallback(() => {
        if (selectionBox) {
            // Finalize Selection
            const x1 = Math.min(selectionBox.startX, selectionBox.currentX);
            const x2 = Math.max(selectionBox.startX, selectionBox.currentX);
            const y1 = Math.min(selectionBox.startY, selectionBox.currentY);
            const y2 = Math.max(selectionBox.startY, selectionBox.currentY);

            const newSelection = new Set(selectedNodeIds);

            // Very basic hit testing centered on node point
            nodes.forEach(node => {
                // Assume rough visual size for hit testing
                const w = node.type === 'main' ? 280 : 200;
                const h = 100;

                // Check intersection
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
            // Pan shortcut
            if (e.code === 'Space') {
                // Optional: could add temporary pan mode on spacebar
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
    const addMainObjective = () => {
        const mainNodes = nodes.filter(n => n.type === 'main');
        if (mainNodes.length >= MAX_MAIN_OBJECTIVES) return;
        const count = mainNodes.length;

        // Position them in a nice circle or grid initially
        const angleStep = 360 / Math.max(MAX_MAIN_OBJECTIVES, 3);
        const angle = -90 + (count * angleStep);

        // Calculate center of screen relative to pan
        const viewportCenterX = (window.innerWidth / 2 - pan.x) / scale;
        const viewportCenterY = (window.innerHeight / 2 - pan.y) / scale;

        const { x, y } = getRadialPosition(viewportCenterX, viewportCenterY, angle, RADIUS_MAIN);

        const newNode: NodeData = {
            id: generateId(),
            type: 'main',
            label: `Nuevo Objetivo`,
            description: '',
            parentId: null,
            x: count === 0 ? viewportCenterX : x, // First one dead center if empty
            y: count === 0 ? viewportCenterY : y,
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

        // Smart positioning logic for children
        const childDist = parent.type === 'main' ? 240 : 180;
        const offsetAngle = siblings.length * 25 + 15; // Simple fanning

        const newNode: NodeData = {
            id: generateId(),
            type: newType,
            label: newType === 'secondary' ? `Estrategia` : `Post`,
            description: '',
            parentId,
            x: parent.x + childDist, // Initial placement, user drags
            y: parent.y + (siblings.length % 2 === 0 ? offsetAngle : -offsetAngle),
        };
        setNodes(prev => [...prev, newNode]);
    };

    // --- Renderers ---

    const getPath = (source: NodeData, target: NodeData) => {
        // Elegant Bezier Curve
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

        // Modern Style Classes
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

                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${iconClasses}`}>
                        {isMain && <Target size={20} />}
                        {isSec && <Zap size={18} fill="currentColor" className="opacity-90" />}
                        {isPost && <FileText size={16} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isMain ? 'text-gray-400' : 'text-gray-400'}`}>
                            {isMain ? 'Objetivo' : isSec ? 'Estrategia' : 'Contenido'}
                        </p>
                        <div className={`font-bold truncate leading-tight ${isMain ? 'text-lg' : 'text-sm'}`}>
                            {node.label}
                        </div>
                    </div>

                    {/* Hover Actions */}
                    {canAdd && (
                        <button
                            onClick={(e) => { e.stopPropagation(); addChildNode(node.id); }}
                            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0
                    ${isMain ? 'bg-white text-brand-dark hover:bg-gray-50' : 'bg-brand-dark text-white hover:bg-gray-800'}`}
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    )}

                    {/* Top Right Option (Visual) */}
                    <button className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${isMain ? 'text-gray-500' : 'text-gray-300'}`}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
        );
    };

    const renderListView = () => {
        const mainNodes = nodes.filter(n => n.type === 'main');

        if (mainNodes.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Layers size={32} className="opacity-30 text-gray-900" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">Tu plan está vacío</p>
                    <p className="text-sm text-gray-500 mt-2">Cambia a la vista de Mapa para empezar.</p>
                </div>
            )
        }

        return (
            <div className="max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-40 space-y-12 overflow-y-auto h-full custom-scrollbar">
                {mainNodes.map(main => {
                    const secondaryNodes = nodes.filter(n => n.parentId === main.id);
                    return (
                        <div key={main.id} className="group relative">
                            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>

                            {/* Main Card */}
                            <div className="relative z-10 glass-dark rounded-[32px] p-8 text-white shadow-float mb-8">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 shrink-0 backdrop-blur-sm">
                                        <Target size={28} className="text-accent-500" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <input
                                            type="text"
                                            value={main.label}
                                            onChange={(e) => updateNodeData(main.id, 'label', e.target.value)}
                                            className="w-full bg-transparent text-2xl md:text-3xl font-bold border-b border-white/10 pb-2 focus:border-accent-500 focus:outline-none placeholder-white/20 transition-all"
                                            placeholder="Define tu Objetivo..."
                                        />
                                        <textarea
                                            value={main.description || ''}
                                            onChange={(e) => updateNodeData(main.id, 'description', e.target.value)}
                                            className="w-full bg-black/20 rounded-xl p-4 text-sm md:text-base text-white/80 focus:bg-black/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-y min-h-[80px]"
                                            placeholder="Añade contexto estratégico, KPIs o notas importantes..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Flow */}
                            <div className="pl-6 space-y-8">
                                {secondaryNodes.map(sec => {
                                    const posts = nodes.filter(n => n.parentId === sec.id);
                                    return (
                                        <div key={sec.id} className="relative pl-8">
                                            <div className="absolute left-0 top-8 w-6 h-0.5 bg-gray-200"></div>

                                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="p-2 bg-accent-50 rounded-xl text-accent-600 mt-1">
                                                        <Zap size={20} fill="currentColor" />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <input
                                                            type="text"
                                                            value={sec.label}
                                                            onChange={(e) => updateNodeData(sec.id, 'label', e.target.value)}
                                                            className="w-full text-lg font-bold text-gray-800 bg-transparent border-b border-gray-100 pb-1 focus:border-accent-500 focus:outline-none"
                                                            placeholder="Nombre de la Estrategia..."
                                                        />
                                                        <textarea
                                                            value={sec.description || ''}
                                                            onChange={(e) => updateNodeData(sec.id, 'description', e.target.value)}
                                                            className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-600 focus:bg-white focus:ring-2 focus:ring-accent-100 focus:outline-none transition-all min-h-[60px]"
                                                            placeholder="Detalles de ejecución..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Posts */}
                                                {posts.length > 0 && (
                                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                                        {posts.map(post => (
                                                            <div key={post.id} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-white transition-all">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <FileText size={14} className="text-gray-400" />
                                                                    <input
                                                                        type="text"
                                                                        value={post.label}
                                                                        onChange={(e) => updateNodeData(post.id, 'label', e.target.value)}
                                                                        className="flex-1 bg-transparent text-sm font-bold text-gray-700 focus:outline-none"
                                                                        placeholder="Título..."
                                                                    />
                                                                </div>
                                                                <textarea
                                                                    value={post.description || ''}
                                                                    onChange={(e) => updateNodeData(post.id, 'description', e.target.value)}
                                                                    className="w-full bg-transparent text-xs text-gray-500 focus:outline-none resize-none h-16 placeholder-gray-300"
                                                                    placeholder="Copy..."
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex h-full min-h-[600px] bg-brand-bg font-sans overflow-hidden text-brand-dark selection:bg-accent-100 selection:text-accent-700">

            <main className="flex-1 relative overflow-hidden flex flex-col">

                {/* Floating Glass Header */}
                <header className="absolute top-6 left-1/2 -translate-x-1/2 h-16 glass-panel rounded-full shadow-float flex items-center gap-4 px-2 z-40 transition-all hover:shadow-glow">
                    {/* Switcher */}
                    <div className="flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/50 backdrop-blur-sm">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${viewMode === 'map' ? 'bg-white text-brand-dark shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Network size={14} /> Mapa
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-brand-dark shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <AlignLeft size={14} /> Listas
                        </button>
                    </div>

                    {/* Tools */}
                    <div className={`flex gap-1 pr-1 transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <button
                            onClick={() => setMode('select')}
                            className={`p-3 rounded-full transition-all duration-200 ${mode === 'select' ? 'bg-accent-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <MousePointer2 size={18} />
                        </button>
                        <button
                            onClick={() => setMode('pan')}
                            className={`p-3 rounded-full transition-all duration-200 ${mode === 'pan' ? 'bg-accent-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <Hand size={18} />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 relative h-full bg-brand-bg">

                    {/* MAP VIEW */}
                    <div
                        ref={canvasRef}
                        onMouseDown={handleCanvasMouseDown}
                        className={`absolute inset-0 w-full h-full overflow-hidden bg-dot-pattern ${viewMode === 'map' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'} ${mode === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                    >
                        <div className="absolute inset-0 w-full h-full origin-center transition-transform duration-75 ease-out will-change-transform pointer-events-none"
                            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>

                            {/* Connections Layer */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                {nodes.map(node => {
                                    if (!node.parentId) return null;
                                    const parent = nodes.find(n => n.id === node.parentId);
                                    if (!parent) return null;
                                    return (
                                        <path
                                            key={`edge-${node.id}`}
                                            d={getPath(parent, node)}
                                            fill="none"
                                            stroke="#CBD5E1"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            className="transition-all duration-500 opacity-60"
                                        />
                                    );
                                })}
                            </svg>

                            {nodes.map(node => renderMapNode(node))}

                            {/* Empty State */}
                            {nodes.length === 0 && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none opacity-50">
                                    <GripHorizontal size={80} className="mx-auto mb-6 text-gray-200" />
                                    <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">Lienzo Infinito</h2>
                                    <p className="text-sm text-gray-400 mt-3 font-medium">Diseña tu estrategia de forma visual.</p>
                                </div>
                            )}
                        </div>

                        {/* Selection Box */}
                        {selectionBox && (
                            <div className="absolute bg-accent-500/10 border border-accent-500/40 rounded-lg z-50 pointer-events-none"
                                style={{
                                    left: Math.min(selectionBox.startX, selectionBox.currentX) * scale + pan.x,
                                    top: Math.min(selectionBox.startY, selectionBox.currentY) * scale + pan.y,
                                    width: Math.abs(selectionBox.currentX - selectionBox.startX) * scale,
                                    height: Math.abs(selectionBox.currentY - selectionBox.startY) * scale
                                }}
                            />
                        )}
                    </div>

                    {/* LIST VIEW */}
                    <div className={`absolute inset-0 w-full h-full overflow-hidden bg-brand-bg ${viewMode === 'list' ? 'opacity-100 visible z-10' : 'opacity-0 invisible pointer-events-none'}`}>
                        {renderListView()}
                    </div>

                </div>

                {/* Bottom Toolbar - Action Dock */}
                {viewMode === 'map' && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-6 duration-500">
                        <div className="glass-panel rounded-2xl p-2 shadow-float flex items-center gap-3 pr-6">
                            <button
                                onClick={addMainObjective}
                                disabled={nodes.filter(n => n.type === 'main').length >= MAX_MAIN_OBJECTIVES}
                                className="group flex items-center gap-3 bg-accent-500 text-white pl-5 pr-6 py-3.5 rounded-xl hover:bg-accent-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                                    <Plus size={16} strokeWidth={3} />
                                </div>
                                <span className="font-bold text-sm tracking-wide">Nuevo Objetivo</span>
                            </button>

                            <div className="w-px h-8 bg-gray-300 mx-2"></div>

                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Capacidad</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="bg-accent-500 h-full transition-all duration-500" style={{ width: `${(nodes.filter(n => n.type === 'main').length / MAX_MAIN_OBJECTIVES) * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-brand-dark">{nodes.filter(n => n.type === 'main').length}/{MAX_MAIN_OBJECTIVES}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default App;