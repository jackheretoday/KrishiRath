import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MapPin, Calendar, Receipt, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const BookingConfirmation = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">{t('booking_confirmed')}</h1>
          <div className="flex justify-center">
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border border-primary/20">
              {t('pending_approval')}
            </span>
          </div>
        </div>

        <Card className="w-full max-w-2xl border-2 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b-2 py-6">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              {t('booking_summary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
               <div className="h-24 w-24 bg-white rounded-xl border-2 flex items-center justify-center shrink-0">
                  <img src="/src/assets/tractor.png" className="h-16 w-16 object-contain" alt="Tractor" />
               </div>
               <div>
                  <h3 className="text-2xl font-black">Mahindra Arjun 555</h3>
                  <p className="text-muted-foreground font-bold">Owner: Vikas Patil</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {t('booking_date')}
                </p>
                <p className="text-lg font-black italic">March 25, 2024</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {t('delivery_location')}
                </p>
                <p className="text-lg font-black italic">Satara District, Maharashtra</p>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-dashed flex justify-between items-center">
              <p className="text-xl font-black text-slate-500">{t('total_price')}</p>
              <p className="text-4xl font-black text-primary">₹1,200</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-12 font-black border-2 gap-2">
                <Receipt className="h-4 w-4" /> {t('download_receipt')}
              </Button>
              <Link to="/farmer-dashboard" className="flex-1">
                <Button className="w-full h-12 font-black shadow-lg shadow-primary/20">
                  {t('return_to_dashboard')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookingConfirmation;
