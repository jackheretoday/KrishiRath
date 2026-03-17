import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Sprout, 
  TestTube, 
  Thermometer, 
  Droplets, 
  FlaskConical, 
  CloudRain, 
  ArrowLeft, 
  Loader2,
  MapPin,
  Wind,
  TrendingUp,
  Search,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/use-toast";

const CropPrediction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [locations, setLocations] = useState<{name: string, lat: number, lon: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    // Fetch predefined locations
    fetch(`${API_URL}/locations`)
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error("Error fetching locations:", err));
  }, []);

  const handleLocationSelect = async (locName: string) => {
    const loc = locations.find(l => l.name === locName);
    if (loc) {
      setFormData(prev => ({
        ...prev,
        latitude: loc.lat.toFixed(6),
        longitude: loc.lon.toFixed(6)
      }));
      setSearchTerm(loc.name);
      
      // Auto-fetch soil profile for this location
      try {
        setLoadingProfile(true);
        const profileRes = await fetch(`${API_URL}/location-profile?lat=${loc.lat}&lon=${loc.lon}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setFormData(prev => ({
            ...prev,
            N: profileData.N.toString(),
            P: profileData.P.toString(),
            K: profileData.K.toString(),
            ph: profileData.ph.toString(),
            rainfall: profileData.rainfall.toString()
          }));
          toast({
            title: "Location Selected",
            description: `Soil data for ${loc.name} has been auto-populated.`,
          });
        }
      } catch (err) {
        console.error("Error fetching profile on selection:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser",
      });
      return;
    }

    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));

          const apikey = import.meta.env.VITE_OPENWEATHER_API_KEY;
          let weatherRes: any = { status: 401 };
          
          if (apikey) {
            try {
              weatherRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}&units=metric`
              );
            } catch (err) {
              console.error("Weather fetch failed:", err);
            }
          }

          // Handle Soil Profile
          const profileRes = await fetch(
            `${API_URL}/location-profile?lat=${latitude}&lon=${longitude}`
          );
          
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setFormData(prev => ({
              ...prev,
              N: profileData.N.toString(),
              P: profileData.P.toString(),
              K: profileData.K.toString(),
              ph: profileData.ph.toString(),
              rainfall: profileData.rainfall.toString()
            }));
            
            toast({
              title: "Soil Data Found",
              description: `Loaded regional soil profile for ${profileData.district} (${profileData.region}).`,
            });
          }

          // Handle Weather
          if (weatherRes.status === 401) {
            setFormData(prev => ({
              ...prev,
              temperature: (25 + Math.random() * 10).toFixed(2),
              humidity: (60 + Math.random() * 20).toFixed(0),
            }));
            
            toast({
              title: "Demo Weather Active",
              description: "Using simulated regional weather for demo.",
            });
          } else if (weatherRes.ok) {
            const data = await weatherRes.json();
            setFormData(prev => ({
              ...prev,
              temperature: data.main.temp.toFixed(2),
              humidity: data.main.humidity.toString(),
            }));

            toast({
              title: "Weather Updated",
              description: `Fetched weather for ${data.name}.`,
            });
          }
        } catch (error) {
          console.error("Fetch error:", error);
          toast({
            variant: "destructive",
            title: "Fetch Error",
            description: "Could not fetch all regional data.",
          });
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Location Access Denied",
          description: "Please enable location services to use this feature.",
        });
        setWeatherLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPredicting(true);
    setPrediction(null);

    try {
      const response = await fetch(`${API_URL}/predict-crop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.prediction);
        toast({
          title: "Prediction Successful",
          description: `The recommended crop is ${data.prediction}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to get prediction",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Server connection failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-primary/5 border-b border-primary/10 pt-24 pb-12 mb-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-bold"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Crop Recommendation</h1>
              <p className="text-slate-600 font-medium mt-2 max-w-xl">
                Advanced machine learning analysis of soil and environmental factors to maximize your agricultural yield.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Model Accuracy</p>
                  <p className="text-xl font-black text-primary">99.55%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-8">
            <Card className="border-2 border-slate-200/60 shadow-xl overflow-hidden bg-white rounded-3xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-800">Field Data Analysis</CardTitle>
                    <CardDescription className="font-bold text-slate-500 mt-1">
                      Complete the soil profile below to get started.
                    </CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-primary/30 text-primary hover:bg-primary/5 gap-2 font-bold rounded-xl h-11"
                    onClick={fetchWeather}
                    disabled={weatherLoading}
                  >
                    {weatherLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <MapPin size={16} />
                    )}
                    Auto-Fill Data
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center mr-2">
                    Quick Profiles:
                  </span>
                  {[
                    { label: "Western Maharashtra", data: { N: "90", P: "42", K: "43", temperature: "20.5", humidity: "82", ph: "6.5", rainfall: "200" } },
                    { label: "Vidarbha (Cotton)", data: { N: "107", P: "18", K: "30", temperature: "25.2", humidity: "65", ph: "7.0", rainfall: "100" } },
                    { label: "Konkan (Rice)", data: { N: "20", P: "60", K: "20", temperature: "28.1", humidity: "85", ph: "5.5", rainfall: "250" } }
                  ].map((profile, i) => (
                    <button 
                      key={i}
                      type="button"
                      onClick={() => setFormData({...formData, ...profile.data})}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 transition-all flex items-center gap-2"
                    >
                      <Sprout size={12} className="text-primary" /> {profile.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Location Group */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 transition-all hover:border-primary/30">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={18} className="text-primary" />
                      <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Location Context</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <Label htmlFor="location-search" className="text-xs font-black text-slate-500 mb-1.5 block">MAHARASHTRA DISTRICT/CITY</Label>
                        <Input
                          id="location-search"
                          placeholder="Search city (e.g. Pune, Akola, Sangli)..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowLocationList(true);
                          }}
                          onFocus={() => setShowLocationList(true)}
                          className="bg-white h-12 border-2 rounded-xl font-bold focus:ring-primary shadow-sm"
                        />
                        {showLocationList && searchTerm && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-auto p-1 animate-in fade-in slide-in-from-top-2">
                            {locations
                              .filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((loc, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="w-full text-left px-4 py-3 hover:bg-primary/5 rounded-xl text-sm font-bold border-b border-slate-50 last:border-0 transition-colors"
                                  onClick={() => {
                                    handleLocationSelect(loc.name);
                                    setShowLocationList(false);
                                  }}
                                >
                                  {loc.name}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[10px] font-black text-slate-400">LATITUDE</Label>
                          <Input disabled readOnly value={formData.latitude} className="bg-slate-100 border-0 h-10 rounded-lg font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-black text-slate-400">LONGITUDE</Label>
                          <Input disabled readOnly value={formData.longitude} className="bg-slate-100 border-0 h-10 rounded-lg font-mono text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Soil Group */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="N" className="flex items-center gap-2 font-black text-slate-700">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><TestTube size={16} /></div>
                        Nitrogen (N)
                      </Label>
                      <Input id="N" name="N" type="number" placeholder="Ratio" value={formData.N} onChange={handleChange} required className="h-12 border-2 rounded-xl font-black text-center text-lg" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="P" className="flex items-center gap-2 font-black text-slate-700">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><TestTube size={16} /></div>
                        Phosphorus (P)
                      </Label>
                      <Input id="P" name="P" type="number" placeholder="Ratio" value={formData.P} onChange={handleChange} required className="h-12 border-2 rounded-xl font-black text-center text-lg" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="K" className="flex items-center gap-2 font-black text-slate-700">
                        <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><TestTube size={16} /></div>
                        Potassium (K)
                      </Label>
                      <Input id="K" name="K" type="number" placeholder="Ratio" value={formData.K} onChange={handleChange} required className="h-12 border-2 rounded-xl font-black text-center text-lg" />
                    </div>
                  </div>

                  {/* Environment Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer size={18} className="text-red-500" />
                        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Climate Factors</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400">TEMP (°C)</Label>
                          <Input id="temperature" name="temperature" type="number" step="0.01" value={formData.temperature} onChange={handleChange} required className="h-11 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400">HUMIDITY (%)</Label>
                          <Input id="humidity" name="humidity" type="number" step="0.01" value={formData.humidity} onChange={handleChange} required className="h-11 border-2 rounded-xl font-bold" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CloudRain size={18} className="text-blue-600" />
                        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Soil & Rainfall</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400">PH LEVEL</Label>
                          <Input id="ph" name="ph" type="number" step="0.01" value={formData.ph} onChange={handleChange} required className="h-11 border-2 rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400">RAINFALL (MM)</Label>
                          <Input id="rainfall" name="rainfall" type="number" step="0.01" value={formData.rainfall} onChange={handleChange} required className="h-11 border-2 rounded-xl font-bold" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Analyzing Samples...
                      </>
                    ) : (
                      <>
                        Get Recommendation <TrendingUp className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Result Side */}
          <div className="lg:col-span-4">
            <Card className={`h-full border-2 transition-all duration-700 rounded-3xl overflow-hidden ${prediction ? 'border-primary ring-8 ring-primary/5 shadow-2xl bg-white' : 'border-dashed border-slate-300 bg-slate-50/50'}`}>
              <CardHeader className={`text-center py-8 ${prediction ? 'bg-primary/5' : ''}`}>
                <CardTitle className="font-black uppercase tracking-widest text-sm text-slate-500">Analysis Result</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-8 h-[450px]">
                {prediction ? (
                  <div className="text-center animate-in zoom-in-95 duration-500">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                      <div className="relative w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <Sprout size={64} />
                      </div>
                    </div>
                    <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">Recommended Crop</p>
                    <h3 className="text-5xl font-black capitalize text-slate-900 mb-6 tracking-tight">
                      {prediction}
                    </h3>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                          <CheckCircle2 size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-600">Suited for your soil profile</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <CloudRain size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-600">Optimized for climatic data</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 opacity-40">
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                      <FlaskConical size={48} className="text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-400 uppercase tracking-widest">Waiting for Data</h4>
                      <p className="text-xs font-bold text-slate-400 mt-2">Submit field conditions to see result</p>
                    </div>
                  </div>
                )}
              </CardContent>
              {prediction && (
                <CardFooter className="p-8 pt-0">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2" onClick={() => navigate("/farmer-dashboard")}>
                    Return to Dashboard
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CropPrediction;
