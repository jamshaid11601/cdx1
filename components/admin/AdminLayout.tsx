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
      <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-slate-300 border-r border-slate-800 z-50">
        <div className="p-6 flex items-center gap-2 text-white font-bold text-xl border-b border-slate-800">
          <div className="bg-blue-600 p-1.5 rounded-lg"><Monitor size={20} /></div>
          Codexier<span className="text-blue-500">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as AdminTab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}>
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
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
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