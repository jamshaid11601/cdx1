import React, { useState } from 'react';
import {
  MessageSquare, ArrowRight, ArrowLeft, CheckCircle2,
  Globe, Smartphone, Cpu, Palette, Layout, Server,
  User, Mail, FileText, DollarSign, Calendar, Upload, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const CustomOrder: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    email: '',
    details: '',
    budget: '10-25k',
    timeline: '1-3m',
    attachmentName: ''
  });

  const categories = [
    { id: 'web', label: 'Web Platform', icon: <Globe size={24} />, desc: 'SaaS, Marketplace, or Corp Site' },
    { id: 'mobile', label: 'Mobile App', icon: <Smartphone size={24} />, desc: 'iOS, Android, or Cross-platform' },
    { id: 'ai', label: 'AI Solution', icon: <Cpu size={24} />, desc: 'LLM Integration, Chatbot, or ML' },
    { id: 'design', label: 'Product Design', icon: <Palette size={24} />, desc: 'UI/UX, Branding, or Prototype' },
    { id: 'devops', label: 'DevOps & Cloud', icon: <Server size={24} />, desc: 'AWS, Infrastructure, or CI/CD' },
    { id: 'consult', label: 'Consulting', icon: <MessageSquare size={24} />, desc: 'Audit, Strategy, or CTO-as-a-Service' },
  ];

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFormData({ ...formData, attachmentName: file.name });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_requests')
        .insert({
          user_id: supabaseUser?.id || null,
          category: formData.category,
          name: formData.name,
          email: formData.email,
          details: formData.details,
          budget: formData.budget,
          timeline: formData.timeline,
          attachment_name: formData.attachmentName || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting request:', error);
        alert('Failed to submit request. Please try again.');
        return;
      }

      console.log('Request submitted successfully:', data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tighter">
            Let's build something <span className="text-blue-600">extraordinary.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light">
            Tell us about your vision. Our solution architects will analyze your requirements and draft a technical roadmap within 24 hours.
          </p>
        </div>

        {/* Wizard Container - Centered and focused */}
        <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden min-h-[600px] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">

          {/* Sidebar / Progress */}
          <div className="bg-slate-900 text-white p-8 md:p-10 md:w-1/3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-10 text-blue-400 font-bold tracking-wider uppercase text-xs">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                  <MessageSquare size={14} />
                </div>
                Concierge Ticket
              </div>

              <h3 className="text-3xl font-bold mb-6 tracking-tight">Project Scope</h3>

              {/* Steps Indicator */}
              <div className="space-y-6">
                <div className={`flex gap-4 items-center transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === 1 ? 'bg-blue-600 border-blue-600' : 'border-white/30'}`}>1</div>
                  <div className="font-medium">Service Domain</div>
                </div>
                <div className={`flex gap-4 items-center transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === 2 ? 'bg-blue-600 border-blue-600' : 'border-white/30'}`}>2</div>
                  <div className="font-medium">Project Details</div>
                </div>
                <div className={`flex gap-4 items-center transition-opacity duration-300 ${step === 3 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === 3 ? 'bg-blue-600 border-blue-600' : 'border-white/30'}`}>3</div>
                  <div className="font-medium">Budget & Launch</div>
                </div>
              </div>
            </div>

            {/* Assistant Profile */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 p-[2px]">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" alt="Agent" className="rounded-full border-2 border-slate-900" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div>
                  <div className="font-bold text-sm">Sarah Jenkins</div>
                  <div className="text-xs text-slate-400">Senior Solutions Architect</div>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                "I'll be reviewing your request personally. Most estimates are sent within 4 hours."
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-8 md:p-12 relative bg-white">

            {/* Step 1: Category Selection */}
            {step === 1 && (
              <div className="animate-in slide-in-from-right-8 duration-300 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">What are we building today?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-6 rounded-2xl border text-left transition-all duration-200 group flex items-start gap-4 ${formData.category === cat.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-400 hover:shadow-md'}`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${formData.category === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                        {cat.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 mb-1">{cat.label}</div>
                        <div className="text-xs text-slate-500 leading-relaxed">{cat.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-auto pt-8 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!formData.category}
                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-8 duration-300 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Project specifics</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="email" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="john@company.com" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Project Description</label>
                    <div className="relative">
                      <textarea rows={5} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Describe the core features, target audience, and any specific tech stack preferences..."></textarea>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Attachments (Optional)</label>
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${formData.attachmentName ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-400 hover:shadow-sm'}`}
                      >
                        {formData.attachmentName ? (
                          <div className="flex items-center gap-3 w-full justify-center">
                            <div className="p-2 bg-white rounded-lg border border-blue-100 text-blue-600">
                              <FileText size={20} />
                            </div>
                            <span className="font-medium text-slate-700 truncate max-w-[200px] md:max-w-xs">{formData.attachmentName}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setFormData({ ...formData, attachmentName: '' });
                              }}
                              className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-full transition-colors ml-2"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 bg-white rounded-full border border-slate-200 mb-3 shadow-sm">
                              <Upload size={20} className="text-slate-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Click to upload resources</span>
                            <span className="text-xs text-slate-400 mt-1">PDF, DOCX, Images (Max 5MB)</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-8 flex justify-between">
                  <button onClick={handleBack} className="text-slate-500 font-bold hover:text-slate-900 flex items-center gap-2"><ArrowLeft size={18} /> Back</button>
                  <button onClick={handleNext} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-600 transition-all">Continue <ArrowRight size={18} /></button>
                </div>
              </div>
            )}

            {/* Step 3: Budget & Timeline */}
            {step === 3 && (
              <div className="animate-in slide-in-from-right-8 duration-300 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Timeline & Investment</h2>

                <div className="space-y-8">
                  {/* Budget Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16} /> Estimated Budget</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['< $5k', '$5k - $10k', '$10k - $25k', '$25k+'].map((b) => (
                        <button
                          key={b}
                          onClick={() => setFormData({ ...formData, budget: b })}
                          className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${formData.budget === b ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar size={16} /> Target Launch</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['< 1 Month', '1 - 3 Months', '3+ Months'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFormData({ ...formData, timeline: t })}
                          className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${formData.timeline === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 flex justify-between">
                  <button onClick={handleBack} className="text-slate-500 font-bold hover:text-slate-900 flex items-center gap-2"><ArrowLeft size={18} /> Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'} <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {submitted && (
              <div className="absolute inset-0 bg-white flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center max-w-md px-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 size={48} className="text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Submitted!</h2>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Thank you for reaching out! Our solution architect <strong>Sarah Jenkins</strong> will review your requirements and send a detailed proposal within <strong>24 hours</strong>.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-900 font-medium">
                      📧 Confirmation sent to your email
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-blue-600 transition-all"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;