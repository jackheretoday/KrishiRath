import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages, LogOut, Menu, X } from "lucide-react";
import { MobileNav } from "./MobileNav";
import NotificationBell from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { role, logout } = useAuth();
  const { t, setLanguage, language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentLangName = {
    en: "English",
    hi: "हिंदी",
    mr: "मराठी",
    gu: "ગુજરાતી",
    ta: "தமிழ்"
  }[language];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="KrishiRath Logo" className="h-10 w-10 object-contain rounded-md" />
            <span className="text-2xl font-bold text-primary tracking-tight">KrishiRath</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {role === "farmer" && <NavLink to="/farmer-dashboard">{t('equipment_search')}</NavLink>}
            {role === "farmer" && <NavLink to="/crop-prediction">Crop AI</NavLink>}
            {role === "farmer" && <NavLink to="/plant-disease">Plant Disease</NavLink>}
            {role === "owner" && <NavLink to="/owner-dashboard">{t('management')}</NavLink>}
            {role && <NavLink to="/contact-support">Support</NavLink>}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 font-bold text-xs uppercase tracking-wider">
                <Languages className="h-4 w-4" />
                {currentLangName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('hi')}>हिंदी (Hindi)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('mr')}>मराठी (Marathi)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('gu')}>ગુજરાતી (Gujarati)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ta')}>தமிழ் (Tamil)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-2">
            {!role ? (
              <Link to="/login">
                <Button size="sm" className="font-bold px-6">{t('login')}</Button>
              </Link>
            ) : (
              <>
                <NotificationBell />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 font-bold border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-in slide-in-from-top-4 duration-200">
          <MobileNav onClose={() => setIsMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
