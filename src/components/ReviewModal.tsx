import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Star, MessageSquare } from "lucide-react";
import { API_URL } from "@/lib/config";

interface ReviewModalProps {
  bookingId: string;
  equipmentName: string;
  open: boolean;
  onClose: () => void;
  onReviewed?: () => void;
}

const ReviewModal = ({ bookingId, equipmentName, open, onClose, onReviewed }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("krishirath_token");
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: bookingId, rating, comment }),
      });
      if (!res.ok) {
        // Fallback: write directly to Supabase
        await supabase.from("reviews").insert([{ booking_id: bookingId, rating, comment }]);
        await supabase.from("bookings").update({ status: "completed" }).eq("id", bookingId);
      }
      toast.success("Review submitted! Thank you.");
      onReviewed?.();
      onClose();
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const starLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-yellow-50 to-amber-100 border-b">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Rate Your Experience
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-bold mt-1">
            {equipmentName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-3">Your Rating</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hovered || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-200 fill-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="text-center text-sm font-black text-yellow-600 mt-2">
                {starLabels[hovered || rating]}
              </p>
            )}
          </div>

          {/* Comment Box */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Comment (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Share your experience with other farmers..."
              className="w-full rounded-xl border-2 border-slate-200 focus:border-primary outline-none p-3 text-sm font-medium resize-none transition-colors"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 h-11 border-2 font-bold" onClick={onClose}>
              Skip for now
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-11 font-black shadow-lg">
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
