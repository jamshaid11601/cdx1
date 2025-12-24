import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock, ArrowRight, Rocket, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import RequestMessaging from '../shared/RequestMessaging';

interface CustomRequest {
    id: string;
    user_id: string | null;
    category: string;
    name: string;
    email: string;
    details: string | null;
    budget: string | null;
    timeline: string | null;
    attachment_name: string | null;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'converted';
    created_at: string;
    updated_at: string;
}

const AdminRequests: React.FC = () => {
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [converting, setConverting] = useState(false);
    const [modalTab, setModalTab] = useState<'details' | 'messages'>('details');
    const [convertPrice, setConvertPrice] = useState<string>('');

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [requests, statusFilter, searchQuery]);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('custom_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = requests;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredRequests(filtered);
    };

    const updateRequestStatus = async (id: string, newStatus: CustomRequest['status']) => {
        try {
            const { error } = await supabase
                .from('custom_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (selectedRequest?.id === id) {
                setSelectedRequest({ ...selectedRequest, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const convertToProject = async () => {
        if (!selectedRequest || !convertPrice) {
            alert('Please enter a price for this project');
            return;
        }

        const priceNum = parseFloat(convertPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            alert('Please enter a valid price');
            return;
        }

        setConverting(true);
        try {
            // Update request to approved status with price
            // Client will see this and can proceed to payment
            const { error: updateError } = await supabase
                .from('custom_requests')
                .update({
                    status: 'approved',
                    approved_price: priceNum
                })
                .eq('id', selectedRequest.id);

            if (updateError) throw updateError;

            alert('Request approved! Client can now proceed with payment.');
            setShowConvertModal(false);
            setConvertPrice('');
            fetchRequests();
        } catch (error: any) {
            console.error('Error approving request:', error);
            alert('Failed to approve request: ' + error.message);
        } finally {
            setConverting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'reviewing': return 'bg-blue-100 text-blue-700';
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'converted': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
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

    const statusCounts = {
        all: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        reviewing: requests.filter(r => r.status === 'reviewing').length,
        approved: requests.filter(r => r.status === 'approved').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-500">Loading requests...</div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Custom Project Requests</h2>

                {/* Status Tabs */}
                <div className="flex gap-2 mb-4">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'reviewing', label: 'Reviewing' },
                        { id: 'approved', label: 'Approved' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab.label} ({statusCounts[tab.id as keyof typeof statusCounts]})
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Requests List */}
            <div className="overflow-auto h-[calc(100%-200px)]">
                {filteredRequests.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No requests found
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        {filteredRequests.map(request => (
                            <div
                                key={request.id}
                                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedRequest(request)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{getCategoryIcon(request.category)}</div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{request.name}</h3>
                                            <p className="text-sm text-slate-500">{request.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                    <div>
                                        <span className="text-slate-500">Category:</span>
                                        <p className="font-medium text-slate-900">{getCategoryLabel(request.category)}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Budget:</span>
                                        <p className="font-medium text-slate-900">{request.budget || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Timeline:</span>
                                        <p className="font-medium text-slate-900">{request.timeline || 'Not specified'}</p>
                                    </div>
                                </div>

                                {request.details && (
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{request.details}</p>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">
                                        {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                                    </span>
                                    <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                                        View Details <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedRequest(null); setModalTab('details'); }}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedRequest.name}</h2>
                                    <p className="text-slate-500">{selectedRequest.email}</p>
                                </div>
                                <button onClick={() => { setSelectedRequest(null); setModalTab('details'); }} className="text-slate-400 hover:text-slate-600">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedRequest.status)}`}>
                                    {selectedRequest.status}
                                </span>
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

                                {selectedRequest.attachment_name && (
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Attachment</label>
                                        <p className="text-slate-900">{selectedRequest.attachment_name}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-bold text-slate-700">Submitted</label>
                                    <p className="text-slate-900">
                                        {new Date(selectedRequest.created_at).toLocaleDateString()} at {new Date(selectedRequest.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-hidden p-6">
                                <RequestMessaging requestId={selectedRequest.id} isAdmin={true} />
                            </div>
                        )}

                        <div className="p-6 border-t border-slate-200 space-y-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => updateRequestStatus(selectedRequest.id, 'reviewing')}
                                    disabled={selectedRequest.status === 'reviewing'}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Clock size={18} /> Mark as Reviewing
                                </button>
                                <button
                                    onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                                    disabled={selectedRequest.status === 'approved'}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Approve
                                </button>
                                <button
                                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                                    disabled={selectedRequest.status === 'rejected'}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                            </div>
                            {selectedRequest.status !== 'converted' && selectedRequest.status !== 'rejected' && (
                                <button
                                    onClick={() => setShowConvertModal(true)}
                                    disabled={!selectedRequest.user_id}
                                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                                    title={!selectedRequest.user_id ? 'No user account linked to this request' : 'Convert this request to a project'}
                                >
                                    <Rocket size={20} /> Convert to Project
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Convert to Project Confirmation Modal */}
            {showConvertModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConvertModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Rocket size={32} className="text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Approve & Set Price</h3>
                            <p className="text-slate-600">
                                Set the project price for <strong>{selectedRequest.name}</strong>. They'll be able to pay and start the project.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Category:</span>
                                <span className="font-medium text-slate-900">{getCategoryLabel(selectedRequest.category)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Requested Budget:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.budget}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Timeline:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.timeline}</span>
                            </div>
                        </div>

                        {/* Price Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Project Price (USD) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                <input
                                    type="number"
                                    value={convertPrice}
                                    onChange={(e) => setConvertPrice(e.target.value)}
                                    placeholder="10000"
                                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-lg font-bold"
                                    min="0"
                                    step="100"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Client will pay this amount to start the project</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowConvertModal(false); setConvertPrice(''); }}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={convertToProject}
                                disabled={converting || !convertPrice}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {converting ? 'Approving...' : 'Approve & Set Price'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRequests;
