import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, MessageSquare, Rocket, PlusCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import RequestMessaging from '../shared/RequestMessaging';
import CustomOrder from '../public/CustomOrder';
import CheckoutModal from '../checkout/CheckoutModal';

interface CustomRequest {
    id: string;
    category: string;
    name: string;
    email: string;
    details: string | null;
    budget: string | null;
    timeline: string | null;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'converted';
    created_at: string;
    converted_project_id: string | null;
    approved_price: number | null;
}

const ClientRequests: React.FC = () => {
    const { supabaseUser } = useAuth();
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
    const [modalTab, setModalTab] = useState<'details' | 'messages'>('details');
    const [showNewRequestForm, setShowNewRequestForm] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [requestToPay, setRequestToPay] = useState<CustomRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'converted'>('all');

    useEffect(() => {
        if (supabaseUser) {
            fetchRequests();
        }
    }, [supabaseUser]);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('custom_requests')
                .select('*')
                .eq('user_id', supabaseUser?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = (request: CustomRequest) => {
        // Prepare gig object for checkout modal with custom request ID
        const customGig = {
            id: 'custom-' + request.id,
            category: request.category,
            title: `Custom Project: ${getCategoryLabel(request.category)}`,
            description: request.details || '',
            price: request.approved_price || 0,
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3', // Generic placeholder
            features: [
                'Custom Development',
                request.timeline ? `Timeline: ${request.timeline}` : 'Flexible Timeline',
                'Dedicated Engineering Support'
            ],
            status: 'active' as const,
            custom_request_id: request.id
        };

        setRequestToPay(request);
        setIsCheckoutOpen(true);
    };

    const handlePaymentSuccess = () => {
        // Redundant logic removed as CheckoutModal now handles custom_order creation
        setIsCheckoutOpen(false);
        setRequestToPay(null);
        fetchRequests();

        // Explicitly move to projects tab to see the newly created project
        window.dispatchEvent(new CustomEvent('changeTab', { detail: 'projects' }));
    };

    const getCategoryLabel = (category: string) => {
        const labels: { [key: string]: string } = {
            web: 'Web Platform',
            mobile: 'Mobile App',
            ai: 'AI Solution',
            design: 'Product Design',
            devops: 'DevOps & Cloud',
            consult: 'Consulting'
        };
        return labels[category] || category;
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: string } = {
            web: '🌐',
            mobile: '📱',
            ai: '🤖',
            design: '🎨',
            devops: '☁️',
            consult: '💼'
        };
        return icons[category] || '📋';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'reviewing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'converted': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'reviewing': return <Eye size={16} />;
            case 'approved': return <CheckCircle size={16} />;
            case 'rejected': return <XCircle size={16} />;
            case 'converted': return <Rocket size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading your requests...</div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Custom Requests Yet</h3>
                <p className="text-slate-500 mb-6">You haven't submitted any custom project requests.</p>
                <a
                    href="/custom-order"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Start Building
                </a>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-8 flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Custom Requests</h1>
                    <p className="text-slate-500 mt-2">Track your custom project requests and their status</p>
                </div>
                <button
                    onClick={() => setShowNewRequestForm(true)}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} />
                    New Request
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl self-start">
                {[
                    { id: 'all', label: 'All Requests' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'converted', label: 'Paid/Active' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none ${statusFilter === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
                {requests
                    .filter(r => statusFilter === 'all' || r.status === statusFilter || (statusFilter === 'pending' && r.status === 'reviewing'))
                    .map((request) => (
                        <div
                            key={request.id}
                            className={`bg-white rounded-2xl border transition-all duration-300 p-6 hover:shadow-xl cursor-pointer ${request.status === 'converted'
                                ? 'bg-green-50/50 border-green-200 ring-1 ring-green-100'
                                : 'border-slate-200 shadow-sm'
                                }`}
                            onClick={() => setSelectedRequest(request)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">{getCategoryIcon(request.category)}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{getCategoryLabel(request.category)}</h3>
                                        <p className="text-sm text-slate-500">
                                            Submitted {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${request.status === 'converted'
                                    ? 'bg-green-600 text-white border-green-600'
                                    : getStatusColor(request.status)
                                    }`}>
                                    {request.status === 'converted' ? <CheckCircle size={16} /> : getStatusIcon(request.status)}
                                    <span className="capitalize">{request.status === 'converted' ? 'Paid & Active' : request.status}</span>
                                </div>
                            </div>

                            {request.details && (
                                <p className="text-slate-600 mb-4 line-clamp-2">{request.details}</p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500">Budget:</span>
                                    <p className="font-medium text-slate-900">{request.budget || 'Not specified'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Timeline:</span>
                                    <p className="font-medium text-slate-900">{request.timeline || 'Not specified'}</p>
                                </div>
                                {request.approved_price && (
                                    <div>
                                        <span className="text-slate-500">Approved Price:</span>
                                        <p className="font-medium text-green-600">${request.approved_price.toLocaleString()}</p>
                                    </div>
                                )}
                                {request.converted_project_id && (
                                    <div>
                                        <span className="text-slate-500">Status:</span>
                                        <p className="font-medium text-purple-600">Converted to Project ✓</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                                {request.status === 'converted' ? (
                                    <>
                                        <div className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold flex items-center justify-center gap-2">
                                            <CheckCircle size={18} /> Order Confirmed
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Dispatch custom event to change tab in parent dashboard
                                                window.dispatchEvent(new CustomEvent('changeTab', { detail: 'projects' }));
                                            }}
                                            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Rocket size={18} /> My Project
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRequest(request);
                                                setModalTab('messages');
                                            }}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare size={18} /> Messages
                                        </button>
                                    </>
                                ) : request.status === 'approved' && request.approved_price ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePayNow(request);
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 animate-pulse"
                                    >
                                        💳 Pay ${request.approved_price.toLocaleString()} Now
                                    </button>
                                ) : (
                                    <>
                                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                            <Eye size={18} /> View Details
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRequest(request);
                                                setModalTab('messages');
                                            }}
                                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare size={18} /> Message Admin
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedRequest(null); setModalTab('details'); }}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{getCategoryLabel(selectedRequest.category)} Request</h2>
                                    <p className="text-slate-500">Submitted {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => { setSelectedRequest(null); setModalTab('details'); }} className="text-slate-400 hover:text-slate-600">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border items-center gap-2 ${getStatusColor(selectedRequest.status)}`}>
                                    {getStatusIcon(selectedRequest.status)}
                                    <span className="capitalize">{selectedRequest.status}</span>
                                </div>
                                {/* Tabs */}
                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={() => setModalTab('details')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${modalTab === 'details' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        <Eye size={16} className="inline mr-2" />
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setModalTab('messages')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${modalTab === 'messages' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        <MessageSquare size={16} className="inline mr-2" />
                                        Messages
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {modalTab === 'details' ? (
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Category</label>
                                    <p className="text-slate-900">{getCategoryIcon(selectedRequest.category)} {getCategoryLabel(selectedRequest.category)}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700">Project Details</label>
                                    <p className="text-slate-900 whitespace-pre-wrap">{selectedRequest.details || 'No details provided'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Budget</label>
                                        <p className="text-slate-900">{selectedRequest.budget || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Timeline</label>
                                        <p className="text-slate-900">{selectedRequest.timeline || 'Not specified'}</p>
                                    </div>
                                </div>

                                {selectedRequest.converted_project_id && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <p className="text-sm text-purple-900 font-medium flex items-center gap-2">
                                            <Rocket size={16} /> This request has been converted to a project!
                                        </p>
                                        <p className="text-xs text-purple-700 mt-1">
                                            Check your "My Projects" tab to view the project details.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 overflow-hidden p-6">
                                <RequestMessaging requestId={selectedRequest.id} isAdmin={false} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* New Request Form Modal */}
            {showNewRequestForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="relative w-full max-w-6xl my-8">
                        <button
                            onClick={() => setShowNewRequestForm(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
                        >
                            <XCircle size={24} />
                        </button>
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <CustomOrder />
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal for Payment */}
            {requestToPay && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => {
                        setIsCheckoutOpen(false);
                        setRequestToPay(null);
                    }}
                    gig={{
                        id: requestToPay.id,
                        title: `${getCategoryLabel(requestToPay.category)} - Custom Project`,
                        description: requestToPay.details || 'Custom project request',
                        price: requestToPay.approved_price || 0,
                        category: requestToPay.category,
                        features: [
                            `Category: ${getCategoryLabel(requestToPay.category)}`,
                            `Timeline: ${requestToPay.timeline || 'To be determined'}`,
                            `Budget: ${requestToPay.budget || 'Custom'}`,
                            'Dedicated project manager',
                            'Regular progress updates'
                        ],
                        image: '',
                        rating: 5.0,
                        status: 'active',
                        custom_request_id: requestToPay.id
                    }}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default ClientRequests;
