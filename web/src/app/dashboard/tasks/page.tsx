"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type TaskRow = {
  id: number;
  audio_title: string;
  status: string;
  created_at: string;
};

/** Task list */
export default function TasksListPage() {
  const [tasks, setTasks] = useState<TaskRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch("/tasks");
      const data = await res.json();
      if (!cancelled && res.ok) setTasks(data.tasks);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{"\u4efb\u52a1\u5217\u8868"}</h1>
        <Link
          href="/dashboard/tasks/new"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
        >
          {"\u65b0\u5efa"}
        </Link>
      </div>
      {!tasks && (
        <p className="mt-6 text-sm text-stone-500">{"\u52a0\u8f7d\u4e2d..."}</p>
      )}
      {tasks && tasks.length === 0 && (
        <p className="mt-6 text-sm text-stone-600">
          {"\u6682\u65e0\u4efb\u52a1\uff0c\u53bb\u521b\u5efa\u4e00\u4e2a\u5427\u3002"}
        </p>
      )}
      {tasks && tasks.length > 0 && (
        <ul className="mt-6 space-y-3">
          {tasks.map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/tasks/${t.id}`}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm hover:border-stone-300"
              >
                <span className="font-medium text-stone-900">{t.audio_title}</span>
                <span className="text-stone-500">{t.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
