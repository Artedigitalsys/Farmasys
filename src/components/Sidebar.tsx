import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Pill as Pills, 
  PackageOpen, 
  BarChart2, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Building2,
  ClipboardList
} from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const { logout, hasPermission } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, permission: null },
    { name: 'Medicamentos', path: '/medications', icon: <Pills size={20} />, permission: 'medications.view' },
    { name: 'Lotes', path: '/batches', icon: <PackageOpen size={20} />, permission: 'batches.view' },
    { name: 'Estoque', path: '/inventory', icon: <BarChart2 size={20} />, permission: 'inventory.manage' },
    { name: 'Fornecedores', path: '/suppliers', icon: <Building2 size={20} />, permission: 'medications.manage' },
    { name: 'Motivos', path: '/reasons', icon: <ClipboardList size={20} />, permission: 'inventory.manage' },
    { name: 'Configurações', path: '/settings', icon: <Settings size={20} />, permission: 'users.manage' },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-br from-blue-800 to-blue-900 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700">
          <div className="flex items-center space-x-2">
            <PackageOpen className="h-8 w-8 text-blue-200" />
            <h1 className="text-xl font-bold">PharmaSys</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden focus:outline-none"
          >
            <X size={24} className="text-blue-200" />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                if (item.permission && !hasPermission(item.permission)) {
                  return null;
                }

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-700 text-white'
                            : 'text-blue-100 hover:bg-blue-700/50'
                        }`
                      }
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-blue-700">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-blue-100 rounded-lg hover:bg-blue-700/50 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Toggle button for large screens */}
        <button
          onClick={toggleSidebar}
          className="absolute right-0 top-20 hidden lg:flex items-center justify-center w-6 h-10 -mr-6 rounded-r-md bg-blue-800 text-blue-100"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className={`fixed bottom-4 right-4 z-40 lg:hidden flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <Menu size={24} />
      </button>
    </>
  );
};

export default Sidebar;