import { Info, FileText, Activity, Target } from "lucide-react";

export function DataTransparency() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Data Transparency & Methodology</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50 rounded">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900">Data Sources</h4>
          </div>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>• Historical Aadhaar enrolment records (2020-2025)</li>
            <li>• State & district-wise demographic data</li>
            <li>• Seasonal enrolment pattern analysis</li>
            <li>• Mobile unit performance metrics</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-50 rounded">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900">AI Model</h4>
          </div>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>• Time-series forecasting algorithm</li>
            <li>• Multi-factor prediction model</li>
            <li>• Regional demand pattern recognition</li>
            <li>• Continuously updated with new data</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-50 rounded">
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900">Purpose</h4>
          </div>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>• Proactive service capacity planning</li>
            <li>• Optimize resource allocation</li>
            <li>• Reduce wait times for citizens</li>
            <li>• Improve operational efficiency</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Note:</span> All predictions are probabilistic estimates based on historical trends and may vary based on policy changes, 
          demographic shifts, and external factors. This dashboard is designed for planning purposes and should be used alongside ground-level assessments.
        </p>
      </div>
    </div>
  );
}