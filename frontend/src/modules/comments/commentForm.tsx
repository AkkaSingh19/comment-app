'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner'; 

export const CommentForm = ({
  parentId,
  onSuccess,
}: {
  parentId?: string;
  onSuccess?: () => void;
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8288/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content, parentId }),
      });

      setLoading(false);

     if (res.ok) {
        setContent('');
        toast.success(parentId ? 'Reply posted!' : 'Comment posted!');
        onSuccess?.(); 
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to post comment');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Network error. Please try again.');
      } else {
        toast.error('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }}

  return (
    <div className="space-y-2 mt-4">
      <Textarea
        placeholder="Write your comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      <div className="flex justify-end mt-2">
        <Button onClick={handleSubmit} disabled={loading || !content.trim()} className='btn'>
          {loading ? 'Posting...' : parentId ? 'Reply' : 'Post'}
        </Button>
      </div>
    </div>
  );
};
