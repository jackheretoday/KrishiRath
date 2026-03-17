import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tractor, MapPin, Shield, Star, Calendar, MessageSquare,
  ArrowLeft, Phone, Video, CheckCircle2, Clock, User, ExternalLink
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChatWidget } from "@/components/ChatWidget";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Parse metadata from description field
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
    return { text: description, imageUrl: "", videoUrl: "", warranty: "", warrantyMonths: "" };
  }
};

// Sample reviews
const SAMPLE_REVIEWS = [
  { id: 1, name: "Ramesh Kulkarni", rating: 5, text: "Outstanding equipment! Worked flawlessly for 3 days straight. The owner was very cooperative and delivered on time.", date: "3 days ago", avatar: "RK" },
  { id: 2, name: "Sunil Patil", rating: 4, text: "Good condition and fair pricing. Minor delay in delivery but overall great experience.", date: "1 week ago", avatar: "SP" },
  { id: 3, name: "Anil More", rating: 5, text: "Best tractor in the area. Very well maintained. Highly recommend this owner!", date: "2 weeks ago", avatar: "AM" },
  { id: 4, name: "Vijay Jadhav", rating: 4, text: "Solid performance. Fuel efficiency was excellent. Will book again for next season.", date: "3 weeks ago", avatar: "VJ" },
  { id: 5, name: "Ganesh Shinde", rating: 5, text: "Owner is very professional. Equipment was clean and ready to use. Great communication.", date: "1 month ago", avatar: "GS" },
];

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [equipment, setEquipment] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "reviews" | "warranty">("overview");

  const staticEquipment = [
    { id: "f001b0b0-0001-4000-8000-000000000001", name: "Escorts FT 45", type: "Tractor", image: "/src/assets/tractor.png", location: "Sangli", price_per_hour: 1000, rating: 4.5, demand: "High", availability: true, description: JSON.stringify({ text: "A reliable 45HP tractor perfect for medium-sized farms. Features include power steering, adjustable seat, and dual-clutch system.", warranty: "Comprehensive warranty covering engine, transmission, and hydraulics. Includes free maintenance for first 3 months.", warrantyMonths: "12", imageUrl: "", videoUrl: "" }) },
    { id: "f001b0b0-0001-4000-8000-000000000002", name: "John Deere 5310", type: "Tractor", image: "/src/assets/tractor.png", location: "Thane", price_per_hour: 1300, rating: 4.8, demand: "Medium", availability: true, description: JSON.stringify({ text: "High-performance tractor with advanced features for precision farming. GPS-guided auto-steering available.", warranty: "Full manufacturer warranty. Parts replacement guaranteed within 48 hours.", warrantyMonths: "24", imageUrl: "", videoUrl: "" }) },
    { id: "f001b0b0-0001-4000-8000-000000000003", name: "Combine Harvester X1", type: "Harvester", image: "/src/assets/harvester.png", location: "Kolhapur", price_per_hour: 3500, rating: 4.7, demand: "Low", availability: true, description: JSON.stringify({ text: "Efficient harvester for quick and clean crop harvesting. Handles wheat, rice, and soybean.", warranty: "6-month blade warranty. Engine warranty for 12 months.", warrantyMonths: "12", imageUrl: "", videoUrl: "" }) },
    { id: "f001b0b0-0001-4000-8000-000000000004", name: "Rotavator X-Series", type: "Rotavator", image: "/src/assets/rotavator.png", location: "Sangli", price_per_hour: 600, rating: 4.2, demand: "High", availability: true, description: JSON.stringify({ text: "Robust rotavator for excellent soil preparation. 48 blades for fine tilling.", warranty: "Blade replacement warranty for 6 months. Body frame warranty for 1 year.", warrantyMonths: "6", imageUrl: "", videoUrl: "" }) },
    { id: "f001b0b0-0001-4000-8000-000000000005", name: "Mahindra 575 DI", type: "Tractor", image: "/src/assets/tractor.png", location: "Pune", price_per_hour: 1100, rating: 4.6, demand: "Medium", availability: true, description: JSON.stringify({ text: "Classic fuel-efficient tractor for multi-purpose farming. Low maintenance cost.", warranty: "Standard warranty on all mechanical parts for 18 months.", warrantyMonths: "18", imageUrl: "", videoUrl: "" }) },
    { id: "f001b0b0-0001-4000-8000-000000000006", name: "Power Tiller PT-200", type: "Power Tiller", image: "/src/assets/tractor.png", location: "Nashik", price_per_hour: 450, rating: 4.3, demand: "Low", availability: true, description: JSON.stringify({ text: "Versatile power tiller for small tasks and light tilling.", warranty: "1 year warranty on motor and gearbox.", warrantyMonths: "12", imageUrl: "", videoUrl: "" }) },
  ];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // First try DB
        const { data } = await supabase
          .from("equipment")
          .select("*")
          .eq("id", id)
          .single();

        if (data) {
          setEquipment(data);
          // Fetch owner from profiles
          if (data.owner_id) {
            const { data: ownerData } = await supabase.from("profiles").select("*").eq("id", data.owner_id).single();
            if (ownerData) setOwner(ownerData);
            else {
              const { data: userData } = await supabase.from("users").select("*").eq("id", data.owner_id).single();
              if (userData) setOwner(userData);
            }
          }
        } else {
          const staticItem = staticEquipment.find(item => item.id === id);
          if (staticItem) {
            setEquipment(staticItem);
            setOwner({ name: "Verified Owner", phone: "+919876543210", email: "owner@krishirath.in", created_at: "2024-01-01" });
          }
        }
      } catch {
        const staticItem = staticEquipment.find(item => item.id === id);
        if (staticItem) {
          setEquipment(staticItem);
          setOwner({ name: "Verified Owner", phone: "+919876543210", email: "owner@krishirath.in", created_at: "2024-01-01" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      toast.error("Please login to book.");
      navigate("/login");
      return;
    }
    // Navigate to farmer dashboard for proper booking flow  
    navigate("/farmer-dashboard");
    toast.info("Use the 'Book Now' button on the equipment card for the full booking flow.");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
  if (!equipment) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Tractor className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <p className="font-bold text-slate-400 text-xl">Equipment not found.</p>
        <Link to="/farmer-dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
      </div>
    </div>
  );

  const meta = parseEquipmentMeta(equipment.description);
  const displayImage = meta.imageUrl || equipment.image || "/src/assets/tractor.png";
  const ownerPhone = owner?.phone || "+919876543210";

  const displaySpecs = [
    { label: "Power", value: "45 HP" },
    { label: "Fuel Type", value: "Diesel" },
    { label: "Drive Type", value: "2WD" },
    { label: "Lifting Capacity", value: "1500 kg" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link to="/farmer-dashboard">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 font-bold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            {t('equipment_search')}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Image */}
            <div className="aspect-video bg-white rounded-2xl overflow-hidden border-2 shadow-sm flex items-center justify-center relative">
              <img
                src={displayImage}
                alt={equipment.name}
                className="w-full h-full object-contain p-8 transition-transform hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = "/src/assets/tractor.png"; }}
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border border-primary/20 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${equipment.availability ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {equipment.availability ? 'Available Now' : 'Not Available'}
              </div>
              {meta.videoUrl && (
                <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Video className="h-3 w-3" /> Video Available
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div>
              <h1 className="text-4xl font-extrabold">{equipment.name}</h1>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {equipment.rating || 4.5} ({SAMPLE_REVIEWS.length} reviews)
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {equipment.location}
                </span>
                {meta.warrantyMonths && (
                  <span className="flex items-center gap-1 text-sm text-emerald-600 font-bold">
                    <Shield className="h-4 w-4" />
                    {meta.warrantyMonths} month warranty
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-xs">
                  {equipment.type || "Equipment"}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-xs flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verified Owner
                </span>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex gap-2">
              {(["overview", "reviews", "warranty"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveDetailTab(tab)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 capitalize ${
                    activeDetailTab === tab
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary/30"
                  }`}
                >
                  {tab === "reviews" ? `Reviews (${SAMPLE_REVIEWS.length})` : tab}
                </button>
              ))}
            </div>

            {/* Tab Content: Overview */}
            {activeDetailTab === "overview" && (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold">About this equipment</h3>
                  <p className="text-muted-foreground">{meta.text || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {displaySpecs.map((spec, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border-2">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{spec.label}</p>
                      <p className="text-lg font-bold">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {/* Video Section */}
                {meta.videoUrl && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Video className="h-5 w-5 text-primary" /> Equipment Video</h3>
                    <div className="aspect-video rounded-2xl overflow-hidden border-2 bg-black">
                      {meta.videoUrl.includes("youtube.com") || meta.videoUrl.includes("youtu.be") ? (
                        <iframe
                          src={meta.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                          className="w-full h-full"
                          allowFullScreen
                          title="Equipment video"
                        />
                      ) : (
                        <video
                          src={meta.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                          poster={displayImage}
                        >
                          Your browser does not support video playback.
                        </video>
                      )}
                    </div>
                    <a href={meta.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Open video in new tab
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Reviews */}
            {activeDetailTab === "reviews" && (
              <div className="space-y-4">
                {/* Rating Summary */}
                <Card className="border-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-5xl font-black text-yellow-500">{equipment.rating || 4.5}</div>
                        <div className="text-yellow-400 text-sm mt-1">★★★★★</div>
                        <p className="text-xs text-slate-400 mt-1">{SAMPLE_REVIEWS.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = SAMPLE_REVIEWS.filter(r => r.rating === star).length;
                          const pct = (count / SAMPLE_REVIEWS.length) * 100;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 w-4">{star}★</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-slate-400 w-6">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                {SAMPLE_REVIEWS.map(review => (
                  <Card key={review.id} className="border-2 bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                          {review.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold">{review.name}</p>
                            <span className="text-xs text-slate-400">{review.date}</span>
                          </div>
                          <div className="text-yellow-500 text-xs mt-0.5 mb-2">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                          <p className="text-sm text-slate-600">{review.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Tab Content: Warranty */}
            {activeDetailTab === "warranty" && (
              <div className="space-y-6">
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Shield className="h-7 w-7 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-emerald-800 mb-1">Warranty Coverage</h3>
                        {meta.warrantyMonths ? (
                          <>
                            <p className="text-sm text-emerald-600 font-bold mb-3">{meta.warrantyMonths} months warranty period</p>
                            <p className="text-sm text-emerald-700">{meta.warranty}</p>
                          </>
                        ) : (
                          <p className="text-sm text-emerald-600">Contact the owner for warranty details.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warranty Includes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Engine & Transmission", included: true, desc: "Full coverage for engine and gearbox issues" },
                    { title: "Hydraulic System", included: true, desc: "Pump, cylinder, and valve warranty" },
                    { title: "Electrical Components", included: true, desc: "Starter motor, alternator, and wiring" },
                    { title: "Wear & Tear Parts", included: false, desc: "Tyres, filters, and belts not covered" },
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-xl border-2 ${item.included ? "bg-white border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {item.included ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-slate-400" />
                        )}
                        <p className={`font-bold text-sm ${item.included ? "text-emerald-700" : "text-slate-500"}`}>{item.title}</p>
                      </div>
                      <p className="text-xs text-slate-500 ml-6">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-800 font-bold">⚠️ Note: Warranty is valid only when equipment is used as per guidelines. Misuse or unauthorized modifications void the warranty. Contact the owner for full terms.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="shadow-xl border-2 border-primary/10 sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">₹{equipment.price_per_hour || 1000}<span className="text-sm font-normal text-muted-foreground"> / hour</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Select Dates</label>
                  <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                    <Calendar className="h-4 w-4" /> Choose dates
                  </Button>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">₹{equipment.price_per_hour || 1000} x 8 hrs</span>
                    <span>₹{(equipment.price_per_hour || 1000) * 8}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>₹50</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{(equipment.price_per_hour || 1000) * 8 + 50}</span>
                  </div>
                </div>

                <Button className="w-full font-extrabold h-12 shadow-lg shadow-primary/20" size="lg" onClick={handleBook}>
                  {t('book_now')}
                </Button>

                {/* Contact Owner - Chat & Call */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Owner</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 font-bold border-2 h-11"
                      onClick={() => setIsChatOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" /> Chat
                    </Button>
                    <a href={`tel:${ownerPhone}`} className="w-full">
                      <Button variant="outline" className="w-full gap-2 font-bold border-2 h-11 text-green-700 border-green-200 hover:bg-green-50">
                        <Phone className="h-4 w-4" /> Call
                      </Button>
                    </a>
                  </div>
                  <a href={`https://wa.me/${ownerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full gap-2 font-bold border-2 h-11 text-green-600 border-green-200 hover:bg-green-50">
                      <MessageSquare className="h-4 w-4" /> WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <div className="p-6 bg-white rounded-xl border-2 space-y-4">
              <h3 className="font-bold">{t('contact_owner')}</h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {owner?.name ? owner.name.split(' ').map((n: string) => n[0]).join('') : "U"}
                </div>
                <div>
                  <p className="font-bold">{owner?.name || "Verified Owner"}</p>
                  <p className="text-xs text-muted-foreground">Member Since {owner?.created_at ? new Date(owner.created_at).getFullYear() : "2024"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> Identity Verified
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <Star className="h-3 w-3 text-yellow-500" /> 4.8 avg rating
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <Clock className="h-3 w-3 text-blue-500" /> Usually responds within 1 hour
                </div>
              </div>
            </div>

            {/* Linked to Contact Support */}
            <Link to="/contact-support">
              <Button variant="outline" className="w-full gap-2 font-bold border-2 h-11">
                <User className="h-4 w-4" /> Need Help? Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <ChatWidget
        ownerName={owner?.name || "Owner"}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default EquipmentDetails;
