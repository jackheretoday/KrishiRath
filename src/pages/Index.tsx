import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tractor, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-primary selection:text-white">
      <Header />
      <main>
        {/* Dynamic Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900 text-white">
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-primary text-sm font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  Ecosystem Status: Online
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.9] uppercase italic">
                  AGRO<span className="text-primary not-italic">RATH</span><br />
                  <span className="text-3xl md:text-5xl not-italic tracking-normal font-bold text-slate-400">Intelligence for Every Acre.</span>
                </h1>

                <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed">
                  The mission-critical platform for modern Indian agriculture. Rent precision equipment, diagnose crop health, and optimize your harvest with our AI suite.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <Link to="/login">
                    <Button size="lg" className="h-16 px-10 text-xl font-black rounded-2xl shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.05] active:scale-95 group">
                      Initialize Login <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-black rounded-2xl border-2 border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all text-white">
                      Create Identity
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-8 pt-6 border-t border-white/10">
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-white">99.5%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Model Accuracy</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-white">10k+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Assets</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-white">24/7</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expert Support</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-200">
                <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-4 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2045&auto=format&fit=crop" 
                    alt="Agricultural Technology" 
                    className="rounded-[2.5rem] w-full h-[600px] object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent rounded-[2.5rem]" />
                  <div className="absolute bottom-10 left-10 p-8 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 max-w-xs">
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />)}
                    </div>
                    <p className="text-white font-bold text-sm leading-relaxed">
                      "The crop prediction model helped us switch to Sugarcane just in time for the peak season. Higher yields, lower stress."
                    </p>
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-4">Verified Testimonial</p>
                  </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute top-1/2 -right-8 w-16 h-16 grid grid-cols-4 gap-2 opacity-30">
                  {Array.from({ length: 16 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Services Section */}
        <section className="py-32 container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 animate-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em]">The AI Suite</h2>
              <h3 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Advanced tools for the<br />modern agriculturalist.</h3>
            </div>
            <p className="text-slate-500 font-bold max-w-xs text-right hidden md:block italic">
              Empowering farmers with the same technology used by global industrial complexes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                title: "Crop Intelligence", 
                desc: "Predict optimal crops based on high-resolution soil analysis and regional weather data.",
                icon: TrendingUp,
                color: "emerald"
              },
              { 
                title: "Plant Diagnostics", 
                desc: "Identify leaf pathogens in seconds using advanced neural network vision patterns.",
                icon: ShieldCheck,
                color: "blue"
              },
              { 
                title: "Asset Network", 
                desc: "Access a verified fleet of industrial equipment with precision availability tracking.",
                icon: Tractor,
                color: "orange"
              }
            ].map((feature, i) => (
              <div key={i} className="border-2 border-slate-100 bg-white rounded-[2.5rem] p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className={`h-16 w-16 bg-${feature.color}-100 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-500`} />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 mb-4">{feature.title}</CardTitle>
                <CardDescription className="text-base font-bold text-slate-500 leading-relaxed mb-8">
                  {feature.desc}
                </CardDescription>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Impact CTA */}
        <section className="container mx-auto px-4 pb-32">
          <div className="bg-primary rounded-[4rem] p-12 md:p-24 overflow-hidden relative shadow-2xl shadow-primary/20">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            <div className="max-w-3xl relative z-10 space-y-10">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tightest uppercase italic">Ready to optimize your harvest?</h2>
              <p className="text-xl text-white/80 font-medium">Join the thousands of Indian farmers using KrushiRath to build a sustainable and profitable future.</p>
              <div className="flex flex-wrap gap-6 pt-4">
                <Link to="/register">
                  <Button size="lg" className="h-16 px-10 text-xl font-black rounded-2xl bg-white text-primary hover:bg-slate-50 shadow-2xl transition-all hover:scale-105">
                    Start Now — Free
                  </Button>
                </Link>
                <Link to="/contact-support">
                  <Button variant="ghost" size="lg" className="h-16 px-10 text-xl font-black rounded-2xl text-white hover:bg-white/10 transition-all border border-white/20">
                    Contact Liaison
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="absolute right-0 bottom-0 md:-mr-20 md:-mb-20 opacity-20 hidden lg:block">
              <Tractor size={600} strokeWidth={1} color="white" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">AGRO<span className="text-primary not-italic">RATH</span></h2>
            <div className="flex gap-12 font-black text-[10px] uppercase tracking-widest text-slate-400">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Protocol</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Operating Terms</Link>
              <Link to="/contact-support" className="hover:text-primary transition-colors">Support Matrix</Link>
            </div>
            <p className="text-xs font-bold text-slate-400">© 2024 AGRO RATH ECODYNAMICS. ALL SYSTEMS NOMINAL.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
