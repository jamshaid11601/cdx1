import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical } from 'lucide-react';
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
    client_name: string;
    request_id?: string | null;
}

const AdminMessages: React.FC = () => {
    const { supabaseUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch all projects
    useEffect(() => {
        fetchProjects();
    }, []);

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
                .channel(`admin_project_messages_${selectedProject}`)
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
            // Fetch regular projects
            const { data: gigData, error: gigError } = await supabase
                .from('projects')
                .select(`
                    id,
                    title,
                    clients (
                        id,
                        users (full_name, email)
                    )
                `)
                .order('created_at', { ascending: false });

            if (gigError) throw gigError;

            // Fetch custom orders
            const { data: customData, error: customError } = await supabase
                .from('custom_orders')
                .select(`
                    id,
                    title,
                    request_id,
                    clients (
                        id,
                        users (full_name, email)
                    )
                `)
                .order('created_at', { ascending: false });

            if (customError) throw customError;

            const transformedGigs = (gigData || []).map((p: any) => ({
                id: p.id,
                title: p.title,
                client_name: p.clients?.users?.full_name || p.clients?.users?.email || 'Client'
            }));

            const transformedCustom = (customData || []).map((o: any) => ({
                id: o.id,
                title: o.title,
                request_id: o.request_id,
                client_name: o.clients?.users?.full_name || o.clients?.users?.email || 'Client'
            }));

            const allProjects = [...transformedGigs, ...transformedCustom];

            setProjects(allProjects);
            if (allProjects.length > 0 && !selectedProject) {
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
            sender_type: 'admin',
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

    const selectedProjectData = projects.find(p => p.id === selectedProject);

    if (projects.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">No projects yet</p>
                    <p className="text-sm text-slate-400">Projects will appear here when clients make orders</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            {/* Sidebar: Client/Project List */}
            <div className="w-80 bg-slate-50 border-r border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Client Inbox</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => setSelectedProject(project.id)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${selectedProject === project.id
                                ? 'bg-white border-blue-600 shadow-sm'
                                : 'border-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-900 text-sm">{project.client_name}</span>
                                <span className="text-[10px] text-slate-400">now</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{project.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                            {selectedProjectData?.client_name.charAt(0) || 'C'}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 text-sm">
                                {selectedProjectData?.client_name || 'Client'}
                            </div>
                            <div className="text-xs text-slate-500">{selectedProjectData?.title}</div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                    {messages.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.sender_type === 'admin'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                        }`}
                                >
                                    {msg.message_text}
                                    <div
                                        className={`text-[10px] mt-1 ${msg.sender_type === 'admin' ? 'text-blue-100' : 'text-slate-400'
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
                            placeholder="Type reply..."
                            className="flex-1 bg-transparent border-none outline-none text-sm p-2 text-slate-900"
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

export default AdminMessages;