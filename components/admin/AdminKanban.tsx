import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { supabase } from '../../lib/supabase';

interface AdminKanbanProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminKanban: React.FC<AdminKanbanProps> = ({ orders, setOrders }) => {
  const columns: { id: OrderStatus; label: string; color: string }[] = [
    { id: 'pending', label: 'Pending', color: 'border-orange-500' },
    { id: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
    { id: 'review', label: 'Review', color: 'border-purple-500' },
    { id: 'completed', label: 'Completed', color: 'border-green-500' }
  ];

  const moveOrder = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  return (
    <div className="h-full overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-[1000px]">
        {columns.map((col, index) => (
          <div key={col.id} className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex flex-col min-h-[500px]">
            <div className={`p-4 border-b border-slate-200 font-bold text-slate-700 border-t-4 ${col.color} rounded-t-xl bg-white`}>
              {col.label} <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded-full">{orders.filter(o => o.status === col.id).length}</span>
            </div>
            <div className="p-4 space-y-3">
              {orders.filter(o => o.status === col.id).map(order => (
                <div key={order.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                    <MoreVertical size={14} className="text-slate-300" />
                  </div>
                  <div className="font-bold text-slate-900 mb-1">{order.client}</div>
                  <div className="text-xs text-slate-500 mb-3">{order.title || 'Project'}</div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <div className="text-xs text-slate-400">{order.date}</div>
                    <div className="font-bold text-slate-900 text-sm">${order.amount}</div>
                  </div>
                  {col.id !== 'completed' && index < columns.length - 1 && (
                    <button
                      onClick={() => moveOrder(order.id, columns[index + 1].id)}
                      className="mt-3 w-full text-xs bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-2 rounded transition-colors font-medium"
                    >
                      Move to {columns[index + 1].label} &rarr;
                    </button>
                  )}
                </div>
              ))}
              {orders.filter(o => o.status === col.id).length === 0 && (
                <div className="text-center text-slate-400 text-sm py-8">
                  No orders in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminKanban;
