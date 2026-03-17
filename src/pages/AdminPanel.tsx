import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Users, Package, IndianRupee, BarChart2,
  Trash2, ShieldCheck, AlertTriangle, Search, LogOut
} from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "@/lib/config";

const AdminLogin = ({ onLogin }: { onLogin: (token: string, admin: any) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLogin(data.token, data.admin);
      toast.success(`Welcome, ${data.admin.name}!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-slate-800 text-white">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
          <CardTitle className="text-2xl font-black text-white">Admin Portal</CardTitle>
          <p className="text-slate-400 text-sm font-bold">KrishiRath Control Center</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
              <Input
                required type="email"
                placeholder="admin@krishirath.com"
                className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Password</label>
              <Input
                required type="password"
                placeholder="••••••••"
                className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}
              className="w-full h-12 font-black bg-red-600 hover:bg-red-700 text-white shadow-lg mt-2">
              {loading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
            <p className="text-xs text-slate-400 font-bold text-center">
              ℹ️ Default credentials in README
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminPanel = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [admin, setAdmin] = useState<any>(JSON.parse(localStorage.getItem("admin_info") || "null"));
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "equipment">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchAll = async () => {
    if (!token) return;
    try {
      const [statsRes, usersRes, eqRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers: authHeaders }),
        fetch(`${API}/admin/users`, { headers: authHeaders }),
        fetch(`${API}/admin/equipment`, { headers: authHeaders }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      if (eqRes.ok) setEquipment((await eqRes.json()).equipment || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const handleLogin = (t: string, a: any) => {
    localStorage.setItem("admin_token", t);
    localStorage.setItem("admin_info", JSON.stringify(a));
    setToken(t); setAdmin(a);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");
    setToken(null); setAdmin(null);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Remove this user permanently?")) return;
    await fetch(`${API}/admin/users/${id}`, { method: "DELETE", headers: authHeaders });
    toast.success("User removed");
    fetchAll();
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm("Remove this listing?")) return;
    await fetch(`${API}/admin/equipment/${id}`, { method: "DELETE", headers: authHeaders });
    toast.success("Listing removed");
    fetchAll();
  };

  if (!token) return <AdminLogin onLogin={handleLogin} />;

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "users", label: "Users", icon: Users },
    { key: "equipment", label: "Equipment", icon: Package },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Admin Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-black text-white">KrishiRath Admin</h1>
            <p className="text-xs text-slate-400 font-bold">{admin?.name} · Control Panel</p>
          </div>
        </div>
        <Button variant="ghost" className="text-slate-400 hover:text-white gap-2 font-bold" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.key
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}>
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.key === "users" && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{users.length}</span>}
                {tab.key === "equipment" && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{equipment.length}</span>}
              </button>
            );
          })}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats?.total_users ?? users.length, icon: Users, color: "bg-blue-600" },
                { label: "Equipment Listed", value: stats?.total_equipment ?? equipment.length, icon: Package, color: "bg-green-600" },
                { label: "Total Bookings", value: stats?.total_bookings ?? 0, icon: BarChart2, color: "bg-purple-600" },
                { label: "Revenue", value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, icon: IndianRupee, color: "bg-amber-600" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="bg-slate-800 border-slate-700 text-white">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-3xl font-black mt-1">{item.value}</p>
                      </div>
                      <div className={`h-12 w-12 ${item.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Users preview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-black flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" /> Recent Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-600 rounded-full flex items-center justify-center font-black text-white">
                          {u.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase ${
                        u.role === "owner" ? "bg-green-900 text-green-400" : "bg-blue-900 text-blue-400"
                      }`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-slate-800 border-slate-700 text-white h-11 placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {filteredUsers.map(u => (
                <Card key={u.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center font-black text-lg text-white">
                        {u.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-black text-white">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email} · {u.district || "Unknown"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${
                        u.role === "owner" ? "bg-green-900 text-green-400" : "bg-blue-900 text-blue-400"
                      }`}>{u.role}</span>
                      <Button size="sm" variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30 font-bold gap-1"
                        onClick={() => deleteUser(u.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-500 font-bold">No users found.</div>
              )}
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === "equipment" && (
          <div className="space-y-3">
            {equipment.map(eq => (
              <Card key={eq.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-700 rounded-xl p-1.5">
                      <img src={eq.image || "/src/assets/tractor.png"} className="h-full w-full object-contain" alt="" />
                    </div>
                    <div>
                      <p className="font-black text-white">{eq.name}</p>
                      <p className="text-xs text-slate-400">{eq.type} · {eq.location} · ₹{eq.price_per_hour}/hr</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                      eq.availability ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                    }`}>{eq.availability ? "Available" : "Unavailable"}</span>
                    <Button size="sm" variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30 font-bold gap-1"
                      onClick={() => deleteEquipment(eq.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {equipment.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-bold">No equipment listings found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
