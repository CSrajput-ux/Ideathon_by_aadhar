import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mb-2">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
          {trend && trendValue && (
            <div className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
            }`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          trend === "up" ? "bg-green-50" : trend === "down" ? "bg-red-50" : "bg-blue-50"
        }`}>
          <Icon className={`w-6 h-6 ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-blue-600"
          }`} />
        </div>
      </div>
    </div>
  );
}
