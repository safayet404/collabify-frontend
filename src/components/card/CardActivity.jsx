'use client';

import { useEffect, useState } from 'react';
import { Loader2, Activity } from 'lucide-react';
import api from '@/lib/axios';
import { timeAgo } from '@/lib/utils';
import { UserAvatar } from '@/app/dashboard/layout';

export default function CardActivity({ cardId }) {
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/activity/board/${cardId}`);
        setActivities(res.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [cardId]);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  if (!activities.length) return <p className="text-xs text-gray-400 text-center py-4">No activity yet</p>;

  return (
    <div className="space-y-3">
      {activities.map(a => (
        <div key={a._id} className="flex gap-2.5">
          <UserAvatar user={a.user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{a.user?.name}</span>{' '}
              {a.description}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
