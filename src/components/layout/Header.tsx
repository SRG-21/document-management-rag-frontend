import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Zero-Cost RAG System
        </h1>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4" />
            <span>{user?.email || 'User'}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
