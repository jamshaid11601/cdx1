import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
    id: string;
    project_id: string | null;
    sender_id: string;
    sender_type: 'client' | 'admin';
    message_text: string;
    read: boolean;
    created_at: string;
}

interface Project {
    id: string;
    title: string;
    request_id?: string | null;
}

interface ClientMessagesProps {
    selectedProjectId?: string | null;
}

const ClientMessages: React.FC<ClientMessagesProps> = ({ selectedProjectId: propSelectedProjectId }) => {
    const { user, supabaseUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Generate professional order number
    const generateOrderNumber = (projectId: string): string => {
        const idSuffix = projectId.slice(-8);
        const numericPart = parseInt(idSuffix, 16) % 10000;
        return `CDX-${String(numericPart).padStart(4, '0')}`;
    };

    // Fetch user's projects
    useEffect(() => {
        if (supabaseUser) {
            fetchProjects();
        }
    }, [supabaseUser]);

    // Sync with prop selectedProjectId
    useEffect(() => {
        if (propSelectedProjectId && projects.length > 0) {
            setSelectedProject(propSelectedProjectId);
        }
    }, [propSelectedProjectId, projects]);

    // Fetch messages when project is selected
    useEffect(() => {
        if (selectedProject) {
            const currentProject = projects.find(p => p.id === selectedProject);
            const messageFilter = currentProject?.request_id
                ? `request_id=eq.${currentProject.request_id}`
                : `project_id=eq.${selectedProject}`;

            fetchMessages();

            // Set up real-time subscription
            const subscription = supabase
                .channel(`project_messages_${selectedProject}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: messageFilter
                }, () => {
                    fetchMessages();
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [selectedProject, projects]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchProjects = async () => {
        try {
            const { data: clientData } = await supabase
                .from('clients')
                .select('id')
                .eq('user_id', supabaseUser!.id)
                .single();

            if (!clientData) return;

            // Fetch regular projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('id, title')
                .eq('client_id', clientData.id)
                .order('created_at', { ascending: false });

            if (projectsError) throw projectsError;

            // Fetch custom orders
            const { data: customOrdersData, error: customOrdersError } = await supabase
                .from('custom_orders')
                .select('id, title, request_id')
                .eq('client_id', clientData.id)
                .order('created_at', { ascending: false });

            if (customOrdersError) throw customOrdersError;

            // Combine both
            const allProjects: Project[] = [
                ...(projectsData || []),
                ...(customOrdersData || [])
            ];

            setProjects(allProjects);
            if (allProjects.length > 0) {
                setSelectedProject(allProjects[0].id);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchMessages = async () => {
        if (!selectedProject) return;

        const currentProject = projects.find(p => p.id === selectedProject);
        const column = currentProject?.request_id ? 'request_id' : 'project_id';
        const idToQuery = currentProject?.request_id || selectedProject;

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq(column, idToQuery)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !selectedProject || !supabaseUser) return;

        const currentProject = projects.find(p => p.id === selectedProject);
        const messageData: any = {
            sender_id: supabaseUser.id,
            sender_type: 'client',
            message_text: inputText.trim(),
            read: false
        };

        if (currentProject?.request_id) {
            messageData.request_id = currentProject.request_id;
        } else {
            messageData.project_id = selectedProject;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert(messageData);

            if (error) throw error;

            setInputText('');
            fetchMessages();
        } catch (error: any) {
            console.error('Error sending message:', error);
            alert('Failed to send message: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (projects.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">No projects yet</p>
                    <p className="text-sm text-slate-400">Purchase a service to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-screen flex flex-col md:flex-row bg-white overflow-hidden text-slate-900">
            {/* Sidebar - Projects List */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 flex flex-col h-full">
                <div className="p-6 border-b border-slate-200/50">
                    <h2 className="font-bold text-slate-900 text-lg mb-4">Your Projects</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => setSelectedProject(project.id)}
                            className={`p-4 cursor-pointer transition-colors border-l-4 ${selectedProject === project.id
                                ? 'bg-white border-blue-600 shadow-sm'
                                : 'border-transparent hover:bg-slate-100'
                                }`}
                        >
                            <div className="text-[10px] font-bold text-slate-400 mb-1">{generateOrderNumber(project.id)}</div>
                            <div className="font-bold text-slate-900 text-sm mb-1">{project.title}</div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                Codexier Team
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/30">
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                            CS
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-sm truncate">
                                {selectedProject && generateOrderNumber(selectedProject)} - {projects.find(p => p.id === selectedProject)?.title || 'Project'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-green-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Codexier Support
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.sender_type === 'client' ? 'flex-row-reverse' : ''}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${msg.sender_type === 'client' ? 'bg-slate-900' : 'bg-blue-600'
                                        }`}
                                >
                                    {msg.sender_type === 'client' ? 'ME' : 'CS'}
                                </div>
                                <div className="space-y-1 max-w-[80%]">
                                    <div
                                        className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender_type === 'client'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.message_text}
                                    </div>
                                    <div
                                        className={`text-[10px] text-slate-400 ${msg.sender_type === 'client' ? 'text-right pr-2' : 'pl-2'
                                            }`}
                                    >
                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 pr-4 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 p-2"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !inputText.trim()}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientMessages;
