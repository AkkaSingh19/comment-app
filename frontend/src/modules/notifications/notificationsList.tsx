'use client';

import { useEffect, useState } from 'react';
import { Bell, HomeIcon, LogOut, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/lib/notificationStore';

interface Notification {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
}

export const NotificationsList = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { unreadCount, setUnreadCount } = useNotificationStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/sign-up');
  };

  const fetchNotifications = async () => {
    const res = await fetch('http://localhost:8288/notifications', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await res.json();

    const sorted = data.sort((a: Notification, b: Notification) =>
      a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1
    );

    setNotifications(sorted);
    const unread = sorted.filter((n: Notification) => !n.isRead).length;
    setUnreadCount(unread); 
  };

  const toggleRead = async (id: string, isRead: boolean) => {
    const url = `http://localhost:8288/notifications/${id}/${isRead ? 'unread' : 'read'}`;
    await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    fetchNotifications(); 
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <h1 className="text-xl font-bold">CommentsApp</h1>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <button className="relative text-zinc-400 hover:text-white" title="Comments">
              <HomeIcon className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/notifications" className="relative">
            <button className="text-zinc-400 hover:text-white" title="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-[6px] py-[1px] rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Notification Box */}
      <div
        className="max-w-2xl mx-auto mt-10 rounded-lg border border-zinc-700"
        style={{ backgroundColor: '#242526' }}
      >
        <div className="border-b border-zinc-600 px-5 py-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-semibold text-lg">Notifications</h2>
        </div>

        <div className="divide-y divide-zinc-700">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-center justify-between px-5 py-3 text-sm cursor-pointer hover:bg-zinc-800 transition ${
                  n.isRead ? 'text-zinc-400' : 'text-white font-semibold'
                }`}
                onClick={() => toggleRead(n.id, n.isRead)}
              >
                <span className="flex items-center gap-2">
                  {n.isRead ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-3 h-3 text-blue-500" />
                  )}
                  <span>
                    <strong>{n.senderName || 'Someone'}</strong> replied to your comment
                  </span>
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-zinc-400 py-6">No notifications</div>
          )}
        </div>
      </div>
    </>
  );
};
