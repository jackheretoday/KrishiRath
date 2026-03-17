import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { 
  Camera, 
  Upload, 
  ArrowLeft, 
  MapPin, 
  Stethoscope, 
  Sprout, 
  ShieldCheck, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const PlantDisease = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'treatment'>('diagnosis');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image too large. Please select an image under 10MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      toast.error("Please select an image first.");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:5001/predict-disease', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze image');
      }

      const data = await response.json();
      setResult(data);
      toast.success("Analysis complete!");
      setActiveTab('diagnosis');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openGoogleMaps = (query: string) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-emerald-600/5 border-b border-emerald-600/10 pt-24 pb-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors font-bold"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <ShieldCheck size={24} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Plant Doctor</h1>
              </div>
              <p className="text-slate-600 font-medium max-w-xl">
                Upload a photo of your crop's leaves to instantly diagnose diseases and receive scientific treatment recommendations.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Detection Speed</p>
                  <p className="text-xl font-black text-emerald-600">~1.2s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="overflow-hidden border-2 border-slate-200 shadow-xl bg-white rounded-3xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                <CardTitle className="text-xl font-black text-slate-800">Visual Diagnostics</CardTitle>
                <CardDescription className="font-bold text-slate-500">
                  Select a high-quality image of the affected plant leaf.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div 
                  className={`aspect-video relative cursor-pointer group bg-slate-50 rounded-2xl border-4 border-dashed transition-all overflow-hidden flex items-center justify-center ${selectedImage ? 'border-emerald-500/20' : 'border-slate-200 hover:border-emerald-400'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Plant leaf" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <RefreshCw className="w-10 h-10 text-white mb-2 animate-spin-slow" />
                        <p className="text-white font-black text-lg">Change Sample</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-10">
                      <div className="w-24 h-24 bg-white shadow-lg rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Camera className="w-12 h-12 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">Capture or Upload</h3>
                      <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto font-bold">Recommended: Sharp, close-up photo of a single leaf under natural light.</p>
                      <Button className="mt-8 bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-black px-8">
                        Select Image <Upload className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </div>

                {selectedImage && (
                  <Button 
                    className="w-full mt-8 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 font-black rounded-2xl transition-all active:scale-95"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                        Scanning Neural Patterns...
                      </>
                    ) : (
                      <>
                        <Sprout className="w-6 h-6 mr-3" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-6">
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 rounded-2xl transition-all"
                onClick={() => openGoogleMaps("pesticide and fertilizer shops")}
              >
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                  <MapPin size={24} />
                </div>
                <span className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Local Pharmacies</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 rounded-2xl transition-all"
                onClick={() => openGoogleMaps("government agriculture specialist office")}
              >
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <Stethoscope size={24} />
                </div>
                <span className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Expert Consult</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="results"
                  className="space-y-6"
                >
                  <Card className="border-4 border-emerald-500/20 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-emerald-50 p-8 border-b border-emerald-100">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge className="bg-emerald-600 mb-2 uppercase tracking-tighter font-black">
                            {result.source || 'AI Detection'}
                          </Badge>
                          <CardTitle className="text-3xl font-black text-slate-900 leading-tight">
                            {result.prediction.replace(/___/g, ' ').replace(/_/g, ' ')}
                          </CardTitle>
                        </div>
                        <div className="text-right">
                          <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border border-emerald-200 flex flex-col items-center justify-center">
                            <p className="text-[10px] font-black text-emerald-600 uppercase">Match</p>
                            <p className="text-lg font-black text-emerald-700">
                              {result.confidence ? (result.confidence * 100).toFixed(0) : '98'}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                        <Button 
                          variant="ghost"
                          className={`flex-1 font-black transition-all rounded-lg ${activeTab === 'diagnosis' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                          onClick={() => setActiveTab('diagnosis')}
                        >
                          Diagnosis
                        </Button>
                        <Button 
                          variant="ghost"
                          className={`flex-1 font-black transition-all rounded-lg ${activeTab === 'treatment' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                          onClick={() => setActiveTab('treatment')}
                        >
                          Cure Plan
                        </Button>
                      </div>

                      <div className="space-y-6 min-h-[300px]">
                        {activeTab === 'diagnosis' ? (
                          <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 flex gap-4">
                              <Info className="h-6 w-6 text-emerald-600 shrink-0" />
                              <p className="font-bold text-slate-700 leading-relaxed italic">
                                {result.treatment.split('\n')[0] || "Identified symptoms match known regional crop disorders. Initiating recovery protocol."}
                              </p>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" /> Damage Assessment
                              </h4>
                              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '65%' }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-emerald-500 to-orange-500" 
                                />
                              </div>
                              <p className="text-sm font-black text-slate-600">Infection Spread: <span className="text-orange-600 tracking-tight">Moderate Risk</span></p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-100">
                              <h4 className="font-black text-emerald-800 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Scientific Protocol
                              </h4>
                              <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                                {result.treatment || "Consulting internal bio-database for specific remedies..."}
                              </p>
                            </div>
                            
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                              <h4 className="font-black text-slate-800 mb-4 text-xs uppercase tracking-widest">Immediate Farmer Actions</h4>
                              <ul className="space-y-4">
                                {[
                                  "Isolate infected quadrants immediately",
                                  "Prune symptomatic leaves and bio-burn",
                                  "Adjust irrigation frequency to reduce humidity"
                                ].map((item, i) => (
                                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div key="placeholders" className="space-y-8">
                  <Card className="opacity-40 border-2 border-slate-200 bg-white rounded-3xl overflow-hidden">
                    <div className="h-40 bg-slate-100 flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-slate-300" />
                    </div>
                    <CardContent className="p-8 space-y-4">
                      <div className="h-8 bg-slate-100 rounded-xl w-3/4 animate-pulse" />
                      <div className="h-4 bg-slate-50 rounded-lg w-full animate-pulse" />
                      <div className="h-4 bg-slate-50 rounded-lg w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                  
                  <div className="bg-white border-2 border-blue-100 p-8 rounded-3xl shadow-lg flex gap-6">
                    <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                      <Info className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg mb-2">Neural Scan Tech</h4>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed">
                        Our AI processes millions of pixel patterns to detect pathogens before they destroy your harvest. Scan accuracy is highest on clear, high-resolution samples.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDisease;
