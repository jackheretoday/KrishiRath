import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Phone, Mail, MapPin, MessageSquare, Send,
  Headphones, Clock, CheckCircle2, ExternalLink,
  HelpCircle, FileText, Shield, Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    toast.success("Your message has been sent! We'll get back to you within 24 hours.");
    setContactForm({ ...contactForm, subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Headphones className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Contact Support</h1>
          <p className="text-muted-foreground font-medium">Need help? We're here for you. Reach out to our team or browse frequently asked questions below.</p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/30 transition-all shadow-sm bg-white group">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-black text-lg mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-3">Mon-Sat, 9 AM - 6 PM</p>
              <a href="tel:+911800123456">
                <Button variant="outline" className="gap-2 font-bold border-2 w-full">
                  <Phone className="h-4 w-4" /> +91 1800 123 4567
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-all shadow-sm bg-white group">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-black text-lg mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-3">Quick responses, 24/7</p>
              <a href="https://wa.me/911800123456" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 font-bold border-2 w-full text-green-700 border-green-200 hover:bg-green-50">
                  <ExternalLink className="h-4 w-4" /> Open WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-300 transition-all shadow-sm bg-white group">
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-black text-lg mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">We reply within 24 hours</p>
              <a href="mailto:support@krishirath.in">
                <Button variant="outline" className="gap-2 font-bold border-2 w-full text-purple-700 border-purple-200 hover:bg-purple-50">
                  <Mail className="h-4 w-4" /> support@krishirath.in
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div>
            <Card className="border-2 shadow-xl bg-white">
              <CardHeader className="bg-primary/5 border-b-2 border-primary/10">
                <CardTitle className="flex items-center gap-3 text-xl font-black">
                  <Send className="h-5 w-5 text-primary" /> Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {sent ? (
                  <div className="py-12 text-center animate-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-black text-xl text-green-700 mb-1">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Name</label>
                        <Input required className="h-11 border-2" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Email</label>
                        <Input required type="email" className="h-11 border-2" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Subject</label>
                      <Input required placeholder="What do you need help with?" className="h-11 border-2" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Message</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Describe your issue or question in detail..."
                        className="w-full border-2 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 font-black shadow-lg gap-2" disabled={sending}>
                      {sending ? (
                        <><Clock className="h-4 w-4 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="h-4 w-4" /> Send Message</>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" /> Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-2xl bg-white overflow-hidden transition-all ${expandedFaq === idx ? "border-primary/30 shadow-md" : "border-slate-200"}`}
                >
                  <button
                    className="w-full p-4 text-left flex items-center justify-between gap-4"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  >
                    <span className="font-bold text-sm">{faq.q}</span>
                    <span className={`text-primary transition-transform shrink-0 ${expandedFaq === idx ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <section>
          <h2 className="text-2xl font-black flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-primary" /> Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <Card key={member.email} className="border-2 bg-white hover:shadow-lg transition-all group overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all">
                    {member.avatar}
                  </div>
                  <h3 className="font-black text-lg">{member.name}</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-4">{member.role}</p>
                  <div className="space-y-2">
                    <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors justify-center font-bold">
                      <Phone className="h-3 w-3" /> {member.phone}
                    </a>
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors justify-center font-bold">
                      <Mail className="h-3 w-3" /> {member.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <div className="bg-white border-2 rounded-2xl p-8 text-center space-y-3">
          <Shield className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-black text-lg">Your Data is Safe With Us</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            KrishiRath is committed to protecting your personal information. All communications are encrypted and your data is never shared with third parties.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><MapPin className="h-3 w-3" /> Sangli, Maharashtra, India</span>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Clock className="h-3 w-3" /> Mon-Sat, 9 AM - 6 PM IST</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactSupport;
