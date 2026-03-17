import { useState, useEffect } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API = "http://localhost:5001";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("krishirath_token");
    if (!token || !user) return;
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    const token = localStorage.getItem("krishirath_token");
    if (!token) return;
    await fetch(`${API}/notifications/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}
        className="relative h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
      >
        <Bell className="h-4 w-4 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-11 w-80 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-slate-50">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full font-black">{unreadCount}</span>
                )}
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-bold">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b last:border-0 flex gap-3 ${
                      !n.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? "bg-primary" : "bg-slate-300"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(n.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t bg-slate-50">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline mx-auto"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
