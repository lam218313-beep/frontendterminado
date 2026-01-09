/**
 * usePlanAccess Hook
 * 
 * Provides plan-based access control for features and panels
 */

import { useAuth } from '../contexts/AuthContext';

// Define which plans have access to which features
const FEATURE_ACCESS: Record<string, string[]> = {
    // Panels - which plans can access each panel
    entrevista: ['free_trial', 'lite', 'basic', 'pro', 'premium'],
    analisis_basico: ['free_trial', 'lite', 'basic', 'pro', 'premium'],
    analisis_completo: ['basic', 'pro', 'premium'],
    estrategia: ['pro', 'premium'],
    validacion: ['pro', 'premium'],
    brand_book: ['premium'],

    // Benefits - which plans unlock each benefit
    benefit_1: ['lite', 'basic', 'pro', 'premium'],
    benefit_2: ['basic', 'pro', 'premium'],
    benefit_3: ['basic', 'pro', 'premium'],
    benefit_4: ['pro', 'premium'],
    benefit_5: ['premium'],
};

// Human-readable plan names
const PLAN_NAMES: Record<string, string> = {
    free_trial: 'Prueba Gratis',
    lite: 'Lite',
    basic: 'Basic',
    pro: 'Pro',
    premium: 'Premium',
};

// Get minimum required plan for a feature
function getMinimumPlan(feature: string): string {
    const plans = FEATURE_ACCESS[feature];
    if (!plans || plans.length === 0) return 'premium';

    // Return the first (lowest) plan in the access list
    const planOrder = ['free_trial', 'lite', 'basic', 'pro', 'premium'];
    for (const plan of planOrder) {
        if (plans.includes(plan)) return plan;
    }
    return 'premium';
}

interface PlanAccessResult {
    hasAccess: boolean;
    requiredPlan: string;
    requiredPlanName: string;
    currentPlan: string;
    currentPlanName: string;
}

export function usePlanAccess(feature: string): PlanAccessResult {
    const { user } = useAuth();

    const currentPlan = user?.plan || 'free_trial';
    const allowedPlans = FEATURE_ACCESS[feature] || [];
    const hasAccess = allowedPlans.includes(currentPlan);
    const requiredPlan = getMinimumPlan(feature);

    return {
        hasAccess,
        requiredPlan,
        requiredPlanName: PLAN_NAMES[requiredPlan] || requiredPlan,
        currentPlan,
        currentPlanName: PLAN_NAMES[currentPlan] || currentPlan,
    };
}

// Helper to check benefit access (considering both plan and individual grants)
export function useBenefitAccess(benefitId: string): PlanAccessResult & { isGranted: boolean } {
    const { user } = useAuth();
    const planAccess = usePlanAccess(benefitId);

    // Check if benefit is individually granted to user
    const isGranted = user?.benefits?.includes(benefitId) || false;

    return {
        ...planAccess,
        hasAccess: planAccess.hasAccess || isGranted,
        isGranted,
    };
}

export default usePlanAccess;
