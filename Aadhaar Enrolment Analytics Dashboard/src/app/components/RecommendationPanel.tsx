import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface RecommendationProps {
  selectedPincode: string;
}

interface AIInsight {
  priority: string;
  predicted_workload_hours: number;
  required_counters: number;
  anomaly_status: string;
  ai_insights: string[];
}

// ✅ Backend URL (change if needed)
const API_URL = "http://localhost:8000/predict-resource-needs";

const RecommendationPanel: React.FC<RecommendationProps> = ({ selectedPincode }) => {
  const [data, setData] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ Invalid pincode handling
    if (!selectedPincode || selectedPincode === "All Pincodes") {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    // ✅ Cancel old request if pincode changes quickly
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get<AIInsight>(API_URL, {
          params: { pincode: selectedPincode },
          timeout: 15000,
          signal: controller.signal,
        });

        setData(response.data);
      } catch (err) {
        // ✅ Ignore cancel request error
        if (axios.isCancel(err)) return;

        // ✅ Proper Axios Error Handling
        const axiosErr = err as AxiosError<any>;

        console.log("API ERROR FULL =>", axiosErr);

        // ✅ If backend responded
        if (axiosErr.response) {
          const status = axiosErr.response.status;
          const backendMessage =
            axiosErr.response.data?.detail ||
            axiosErr.response.data?.message ||
            "Backend error response";

          setError(`API Error (${status}): ${backendMessage}`);
        }
        // ✅ If no response came (backend down / CORS)
        else if (axiosErr.request) {
          setError("Backend not reachable (Server OFF / CORS / Network Issue)");
        }
        // ✅ Other error
        else {
          setError(axiosErr.message || "Unknown Error");
        }

        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // ✅ Cleanup: cancel request on unmount/pincode change
    return () => controller.abort();
  }, [selectedPincode]);

  // ✅ UI when not selected
  if (!selectedPincode || selectedPincode === "All Pincodes") {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400">Select a Pincode on map to see AI Recommendations</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🤖 AI Resource Planner</h3>

      {loading ? (
        <p className="text-blue-500 animate-pulse">Analyzing Workload...</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm font-semibold">❌ {error}</p>
          <p className="text-xs text-red-500 mt-1">
            ✅ Check Backend Running at: <b>http://localhost:8000</b>
          </p>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* ✅ Top Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-lg border ${
                data.priority === "Critical"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              <p className="text-xs font-bold uppercase">Priority</p>
              <p className="text-lg font-bold">{data.priority}</p>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 text-blue-700 border-blue-200">
              <p className="text-xs font-bold uppercase">Counters Needed</p>
              <p className="text-lg font-bold">{data.required_counters}</p>
            </div>
          </div>

          {/* ✅ Extra Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-purple-50 text-purple-700 border-purple-200">
              <p className="text-xs font-bold uppercase">Workload (hrs)</p>
              <p className="text-lg font-bold">{data.predicted_workload_hours}</p>
            </div>

            <div className="p-3 rounded-lg border bg-yellow-50 text-yellow-700 border-yellow-200">
              <p className="text-xs font-bold uppercase">Anomaly</p>
              <p className="text-lg font-bold">{data.anomaly_status}</p>
            </div>
          </div>

          {/* ✅ AI Insights */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase">AI Insights</p>

            {data.ai_insights?.length > 0 ? (
              data.ai_insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded"
                >
                  <span>⚡</span>
                  <span>{insight}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No insights available</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No data available</p>
      )}
    </div>
  );
};

export default RecommendationPanel;
