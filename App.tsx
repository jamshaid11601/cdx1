import React, { useState, useEffect } from 'react';
import { PageView, Gig } from './types';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

// Shared Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

// Public Components
import HomePage from './components/public/HomePage';
import Marketplace from './components/public/Marketplace';
import CustomOrder from './components/public/CustomOrder';
import AboutPage from './components/public/AboutPage';
import PortfolioPage from './components/public/PortfolioPage';

// Client Components
import ClientDashboard from './components/client/ClientDashboard';

// Admin Components
import AdminLayout, { AdminTab } from './components/admin/AdminLayout';
import AdminDashboardHome from './components/admin/AdminDashboardHome';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [activePage, setPage] = useState<PageView>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [services, setServices] = useState<Gig[]>([]);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Fetch services from Supabase
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      // Transform Supabase data to match Gig interface
      const transformedServices: Gig[] = (data || []).map(service => ({
        id: service.id,
        category: service.category,
        title: service.title,
        description: service.description || '',
        price: Number(service.price),
        rating: Number(service.rating) || 5.0,
        reviews: service.reviews_count || 0,
        features: service.features || [],
        image: service.image_url || '',
        status: 'active' as const
      }));

      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setPage('home');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin View
  if (user?.role === 'admin') {
    return (
      <AdminLayout activeTab={adminTab} setActiveTab={setAdminTab} onLogout={handleLogout}>
        {adminTab === 'dashboard' && <AdminDashboardHome orders={[]} />}
        {/* Other admin tabs can be added later */}
      </AdminLayout>
    );
  }

  // Client Dashboard
  if (user?.role === 'client' && activePage === 'dashboard') {
    return (
      <ClientDashboard
        user={{ role: 'client', name: user.full_name || user.email, email: user.email }}
        orders={[]}
        gigs={services}
        messages={[]}
        onSendMessage={() => { }}
        onLogout={handleLogout}
        onBrowse={() => setPage('marketplace')}
        onBuy={() => { }}
      />
    );
  }

  // Public / Guest View
  return (
    <div className="font-sans bg-slate-50 min-h-screen text-slate-900 selection:bg-blue-500/30">
      <Navigation
        activePage={activePage}
        setPage={setPage}
        onOpenLogin={() => setIsLoginOpen(true)}
        user={user ? { role: user.role, name: user.full_name || user.email } : null}
      />

      <main className="pt-0">
        {activePage === 'home' && <HomePage setPage={setPage} />}
        {activePage === 'marketplace' && <Marketplace setPage={setPage} gigs={services} onBuy={() => { }} />}
        {activePage === 'custom-order' && <CustomOrder />}
        {activePage === 'about' && <AboutPage setPage={setPage} />}
        {activePage === 'portfolio' && <PortfolioPage setPage={setPage} />}
      </main>

      <Footer setPage={setPage} />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Floating Action Button for Clients */}
      {user?.role === 'client' && (
        <button
          onClick={() => setPage('dashboard')}
          className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-xl z-50 hover:bg-blue-600 transition-colors"
        >
          Return to Dashboard
        </button>
      )}
    </div>
  );
}