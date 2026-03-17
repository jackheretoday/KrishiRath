import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavProps {
  onClose: () => void;
}

export const MobileNav = ({ onClose }: MobileNavProps) => {
  const { t } = useLanguage();
  const { role } = useAuth();

  return (
    <div className="flex flex-col p-6 gap-6 bg-white shadow-xl">
      <Link
        to="/farmer-dashboard"
        className="text-lg font-bold hover:text-primary transition-colors flex items-center justify-between"
        onClick={onClose}
      >
        {t('equipment_search')}
        <span className="text-xs bg-primary/10 px-2 py-0.5 rounded text-primary uppercase">New</span>
      </Link>
      <Link
        to="/owner-dashboard"
        className="text-lg font-bold hover:text-primary transition-colors"
        onClick={onClose}
      >
        {t('management')}
      </Link>
      
      {!role && (
        <>
          <hr />
          <div className="flex flex-col gap-3">
            <Link to="/login" onClick={onClose}>
              <Button variant="outline" className="w-full font-bold h-12">
                {t('login')}
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
