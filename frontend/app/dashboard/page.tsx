'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

type Stats = {
  total: number;
  beginner: number;
  intermediate: number;
  advanced: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setLoading(true);

      axios
        .get(
          `http://localhost:3001/analyze/stats?email=${session.user.email}`
        )
        .then((res) => {
          setStats(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch stats", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session]);

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {!session?.user?.email && (
          <p className="text-red-400">
            Please login to view analytics
          </p>
        )}

        {session?.user?.email && loading && (
          <p className="text-zinc-400">Loading stats...</p>
        )}

        {session?.user?.email && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Solved" value={stats.total} />
            <StatCard title="Beginner" value={stats.beginner} />
            <StatCard title="Intermediate" value={stats.intermediate} />
            <StatCard title="Advanced" value={stats.advanced} />
          </div>
        )}
      </div>
    </main>
  );
}

/* 🔹 Reusable Card Component */
function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
