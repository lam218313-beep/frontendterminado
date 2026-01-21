import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// --- DATA STRUCTURES ---

export interface ContextBlock {
    id: string;
    label: string;
    text: string;
    selected: boolean;
    type: 'interview' | 'manual' | 'analysis';
}

export interface StudioState {
    // META
    currentStep: number;
    totalSteps: number;

    // PASO 1: Contexto
    clientId: string;
    contextBlocks: ContextBlock[];
    customContext: string;

    // PASO 2: Estrategia
    taskId: string;
    taskData?: any;
    excludedTaskFields: string[]; // Fields deselected by user in Step 1
    strategyContext: {
        objective: string;
        keyMessage: string;
        targetAudience: string;
    };

    // PASO 3: Assets
    assets: {
        products: string[];
        backgrounds: string[];
        references: string[];
    };

    // PASO 4: Estilo
    styleConfig: {
        archetype: 'PROMO' | 'LIFESTYLE' | 'PRODUCT_FOCUS' | 'MINIMAL' | 'EDITORIAL' | 'NONE';
        parameters: {
            lighting: string;
            mood: string;
            colorPalette: string[];
        };
    };
}

// --- INITIAL STATE ---

const initialState: StudioState = {
    currentStep: 1,
    totalSteps: 5,
    clientId: '',
    contextBlocks: [],
    customContext: '',
    taskId: '',
    excludedTaskFields: [],
    strategyContext: {
        objective: '',
        keyMessage: '',
        targetAudience: '',
    },
    assets: {
        products: [],
        backgrounds: [],
        references: [],
    },
    styleConfig: {
        archetype: 'NONE',
        parameters: {
            lighting: 'Studio',
            mood: 'Professional',
            colorPalette: [],
        },
    },
};

// --- ACTIONS ---

type Action =
    | { type: 'SET_CLIENT'; payload: string }
    | { type: 'SET_STEP'; payload: number }
    | { type: 'NEXT_STEP' }
    | { type: 'PREV_STEP' }
    | { type: 'TOGGLE_BLOCK'; payload: { id: string; block?: ContextBlock } }
    | { type: 'SET_CUSTOM_CONTEXT'; payload: string }
    | { type: 'LOAD_CONTEXT_BLOCKS'; payload: ContextBlock[] }
    | { type: 'SET_INITIAL_DATA'; payload: { clientId: string; taskId?: string; taskData?: any } }
    | { type: 'TOGGLE_TASK_FIELD'; payload: { field: string } }
    | { type: 'RESET_WIZARD' };

// --- REDUCER ---

const studioReducer = (state: StudioState, action: Action): StudioState => {
    switch (action.type) {
        case 'SET_CLIENT':
            return { ...state, clientId: action.payload, contextBlocks: [] }; // Reset blocks on client change
        case 'SET_STEP':
            return { ...state, currentStep: action.payload };
        case 'NEXT_STEP':
            return { ...state, currentStep: Math.min(state.currentStep + 1, state.totalSteps) };
        case 'PREV_STEP':
            return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
        case 'TOGGLE_BLOCK': {
            const { id, block } = action.payload;
            const exists = state.contextBlocks.find((b) => b.id === id);

            if (exists) {
                // Toggle existing selection
                return {
                    ...state,
                    contextBlocks: state.contextBlocks.map((b) =>
                        b.id === id ? { ...b, selected: !b.selected } : b
                    ),
                };
            } else if (block) {
                // Add new block if provided (and not present)
                return {
                    ...state,
                    contextBlocks: [...state.contextBlocks, { ...block, selected: true }]
                };
            }
            return state;
        }
        case 'TOGGLE_TASK_FIELD': {
            const { field } = action.payload;
            const isExcluded = state.excludedTaskFields.includes(field);
            return {
                ...state,
                excludedTaskFields: isExcluded
                    ? state.excludedTaskFields.filter(f => f !== field) // Remove from excluded (select it)
                    : [...state.excludedTaskFields, field] // Add to excluded (deselect it)
            };
        }
        case 'LOAD_CONTEXT_BLOCKS':
            return {
                ...state,
                contextBlocks: action.payload
            };
        case 'SET_CUSTOM_CONTEXT':
            return { ...state, customContext: action.payload };
        case 'SET_INITIAL_DATA':
            // Pre-fills the wizard with data from an external source (e.g. Content Factory)
            return {
                ...state,
                clientId: action.payload.clientId,
                taskId: action.payload.taskId || '',
                taskData: action.payload.taskData,
                excludedTaskFields: [], // Reset exclusion on new data load
                // We can mapped the incoming task data to specific steps here if needed
                // For now we just ensure client is set so Step 1 works
                currentStep: 1
            };
        case 'RESET_WIZARD':
            return initialState;
        default:
            return state;
    }
};

// --- CONTEXT ---

interface StudioContextType {
    state: StudioState;
    dispatch: React.Dispatch<Action>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(studioReducer, initialState);

    return (
        <StudioContext.Provider value={{ state, dispatch }}>
            {children}
        </StudioContext.Provider>
    );
};

export const useStudio = () => {
    const context = useContext(StudioContext);
    if (!context) {
        throw new Error('useStudio must be used within a StudioProvider');
    }
    return context;
};
