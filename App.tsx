import React, { useState, useEffect } from 'react';
import { PageView, Gig } from './types';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

// Shared Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import CheckoutModal from './components/checkout/CheckoutModal';

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
import AdminKanban from './components/admin/AdminKanban';
import AdminServices from './components/admin/AdminServices';
import AdminMessages from './components/admin/AdminMessages';
import AdminFinance from './components/admin/AdminFinance';
import AdminRequests from './components/admin/AdminRequests';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [activePage, setPage] = useState<PageView>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [services, setServices] = useState<Gig[]>([]);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Checkout State
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]); // For admin

  // Fetch services from Supabase
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch user projects when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        fetchAllProjects();
      } else {
        fetchUserProjects();
      }
    }
  }, [user]);

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

  const fetchUserProjects = async () => {
    try {
      // First get client record
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (clientError) {
        console.error('Error fetching client:', clientError);
        return;
      }

      if (!clientData) return;

      // Fetch regular projects for this client
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          services (id, title, category, image_url)
        `)
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch custom orders for this client
      const { data: customOrdersData, error: customOrdersError } = await supabase
        .from('custom_orders')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (customOrdersError) throw customOrdersError;

      // Transform regular projects
      const transformedProjects = (projectsData || []).map(project => ({
        id: project.id,
        gigId: project.service_id,
        client: user!.full_name || user!.email,
        amount: Number(project.amount),
        status: project.status as any,
        date: new Date(project.created_at).toLocaleDateString(),
        title: project.title,
        description: project.description,
        isCustomOrder: false,
        rawCreatedAt: project.created_at
      }));

      // Transform custom orders
      const transformedCustomOrders = (customOrdersData || []).map(order => ({
        id: order.id,
        gigId: null, // Custom orders don't have a gig/service
        client: user!.full_name || user!.email,
        amount: Number(order.amount),
        status: order.status as any,
        date: new Date(order.created_at).toLocaleDateString(),
        title: order.title,
        description: order.description,
        isCustomOrder: true,
        rawCreatedAt: order.created_at
      }));

      // Combine and sort by date using raw timestamp
      const allOrders = [...transformedProjects, ...transformedCustomOrders]
        .sort((a, b) => new Date(b.rawCreatedAt).getTime() - new Date(a.rawCreatedAt).getTime());

      setProjects(allOrders);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAllProjects = async () => {
    try {
      // Fetch all projects for admin
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          services (id, title, category, image_url),
          clients!inner (id, company_name, user_id, users (email, full_name))
        `)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Transform to match Order interface
      const transformedProjects = (projectsData || []).map(project => ({
        id: project.id,
        gigId: project.service_id,
        client: project.clients?.users?.full_name || project.clients?.users?.email || project.clients?.company_name || 'Unknown',
        amount: Number(project.amount),
        status: project.status as any,
        date: new Date(project.created_at).toLocaleDateString(),
        title: project.title,
        description: project.description
      }));

      setAllProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching all projects:', error);
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

  const handleBuyService = (gig: Gig) => {
    console.log('handleBuyService called with gig:', gig);
    if (!user) {
      console.log('No user, opening login modal');
      setIsLoginOpen(true);
      return;
    }
    console.log('Setting selectedGig and opening checkout');
    setSelectedGig(gig);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    console.log('✅ App.tsx: handleCheckoutSuccess called');
    setIsCheckoutOpen(false);
    setSelectedGig(null);
    if (user?.role === 'admin') {
      console.log('Admin detected, fetching all projects');
      fetchAllProjects();
    } else {
      console.log('Client detected, fetching user projects');
      fetchUserProjects();
    }
    console.log('Navigating to dashboard...');
    setPage('dashboard');
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
        {adminTab === 'dashboard' && <AdminDashboardHome orders={allProjects} />}
        {adminTab === 'orders' && <AdminKanban orders={allProjects} setOrders={setAllProjects} />}
        {adminTab === 'requests' && <AdminRequests />}
        {adminTab === 'services' && <AdminServices gigs={services} setGigs={setServices} />}
        {adminTab === 'messages' && <AdminMessages />}
        {adminTab === 'finance' && <AdminFinance orders={allProjects} />}
      </AdminLayout>
    );
  }

  // Client Dashboard
  if (user?.role === 'client' && activePage === 'dashboard') {
    return (
      <ClientDashboard
        user={{ role: 'client', name: user.full_name || user.email, email: user.email }}
        orders={projects}
        gigs={services}
        messages={[]}
        onSendMessage={() => { }}
        onLogout={handleLogout}
        onBrowse={() => setPage('marketplace')}
        onSuccess={fetchUserProjects}
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
        {activePage === 'marketplace' && <Marketplace setPage={setPage} gigs={services} onBuy={handleBuyService} />}
        {activePage === 'custom-order' && <CustomOrder />}
        {activePage === 'about' && <AboutPage setPage={setPage} />}
        {activePage === 'portfolio' && <PortfolioPage setPage={setPage} />}
      </main>

      <Footer setPage={setPage} />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        gig={selectedGig}
        onSuccess={handleCheckoutSuccess}
      />

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