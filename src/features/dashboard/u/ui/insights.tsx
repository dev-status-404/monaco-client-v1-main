"use client";

type Totals = {
  totalDeposits: number;
  totalWithdraws: number;
  totalRewards: number;
};

const StatCard = ({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: string;
}) => (
  <div className={`${variant} p-4`}>
    <p className="text-xs text-white/85">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
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
        variant="gradient-card-a"
      />
      <StatCard
        label="Total Withdraws"
        value={`$${fmt(totals.totalWithdraws ?? 0)}`}
        variant="gradient-card-b"
      />
      <StatCard
        label="Total Rewards"
        value={`$${fmt(totals.totalRewards ?? 0)}`}
        variant="gradient-card-c"
      />
    </div>
  );
};

export default Insights;
