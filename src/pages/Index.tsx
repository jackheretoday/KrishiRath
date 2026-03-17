import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tractor, ShieldCheck, IndianRupee, ArrowRight, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wide uppercase">
                {t('krishirath')} 2.0 • AI-Powered 🚜
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                {t('hero_title')}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20">
                    {t('farmer_login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2">
                    {t('owner_login')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted border">
                <img 
                  src="/src/assets/hero-farmland.jpg" 
                  alt="Indian Farmland" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <p className="text-white font-bold italic">"KrishiRath saved me 40% on my harvesting costs this season!"</p>
                    <p className="text-white/80 text-sm mt-1">— S. Deshmukh, Satara Farmer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 container mx-auto px-4 pb-20">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-4xl font-black">{t('why_choose')}</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">{t('infrastructure_text')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-all shadow-lg group">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Tractor className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-black">{t('smart_fleet')}</CardTitle>
                <CardDescription className="text-base font-bold text-slate-500 italic">{t('smart_fleet_desc')}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary/20 transition-all shadow-lg group">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-black">{t('verified_trust')}</CardTitle>
                <CardDescription className="text-base font-bold text-slate-500 italic">{t('verified_trust_desc')}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary/20 transition-all shadow-lg group">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-black">{t('dynamic_pricing')}</CardTitle>
                <CardDescription className="text-base font-bold text-slate-500 italic">{t('dynamic_pricing_desc')}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 KrishiRath. Empowering the future of farming.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
