import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare, Users, FileCheck, Clock, ThumbsUp,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { getAnalytics } from '@/services/api';
import { KpiCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorBoundary';
import { Badge } from '@/components/ui/Badge';
import { formatRelative, cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/types';

const PIE_COLORS = ['#171717', '#737373', '#b4b4b4'];

function KpiCard({
  label, value, trend, icon: Icon, suffix = '', prefix = '',
}: {
  label: string;
  value: number;
  trend: number;
  icon: React.ElementType;
  suffix?: string;
  prefix?: string;
}) {
  const isUp = trend > 0;
  const isDown = trend < 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center">
          <Icon className="h-4 w-4 text-[var(--text-primary)]" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-[var(--text-primary)]">
          {prefix}{typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}{suffix}
        </span>
      </div>
      <div className={cn('flex items-center gap-1 text-xs font-medium', isUp ? 'text-emerald-500' : isDown ? 'text-red-500' : 'text-[var(--text-muted)]')}>
        {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : isDown ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        {Math.abs(trend)}{typeof trend === 'number' && Number.isInteger(trend) ? '' : ''} {isUp ? 'increase' : isDown ? 'decrease' : 'no change'} this week
      </div>
    </motion.div>
  );
}

const confidenceBadgeVariant: Record<ConfidenceLevel, 'success' | 'warning' | 'danger'> = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
};

export function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
    staleTime: 60_000,
  });

  if (isError) return (
    <div className="h-full flex items-center justify-center">
      <ErrorState message="Failed to load analytics" onRetry={refetch} />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Insights into system usage and student engagement
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Total Queries" value={data!.kpis.totalQueries} trend={data!.kpis.totalQueriesTrend} icon={MessageSquare} />
            <KpiCard label="Active Users" value={data!.kpis.activeUsers} trend={data!.kpis.activeUsersTrend} icon={Users} />
            <KpiCard label="Docs Indexed" value={data!.kpis.documentsIndexed} trend={data!.kpis.documentsIndexedTrend} icon={FileCheck} />
            <KpiCard label="Avg Response" value={data!.kpis.avgResponseTime} trend={data!.kpis.avgResponseTimeTrend} icon={Clock} suffix="s" />
            <KpiCard label="Satisfaction" value={data!.kpis.satisfactionRate} trend={data!.kpis.satisfactionRateTrend} icon={ThumbsUp} suffix="%" />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Queries over time */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Queries Over Time</h2>
          {isLoading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={data!.queriesOverTime} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.slice(5)}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="queries" stroke="#171717" strokeWidth={2} dot={false} name="Queries" className="stroke-neutral-900 dark:stroke-neutral-100" />
                <Line type="monotone" dataKey="uniqueUsers" stroke="#737373" strokeWidth={2} dot={false} name="Unique Users" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Feedback pie */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Feedback Distribution</h2>
          {isLoading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={data!.feedbackSplit}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {data!.feedbackSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar chart + tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Top categories */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Queries by Category</h2>
          {isLoading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data!.topCategories} layout="vertical" margin={{ top: 0, right: 16, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#171717" className="fill-neutral-900 dark:fill-neutral-200" radius={[0, 4, 4, 0]} name="Queries" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top questions */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Top Asked Questions</h2>
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)
              : data!.topQuestions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-[var(--text-muted)] w-5 mt-0.5 flex-shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">{q.question}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--text-muted)]">{q.count} times</span>
                        <Badge variant={confidenceBadgeVariant[q.avgConfidence]} className="text-[10px] py-0">
                          {q.avgConfidence}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Low confidence questions */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Unanswered / Low Confidence Questions</h2>
          <Badge variant="warning">Needs Attention</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {['Question', 'Confidence', 'Times Asked', 'Last Asked'].map((h) => (
                  <th key={h} className="text-left pb-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={4}><div className="skeleton h-8 my-2 rounded-lg" /></td></tr>
                  ))
                : data!.lowConfidenceQuestions.map((q) => (
                    <tr key={q.id} className="border-b border-[var(--border-muted)] last:border-0">
                      <td className="py-3 pr-4 text-sm text-[var(--text-primary)] max-w-xs">{q.question}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-[var(--bg-muted)]">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{ width: `${q.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-red-500 font-medium">{q.confidence}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-[var(--text-secondary)]">{q.asked}</td>
                      <td className="py-3 text-sm text-[var(--text-muted)]">{formatRelative(q.lastAsked)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
