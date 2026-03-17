import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const { isAuthenticated, role, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(role === "farmer" ? "/farmer-dashboard" : "/owner-dashboard");
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05)_0%,transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
      
      <div className="w-full max-w-md mb-8 text-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 rotate-3">
          <span className="text-white font-black text-2xl uppercase tracking-tighter">AR</span>
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tightest mb-2 italic uppercase">KRUSHI<span className="text-primary not-italic">RATH</span></h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{t('login_to_account')}</p>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in zoom-in-95 duration-500">
        <form onSubmit={handleSubmit} className="space-y-6 p-10 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-2 border-white/50">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('email') || 'EMAIL ADDRESS'}</label>
            <Input 
              required
              type="email"
              placeholder="farmer@krushirath.in"
              className="h-14 px-5 rounded-2xl border-2 bg-white/50 focus:bg-white transition-all font-bold text-slate-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('password') || 'SECURE PASSWORD'}</label>
            <Input 
              required
              type="password"
              placeholder="••••••••"
              className="h-14 px-5 rounded-2xl border-2 bg-white/50 focus:bg-white transition-all font-bold text-slate-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button 
            disabled={loading}
            className="w-full h-14 font-black shadow-xl shadow-primary/20 text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <span className="flex items-center gap-2 italic">Authenticating...</span> : <span className="uppercase tracking-widest">Access Vault</span>}
          </Button>
        </form>

        <div className="text-center pt-8 mt-8 border-t-2 border-slate-100/50">
          <p className="text-sm text-slate-500 font-bold">
            New to the ecosystem? <Link to="/register" className="text-primary hover:underline underline-offset-4 decoration-2">Initialize Account</Link>
          </p>
        </div>
      </div>

      <div className="text-center pt-8 relative z-10">
        <Link to="/" className="text-slate-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <span className="text-lg">←</span> {t('back_to_home')}
        </Link>
      </div>
    </div>
  );
};

export default Login;
