'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentForm } from './commentForm';
import { Pencil, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  deletedAt?: string | null;
  author: { id: string; name: string };
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply?: () => void;
}

export const CommentItem = ({ comment, onReply }: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isEditable, setIsEditable] = useState(false);
  const [isDeleted, setIsDeleted] = useState(!!comment.deletedAt);
  const [canUndo, setCanUndo] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;

  useEffect(() => {
    const now = Date.now();
    const createdTime = new Date(comment.createdAt).getTime();
    const deletedTime = comment.deletedAt ? new Date(comment.deletedAt).getTime() : null;
    const fifteenMin = 15 * 60 * 1000;

    setIsEditable(now - createdTime <= fifteenMin);
    setCanUndo(!!deletedTime && now <= deletedTime + fifteenMin);
  }, [comment.createdAt, comment.deletedAt]);

  const handleEdit = async () => {
    try {
      const res = await fetch(`http://localhost:8288/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (res.ok) {
        toast.success('Comment updated');
        setIsEditing(false);
        if (onReply) await onReply(); // Refresh comments
      } else {
        toast.error('Failed to update comment');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Network error');
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8288/comments/${comment.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        toast.success('Comment deleted');
        setIsDeleted(true);
        if (onReply) await onReply();
      } else {
        toast.error('Failed to delete');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Network error');
    }
  };

  const handleRestore = async () => {
    try {
      const res = await fetch(`http://localhost:8288/comments/${comment.id}/restore`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        toast.success('Comment restored');
        setIsDeleted(false);
        if (onReply) await onReply();
      } else {
        toast.error('Failed to restore');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Network error');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-4 dark:bg-zinc-800 shadow-sm">
        <div className="w-9 h-9 rounded-full bg-zinc-500/20 flex-shrink-0" />

        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-white">{comment.author.name}</div>

            {!isDeleted && isEditable && (
              <div className="flex gap-2 text-zinc-400">
                <button onClick={() => setIsEditing(!isEditing)}>
                  <Pencil className="w-4 h-4 hover:text-white" />
                </button>
                <button onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 hover:text-red-400" />
                </button>
              </div>
            )}
          </div>

          {isDeleted ? (
            <div className="space-y-1">
              <div className="text-sm italic text-zinc-400">This comment was deleted</div>
              {canUndo && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-blue-400 px-0 mt-1 flex items-center gap-1"
                  onClick={handleRestore}
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo delete
                </Button>
              )}
            </div>
          ) : isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>Save</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-200 whitespace-pre-line">{comment.content}</p>
          )}

          {!isDeleted && (
            <div className="mt-2 flex gap-3 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-blue-400 hover:underline px-2 py-0 h-6"
              >
                {showReplyForm ? 'Cancel' : 'Reply'}
              </Button>
              {hasReplies && !showReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(true)}
                  className="text-xs text-muted-foreground hover:underline px-2 py-0 h-6"
                >
                  View {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
              {hasReplies && showReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(false)}
                  className="text-xs text-muted-foreground hover:underline px-2 py-0 h-6"
                >
                  Hide replies
                </Button>
              )}
            </div>
          )}

          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                parentId={comment.id}
                onSuccess={async () => {
                  setShowReplyForm(false);
                  if (onReply) await onReply();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {hasReplies && showReplies && (
        <div className="ml-10 mt-2 space-y-3">
          {comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};
