import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="h-auto min-h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 py-2 gap-2 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white whitespace-nowrap">
          Zero-Cost RAG
        </h1>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">{user?.email || 'User'}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
