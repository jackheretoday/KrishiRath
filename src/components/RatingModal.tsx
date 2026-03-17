import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentName: string;
}

export const RatingModal = ({ isOpen, onClose, equipmentName }: RatingModalProps) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('rate_experience')}</DialogTitle>
          <DialogDescription>
            {t('how_was_rental')} {equipmentName}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="transition-transform active:scale-95"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea 
            placeholder={t('tell_more')} 
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="font-bold">
            {t('cancel')}
          </Button>
          <Button disabled={rating === 0} onClick={onClose} className="font-bold">
            {t('submit_review')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
