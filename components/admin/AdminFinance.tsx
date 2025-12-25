import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Download, ArrowUpRight, Filter } from 'lucide-react';
import { Order } from '../../types';

interface AdminFinanceProps {
    orders: Order[];
}

const AdminFinance: React.FC<AdminFinanceProps> = ({ orders }) => {
    // 1. Mock Dummy Transactions (Historical Data to populate the view)
    const historicalTransactions = [
        { id: 'TRX-998', client: 'Nexus Systems', service: 'Custom API Dev', amount: 4500, date: '2024-02-28', status: 'completed' },
        { id: 'TRX-997', client: 'BlueOcean Inc', service: 'Shopify Store', amount: 1200, date: '2024-02-25', status: 'completed' },
        { id: 'TRX-996', client: 'Alpha Nodes', service: 'Security Audit', amount: 850, date: '2024-02-20', status: 'completed' },
    ];

    // 2. Merge with real orders to create a full transaction list
    const realTransactions = orders.map(o => ({
        id: o.id.replace('ORD-', 'TRX-'), // Format ID to look like transaction
        client: o.client,
        service: 'Project Milestone', // Generic label since we don't have gig titles in order obj easily without lookup
        amount: o.amount,
        date: o.date,
        status: o.status === 'completed' ? 'completed' : 'pending'
    }));

    const allTransactions = [...realTransactions, ...historicalTransactions];

    // 3. Calculate Stats
    const totalRevenue = allTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const pendingRevenue = allTransactions.filter(t => t.status !== 'completed').reduce((sum, t) => sum + t.amount, 0);
    const activeOrdersCount = orders.length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} /> +12.5%
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-1 tracking-tight text-slate-900">${totalRevenue.toLocaleString()}</div>
                    <div className="text-slate-500 text-sm font-medium">Total Revenue</div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <CreditCard size={24} />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-1 tracking-tight text-slate-900">${pendingRevenue.toLocaleString()}</div>
                    <div className="text-slate-500 text-sm font-medium">Pending Clearance</div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-1 tracking-tight text-slate-900">{activeOrdersCount}</div>
                    <div className="text-slate-500 text-sm font-medium">Active Invoices</div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none justify-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 text-slate-900">
                            <Filter size={16} /> Filter
                        </button>
                        <button className="flex-1 md:flex-none justify-center px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-8 py-4">ID</th>
                                <th className="px-8 py-4">Client</th>
                                <th className="px-8 py-4">Date</th>
                                <th className="px-8 py-4">Amount</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allTransactions.map((trx, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-4 font-mono text-xs text-slate-400">{trx.id}</td>
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-slate-900">{trx.client}</div>
                                        <div className="text-xs text-slate-400">{trx.service}</div>
                                    </td>
                                    <td className="px-8 py-4">{trx.date}</td>
                                    <td className="px-8 py-4 font-bold text-slate-900">${trx.amount.toLocaleString()}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${trx.status === 'completed'
                                                ? 'bg-green-50 text-green-600'
                                                : 'bg-yellow-50 text-yellow-600'
                                            }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="text-blue-600 font-bold text-xs hover:underline">Download PDF</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFinance;