"use client";

type Totals = {
  totalDeposits: number;
  totalWithdraws: number;
  totalRewards: number;
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-white bg-slate-50 dark:bg-white/5 p-4">
    <p className="text-xs text-slate-600 dark:text-white/60">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

const Insights = ({ totals }: { totals: Totals }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total Deposits"
        value={`$${fmt(totals.totalDeposits ?? 0)}`}
      />
      <StatCard
        label="Total Withdraws"
        value={`$${fmt(totals.totalWithdraws ?? 0)}`}
      />
      <StatCard
        label="Total Rewards"
        value={`$${fmt(totals.totalRewards ?? 0)}`}
      />
    </div>
  );
};

export default Insights;
