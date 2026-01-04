import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { LoginForm, WorkflowVisual, SuccessAnimation } from './components/LoginComponents.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { RightSidebar } from './components/RightSidebar.tsx';
import { LabView } from './components/LabView.tsx';
import { TasksView } from './components/TasksView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import WikiView from './components/WikiView.tsx';
import PartnersView from './components/PartnersView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { Layout, AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { AnalysisProvider } from './hooks/useAnalysis.tsx';
import { TasksProvider } from './hooks/useTasks.tsx';

// =============================================================================
// ERROR BOUNDARY
// =============================================================================
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle size={40} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Algo salió mal</h3>
            <p className="text-sm text-gray-500 mb-4">{this.state.error?.message || 'Error desconocido'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Transition States
type FlowState = 'LOGIN_ACTIVE' | 'LOGIN_EXITING' | 'ANIMATION_ENTRY' | 'ANIMATION_EXITING' | 'DASHBOARD_ACTIVE';
type ViewType = 'dashboard' | 'partners' | 'lab' | 'work' | 'wiki' | 'admin';

// Inner App component that uses auth context
const AppContent: React.FC = () => {
  const { user: authUser, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [flow, setFlow] = useState<FlowState>('LOGIN_ACTIVE');
  const [displayUser, setDisplayUser] = useState('');

  // State to track sidebar hover/expansion
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // State to track active page view
  const [activeView, setActiveView] = useState<string>('partners');

  // Check for existing session on mount
  useEffect(() => {
    if (isAuthenticated && authUser && !authLoading) {
      // Skip animation if already authenticated
      setDisplayUser(authUser.email.split('@')[0]);
      setFlow('DASHBOARD_ACTIVE');
      setActiveView('partners');
    }
  }, [isAuthenticated, authUser, authLoading]);

  // Handler for login form submission
  const handleLogin = (username: string) => {
    setDisplayUser(username);
    setFlow('LOGIN_EXITING');
    setActiveView('partners');
  };

  // Handler for logout
  const handleLogout = () => {
    logout();
    setDisplayUser('');
    setFlow('LOGIN_ACTIVE');
  };

  // State Machine for Transitions
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (flow === 'LOGIN_EXITING') {
      timer = setTimeout(() => setFlow('ANIMATION_ENTRY'), 400);
    }
    else if (flow === 'ANIMATION_ENTRY') {
      timer = setTimeout(() => setFlow('ANIMATION_EXITING'), 2800);
    }
    else if (flow === 'ANIMATION_EXITING') {
      timer = setTimeout(() => setFlow('DASHBOARD_ACTIVE'), 600);
    }

    return () => clearTimeout(timer);
  }, [flow]);

  // Content Renderer Logic
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <DashboardView />
          </ErrorBoundary>
        );
      case 'partners':
        return (
          <ErrorBoundary>
            <PartnersView />
          </ErrorBoundary>
        );
      case 'lab':
        return (
          <ErrorBoundary>
            <LabView />
          </ErrorBoundary>
        );
      case 'work':
        return (
          <ErrorBoundary>
            <TasksView />
          </ErrorBoundary>
        );
      case 'wiki':
        return (
          <ErrorBoundary>
            <WikiView />
          </ErrorBoundary>
        );
      case 'admin':
        return (
          <ErrorBoundary>
            <AdminView />
          </ErrorBoundary>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden relative">

      {/* 1. LOGIN VIEW */}
      {(flow === 'LOGIN_ACTIVE' || flow === 'LOGIN_EXITING') && (
        <div
          className={`absolute inset-0 z-50 flex h-screen w-full transition-all duration-500 ease-in-out ${flow === 'LOGIN_EXITING' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}
        >
          {/* Left Side */}
          <div className="hidden lg:flex w-1/2 bg-brand-bg relative items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary-100/50 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[100px]"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <WorkflowVisual />
              <div className="mt-12 text-center max-w-md px-6">
                <h2 className="text-2xl font-bold text-brand-dark mb-3">Estrategia integrada</h2>
                <p className="text-gray-500 leading-relaxed">
                  Transforma datos dispersos en estrategias de alto impacto con nuestra plataforma de análisis semántico.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 md:p-12 relative">
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      )}

      {/* 2. SUCCESS ANIMATION OVERLAY */}
      {(flow === 'ANIMATION_ENTRY' || flow === 'ANIMATION_EXITING') && (
        <SuccessAnimation
          username={displayUser}
          isExiting={flow === 'ANIMATION_EXITING'}
        />
      )}

      {/* 3. DASHBOARD LAYOUT (Final State) */}
      {flow === 'DASHBOARD_ACTIVE' && (
        <div className="absolute inset-0 z-0 h-screen w-full bg-brand-bg flex animate-[fade-in_0.8s_ease-out]">

          {/* Sidebar Left (Fixed Floating Card) */}
          <Sidebar
            isExpanded={sidebarExpanded}
            setIsExpanded={setSidebarExpanded}
            activeView={activeView}
            setActiveView={setActiveView}
            onLogout={handleLogout}
          />

          {/* Main Layout Area */}
          <div className={`flex-1 flex ${sidebarExpanded ? 'pl-[320px]' : 'pl-[120px]'} h-full overflow-hidden transition-all duration-300 ease-in-out`}>

            {/* Center Content */}
            <main className="flex-1 flex flex-col relative h-full overflow-hidden py-4 pr-4">

              {/* Header Section (Redesigned) */}
              <div className="flex items-center justify-end mb-6 shrink-0 pt-4 px-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight">
                  Buenos días, {displayUser || 'Usuario'}!
                </h1>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                  {authUser?.logoUrl ? (
                    <img
                      src={authUser.logoUrl}
                      alt="Client"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {authUser?.email ? authUser.email.charAt(0).toUpperCase() : displayUser.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Card Container */}
              <div className="flex-1 min-h-0 bg-transparent rounded-[40px] relative overflow-y-auto group flex flex-col items-stretch justify-start mb-2 transition-all duration-500">

                {/* Subtle grid background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>

                {/* Render Content based on activeView */}
                <div className="relative z-10 flex-1 flex flex-col">
                  {renderContent()}
                </div>
              </div>

              {/* Footer Credit */}
              <div className="mt-2 text-center shrink-0">
                <p className="text-[10px] text-gray-300 font-medium flex items-center justify-center gap-1">
                  <span className="text-primary-500">❤</span>
                  <span>DIKIMRO</span>
                </p>
              </div>
            </main>

            {/* Sidebar Right (Floating Card) */}
            <RightSidebar onNavigateToTasks={() => setActiveView('work')} />
          </div>
        </div>
      )}
    </div>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <TasksProvider>
          <AppContent />
        </TasksProvider>
      </AnalysisProvider>
    </AuthProvider>
  );
};

export default App;