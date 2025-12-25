import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Gig, User } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Declare confetti global from CDN
declare const confetti: any;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  gig: Gig | null;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, gig, onSuccess }) => {
  const { user, supabaseUser } = useAuth();
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  // Customer Details State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setError('');

      // Pre-fill if user exists
      if (user) {
        setName(user.full_name || user.email);
        setEmail(user.email);
      } else {
        setEmail('');
        setName('');
      }
    }
  }, [isOpen, user]);

  console.log('CheckoutModal render - isOpen:', isOpen, 'gig:', gig);

  if (!isOpen || !gig) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create or get client record
      let clientId: string;

      if (supabaseUser) {
        // User is logged in - get their client record
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', supabaseUser.id)
          .single();

        if (clientError && clientError.code !== 'PGRST116') {
          throw clientError;
        }

        if (clientData) {
          clientId = clientData.id;
        } else {
          // Create client record
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({
              user_id: supabaseUser.id,
              company_name: name
            })
            .select('id')
            .single();

          if (createError) throw createError;
          clientId = newClient.id;
        }
      } else {
        // Guest checkout - this shouldn't happen with current auth flow
        // but keeping for safety
        throw new Error('Please sign in to complete purchase');
      }

      // Check if this is a custom request
      const isCustomRequest = gig.title.includes('Custom Project') || !!gig.custom_request_id;

      if (isCustomRequest && gig.custom_request_id) {
        // 1. Create custom_order record
        const { data: newOrder, error: orderError } = await supabase
          .from('custom_orders')
          .insert({
            client_id: clientId,
            request_id: gig.custom_request_id,
            title: gig.title,
            description: gig.description,
            amount: gig.price,
            status: 'pending',
            payment_status: 'paid'
          })
          .select('id')
          .single();

        if (orderError) throw orderError;

        // 2. Update custom_request to 'converted' state and link the order
        const { error: updateError } = await supabase
          .from('custom_requests')
          .update({
            status: 'converted',
            custom_order_id: newOrder.id,
            converted_project_id: newOrder.id
          })
          .eq('id', gig.custom_request_id);

        if (updateError) {
          console.error('Error updating custom request status:', updateError);
          throw new Error(`Failed to update request status: ${updateError.message}`);
        }
      } else if (!isCustomRequest) {
        // Create project record for regular gigs
        const { error: projectError } = await supabase
          .from('projects')
          .insert({
            client_id: clientId,
            service_id: gig.id,
            title: gig.title,
            description: gig.description,
            amount: gig.price,
            status: 'pending'
          });

        if (projectError) throw projectError;
      }

      setStep('success');

      // Trigger confetti celebration
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#10b981']
        });
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setStep('payment');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    } else {
      onClose();
    }
  };

  const handleGoToDashboard = () => {
    onSuccess();
  };

  const formatCardNumber = (val: string) => {
    return val.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full ${gig?.title.includes('Custom Project') ? 'max-w-2xl' : 'max-w-5xl'} bg-white rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] md:h-auto md:overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row`}>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-slate-900"
        >
          <X size={20} />
        </button>

        {/* Left Side: Order Summary - Hidden for Custom Requests */}
        {!gig.title.includes('Custom Project') && (
          <div className="w-full md:w-5/12 bg-slate-50 p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">C.</div>
              Order Summary
            </h3>

            <div className="flex-1">
              <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <img src={gig.image} alt={gig.title} className="w-full h-48 object-cover" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">{gig.title}</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">{gig.description}</p>

              <div className="space-y-3 mb-8">
                {gig.features.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 space-y-3">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span>${gig.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Platform Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-slate-900 text-xl font-bold pt-2">
                <span>Total Due</span>
                <span>${gig.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Payment Form */}
        <div className={`${gig?.title.includes('Custom Project') ? 'w-full' : 'w-full md:w-7/12'} p-8 md:p-10 bg-white relative flex flex-col justify-center min-h-0 md:min-h-[500px]`}>

          {/* STEP: Payment Form */}
          {step === 'payment' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Checkout</h2>
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-500" />
                  Encrypted via Stripe. We never store your card details.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-6">

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100"
                    placeholder="john@company.com"
                    disabled={!!user}
                  />
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      <div className="font-bold text-sm">💳 Credit Card</div>
                      <div className="text-xs mt-1">Pay with card</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash'
                        ? 'border-green-600 bg-green-50 text-green-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      <div className="font-bold text-sm">💵 Cash</div>
                      <div className="text-xs mt-1">Pay on delivery</div>
                    </button>
                  </div>
                </div>

                {/* Card Details Group - Only show if card payment */}
                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Card Information</label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <div className="flex items-center bg-slate-50 px-4 border-b border-slate-200">
                        <CreditCard size={20} className="text-slate-400 mr-3" />
                        <input
                          type="text"
                          placeholder="Card number"
                          className="w-full py-4 bg-transparent outline-none placeholder:text-slate-400 font-mono text-sm"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="flex divide-x divide-slate-200 bg-slate-50">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="w-1/2 py-4 px-4 bg-transparent outline-none placeholder:text-slate-400 font-mono text-center text-sm"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substr(0, 5))}
                          maxLength={5}
                          required={paymentMethod === 'card'}
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="w-1/2 py-4 px-4 bg-transparent outline-none placeholder:text-slate-400 font-mono text-center text-sm"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substr(0, 4))}
                          maxLength={4}
                          required={paymentMethod === 'card'}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pay Button */}
                <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 mt-4">
                  <Lock size={18} /> {paymentMethod === 'cash' ? `Place Order - $${gig.price.toFixed(2)}` : `Pay $${gig.price.toFixed(2)}`}
                </button>

                <div className="text-center">
                  <p className="text-xs text-slate-400">Powered by Stripe. Terms and Privacy apply.</p>
                </div>
              </form>
            </div>
          )}

          {/* STEP: Processing */}
          {step === 'processing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-6">Processing Payment...</h3>
              <p className="text-slate-500 text-sm">Please do not close this window.</p>
            </div>
          )}

          {/* STEP: Success */}
          {step === 'success' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 animate-in zoom-in-95 duration-500 text-center px-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 size={48} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 max-w-sm">
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Confirmation sent to:
                </p>
                <p className="text-slate-900 font-bold">{email}</p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button onClick={handleGoToDashboard} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;