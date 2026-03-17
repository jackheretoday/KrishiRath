import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Phone, Mail, MapPin, MessageSquare, Send,
  Headphones, Clock, CheckCircle2, ExternalLink,
  HelpCircle, FileText, Shield, Users, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TEAM_MEMBERS = [
  { name: "Jay Kshirsagar", role: "Lead Developer", phone: "+91 98765 43210", email: "jay@krishirath.in", avatar: "JK" },
  { name: "Parth Padwal", role: "Backend Engineer", phone: "+91 98765 43211", email: "parth@krishirath.in", avatar: "PP" },
  { name: "Support Team", role: "Customer Support", phone: "+91 1800 123 4567", email: "support@krishirath.in", avatar: "ST" },
];

const FAQ_ITEMS = [
  { q: "How do I book equipment?", a: "Navigate to the Farmer Dashboard, browse available equipment, and click 'Book Now'. Select your preferred date and hours, then submit your booking request." },
  { q: "How do I add my equipment for rent?", a: "Login as an Owner, go to your Owner Dashboard, and click 'Add New Equipment'. Fill in the details including name, price, location, warranty info, and submit." },
  { q: "How does payment work?", a: "Once your booking is approved by the owner, you'll be redirected to the payment page. We support UPI, card payments, and net banking." },
  { q: "What if equipment is damaged?", a: "All listed equipment comes with warranty information. Contact the owner directly through chat or call. If unresolved, reach out to our support team." },
  { q: "How do I contact an equipment owner?", a: "From the equipment details page, use the Chat or Call buttons to reach the owner directly. Chat is available 24/7." },
];

const ContactSupport = () => {
  const { user } = useAuth();
  const [contactForm, setContactForm] = useState({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    toast.success("Message transmitted! Our team will respond within 24 hours.");
    setContactForm({ ...contactForm, subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-primary/5 border-b border-primary/10 pt-24 pb-16 mb-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-6">
            <Shield className="h-4 w-4" /> Trusted Agriculture Support
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6">How can we help you today?</h1>
          <p className="text-lg text-slate-600 font-medium">
            Whether you're a farmer looking for equipment or an owner managing your fleet, our dedicated team is here to ensure your success.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-6xl space-y-20">
        {/* Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            { 
              title: "Active Support", 
              desc: "Mon-Sat, 9AM - 6PM", 
              val: "+91 1800 123 4567", 
              icon: Phone, 
              color: "blue",
              link: "tel:+911800123456"
            },
            { 
              title: "Express Chat", 
              desc: "WhatsApp Support 24/7", 
              val: "Open Messenger", 
              icon: MessageSquare, 
              color: "emerald",
              link: "https://wa.me/911800123456"
            },
            { 
              title: "Official Inquiry", 
              desc: "Replies in 24 hours", 
              val: "support@krishirath.in", 
              icon: Mail, 
              color: "purple",
              link: "mailto:support@krishirath.in"
            }
          ].map((item, i) => (
            <Card key={i} className="border-2 border-slate-200 shadow-xl hover:scale-[1.02] transition-all bg-white rounded-3xl overflow-hidden group">
              <CardContent className="p-8 text-center">
                <div className={`h-16 w-16 bg-${item.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform`}>
                  <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                </div>
                <h3 className="font-black text-xl text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{item.desc}</p>
                <a href={item.link} target={item.link.startsWith('http') ? "_blank" : undefined}>
                  <Button className={`w-full h-12 font-black rounded-xl bg-${item.color}-600 hover:bg-${item.color}-700 shadow-lg shadow-${item.color}-100`}>
                    {item.val}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Submission Form */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Technical Assistance</h2>
              <p className="text-slate-500 font-bold">Submit a detailed ticket and our engineers will investigate.</p>
            </div>
            
            <Card className="border-2 border-slate-200 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
              <CardContent className="p-8">
                {sent ? (
                  <div className="py-20 text-center animate-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="font-black text-2xl text-slate-900 mb-2">Ticket Received</h3>
                    <p className="text-slate-500 font-bold">Check your email for the confirmation ID.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                        <Input required className="h-12 border-2 rounded-xl font-bold bg-slate-50 focus:bg-white" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                        <Input required type="email" className="h-12 border-2 rounded-xl font-bold bg-slate-50 focus:bg-white" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Issue Category</label>
                      <Input required placeholder="e.g. Booking Error, Payment Failed" className="h-12 border-2 rounded-xl font-bold bg-slate-50 focus:bg-white" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Detailed Description</label>
                      <textarea
                        required
                        className="w-full border-2 rounded-2xl px-4 py-4 text-sm font-bold bg-slate-50 focus:bg-white min-h-[150px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        placeholder="Tell us exactly what happened..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full h-14 font-black text-lg rounded-2xl shadow-xl shadow-primary/20" disabled={sending}>
                      {sending ? <Loader2 className="animate-spin h-6 w-6" /> : "Dispatch Message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Column */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Knowledge Base</h2>
              <p className="text-slate-500 font-bold">Instant answers to the most common queries.</p>
            </div>
            
            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, idx) => (
                <div
                  key={idx}
                  className={`group border-2 rounded-2xl bg-white overflow-hidden transition-all duration-300 ${expandedFaq === idx ? "border-primary/40 shadow-xl" : "border-slate-100 hover:border-slate-200"}`}
                >
                  <button
                    className="w-full p-6 text-left flex items-center justify-between gap-6"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  >
                    <span className={`font-black text-md transition-colors ${expandedFaq === idx ? "text-primary" : "text-slate-700"}`}>{faq.q}</span>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${expandedFaq === idx ? "bg-primary text-white rotate-45" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                      <Send className="h-4 w-4" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 overflow-hidden"
                      >
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Network Section */}
        <section className="bg-white border-2 border-slate-100 rounded-[3rem] p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Our Global Network</h2>
              <p className="text-slate-500 font-bold text-lg leading-relaxed">
                Operating from the heart of India's agricultural hub, our support network spans across Maharashtra to provide local expertise in your native language.
              </p>
              <div className="flex gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-3xl font-black text-slate-900">24/7</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Care</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-3xl font-black text-slate-900">15m</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Response</p>
                </div>
              </div>
            </div>
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className="space-y-4">
                <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary font-black text-2xl shadow-inner">
                  {member.avatar}
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">{member.name}</h4>
                  <p className="text-xs font-black text-primary uppercase tracking-widest">{member.role}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><Phone size={12} /> {member.phone}</span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><Mail size={12} /> {member.email}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none">
            <MapPin size={300} strokeWidth={1} />
          </div>
        </section>
      </main>
      
      {/* Dynamic Footer Info */}
      <div className="container mx-auto px-4 mt-20 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl">
          <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 text-emerald-600" />
            <div>
              <p className="font-black text-slate-900">Encryption Active</p>
              <p className="text-xs font-bold text-slate-400">All support tickets are secured with 256-bit SSL</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HQ Location</p>
              <p className="text-sm font-bold text-slate-700">Sangli, MH - 416416</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Hours</p>
              <p className="text-sm font-bold text-slate-700">Mon-Sat, 09:00 - 18:00 IST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
