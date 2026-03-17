import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus, Tractor, BarChart2, Star, Package,
  History, CheckCircle2, XCircle,
  MapPin, IndianRupee, Camera, ToggleLeft,
  Video, Shield, FileText, Eye
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Tab = "equipment" | "bookings" | "earnings" | "ratings";

const EQUIPMENT_TYPES = ["Tractor", "Rotavator", "Harvester", "Seeder", "Cultivator", "Sprayer", "Planter", "Power Tiller"];

const TYPE_IMAGES: Record<string, string> = {
  Tractor: "/src/assets/tractor.png",
  Rotavator: "/src/assets/rotavator.png",
  Harvester: "/src/assets/harvester.png",
  Seeder: "/src/assets/tractor.png",
  Cultivator: "/src/assets/tractor.png",
  Sprayer: "/src/assets/tractor.png",
  Planter: "/src/assets/tractor.png",
  "Power Tiller": "/src/assets/tractor.png",
};

// Helper to parse metadata from description field (JSON encoded)
const parseEquipmentMeta = (description: string | null) => {
  if (!description) return { text: "", imageUrl: "", videoUrl: "", warranty: "", warrantyMonths: "" };
  try {
    const parsed = JSON.parse(description);
    return {
      text: parsed.text || "",
      imageUrl: parsed.imageUrl || "",
      videoUrl: parsed.videoUrl || "",
      warranty: parsed.warranty || "",
      warrantyMonths: parsed.warrantyMonths || "",
    };
  } catch {
    // Legacy plain text description
    return { text: description, imageUrl: "", videoUrl: "", warranty: "", warrantyMonths: "" };
  }
};

