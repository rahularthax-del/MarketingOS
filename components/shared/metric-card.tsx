interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p
              className={`text-sm mt-2 ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </div>
  );
}
