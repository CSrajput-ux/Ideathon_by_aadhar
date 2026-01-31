import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Jan '25", historical: 145000, predicted: null },
  { month: "Feb '25", historical: 152000, predicted: null },
  { month: "Mar '25", historical: 148000, predicted: null },
  { month: "Apr '25", historical: 165000, predicted: null },
  { month: "May '25", historical: 172000, predicted: null },
  { month: "Jun '25", historical: 168000, predicted: null },
  { month: "Jul '25", historical: 178000, predicted: null },
  { month: "Aug '25", historical: 185000, predicted: null },
  { month: "Sep '25", historical: 182000, predicted: null },
  { month: "Oct '25", historical: 195000, predicted: null },
  { month: "Nov '25", historical: 202000, predicted: null },
  { month: "Dec '25", historical: 198000, predicted: null },
  { month: "Jan '26", historical: null, predicted: 210000 },
  { month: "Feb '26", historical: null, predicted: 218000 },
  { month: "Mar '26", historical: null, predicted: 225000 },
  { month: "Apr '26", historical: null, predicted: 234000 },
];

const quarterlyData = [
  { quarter: "Q1 '25", historical: 445000, predicted: null },
  { quarter: "Q2 '25", historical: 505000, predicted: null },
  { quarter: "Q3 '25", historical: 545000, predicted: null },
  { quarter: "Q4 '25", historical: 595000, predicted: null },
  { quarter: "Q1 '26", historical: null, predicted: 653000 },
  { quarter: "Q2 '26", historical: null, predicted: 698000 },
];

export function TrendChart() {
  const [timeView, setTimeView] = useState<"monthly" | "quarterly">("monthly");
  const data = timeView === "monthly" ? monthlyData : quarterlyData;
  const xKey = timeView === "monthly" ? "month" : "quarter";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Enrolment Trend Analysis</h3>
        <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50">
          <button
            onClick={() => setTimeView("monthly")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
              timeView === "monthly"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeView("quarterly")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
              timeView === "quarterly"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xKey} 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [value.toLocaleString(), '']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="historical"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            name="Historical Data"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#16a34a"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#16a34a', r: 4 }}
            name="AI Prediction"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Dotted line represents AI-predicted future enrolments based on historical patterns
      </p>
    </div>
  );
}
