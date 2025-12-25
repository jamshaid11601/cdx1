import React from 'react';
import { DollarSign, Briefcase, MessageSquare } from 'lucide-react';
import { Order } from '../../types';

interface AdminDashboardHomeProps {
  orders: Order[];
}

const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ orders }) => {
  const stats = [
    { label: 'Total Revenue', value: '$45,230', change: '+12%', icon: <DollarSign size={24} />, color: 'bg-green-500' },
    { label: 'Active Orders', value: orders.filter(o => o.status !== 'completed').length, change: '+5%', icon: <Briefcase size={24} />, color: 'bg-blue-500' },
    { label: 'Pending Requests', value: '12', change: '-2%', icon: <MessageSquare size={24} />, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-slate-200`}>{stat.icon}</div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-slate-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="text-xs text-slate-500 uppercase border-b border-slate-100">
              <tr><th className="pb-3">ID</th><th className="pb-3">Client</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-4 font-medium">{order.id}</td>
                  <td className="py-4 text-slate-600">{order.client}</td>
                  <td className="py-4 font-bold">${order.amount}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
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

export default AdminDashboardHome;
