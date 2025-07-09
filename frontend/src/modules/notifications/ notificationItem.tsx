'use client';

import { CheckCircle, CircleDot } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  comment: {
    author?: {
      name: string;
    };
  };
}

interface Props {
  notification: Notification;
  onMarkAsRead: (id: string, isRead: boolean) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead }: Props) => {
  const { id, content, isRead, createdAt, comment } = notification;
  const authorName = comment?.author?.name || 'Someone';

  const handleToggleRead = () => {
    onMarkAsRead(id, !isRead);
  };

  return (
    <div
      className={`flex justify-between items-center px-4 py-3 rounded-md transition ${
        isRead ? 'bg-[#242526]' : 'bg-[#3a3b3c]'
      }`}
    >
      <div className="flex items-center gap-2 text-sm text-white">
        {isRead ? (
          <CheckCircle className="text-green-500 w-4 h-4 flex-shrink-0" />
        ) : (
          <CircleDot className="text-yellow-400 w-4 h-4 flex-shrink-0" />
        )}
        <div>
          <p>
            <strong>{authorName}</strong> {content}
          </p>
          <span className="text-xs text-zinc-400 block mt-1">
            {format(new Date(createdAt), 'dd MMM yyyy, HH:mm')}
          </span>
        </div>
      </div>

      <button
        onClick={handleToggleRead}
        className={`text-xs font-medium ml-4 px-3 py-1 rounded-md ${
          isRead
            ? 'bg-zinc-700 text-blue-300 hover:bg-zinc-600'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        Mark as {isRead ? 'Unread' : 'Read'}
      </button>
    </div>
  );
};
