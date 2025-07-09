'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, HomeIcon, LogOut } from 'lucide-react';

import { CommentItem } from './commentItem';
import { CommentForm } from './commentForm';
import { useNotificationStore } from '@/lib/notificationStore';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
  replies?: Comment[];
}

export const CommentsList = () => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const { unreadCount } = useNotificationStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/sign-up');
  };

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8288/comments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch comments');

      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <>
      {/* Header */}
      <header className="navbar flex justify-between items-center px-4 py-2 bg-muted/40 shadow-sm">
        <h1 className="text-xl font-bold">CommentsApp</h1>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <button className="text-zinc-400 hover:text-white" title="Home">
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

      {/* Main Content */}
      <main className="max-w-2xl mx-auto mt-6 px-4">
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">What&apos;s on your mind?</h2>
          <CommentForm onSuccess={fetchComments} />
        </div>

        <div className="mt-6 space-y-4">
          {comments.length > 0 ? (
            [...comments].reverse().map((comment) => (
              <CommentItem key={comment.id} comment={comment} onReply={fetchComments} />
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No comments yet.</p>
          )}
        </div>
      </main>
    </>
  );
};
