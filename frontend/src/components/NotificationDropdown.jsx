import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotificationStore } from "../store/useNotificationStore";
import LottieStateIcon from "./LottieStateIcon";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();
  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const time = (stamp) => {
    const minutes = Math.floor((Date.now() - new Date(stamp)) / (1000 * 60));
    return minutes < 1
      ? "Just now"
      : minutes < 60
        ? `${minutes}m ago`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}h ago`
          : `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="relative grid size-11 place-items-center rounded-full text-white/80 hover:bg-white/10"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="size-5" />
        {unreadCount ? (
          <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#65d6b4] px-1 text-[10px] font-semibold text-[#062e28]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
      {isOpen ? (
        <div className="fixed inset-x-3 top-[76px] z-50 max-h-[70vh] overflow-hidden rounded-[24px] border border-[#dce7e3] bg-white text-[#10211b] shadow-[0_24px_70px_rgba(6,46,40,.2)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[410px]">
          <div className="flex items-center justify-between border-b border-[#e2ebe7] bg-[#effbf7] p-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#159a74]">
                Account activity
              </span>
              <h3 className="mt-1 font-semibold">Notifications</h3>
            </div>
            <div className="flex gap-1">
              {unreadCount ? (
                <button
                  onClick={markAllAsRead}
                  className="grid size-9 place-items-center rounded-full hover:bg-white"
                  aria-label="Mark all as read"
                >
                  <CheckCheck className="size-4 text-[#159a74]" />
                </button>
              ) : null}
              {notifications.length ? (
                <button
                  onClick={clearAllNotifications}
                  className="grid size-9 place-items-center rounded-full hover:bg-red-50"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="size-4 text-red-500" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length ? (
              notifications.slice(0, 10).map((note) => (
                <article
                  key={note.id}
                  onClick={() => {
                    if (!note.isRead) markAsRead(note.id);
                  }}
                  className={`relative flex cursor-pointer gap-3 border-b border-[#edf2f0] p-4 last:border-0 ${note.isRead ? "bg-white" : "bg-[#f3fcf8]"}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#dff8ef] text-xl">
                    {note.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <h4 className="font-semibold">{note.title}</h4>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNotification(note.id);
                        }}
                        className="grid size-8 shrink-0 place-items-center rounded-full text-[#8ba098] hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete notification"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-[#66756f]">
                      {note.message}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#8ba098]">
                      <span>{time(note.timestamp)}</span>
                      {note.orderId ? (
                        <Link
                          to="/orders"
                          onClick={() => setIsOpen(false)}
                          className="font-semibold text-[#087558]"
                        >
                          View order →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {!note.isRead ? (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-[#159a74]" />
                  ) : null}
                </article>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <LottieStateIcon
                  className="mx-auto h-24 w-24"
                  label="Animated empty notifications"
                />
                <h3 className="mt-4 font-semibold">All caught up</h3>
                <p className="mt-1 text-sm text-[#66756f]">
                  New account and order updates will appear here.
                </p>
              </div>
            )}
          </div>
          {notifications.length > 10 ? (
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block border-t border-[#e2ebe7] bg-[#f5f8f7] p-3 text-center text-sm font-semibold text-[#087558]"
            >
              View all notifications
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default NotificationDropdown;
