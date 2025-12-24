import React, { useState } from 'react';
import { Search, Send, User, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Message } from '../../types';

interface AdminMessagesProps {
    messages?: Message[];
    onSendMessage?: (text: string) => void;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ messages = [], onSendMessage = () => { } }) => {
    const [selectedClient, setSelectedClient] = useState<string>('Client'); // Default to our main client
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (onSendMessage) {
            onSendMessage(inputText);
        }
        setInputText('');
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            {/* Sidebar: Client List */}
            <div className="w-80 bg-slate-50 border-r border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Inbox</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Search client..." className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Mock Conversation List */}
                    <div className="p-4 bg-white border-l-4 border-blue-600 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900 text-sm">Client</span>
                            <span className="text-[10px] text-slate-400">now</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{messages[messages.length - 1]?.text || 'No messages'}</p>
                    </div>
                    {/* Inactive Dummy Chats */}
                    <div className="p-4 hover:bg-slate-100 cursor-pointer border-l-4 border-transparent opacity-60">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900 text-sm">Acme Corp</span>
                            <span className="text-[10px] text-slate-400">2d</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">Looking forward to the update.</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">C</div>
                        <div>
                            <div className="font-bold text-slate-900 text-sm">Client</div>
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active Now
                            </div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><MoreVertical size={20} /></button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 pr-4 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input
                            type="text"
                            placeholder="Type reply..."
                            className="flex-1 bg-transparent border-none outline-none text-sm p-2 text-slate-900"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Send size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;