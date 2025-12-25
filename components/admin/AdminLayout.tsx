import React from 'react';
import { LayoutDashboard, Briefcase, Database, DollarSign, Monitor, LogOut, MessageSquare, FileText } from 'lucide-react';

export type AdminTab = 'dashboard' | 'orders' | 'services' | 'finance' | 'messages' | 'requests';

interface AdminLayoutProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ activeTab, setActiveTab, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menu = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Order Kanban', icon: <Briefcase size={20} /> },
    { id: 'requests', label: 'Custom Requests', icon: <FileText size={20} /> },
    { id: 'services', label: 'Services CMS', icon: <Database size={20} /> },
    { id: 'messages', label: 'Message Center', icon: <MessageSquare size={20} /> },
    { id: 'finance', label: 'Finance', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-900 text-white z-40 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-blue-600 p-1.5 rounded-lg"><Monitor size={16} /></div>
          Codexier<span className="text-blue-500">Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white">
          {isMobileMenuOpen ? <Monitor size={24} className="rotate-45" /> : <Monitor size={24} />}
          {/* Note: Monitor icon misused as close for now, but simple enough. A proper menu icon is better if imported. */}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-slate-300 border-r border-slate-800 z-50 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-2 text-white font-bold text-xl border-b border-slate-800">
          <div className="bg-blue-600 p-1.5 rounded-lg"><Monitor size={20} /></div>
          Codexier<span className="text-blue-500">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as AdminTab); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              {item.icon}<span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <LogOut size={20} /><span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto h-screen w-full">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="flex items-center gap-3 pl-4 md:border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">Administrator</div>
                <div className="text-xs text-slate-500">Super User</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;