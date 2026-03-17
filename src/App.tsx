import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import EquipmentDetails from "./pages/EquipmentDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import Payment from "./pages/Payment";
import AdminPanel from "./pages/AdminPanel";
import CropPrediction from "./pages/CropPrediction";
import PlantDisease from "./pages/PlantDisease";
import ContactSupport from "./pages/ContactSupport";
import NotFound from "./pages/NotFound";
import { Navigate } from "react-router-dom";
import { PWAPrompt } from "./components/PWAPrompt";

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: "farmer" | "owner" }) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate replace to="/login" />;
  
  if (requiredRole && role !== requiredRole) {
    if (role === 'farmer') return <Navigate replace to="/farmer-dashboard" />;
    if (role === 'owner') return <Navigate replace to="/owner-dashboard" />;
    return <Navigate replace to="/" />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login/*" element={<Login />} />
          <Route path="/register/*" element={<Register />} />
          <Route 
            path="/farmer-dashboard" 
            element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner-dashboard" 
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/equipment/:id" element={<EquipmentDetails />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/payment" element={<Payment />} />
          <Route 
            path="/crop-prediction" 
            element={
              <ProtectedRoute requiredRole="farmer">
                <CropPrediction />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plant-disease" 
            element={
              <ProtectedRoute requiredRole="farmer">
                <PlantDisease />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
