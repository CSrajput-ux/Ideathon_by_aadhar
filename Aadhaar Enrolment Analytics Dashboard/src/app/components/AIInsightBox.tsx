import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface Insight {
  text: string;
  type: "primary" | "warning" | "info";
  priorityScore?: number;
}

interface AIBoxProps {
  selectedPincode: string;
}

const insights: Insight[] = [
  {
    text: "AI predicts a 24% increase in new Aadhaar enrolments in Uttar Pradesh districts over the next 3 months.",
    type: "primary",
    priorityScore: 92
  },
  {
    text: "Update requests expected to surge by 18% in Maharashtra during Q2 2026, particularly in Mumbai and Pune regions.",
    type: "warning",
    priorityScore: 85
  },
  {
    text: "Bihar and West Bengal showing consistent growth patterns - recommend preventive capacity expansion.",
    type: "info",
    priorityScore: 88
  }
];

export function AIInsightBox({ selectedPincode }: AIBoxProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              insight.type === "primary"
                ? "bg-blue-50 border-blue-300"
                : insight.type === "warning"
                ? "bg-amber-50 border-amber-300"
                : "bg-green-50 border-green-300"
            }`}
          >
            <div className="flex items-start gap-3">
              {insight.type === "primary" ? (
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : insight.type === "warning" ? (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
                {insight.priorityScore && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Priority Score:</span>
                    <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          insight.priorityScore >= 80
                            ? "bg-red-600"
                            : insight.priorityScore >= 60
                            ? "bg-amber-500"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${insight.priorityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {insight.priorityScore}/100
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
