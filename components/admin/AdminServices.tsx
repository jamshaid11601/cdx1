import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Sparkles } from 'lucide-react';
import { Gig } from '../../types';
import { CATEGORIES } from '../../constants';
import { supabase } from '../../lib/supabase';

interface AdminServicesProps {
  gigs: Gig[];
  setGigs: React.Dispatch<React.SetStateAction<Gig[]>>;
}

const AdminServices: React.FC<AdminServicesProps> = ({ gigs, setGigs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Gig>>({
    title: '',
    category: 'web_dev',
    price: 0,
    description: '',
    image: '',
    features: ['']
  });

  const handleOpenModal = (gig?: Gig) => {
    if (gig) {
      setEditingGig(gig);
      setFormData({ ...gig });
    } else {
      setEditingGig(null);
      setFormData({
        title: '',
        category: 'web_dev',
        price: 99,
        description: '',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        features: ['Feature 1', 'Feature 2'],
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.price) return;
    setLoading(true);

    try {
      if (editingGig) {
        // Update existing service in Supabase
        const { error } = await supabase
          .from('services')
          .update({
            title: formData.title,
            category: formData.category,
            description: formData.description,
            price: formData.price,
            image_url: formData.image,
            features: formData.features,
            status: formData.status
          })
          .eq('id', editingGig.id);

        if (error) throw error;

        // Update local state
        setGigs(gigs.map(g => g.id === editingGig.id ? { ...g, ...formData } as Gig : g));
      } else {
        // Create new service in Supabase
        const { data, error } = await supabase
          .from('services')
          .insert({
            title: formData.title,
            category: formData.category,
            description: formData.description,
            price: formData.price,
            image_url: formData.image,
            features: formData.features,
            status: formData.status || 'active'
          })
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        const newGig: Gig = {
          id: data.id,
          title: data.title,
          category: data.category,
          description: data.description || '',
          price: Number(data.price),
          rating: 5.0,
          reviews: 0,
          features: data.features || [],
          image: data.image_url || '',
          status: data.status as any
        };
        setGigs([newGig, ...gigs]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving service:', error);
      alert('Error saving service: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGigs(gigs.filter(g => g.id !== id));
    } catch (error: any) {
      console.error('Error deleting service:', error);
      alert('Error deleting service: ' + error.message);
    }
  };

  const toggleStatus = async (id: string) => {
    const gig = gigs.find(g => g.id === id);
    if (!gig) return;

    const newStatus = gig.status === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('services')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setGigs(gigs.map(g => g.id === id ? { ...g, status: newStatus as any } : g));
    } catch (error: any) {
      console.error('Error toggling status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const filteredGigs = gigs.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
          <Plus size={18} /> Create New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGigs.map(gig => (
          <div key={gig.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
            <div className="h-48 relative overflow-hidden">
              <img src={gig.image} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleOpenModal(gig)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 hover:text-blue-600 shadow-sm">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(gig.id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 hover:text-red-500 shadow-sm">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${gig.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                  {gig.status === 'active' ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{CATEGORIES.find(c => c.id === gig.category)?.label}</span>
                <span className="font-bold text-slate-900">${gig.price}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{gig.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">{gig.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Sparkles size={12} /> {gig.features.length} Features
                </div>
                <button onClick={() => toggleStatus(gig.id)} className="text-sm font-bold text-slate-500 hover:text-slate-900">
                  {gig.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h2 className="text-2xl font-bold text-slate-900">{editingGig ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Service Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    placeholder="e.g. Corporate Website"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none text-slate-900"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Cover Image URL</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    placeholder="https://..."
                  />
                  <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                    {formData.image && <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Included Features</label>
                {formData.features?.map((feature, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={e => {
                        const newFeatures = [...(formData.features || [])];
                        newFeatures[idx] = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 text-slate-900"
                    />
                    <button
                      onClick={() => {
                        const newFeatures = formData.features?.filter((_, i) => i !== idx);
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFormData({ ...formData, features: [...(formData.features || []), ''] })}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Feature
                </button>
              </div>

            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 rounded-b-[2rem]">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900">Cancel</button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-900/10 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminServices;