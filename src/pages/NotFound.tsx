import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-black text-primary/20">404</h1>
        <p className="text-2xl font-bold text-muted-foreground">{t('page_not_found')}</p>
        <Link to="/">
          <Button className="h-12 px-8 font-black shadow-lg shadow-primary/20">
            {t('return_home')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
