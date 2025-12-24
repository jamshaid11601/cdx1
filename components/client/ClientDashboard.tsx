import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard, ShoppingBag, MessageSquare, Settings, LogOut,
    Clock, CheckCircle2, AlertCircle, ArrowRight, Download,
    Folder, FileText, Image as ImageIcon, FileCode, Paperclip, Send,
    Bell, CreditCard, User as UserIcon, Shield, Search, MoreVertical, PlusCircle, Menu,
    Loader2
} from 'lucide-react';
import { Order, User, Gig, Message, OrderStatus } from '../../types';
import Marketplace from '../public/Marketplace';
import ClientMessages from './ClientMessages';

interface ClientDashboardProps {
    user: User;
    orders: Order[];
    gigs: Gig[];
    messages: Message[];
    onSendMessage: (text: string) => void;
    onLogout: () => void;
    onBrowse: () => void;
    onBuy: (gig: Gig) => void;
}

type Tab = 'dashboard' | 'browse' | 'projects' | 'messages' | 'files' | 'settings';

const STAGES: { id: OrderStatus; label: string; desc: string }[] = [
    { id: 'pending', label: 'Pending', desc: 'Order placed, awaiting assignment.' },
    { id: 'in_progress', label: 'In Progress', desc: 'Development team is working.' },
    { id: 'review', label: 'Review', desc: 'QA testing and client review.' },
    { id: 'completed', label: 'Completed', desc: 'Project deployed and delivered.' }
];

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, orders, gigs, messages, onSendMessage, onLogout, onBrowse, onBuy }) => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (activeTab === 'messages') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    // Filter orders for this specific client
    const myOrders = orders.filter(o => o.client === user.name);
    const activeOrder = myOrders.find(o => o.status === 'in_progress' || o.status === 'pending');

    const handleStartNewProject = () => {
        setActiveTab('browse');
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        onSendMessage(chatInput);
        setChatInput('');
    };

    // --- Render Helpers (Fixed: Changed from Components to Functions to prevent re-render focus loss) ---

    const renderDashboardOverview = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 md:p-10 lg:p-12">
            <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
                    <p className="text-slate-500 font-light">Here is what's happening with your projects today.</p>
                </div>
                <button onClick={handleStartNewProject} className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/10 flex items-center gap-2">
                    <PlusCircle size={18} /> Start New Project
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">{myOrders.length}</div>
                    <div className="text-slate-500 text-sm font-medium">Total Orders</div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">{myOrders.filter(o => o.status === 'in_progress').length}</div>
                    <div className="text-slate-500 text-sm font-medium">Active Projects</div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('messages')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <MessageSquare size={24} />
                        </div>
                        {messages.some(m => !m.read && m.sender === 'admin') && <span className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>}
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">{messages.filter(m => !m.read && m.sender === 'admin').length}</div>
                    <div className="text-slate-500 text-sm font-medium">Unread Messages</div>
                </div>
            </div>

            {/* Recent Activity / Active Order Preview */}
            {activeOrder && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Active Project Status</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Loader2 size={24} className="text-blue-600 animate-spin" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{gigs.find(g => g.id === activeOrder.gigId)?.title}</div>
                            <div className="text-sm text-slate-500">Order #{activeOrder.id}</div>
                        </div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                            style={{ width: activeOrder.status === 'pending' ? '25%' : activeOrder.status === 'in_progress' ? '50%' : activeOrder.status === 'review' ? '75%' : '100%' }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Initiated</span>
                        <span className="text-blue-600">
                            {activeOrder.status === 'in_progress' ? 'Developing...' : activeOrder.status === 'review' ? 'Reviewing...' : 'Pending...'}
                        </span>
                        <span>Launch</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMessagesView = () => <ClientMessages />;

    const renderProjectsView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 p-6 md:p-10 lg:p-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Projects</h1>
                <p className="text-slate-500 mt-2">Track the live progress of your engineering requests.</p>
            </header>
            <div className="grid gap-8">
                {myOrders.length > 0 ? myOrders.map(order => {
                    const currentStageIndex = STAGES.findIndex(s => s.id === order.status);

                    return (
                        <div key={order.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 border-b border-slate-100 pb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'review' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }`}>
                                            {/* Display nice label based on status */}
                                            {STAGES.find(s => s.id === order.status)?.label || order.status}
                                        </span>
                                        <span className="text-slate-400 text-sm font-mono">#{order.id}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{gigs.find(g => g.id === order.gigId)?.title || 'Custom Enterprise Project'}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Investment</div>
                                    <div className="text-2xl font-bold text-slate-900">${order.amount.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Stage Stepper */}
                            <div className="mb-8">
                                <div className="grid grid-cols-4 gap-4 relative">
                                    {/* Connecting Line */}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

                                    {STAGES.map((stage, idx) => {
                                        const isCompleted = idx <= currentStageIndex;
                                        const isCurrent = idx === currentStageIndex;

                                        return (
                                            <div key={stage.id} className="flex flex-col items-center text-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-all duration-500 z-10 ${isCompleted ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                                                </div>
                                                <div className={`text-sm font-bold transition-colors ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {stage.label}
                                                </div>
                                                <div className="hidden md:block text-xs text-slate-400 mt-1 max-w-[120px]">
                                                    {stage.desc}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="flex justify-between items-center pt-4">
                                <div className="flex -space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">DT</div>
                                    <div className="w-10 h-10 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">PM</div>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 text-xs font-bold">+2</div>
                                </div>
                                <button className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2">
                                    View Full Timeline <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200">
                        <p className="text-slate-500">No projects found.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderFilesView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 p-6 md:p-10 lg:p-12">
            <header className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Files & Assets</h1></header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Contract_Signed.pdf', 'Design_System.fig', 'Invoice_001.pdf', 'Codebase_v1.zip'].map((file, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText size={24} />
                        </div>
                        <div className="font-bold text-slate-900 truncate mb-1">{file}</div>
                        <div className="text-xs text-slate-400">2.4 MB • 2 days ago</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSettingsView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl p-6 md:p-10 lg:p-12">
            <header className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1></header>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <button className="text-blue-600 font-bold text-sm hover:underline">Change Avatar</button>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                        <input type="text" value={user.name} readOnly className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input type="text" value={user.email} readOnly className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
                    </div>
                </div>
                <div className="pt-6 border-t border-slate-100">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Save Changes</button>
                </div>
            </div>
        </div>
    );

    const renderBrowseView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 p-6 md:p-10 lg:p-12">
            <Marketplace setPage={() => { }} gigs={gigs} onBuy={onBuy} isEmbedded={true} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 p-4 flex justify-between items-center">
                <span className="text-xl font-bold tracking-tighter text-slate-900">
                    codexier<span className="text-blue-600">.</span>
                </span>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar Navigation */}
            <div className={`
        w-80 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 transition-transform duration-300 md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        top-0 left-0
      `}>
                <div className="p-8 pb-4 hidden md:block">
                    <span className="text-2xl font-bold tracking-tighter text-slate-900 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        codexier<span className="text-blue-600">.</span>
                    </span>
                </div>

                {/* Mobile Close */}
                <div className="md:hidden p-4 flex justify-end">
                    <button onClick={() => setMobileMenuOpen(false)}><ArrowRight size={24} className="rotate-180" /></button>
                </div>

                <nav className="flex-1 px-6 space-y-2 py-6">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                        { id: 'browse', label: 'Browse Services', icon: <ShoppingBag size={20} /> },
                        { id: 'projects', label: 'My Projects', icon: <Folder size={20} /> },
                        { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} />, badge: messages.filter(m => !m.read && m.sender === 'admin').length },
                        { id: 'files', label: 'Files & Assets', icon: <FileText size={20} /> },
                        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id as Tab);
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all duration-200 group relative ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <div className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>{item.icon}</div>
                            {item.label}
                            {item.badge > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>
                {/* Footer Sidebar ... */}
                <div className="p-6 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {user.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-bold text-slate-900 text-sm truncate">{user.name}</div>
                                <div className="text-xs text-slate-400 truncate">{user.email || 'client@codexier.com'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <Shield size={10} className="text-green-500" /> Client Account
                        </div>
                    </div>

                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className={`flex-1 md:ml-80 overflow-x-hidden pt-20 md:pt-0 ${activeTab === 'messages' ? 'p-0' : 'bg-slate-50'}`}>
                {activeTab === 'dashboard' && renderDashboardOverview()}
                {activeTab === 'browse' && renderBrowseView()}
                {activeTab === 'projects' && renderProjectsView()}
                {activeTab === 'messages' && renderMessagesView()}
                {activeTab === 'files' && renderFilesView()}
                {activeTab === 'settings' && renderSettingsView()}
            </main>
        </div>
    );
};

export default ClientDashboard;