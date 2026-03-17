import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sprout, TestTube, Thermometer, Droplets, FlaskConical, CloudRain, ArrowLeft, Loader2, MapPin, Wind } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// OpenWeather API key is loaded from environment variables

const CropPrediction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [locations, setLocations] = useState<{name: string, lat: number, lon: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);

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
    fetch('http://localhost:5001/locations')
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
        const profileRes = await fetch(`http://localhost:5001/location-profile?lat=${loc.lat}&lon=${loc.lon}`);
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
          
          // Update lat/long in form
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));

          const apikey = import.meta.env.VITE_OPENWEATHER_API_KEY;
          
          // Initialize with null or dummy value
          let weatherRes: any = { status: 401 };
          
          if (apikey) {
            try {
              weatherRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}&units=metric`
              );
            } catch (err) {
              console.error("Weather fetch failed:", err);
            }
          } else {
            console.warn("OpenWeatherMap API key missing in environment. Using demo weather data.");
          }
          
          // Handle Soil Profile
          const profileRes = await fetch(
            `http://localhost:5001/location-profile?lat=${latitude}&lon=${longitude}`
          );
          
          // Handle Soil Profile
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
            console.warn("OpenWeatherMap API key unauthorized. Using demo weather data.");
            setFormData(prev => ({
              ...prev,
              temperature: (25 + Math.random() * 10).toFixed(2),
              humidity: (60 + Math.random() * 20).toFixed(0),
            }));
            
            toast({
              title: "Demo Weather Active",
              description: "The API key provided is not yet active. Using simulated regional weather.",
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
            description: "Could not fetch all regional data. Some fields may be empty.",
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
    setPrediction(null);

    try {
      const response = await fetch("http://localhost:5001/predict-crop", {
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
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Sprout size={24} />
                  </div>
                  <CardTitle>Crop Recommendation</CardTitle>
                </div>
                <CardDescription className="flex justify-between items-end">
                  <span>Enter your soil and environmental data to get the best crop recommendation for your farm.</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-9 border-primary/30 text-primary hover:bg-primary/5 gap-2 font-bold"
                    onClick={fetchWeather}
                    disabled={weatherLoading}
                  >
                    {weatherLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <MapPin size={14} />
                    )}
                    Use Current Weather
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-2 relative">
                      <Label htmlFor="location-search" className="flex items-center gap-2 text-slate-500">
                        <Wind size={14} /> Search Maharashtra Location
                      </Label>
                      <div className="relative">
                        <Input
                          id="location-search"
                          placeholder="Type city name (e.g. Pune, Akola)..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowLocationList(true);
                          }}
                          onFocus={() => setShowLocationList(true)}
                          className="bg-white"
                        />
                        {showLocationList && searchTerm && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {locations
                              .filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((loc, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm border-b last:border-0 border-slate-100"
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude" className="flex items-center gap-2 text-slate-500 text-xs">
                          <MapPin size={12} /> Latitude
                        </Label>
                        <Input
                          id="latitude"
                          name="latitude"
                          type="number"
                          step="0.000001"
                          placeholder="e.g. 19.076"
                          value={formData.latitude}
                          onChange={handleChange}
                          className="bg-white h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude" className="flex items-center gap-2 text-slate-500 text-xs">
                          <MapPin size={12} /> Longitude
                        </Label>
                        <Input
                          id="longitude"
                          name="longitude"
                          type="number"
                          step="0.000001"
                          placeholder="e.g. 72.877"
                          value={formData.longitude}
                          onChange={handleChange}
                          className="bg-white h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="N" className="flex items-center gap-2">
                        <TestTube size={16} className="text-blue-500" />
                        Nitrogen (N)
                      </Label>
                      <Input
                        id="N"
                        name="N"
                        type="number"
                        placeholder="0-140"
                        value={formData.N}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="P" className="flex items-center gap-2">
                        <TestTube size={16} className="text-purple-500" />
                        Phosphorus (P)
                      </Label>
                      <Input
                        id="P"
                        name="P"
                        type="number"
                        placeholder="0-145"
                        value={formData.P}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="K" className="flex items-center gap-2">
                        <TestTube size={16} className="text-orange-500" />
                        Potassium (K)
                      </Label>
                      <Input
                        id="K"
                        name="K"
                        type="number"
                        placeholder="0-205"
                        value={formData.K}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature" className="flex items-center gap-2">
                        <Thermometer size={16} className="text-red-500" />
                        Temperature (°C)
                      </Label>
                      <Input
                        id="temperature"
                        name="temperature"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 25.5"
                        value={formData.temperature}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="humidity" className="flex items-center gap-2">
                        <Droplets size={16} className="text-blue-400" />
                        Humidity (%)
                      </Label>
                      <Input
                        id="humidity"
                        name="humidity"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 80"
                        value={formData.humidity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ph" className="flex items-center gap-2">
                        <FlaskConical size={16} className="text-green-500" />
                        Soil pH
                      </Label>
                      <Input
                        id="ph"
                        name="ph"
                        type="number"
                        step="0.01"
                        placeholder="3.5 - 9.9"
                        value={formData.ph}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rainfall" className="flex items-center gap-2">
                        <CloudRain size={16} className="text-blue-600" />
                        Rainfall (mm)
                      </Label>
                      <Input
                        id="rainfall"
                        name="rainfall"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 200"
                        value={formData.rainfall}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      "Get Recommendation"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className={`h-full border-2 transition-all duration-500 ${prediction ? 'border-primary ring-4 ring-primary/10 scale-105' : 'border-dashed'}`}>
              <CardHeader className="text-center">
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-12 h-64">
                {prediction ? (
                  <div className="text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      <Sprout size={40} />
                    </div>
                    <h3 className="text-3xl font-bold capitalize text-primary mb-2">
                      {prediction}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      "Perfectly suited for your soil conditions"
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <FlaskConical size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Enter data to see recommendation</p>
                  </div>
                )}
              </CardContent>
              {prediction && (
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/farmer-dashboard")}>
                    Go to Dashboard
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
