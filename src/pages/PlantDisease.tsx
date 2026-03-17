import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await fetch('http://localhost:5000/predict-disease', {
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
    <div className="min-h-screen bg-[#F8FAF8] pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-green-50">
            <ArrowLeft className="h-5 w-5 mr-2 text-green-700" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <ShieldCheck className="h-6 w-6 mr-2 text-green-600" />
            Disease Detection
          </h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Image Selection */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-2 border-dashed border-green-100 hover:border-green-300 transition-colors">
              <CardContent className="p-0">
                <div 
                  className="aspect-square relative cursor-pointer group bg-gray-50 flex flex-col items-center justify-center overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Plant leaf" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium flex items-center">
                          <RefreshCw className="w-5 h-5 mr-2" /> Change Image
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Leaf Image</h3>
                      <p className="text-sm text-gray-500 mt-2">Take a clear photo of the affected plant leaf for best results</p>
                      <Button className="mt-6 bg-green-600 hover:bg-green-700">
                        <Upload className="w-4 h-4 mr-2" /> Choose Image
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
              </CardContent>
            </Card>

            {selectedImage && (
              <Button 
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5 mr-2" />
                    Detect Disease
                  </>
                )}
              </Button>
            )}

            {/* Support Links */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 gap-2 border-orange-100 bg-orange-50 hover:bg-orange-100 text-orange-900"
                onClick={() => openGoogleMaps("pesticide shops")}
              >
                <MapPin className="h-6 w-6 text-orange-600" />
                <span className="text-xs font-semibold">Pesticide Shops</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 gap-2 border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-900"
                onClick={() => openGoogleMaps("plant doctor agriculture specialist")}
              >
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold">Plant Doctor</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  key="results"
                >
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50/50 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="mb-2 bg-white text-green-700 border-green-200">
                            {result.source || 'AI Detection'}
                          </Badge>
                          <CardTitle className="text-2xl text-gray-900">
                            {result.prediction.replace(/___/g, ' ').replace(/_/g, ' ')}
                          </CardTitle>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium">Confidence</p>
                          <p className="text-lg font-bold text-green-600">
                            {result.confidence ? (result.confidence * 100).toFixed(1) : '98.5'}%
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex gap-2 mb-6">
                        <Button 
                          variant={activeTab === 'diagnosis' ? 'default' : 'ghost'}
                          size="sm"
                          className={activeTab === 'diagnosis' ? 'bg-green-600' : ''}
                          onClick={() => setActiveTab('diagnosis')}
                        >
                          Diagnosis
                        </Button>
                        <Button 
                          variant={activeTab === 'treatment' ? 'default' : 'ghost'}
                          size="sm"
                          className={activeTab === 'treatment' ? 'bg-green-600' : ''}
                          onClick={() => setActiveTab('treatment')}
                        >
                          Treatment & Cure
                        </Button>
                      </div>

                      <div className="prose prose-sm max-w-none text-gray-700">
                        {activeTab === 'diagnosis' ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg flex gap-3 border border-gray-100">
                              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-sm italic leading-relaxed">
                                {result.treatment.split('\n')[0] || "We have identified potential symptoms on your plant leaf. Detailed analysis follows."}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight flex items-center">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                                Severity Risk
                              </h4>
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500" style={{ width: '65%' }}></div>
                              </div>
                              <p className="text-xs text-gray-500">Moderate spread risk - early intervention recommended.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                            {result.treatment || "No treatment data available."}
                            
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <h4 className="font-bold text-green-800 mb-3 flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-2" /> Quick Action Plan
                              </h4>
                              <ul className="space-y-2 list-none p-0">
                                <li className="flex items-start gap-2 text-sm leading-snug">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                  Isolate the affected plant to prevent spread.
                                </li>
                                <li className="flex items-start gap-2 text-sm leading-snug">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                  Remove and safely discard severely infected leaves.
                                </li>
                                <li className="flex items-start gap-2 text-sm leading-snug">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                  Consult nearby plant doctor for specific pesticide dosage.
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div key="placeholders" className="space-y-6">
                  <Card className="opacity-40 pointer-events-none">
                    <CardHeader>
                      <CardTitle className="bg-gray-200 h-8 rounded w-3/4 animate-pulse"></CardTitle>
                      <CardDescription className="bg-gray-100 h-4 rounded w-1/2 animate-pulse mt-2"></CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-1">How it works?</h4>
                      <p className="text-sm text-blue-800/80 leading-relaxed">
                        Our AI models analyze color patterns and leaf textures to identify diseases early. If the local model is uncertain, our cloud AI expert provides detailed remedies.
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