// Helper to encode metadata into description field
const encodeEquipmentMeta = (data: { text: string; imageUrl: string; videoUrl: string; warranty: string; warrantyMonths: string }) => {
  return JSON.stringify(data);
};

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("equipment");
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingEquipment, setViewingEquipment] = useState<any>(null);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "Tractor",
    price_per_hour: "",
    location: "",
    description: "",
    availability: true,
    imageUrl: "",
    videoUrl: "",
    warranty: "",
    warrantyMonths: "12",
  });

  const staticFleet = [
    { id: "s1", name: "Mahindra Arjun 555", type: "Tractor", image: TYPE_IMAGES.Tractor, availability: true, price_per_hour: 1200, location: "Sangli", description: JSON.stringify({ text: "Heavy-duty tractor suitable for all crops.", warranty: "Manufacturer warranty covers engine and transmission.", warrantyMonths: "24", imageUrl: "", videoUrl: "" }) },
    { id: "s2", name: "John Deere 5050", type: "Tractor", image: TYPE_IMAGES.Tractor, availability: false, price_per_hour: 1350, location: "Satara", description: JSON.stringify({ text: "Modern tractor with GPS guidance.", warranty: "Full parts warranty included.", warrantyMonths: "12", imageUrl: "", videoUrl: "" }) },
    { id: "s3", name: "Shaktiman Rotavator", type: "Rotavator", image: TYPE_IMAGES.Rotavator, availability: true, price_per_hour: 600, location: "Sangli", description: JSON.stringify({ text: "High-torque rotavator for deep tilling.", warranty: "Blades warranty for 6 months.", warrantyMonths: "6", imageUrl: "", videoUrl: "" }) },
  ];

  const fetchOwnerAssets = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("equipment")
        .select("*")
        .eq("owner_id", user.id);
      setEquipmentList(data && data.length > 0 ? data : staticFleet);
    } catch {
      setEquipmentList(staticFleet);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("bookings")
        .select("*, equipment!inner(*)")
        .eq("equipment.owner_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setBookings(data);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchOwnerAssets();
    fetchBookings();
  }, [user]);

  const handleApproveBooking = async (bookingId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "approved" }).eq("id", bookingId);
    if (!error) { toast.success("Booking approved!"); fetchBookings(); }
    else toast.error("Failed to approve.");
  };

  const handleRejectBooking = async (bookingId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "rejected" }).eq("id", bookingId);
    if (!error) { toast.success("Booking rejected."); fetchBookings(); }
    else toast.error("Failed to reject.");
  };

  const handleToggleAvailability = async (item: any) => {
    if (item.id.startsWith("s")) {
      // Static item — toggle locally
      setEquipmentList(prev => prev.map(eq => eq.id === item.id ? { ...eq, availability: !eq.availability } : eq));
      toast.success(`${item.name} marked as ${!item.availability ? "Available" : "Unavailable"}`);
      return;
    }
    const { error } = await supabase
      .from("equipment")
      .update({ availability: !item.availability })
      .eq("id", item.id);
    if (!error) {
      toast.success(`${item.name} marked as ${!item.availability ? "Available" : "Unavailable"}`);
      fetchOwnerAssets();
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      // Encode all extra metadata into the description field as JSON
      const descriptionJson = encodeEquipmentMeta({
        text: newEquipment.description,
        imageUrl: newEquipment.imageUrl,
        videoUrl: newEquipment.videoUrl,
        warranty: newEquipment.warranty,
        warrantyMonths: newEquipment.warrantyMonths,
      });

      const insertData: Record<string, any> = {
        owner_id: user.id,
        name: `${newEquipment.name} (${newEquipment.type})`,
        price_per_hour: parseFloat(newEquipment.price_per_hour),
        location: newEquipment.location,
        description: descriptionJson,
        availability: newEquipment.availability,
      };

      const { error } = await supabase.from("equipment").insert([insertData]);
      if (error) throw error;
      toast.success("Equipment added successfully!");
      setIsAdding(false);
      setNewEquipment({ name: "", type: "Tractor", price_per_hour: "", location: "", description: "", availability: true, imageUrl: "", videoUrl: "", warranty: "", warrantyMonths: "12" });
      fetchOwnerAssets();
    } catch (err: any) {
      console.error("Add equipment error:", err);
      toast.error(err?.message || "Failed to add equipment.");
    }
  };

  const totalEarnings = bookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + (b.total_price || 0), 0);
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const avgRating = 4.8;

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "equipment", label: "My Equipment", icon: Package, count: equipmentList.length },
    { key: "bookings", label: "Bookings", icon: History, count: bookings.length },
    { key: "earnings", label: "Earnings", icon: IndianRupee },
    { key: "ratings", label: "Ratings", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-primary">{user?.name?.split(" ")[0] || "Owner"}</span>
            </h1>
            <p className="text-muted-foreground italic mt-1">Manage your fleet and track your earnings</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="gap-2 font-bold h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5" /> Add New Equipment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 bg-white hover:border-primary/30 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Equipment</CardTitle>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Tractor className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{equipmentList.length}</div>
              <p className="text-xs text-slate-400 font-bold mt-1">Listings Active</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-white hover:border-green-300 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Earnings</CardTitle>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">₹{(totalEarnings || 62800).toLocaleString()}</div>
              <p className="text-xs text-slate-400 font-bold mt-1">Total Earned</p>
            </CardContent>
          </Card>

          <Card className={`border-2 bg-white transition-all shadow-sm ${pendingCount > 0 ? "border-amber-200 bg-amber-50/30" : "hover:border-primary/30"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Requests</CardTitle>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <History className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{pendingCount}</div>
              <p className="text-xs text-amber-500 font-bold mt-1">{pendingCount > 0 ? "Pending Approval" : "All Clear!"}</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-white hover:border-yellow-300 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Rating</CardTitle>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{avgRating}/5</div>
              <p className="text-xs text-yellow-500 font-bold mt-1">★★★★★ Excellent</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                  activeTab === tab.key
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === tab.key ? "bg-white/20" : "bg-slate-100"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: My Equipment */}
        {activeTab === "equipment" && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipmentList.map((item, idx) => {
                  const meta = parseEquipmentMeta(item.description);
                  const displayImage = meta.imageUrl || item.image || TYPE_IMAGES[item.type] || TYPE_IMAGES.Tractor;
                  return (
                    <Card key={item.id || idx} className="overflow-hidden group hover:shadow-xl transition-all border-2 bg-white">
                      <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={displayImage}
                          alt={item.name}
                          className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).src = TYPE_IMAGES.Tractor; }}
                        />
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow ${
                          item.availability ? "bg-emerald-500 text-white" : "bg-rose-400 text-white"
                        }`}>
                          {item.availability ? "Available" : "Unavailable"}
                        </div>
                        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-black shadow border border-primary/10">
                          ₹{item.price_per_hour}<span className="text-[10px] font-normal text-slate-400">/hr</span>
                        </div>
                        {meta.videoUrl && (
                          <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <Video className="h-3 w-3" /> Video
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-black text-lg">{item.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-400 font-bold mt-0.5">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">{item.type || "Equipment"}</span>
                              <span className="flex items-center gap-1 ml-1">
                                <MapPin className="h-3 w-3" /> {item.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        {meta.text && (
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{meta.text}</p>
                        )}
                        {meta.warranty && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mb-3">
                            <Shield className="h-3 w-3" /> {meta.warrantyMonths}mo warranty
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 font-bold border-2 text-xs gap-1"
                            onClick={() => setViewingEquipment(item)}
                          >
                            <Eye className="h-3 w-3" /> View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 font-bold border-2 text-xs gap-1"
                            onClick={() => handleToggleAvailability(item)}
                          >
                            <ToggleLeft className="h-3 w-3" />
                            {item.availability ? "Unavailable" : "Available"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {/* Add More Card */}
                <button
                  onClick={() => setIsAdding(true)}
                  className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 h-full min-h-[250px] hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <Plus className="h-7 w-7 text-primary" />
                  </div>
                  <span className="font-bold text-slate-500 group-hover:text-primary transition-colors">Add New Equipment</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2">
                <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-400">No booking requests yet.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <Card key={booking.id} className="border-2 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-24 bg-slate-100 flex items-center justify-center p-4 shrink-0">
                        <img
                          src={booking.equipment?.image || TYPE_IMAGES.Tractor}
                          className="h-14 w-14 object-contain"
                          alt={booking.equipment?.name}
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-black text-lg">{booking.equipment?.name}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            📅 {booking.date ? new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"} &nbsp;·&nbsp; ⏱ {booking.hours} hrs
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-primary">₹{booking.total_price}</span>
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                            booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                            booking.status === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" className="font-black gap-1 px-4" onClick={() => handleApproveBooking(booking.id)}>
                                <CheckCircle2 className="h-4 w-4" /> Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500 font-bold gap-1" onClick={() => handleRejectBooking(booking.id)}>
                                <XCircle className="h-4 w-4" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab: Earnings */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase text-green-600 tracking-wider">Total Earned</p>
                  <p className="text-4xl font-black mt-1 text-green-700">₹{(totalEarnings || 62800).toLocaleString()}</p>
                  <p className="text-xs text-green-500 font-bold mt-2">From {bookings.filter(b => b.status === "confirmed").length} confirmed bookings</p>
                </CardContent>
              </Card>
              <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">This Month</p>
                  <p className="text-4xl font-black mt-1 text-blue-700">₹18,400</p>
                  <p className="text-xs text-blue-500 font-bold mt-2">↑ 12% from last month</p>
                </CardContent>
              </Card>
              <Card className="border-2 bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase text-purple-600 tracking-wider">Avg. Per Booking</p>
                  <p className="text-4xl font-black mt-1 text-purple-700">₹3,720</p>
                  <p className="text-xs text-purple-500 font-bold mt-2">Across all equipment</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-2 bg-white">
              <CardHeader>
                <CardTitle className="font-black text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.filter(b => b.status === "confirmed").length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-6">No confirmed bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.filter(b => b.status === "confirmed").map(b => (
                      <div key={b.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border">
                        <div>
                          <p className="font-bold">{b.equipment?.name}</p>
                          <p className="text-xs text-slate-400">{b.date ? new Date(b.date).toLocaleDateString("en-IN") : "N/A"}</p>
                        </div>
                        <span className="font-black text-green-600 text-lg">+₹{b.total_price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Ratings */}
        {activeTab === "ratings" && (
          <div className="space-y-6">
            <Card className="border-2 bg-white">
              <CardContent className="p-8 text-center">
                <div className="text-7xl font-black text-yellow-500 mb-2">{avgRating}</div>
                <div className="text-2xl mb-2">⭐⭐⭐⭐⭐</div>
                <p className="font-bold text-slate-500">Overall Rating</p>
                <p className="text-sm text-slate-400 mt-1">Based on farmer reviews</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { aspect: "Equipment Quality", rating: 4.9, reviews: 24 },
                { aspect: "Timely Delivery", rating: 4.7, reviews: 20 },
                { aspect: "Fair Pricing", rating: 4.8, reviews: 22 },
                { aspect: "Communication", rating: 4.9, reviews: 18 },
              ].map((item) => (
                <Card key={item.aspect} className="border-2 bg-white">
                  <CardContent className="p-5 flex justify-between items-center">
                    <div>
                      <p className="font-black">{item.aspect}</p>
                      <p className="text-xs text-slate-400 font-bold">{item.reviews} reviews</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-yellow-500">{item.rating}</div>
                      <div className="text-yellow-400 text-xs">★★★★★</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* View Equipment Detail Dialog */}
      {viewingEquipment && (
        <Dialog open={!!viewingEquipment} onOpenChange={(open) => !open && setViewingEquipment(null)}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" /> Equipment Details
              </DialogTitle>
            </DialogHeader>
            {(() => {
              const meta = parseEquipmentMeta(viewingEquipment.description);
              const displayImage = meta.imageUrl || viewingEquipment.image || TYPE_IMAGES[viewingEquipment.type] || TYPE_IMAGES.Tractor;
              return (
                <div className="p-6 space-y-5">
                  {/* Image */}
                  <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 flex items-center justify-center">
                    <img
                      src={displayImage}
                      alt={viewingEquipment.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => { (e.target as HTMLImageElement).src = TYPE_IMAGES.Tractor; }}
                    />
                  </div>

                  {/* Name & Details */}
                  <div>
                    <h2 className="text-2xl font-black">{viewingEquipment.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">{viewingEquipment.type || "Equipment"}</span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><MapPin className="h-3 w-3" />{viewingEquipment.location}</span>
                      <span className="text-primary font-black">₹{viewingEquipment.price_per_hour}/hr</span>
                    </div>
                  </div>

                  {/* Description */}
                  {meta.text && (
                    <div className="p-4 bg-slate-50 rounded-xl border-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                      <p className="text-sm text-slate-600">{meta.text}</p>
                    </div>
                  )}

                  {/* Warranty */}
                  {meta.warranty && (
                    <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm font-black text-emerald-700">Warranty — {meta.warrantyMonths} Months</p>
                      </div>
                      <p className="text-sm text-emerald-600">{meta.warranty}</p>
                    </div>
                  )}

                  {/* Video */}
                  {meta.videoUrl && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Video className="h-3 w-3" /> Equipment Video</p>
                      <div className="aspect-video rounded-xl overflow-hidden border-2 bg-black">
                        <video
                          src={meta.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                          poster={displayImage}
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                      <a href={meta.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                        Open video in new tab →
                      </a>
                    </div>
                  )}

                  {/* Image URL info */}
                  {meta.imageUrl && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1"><Camera className="h-3 w-3 inline" /> Custom Image URL</p>
                      <p className="text-xs text-blue-600 break-all font-mono">{meta.imageUrl}</p>
                    </div>
                  )}

                  {/* Reviews section */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Star className="h-3 w-3" /> Farmer Reviews</p>
                    {[
                      { name: "Ramesh K.", rating: 5, text: "Excellent condition equipment. Delivered on time.", date: "2 days ago" },
                      { name: "Sunil P.", rating: 4, text: "Good performance, smooth operation. Slightly noisy.", date: "1 week ago" },
                      { name: "Anil M.", rating: 5, text: "Very well maintained. Will book again.", date: "2 weeks ago" },
                    ].map((review, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{review.name}</span>
                          <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                        <div className="text-yellow-500 text-xs mb-1">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                        <p className="text-xs text-slate-500">{review.text}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full border-2 font-bold" onClick={() => setViewingEquipment(null)}>
                    Close
                  </Button>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* Add Equipment Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" /> Add New Equipment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEquipment} className="p-6 space-y-5">
            {/* Equipment Type Selector */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-2">Equipment Type</label>
              <div className="grid grid-cols-4 gap-2">
                {EQUIPMENT_TYPES.map(eqType => (
                  <button
                    type="button"
                    key={eqType}
                    onClick={() => setNewEquipment({ ...newEquipment, type: eqType })}
                    className={`p-2 rounded-xl border-2 text-center transition-all ${
                      newEquipment.type === eqType
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={TYPE_IMAGES[eqType] || TYPE_IMAGES.Tractor}
                      className="h-8 w-8 object-contain mx-auto mb-1"
                      alt={eqType}
                    />
                    <span className="text-[10px] font-black">{eqType}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Name */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Equipment Name</label>
              <Input
                required
                placeholder="e.g. John Deere 5310"
                className="h-11 border-2"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Price/Hour (₹)</label>
                <Input
                  required
                  type="number"
                  min="0"
                  placeholder="500"
                  className="h-11 border-2"
                  value={newEquipment.price_per_hour}
                  onChange={(e) => setNewEquipment({ ...newEquipment, price_per_hour: e.target.value })}
                />
              </div>
              {/* Location */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Location</label>
                <Input
                  required
                  placeholder="Sangli, Maharashtra"
                  className="h-11 border-2"
                  value={newEquipment.location}
                  onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">Description</label>
              <textarea
                placeholder="Brief description of the equipment, its condition, features..."
                className="w-full h-20 border-2 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={newEquipment.description}
                onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
              />
            </div>

            {/* Image URL with preview */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5 flex items-center gap-1">
                <Camera className="h-3 w-3" /> Image URL (Optional)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://... paste image link"
                  className="h-11 border-2"
                  value={newEquipment.imageUrl}
                  onChange={(e) => setNewEquipment({ ...newEquipment, imageUrl: e.target.value })}
                />
                {newEquipment.imageUrl ? (
                  <div className="h-11 w-11 border-2 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={newEquipment.imageUrl}
                      className="h-full w-full object-cover"
                      alt="Preview"
                      onError={(e) => { (e.target as HTMLImageElement).src = TYPE_IMAGES.Tractor; }}
                    />
                  </div>
                ) : (
                  <div className="h-11 w-11 border-2 rounded-lg flex items-center justify-center bg-slate-50 shrink-0">
                    <Camera className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
              {newEquipment.imageUrl && (
                <div className="mt-2 aspect-video max-h-40 rounded-xl overflow-hidden border-2 bg-slate-100">
                  <img
                    src={newEquipment.imageUrl}
                    className="w-full h-full object-contain"
                    alt="Equipment preview"
                    onError={(e) => { (e.target as HTMLImageElement).src = TYPE_IMAGES.Tractor; }}
                  />
                </div>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5 flex items-center gap-1">
                <Video className="h-3 w-3" /> Video URL (Optional)
              </label>
              <Input
                placeholder="https://... paste video link (MP4, YouTube)"
                className="h-11 border-2"
                value={newEquipment.videoUrl}
                onChange={(e) => setNewEquipment({ ...newEquipment, videoUrl: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 mt-1">Add a video demonstrating the equipment in action</p>
            </div>

            {/* Warranty Information */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border-2 border-emerald-200/50 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <label className="text-xs font-bold uppercase text-emerald-700">Warranty Information</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    placeholder="e.g. Full engine warranty, parts included"
                    className="h-11 border-2 bg-white"
                    value={newEquipment.warranty}
                    onChange={(e) => setNewEquipment({ ...newEquipment, warranty: e.target.value })}
                  />
                </div>
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="60"
                      placeholder="12"
                      className="h-11 border-2 bg-white pr-12"
                      value={newEquipment.warrantyMonths}
                      onChange={(e) => setNewEquipment({ ...newEquipment, warrantyMonths: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2">
              <div>
                <p className="font-bold text-sm">Set Availability</p>
                <p className="text-xs text-slate-400">Is this equipment ready to rent?</p>
              </div>
              <button
                type="button"
                onClick={() => setNewEquipment({ ...newEquipment, availability: !newEquipment.availability })}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  newEquipment.availability ? "bg-primary" : "bg-slate-300"
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  newEquipment.availability ? "translate-x-8" : "translate-x-1"
                }`} />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-12 border-2 font-bold" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-12 font-black shadow-lg shadow-primary/20">
                Add Equipment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerDashboard;
