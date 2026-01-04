import React from 'react';
import { LayoutGrid, Users, Layers, FileText, BookOpen, Power, Hexagon, Shield } from 'lucide-react';
import pixelyLogo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    activeView: string;
    setActiveView: (view: string) => void;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded, activeView, setActiveView, onLogout }) => {
    const { user } = useAuth();

    return (
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`fixed left-4 top-4 h-[calc(100vh-2rem)] bg-brand-dark text-white flex flex-col py-6 z-40 transition-all duration-300 ease-in-out group overflow-hidden shadow-2xl rounded-[30px] border border-white/5 font-sans ${isExpanded ? 'w-72' : 'w-[88px]'}`}
        >

            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center relative shrink-0 w-full">
                <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 overflow-hidden">
                    <img src={pixelyLogo} alt="Pixely Logo" className="w-full h-full object-contain" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col justify-center space-y-3 px-3 w-full">
                <SidebarItem
                    icon={Users}
                    label="Pixely Partners"
                    viewId="partners"
                    isActive={activeView === 'partners'}
                    onClick={setActiveView}
                />
                <SidebarItem
                    icon={LayoutGrid}
                    label="Dashboard"
                    viewId="dashboard"
                    isActive={activeView === 'dashboard'}
                    onClick={setActiveView}
                />
                <SidebarItem
                    icon={Layers}
                    label="Lab"
                    viewId="lab"
                    isActive={activeView === 'lab'}
                    onClick={setActiveView}
                />
                <SidebarItem
                    icon={FileText}
                    label="Tareas"
                    viewId="work"
                    isActive={activeView === 'work'}
                    onClick={setActiveView}
                />
                <SidebarItem
                    icon={BookOpen}
                    label="Wiki"
                    viewId="wiki"
                    isActive={activeView === 'wiki'}
                    onClick={setActiveView}
                />

                {/* Admin Link - ONLY visible for admin users */}
                {user?.isAdmin && (
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <SidebarItem
                            icon={Shield}
                            label="Admin"
                            viewId="admin"
                            isActive={activeView === 'admin'}
                            onClick={setActiveView}
                        />
                    </div>
                )}
            </nav>

            {/* --- Bottom User Section --- */}
            <div className="px-3 mb-2 w-full shrink-0">
                <div className="flex items-center p-3 rounded-[20px] bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors overflow-hidden relative h-[68px] group/user">

                    {/* Avatar with Initial */}
                    <div className="relative w-10 h-10 shrink-0">
                        {user?.logoUrl ? (
                            <img
                                src={user.logoUrl}
                                alt="User"
                                className="w-full h-full object-cover rounded-full border-2 border-white/10 shadow-sm"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full border-2 border-white/10 shadow-sm bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                                </span>
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-chart-green border-2 border-brand-dark rounded-full"></div>
                    </div>

                    {/* User Info (Reveals on hover) */}
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-w-[120px]">
                        <span className="block text-sm font-bold text-white leading-none mb-1">{user?.email ? user.email.split('@')[0] : "Usuario Demo"}</span>
                        <span className="block text-[10px] text-gray-300 font-medium">{user?.email || "admin@pixely.com"}</span>
                    </div>

                    {/* Logout / Power Icon (Absolute right, reveals on hover) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLogout();
                        }}
                        className="absolute right-4 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <Power size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

// Helper Component for Items
interface SidebarItemProps {
    icon: any;
    label: string;
    viewId: string;
    isActive: boolean;
    onClick: (view: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, viewId, isActive, onClick }) => (
    <button
        onClick={() => onClick(viewId)}
        className={`w-full flex items-center h-12 rounded-[18px] transition-all duration-200 relative group/item overflow-hidden ${isActive
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
        {/* Icon container */}
        <div className="w-[64px] flex items-center justify-center shrink-0">
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        </div>

        {/* Label */}
        <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 ${isActive ? 'font-bold' : ''}`}>
            {label}
        </span>

        {/* Active Indicator Dot */}
        {isActive && (
            <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
    </button>
);