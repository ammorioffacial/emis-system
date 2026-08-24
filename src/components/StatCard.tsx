import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: "blue" | "green" | "red" | "amber";
}

const accentStyles: Record<StatCardProps["accent"], { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600" },
  red: { bg: "bg-rose-50", text: "text-rose-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
};

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  const styles = accentStyles[accent];
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.bg}`}>
        <Icon className={`h-6 w-6 ${styles.text}`} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
