import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldCheck, Lock, QrCode, Smartphone, Info } from "lucide-react";

type UpiMethod = "phonepe" | "googlepay" | "paytm";

const UPI_OPTIONS: { id: UpiMethod; label: string; color: string; bg: string; logo: string }[] = [
  {
    id: "phonepe",
    label: "PhonePe",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-300 hover:border-purple-500",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.png/200px-PhonePe_Logo.png",
  },
  {
    id: "googlepay",
    label: "Google Pay",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-300 hover:border-blue-500",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/200px-Google_Pay_Logo.svg.png",
  },
  {
    id: "paytm",
    label: "Paytm",
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-300 hover:border-sky-500",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/200px-Paytm_Logo_%28standalone%29.svg.png",
  },
];

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId, amount, equipmentName } = (location.state as any) || {};
  
  const [selected, setSelected] = useState<UpiMethod | null>(null);
  const [stage, setStage] = useState<"select" | "processing" | "success">("select");

  const handlePay = async () => {
    if (!selected) { toast.error("Please select a payment method."); return; }
    setStage("processing");

    // Simulate a 2.5-second payment processing delay
    await new Promise((r) => setTimeout(r, 2500));

    try {
      // 1. Insert into payments table
      if (bookingId) {
        await supabase.from("payments").insert([{
          booking_id: bookingId,
          amount: amount || 0,
          method: selected,
          status: "success",
        }]);

        // 2. Mark booking as confirmed
        await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", bookingId);
      }

      setStage("success");
    } catch (err) {
      console.error("Payment error:", err);
      // Even if DB fails, show success for demo purposes
      setStage("success");
    }
  };

  const selectedOption = UPI_OPTIONS.find(u => u.id === selected);

  if (stage === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border-2 border-green-200">
          {/* Success Animation */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative h-24 w-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-300">
              <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-green-700 mb-1">Payment Successful!</h1>
          <p className="text-slate-500 font-medium mb-6">Your booking has been confirmed.</p>

          {/* Receipt */}
          <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 border-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Equipment</span>
              <span className="font-black">{equipmentName || "Equipment"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Paid via</span>
              <span className="font-black capitalize">{selectedOption?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Status</span>
              <span className="font-black text-green-600">✅ Booking Confirmed</span>
            </div>
            <div className="border-t-2 border-dashed pt-3 flex justify-between">
              <span className="font-black text-slate-500">Amount Paid</span>
              <span className="text-2xl font-black text-primary">₹{(amount || 0).toLocaleString()}</span>
            </div>
          </div>

          <Button
            className="w-full h-12 font-black shadow-lg"
            onClick={() => navigate("/farmer-dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-lg">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Complete Payment</h1>
        <p className="text-slate-400 font-bold mb-6">Select a UPI method to pay</p>

        {/* Amount Card */}
        <Card className="border-2 bg-white shadow-sm mb-6">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Total Amount</p>
              <p className="text-4xl font-black text-primary">₹{(amount || 0).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-slate-400 mb-1">For</p>
              <p className="font-black text-slate-700">{equipmentName || "Equipment Booking"}</p>
              <div className="flex items-center gap-1 mt-1 justify-end">
                <Lock className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 font-bold">Secured Payment</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UPI Method Selector */}
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Choose UPI Method</p>
        <div className="space-y-3 mb-6">
          {UPI_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                selected === opt.id
                  ? `${opt.bg} border-opacity-100 shadow-md scale-[1.01]`
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="h-12 w-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-sm border">
                <img src={opt.logo} alt={opt.label} className="h-full w-full object-contain" />
              </div>
              <div className="flex-1">
                <p className={`font-black text-lg ${selected === opt.id ? opt.color : "text-slate-700"}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-400 font-bold">UPI • Instant Transfer</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === opt.id ? "border-primary bg-primary" : "border-slate-300"
              }`}>
                {selected === opt.id && <div className="h-2 w-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        {/* UPI ID Entry & QR Code */}
        {selected && (
          <div className="space-y-4 mb-6">
            <div className="bg-white border-2 rounded-3xl p-6 text-center shadow-lg border-primary/10 animate-in zoom-in-95 duration-300">
               <p className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Scan QR to Pay via {selectedOption?.label}</p>
               
               <div className="relative mx-auto w-48 h-48 bg-white p-3 border-4 border-slate-100 rounded-3xl shadow-inner mb-4 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=agrorath@upi&pn=AgroRath&am=${amount}&cu=INR`} 
                    alt="Payment QR Code"
                    className="w-full h-full"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-white">
                     <QrCode className="h-4 w-4" />
                  </div>
               </div>
               
               <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-2xl p-3 border-2 border-dashed border-slate-200">
                  <Smartphone className="h-4 w-4 text-slate-400" />
                  <span className="font-black text-slate-600 text-sm">agrorath@{selected}</span>
                  <span className="text-[9px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded-full">VERIFIED MERCHANT</span>
               </div>
            </div>
            
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex gap-3">
               <Info className="h-5 w-5 text-amber-600 shrink-0" />
               <p className="text-[11px] text-amber-800 font-bold leading-normal">
                 Scan the QR code above with your <strong>{selectedOption?.label}</strong> app. Once you complete the payment on your phone, click the button below to confirm.
               </p>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <Button
          className="w-full h-14 font-black text-lg shadow-xl shadow-primary/20 gap-2"
          disabled={!selected || stage === "processing"}
          onClick={handlePay}
        >
          {stage === "processing" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Processing Payment...
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Confirm Payment & Place Order
            </>
          )}
        </Button>

        {stage === "processing" && (
          <div className="mt-6 text-center animate-in fade-in">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-3 w-3 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400">Verifying with {selectedOption?.label}...</p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 mt-6 font-bold">
          🔒 Payments are simulated for demo purposes
        </p>
      </main>
    </div>
  );
};

export default Payment;
