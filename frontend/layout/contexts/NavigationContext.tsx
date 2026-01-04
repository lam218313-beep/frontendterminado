/**
 * Pixely Partners - Navigation Context
 * 
 * Shared navigation state for the app
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType = 'dashboard' | 'partners' | 'lab' | 'work' | 'wiki';

interface NavigationContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  navigateToTasks: () => void;
  navigateToLab: () => void;
  navigateToDashboard: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const navigateToTasks = () => setActiveView('work');
  const navigateToLab = () => setActiveView('lab');
  const navigateToDashboard = () => setActiveView('dashboard');

  return (
    <NavigationContext.Provider value={{ 
      activeView, 
      setActiveView, 
      navigateToTasks, 
      navigateToLab, 
      navigateToDashboard 
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
