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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full mb-8 text-center">
        <h2 className="text-4xl font-black text-primary tracking-tight">{t('join_krishirath')}</h2>
      </div>

      {step === "role" && (
        <div className="max-w-md w-full space-y-4 p-8 bg-white rounded-2xl shadow-xl border-2">
          <p className="text-center text-muted-foreground font-medium italic mb-4">{t('create_account_start')}</p>
          <Button 
            className="w-full h-12 font-black shadow-lg shadow-primary/10 text-lg"
            onClick={() => handleRoleSelect("farmer")}
          >
            {t('register_as_farmer')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 font-black border-2 text-lg"
            onClick={() => handleRoleSelect("owner")}
          >
            {t('register_as_owner')}
          </Button>
          <p className="text-center text-sm text-slate-500 font-bold italic pt-4">
            {t('already_have_account')}? <Link to="/login" className="text-primary hover:underline">{t('login_to_account')}</Link>
          </p>
        </div>
      )}

      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="max-w-md w-full space-y-4 p-8 bg-white rounded-2xl shadow-xl border-2">
          <h3 className="font-bold text-center mb-4 uppercase tracking-wider text-sm text-slate-400 font-mono italic">Step 2: Your Location</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1 ml-1 font-mono">Phone Number</label>
              <Input 
                required 
                type="tel" 
                placeholder="e.g. +91 9876543210" 
                className="h-12 border-2"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1 ml-1 font-mono">Village</label>
              <Input 
                required 
                type="text" 
                placeholder="Name of your village" 
                className="h-12 border-2"
                value={formData.village}
                onChange={(e) => setFormData({...formData, village: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1 ml-1 font-mono">District</label>
              <Input 
                required 
                type="text" 
                placeholder="Name of your district" 
                className="h-12 border-2"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-black shadow-lg shadow-primary/10 text-lg mt-6">
            Continue to Account Creation →
          </Button>
          <Button variant="ghost" onClick={() => setStep("role")} className="w-full font-bold text-sm text-slate-400">
            ← Change Role
          </Button>
        </form>
      )}

      {step === "account" && (
        <form onSubmit={handleFinalSubmit} className="max-w-md w-full space-y-4 p-8 bg-white rounded-2xl shadow-xl border-2">
          <h3 className="font-bold text-center mb-4 uppercase tracking-wider text-sm text-slate-400 font-mono italic">Step 3: Account Info</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1 ml-1 font-mono">Full Name</label>
              <Input 
                required 
                type="text" 
                placeholder="Parth Padwal" 
                className="h-12 border-2"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1 ml-1 font-mono">Email Address</label>
              <Input 
                required 
                type="email" 
                placeholder="example@gmail.com" 
                className="h-12 border-2"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1 ml-1 font-mono">Password</label>
              <Input 
                required 
                type="password" 
                placeholder="••••••••" 
                className="h-12 border-2"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          <Button disabled={loading} type="submit" className="w-full h-12 font-black shadow-lg shadow-primary/10 text-lg mt-6">
            {loading ? "Creating Account..." : "Complete Registration"}
          </Button>
          <Button variant="ghost" onClick={() => setStep("details")} className="w-full font-bold text-sm text-slate-400">
            ← Back to Location
          </Button>
        </form>
      )}
    </div>
  );
};

export default Register;
