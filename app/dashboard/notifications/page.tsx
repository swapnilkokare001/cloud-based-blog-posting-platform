'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from '@/redux/slices/notificationSlice';
import type { AppDispatch, RootState } from '@/redux/store';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Check } from 'lucide-react';
import { timeAgo } from '@/utils/helpers';
import Link from 'next/link';

const iconMap: Record<string, React.ElementType> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  reply: MessageCircle,
  mention: AtSign,
};

const colorMap: Record<string, string> = {
  like: 'text-red-500 bg-red-100 dark:bg-red-950',
  comment: 'text-blue-500 bg-blue-100 dark:bg-blue-950',
  follow: 'text-green-500 bg-green-100 dark:bg-green-950',
  reply: 'text-purple-500 bg-purple-100 dark:bg-purple-950',
  mention: 'text-amber-500 bg-amber-100 dark:bg-amber-950',
};

export default function NotificationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, unreadCount, isLoading } = useSelector((s: RootState) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-secondary transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-display text-lg text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            When someone likes or comments on your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((notif: any) => {
            const Icon = iconMap[notif.type] || Bell;
            const iconClass = colorMap[notif.type] || 'text-muted-foreground bg-muted';

            return (
              <div
                key={notif._id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  !notif.isRead
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-card border-border hover:bg-muted/30'
                }`}
              >
                {/* Type Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Sender Avatar */}
                {notif.sender && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                    {notif.sender.avatar ? (
                      <img src={notif.sender.avatar} alt={notif.sender.name} className="w-full h-full object-cover" />
                    ) : (
                      notif.sender.name?.[0]
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
