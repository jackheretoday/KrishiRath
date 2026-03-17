import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Register = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"farmer" | "owner" | null>(null);
  const [step, setStep] = useState<"role" | "details" | "account">("role");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    village: "",
    district: ""
  });

  const handleRoleSelect = (role: "farmer" | "owner") => {
    setSelectedRole(role);
    setStep("details");
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("account");
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...formData, role: selectedRole });
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] relative overflow-hidden p-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-md w-full mb-8 text-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="h-14 w-14 bg-white shadow-xl rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
          <div className="h-8 w-8 bg-primary rounded-lg shadow-sm rotate-12" />
        </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tightest mb-2 italic uppercase">Krushi<span className="text-primary not-italic">Rath</span></h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Initialize New Ecosystem Identity</p>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in zoom-in-95 duration-500">
        {step === "role" && (
          <div className="space-y-6 p-10 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-2 border-white/50">
            <p className="text-center text-slate-500 font-bold text-sm tracking-tight mb-8">Select your operational profile to continue</p>
            <div className="space-y-4">
              <Button 
                className="w-full h-16 font-black shadow-xl shadow-primary/20 text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleRoleSelect("farmer")}
              >
                Operational: Farmer
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-16 font-black border-2 text-lg rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98]"
                onClick={() => handleRoleSelect("owner")}
              >
                Operational: Owner
              </Button>
            </div>
            <p className="text-center text-xs text-slate-500 font-bold tracking-tight pt-8 border-t border-slate-100">
              Identity exists? <Link to="/login" className="text-primary hover:underline underline-offset-4 decoration-2">System Access</Link>
            </p>
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-6 p-10 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-2 border-white/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase tracking-widest text-[10px] text-primary">PHASE 02: Geolocation</h3>
              <span className="text-[10px] font-black text-slate-300">66%</span>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contact Protocol (Phone)</label>
                <Input 
                  required 
                  type="tel" 
                  placeholder="+91 00000 00000" 
                  className="h-14 border-2 rounded-2xl bg-white/50 focus:bg-white font-bold"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Primary Settlement (Village)</label>
                <Input 
                  required 
                  type="text" 
                  placeholder="Enter location name" 
                  className="h-14 border-2 rounded-2xl bg-white/50 focus:bg-white font-bold"
                  value={formData.village}
                  onChange={(e) => setFormData({...formData, village: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Regional Sector (District)</label>
                <Input 
                  required 
                  type="text" 
                  placeholder="Identify your district" 
                  className="h-14 border-2 rounded-2xl bg-white/50 focus:bg-white font-bold"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 font-black shadow-xl shadow-primary/20 text-lg rounded-2xl mt-4 transition-all hover:scale-[1.02]">
              Next Phase →
            </Button>
            <Button variant="ghost" onClick={() => setStep("role")} className="w-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
              Restart Sequence
            </Button>
          </form>
        )}

        {step === "account" && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 p-10 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-2 border-white/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase tracking-widest text-[10px] text-primary">PHASE 03: Profile Signature</h3>
              <span className="text-[10px] font-black text-slate-300">99%</span>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Human Identifier (Full Name)</label>
                <Input 
                  required 
                  type="text" 
                  placeholder="Authorized signature" 
                  className="h-14 border-2 rounded-2xl bg-white/50 focus:bg-white font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Digital Frequency (Email)</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="active@krushirath.in"
 
                  className="h-14 border-2 rounded-2xl bg-white/50 focus:bg-white font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Access Cipher (Password)</label>
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-14 border-2 rounded-2xl bg-white/50 focus:bg-white font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <Button disabled={loading} type="submit" className="w-full h-14 font-black shadow-xl shadow-primary/20 text-lg rounded-2xl mt-4 transition-all hover:scale-[1.02]">
              {loading ? <span className="flex items-center gap-2 italic">Transmitting Data...</span> : "Finalize Identity"}
            </Button>
            <Button variant="ghost" onClick={() => setStep("details")} className="w-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
              Adjust Geolocation
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
