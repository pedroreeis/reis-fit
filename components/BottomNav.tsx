import React from 'react';
import { Page } from '../types';
import Icon, { IconName } from './Icon';

interface BottomNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: IconName;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
    }`}
  >
    <Icon name={icon} size={24} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigate }) => {
  const navItems: { page: Page; label: string; icon: IconName }[] = [
    { page: 'dashboard', label: 'Início', icon: 'Home' },
    { page: 'workouts', label: 'Treinos', icon: 'Dumbbell' },
    { page: 'history', label: 'Histórico', icon: 'History' },
    { page: 'settings', label: 'Ajustes', icon: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] flex justify-around z-50">
      {navItems.map((item) => (
        <NavItem
          key={item.page}
          label={item.label}
          icon={item.icon}
          isActive={activePage === item.page}
          onClick={() => onNavigate(item.page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;