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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h2 className="text-4xl font-black text-primary tracking-tight">{t('krishirath')}</h2>
        <p className="mt-2 text-muted-foreground font-medium">{t('login_to_account')}</p>
      </div>
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 block ml-1 font-mono">Email</label>
            <Input 
              required
              type="email"
              placeholder="farmer@example.com"
              className="h-12 px-4 rounded-xl border-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 block ml-1 font-mono">Password</label>
            <Input 
              required
              type="password"
              placeholder="••••••••"
              className="h-12 px-4 rounded-xl border-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button 
            disabled={loading}
            className="w-full h-12 font-black shadow-lg shadow-primary/10 text-lg"
          >
            {loading ? "Authenticating..." : t('login_to_account')}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 font-bold italic">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register Now</Link>
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link to="/" className="text-primary hover:underline font-bold text-sm">
          ← {t('back_to_home')}
        </Link>
      </div>
    </div>
  );
};

export default Login;
