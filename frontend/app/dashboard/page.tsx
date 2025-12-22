'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 🔥 Charts client-only
const DashboardCharts = dynamic(
  () => import('../components/DashboardCharts'),
  { ssr: false }
);

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [stats, setStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const email = session.user.email;
    setLoading(true);

    // 📊 Stats
    axios
      .get(`${BACKEND_URL}/analyze/stats`, { params: { email } })
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // 🤖 AI Recommendations (safe parse)
    axios
      .get(`${BACKEND_URL}/analyze/recommendations`, {
        params: { email },
      })
      .then((res) => {
        const data = res.data;
        if (typeof data === 'string') setRecommendations(data);
        else if (typeof data?.result === 'string')
          setRecommendations(data.result);
        else setRecommendations('');
      })
      .catch(() => setRecommendations(''));
  }, [session, status]);

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>

        {/* LOADING / AUTH STATES */}
        {status === 'loading' && (
          <p className="text-zinc-400">Loading session…</p>
        )}

        {status === 'unauthenticated' && (
          <p className="text-red-400">Please login to view dashboard</p>
        )}

        {status === 'authenticated' && loading && (
          <p className="text-zinc-400">Loading stats…</p>
        )}

        {/* STATS */}
        {status === 'authenticated' && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard title="Total Submissions" value={stats.total} />
            <StatCard title="Easy" value={stats.easy} accent="emerald" />
            <StatCard title="Medium" value={stats.medium} accent="blue" />
            <StatCard title="Hard" value={stats.hard} accent="rose" />
          </div>
        )}

        {/* CHART */}
        {status === 'authenticated' && !loading && stats.total > 0 && (
          <DashboardCharts
            easy={stats.easy}
            medium={stats.medium}
            hard={stats.hard}
          />
        )}

        {/* 🤖 AI RECOMMENDATIONS – COOL VERSION */}
        {status === 'authenticated' && recommendations && (
          <div
            className="
              relative
              bg-zinc-900/70
              backdrop-blur-xl
              border border-zinc-800
              rounded-2xl
              p-6
              shadow-[0_0_40px_rgba(0,0,0,0.6)]
            "
          >
            {/* Accent glow */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-emerald-500/10 pointer-events-none" />

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🤖 <span className="text-emerald-400">AI Recommendations</span>
            </h2>

            <div className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
              {recommendations}
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              Generated from your recent submissions & patterns
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  title,
  value,
  accent = 'zinc',
}: {
  title: string;
  value: number;
  accent?: 'emerald' | 'blue' | 'rose' | 'zinc';
}) {
  const accentMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    zinc: 'text-white',
  };

  return (
    <div
      className="
        bg-zinc-800/70
        backdrop-blur
        border border-zinc-700
        rounded-xl
        p-6
        transition
        hover:shadow-[0_0_25px_rgba(0,0,0,0.5)]
        hover:-translate-y-0.5
      "
    >
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${accentMap[accent]}`}>
        {value}
      </p>
    </div>
  );
}
