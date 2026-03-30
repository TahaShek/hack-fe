"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck, Package, Tag, MessageCircle, Settings } from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification } from "@/types";

const typeConfig: Record<Notification["type"], { icon: typeof Bell; color: string; bg: string }> = {
  order: { icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
  promo: { icon: Tag, color: "text-amber-400", bg: "bg-amber-500/10" },
  system: { icon: Settings, color: "text-zinc-400", bg: "bg-zinc-500/10" },
  chat: { icon: MessageCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

function NotificationItem({
  notification,
  variant,
}: {
  notification: Notification;
  variant: "light" | "dark";
}) {
  const { markAsRead, removeNotification } = useNotificationStore();
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const isDark = variant === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-start gap-3 p-3 transition-colors cursor-pointer ${
        notification.read
          ? isDark ? "opacity-60" : "opacity-50"
          : isDark ? "bg-zinc-800/50" : "bg-[#9a4601]/5"
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className={`p-2 rounded-sm shrink-0 ${config.bg}`}>
        <Icon size={14} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDark ? "text-zinc-100" : "text-[#1d1c17]"}`}>
          {notification.title}
        </p>
        <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? "text-zinc-400" : "text-[#897367]"}`}>
          {notification.message}
        </p>
        <span className={`text-[10px] mt-1 block ${isDark ? "text-zinc-500" : "text-[#897367]"}`}>
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeNotification(notification.id);
        }}
        className={`p-1 rounded-sm shrink-0 cursor-pointer ${
          isDark ? "hover:bg-zinc-700 text-zinc-500" : "hover:bg-[#ece8e0] text-[#897367]"
        }`}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export default function NotificationPanel({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { notifications, unreadCount, isOpen, togglePanel, setOpen, markAllAsRead } =
    useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const isDark = variant === "dark";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => {
          // Request browser notification permission on user gesture
          if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default") {
            window.Notification.requestPermission().catch(() => {});
          }
          togglePanel();
        }}
        className={`relative p-2 rounded-sm transition-colors cursor-pointer ${
          isDark
            ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            : "text-[#897367] hover:text-[#1d1c17] hover:bg-[#ece8e0]"
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#9a4601] text-[9px] font-bold text-white flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Panel dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-2 w-80 max-h-96 rounded-sm shadow-xl z-50 flex flex-col overflow-hidden ${
              isDark
                ? "bg-[#1A1A1A] border border-zinc-800"
                : "bg-white border border-[#dcc1b4]/20"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? "border-zinc-800" : "border-[#dcc1b4]/20"
            }`}>
              <span className="text-[11px] font-medium uppercase tracking-[0.1rem]" style={{ color: isDark ? "#a1a1aa" : "#897367" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer ${
                    isDark ? "text-[#e07b39] hover:text-[#9a4601]" : "text-[#9a4601] hover:text-[#e07b39]"
                  }`}
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-transparent">
              <AnimatePresence mode="popLayout">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} variant={variant} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-8 text-center text-sm ${isDark ? "text-zinc-500" : "text-[#897367]"}`}
                  >
                    No notifications yet
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
