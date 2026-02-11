import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
    id: string;
    project_id: string | null;
    request_id: string | null;
    sender_id: string;
    sender_type: 'client' | 'admin';
    message_text: string;
    read: boolean;
    created_at: string;
}

interface RequestMessagingProps {
    requestId?: string;
    projectId?: string;
    isAdmin?: boolean;
}

const RequestMessaging: React.FC<RequestMessagingProps> = ({ requestId, projectId, isAdmin = false }) => {
    const { supabaseUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();

        // Set up real-time subscription
        const channelName = projectId
            ? `project_messages_${projectId}`
            : `request_messages_${requestId}`;

        const filter = projectId
            ? `project_id=eq.${projectId}`
            : `request_id=eq.${requestId}`;

        const subscription = supabase
            .channel(channelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: filter
            }, () => {
                fetchMessages();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [requestId, projectId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            let query = supabase.from('messages').select('*');

            if (projectId) {
                query = query.eq('project_id', projectId);
            } else if (requestId) {
                query = query.eq('request_id', requestId);
            } else {
                return;
            }

            const { data, error } = await query.order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !supabaseUser) return;

        setSending(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    request_id: requestId || null,
                    project_id: projectId || null,
                    sender_id: supabaseUser.id,
                    sender_type: isAdmin ? 'admin' : 'client',
                    message_text: inputText.trim(),
                    read: false
                });

            if (error) throw error;

            setInputText('');
            fetchMessages();
        } catch (error: any) {
            console.error('Error sending message:', error);
            alert('Failed to send message: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200">
            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_type === (isAdmin ? 'admin' : 'client') ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.sender_type === (isAdmin ? 'admin' : 'client')
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{msg.message_text}</div>
                                <div
                                    className={`text-[10px] mt-1 ${msg.sender_type === (isAdmin ? 'admin' : 'client') ? 'text-blue-100' : 'text-slate-400'
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

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 pr-4 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <input
                        type="text"
                        placeholder={isAdmin ? "Reply to client..." : "Message admin about your request..."}
                        className="flex-1 bg-transparent border-none outline-none text-sm p-2 text-slate-900"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !sending && handleSend()}
                        disabled={sending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !inputText.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestMessaging;
