import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, Calendar, Users, TrendingUp, MapPin, Target } from "lucide-react";

// Components
import { MetricCard } from "./components/MetricCard";
import { IndiaMap } from "./components/IndiaMap";
import { TrendChart } from "./components/TrendChart";
import { AIInsightBox } from "./components/AIInsightBox";
import RecommendationPanel from "./components/RecommendationPanel";
import { DataTransparency } from "./components/DataTransparency";

export default function App() {
  // --- State Management ---
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedPincode, setSelectedPincode] = useState("All Pincodes");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("All Age Groups");
  const [enrolmentType, setEnrolmentType] = useState("All Types");

  // --- Dropdown Data Lists ---
  const [statesList, setStatesList] = useState<string[]>([]);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [pincodesList, setPincodesList] = useState<string[]>([]);

  // --- Dashboard Stats ---
  const [stats, setStats] = useState({
    total: 0,
    growth: "0%",
    priority: 0,
    predicted: 0
  });

  // 1. Initial Load: Fetch States
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/filters/states");
        setStatesList(res.data);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };
    fetchStates();
  }, []);

  // 1.5 Fetch Dashboard Stats (Jab filters badlen)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/dashboard-stats", {
          params: {
            state: selectedState,
            district: selectedDistrict,
            pincode: selectedPincode,
            year: selectedYear
          }
        });
        
        setStats({
          total: res.data.total_enrolments,
          growth: res.data.growth_rate,
          priority: res.data.high_priority_regions,
          predicted: res.data.predicted_enrolments
        });
      } catch (err) {
        console.error("Stats Fetch Error:", err);
      }
    };

    fetchStats();
  }, [selectedState, selectedDistrict, selectedPincode, selectedYear]);

  // 2. Handle State Change -> Fetch Districts
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    
    // Reset subordinate filters
    setSelectedDistrict("All Districts");
    setSelectedPincode("All Pincodes");
    setDistrictsList([]); 
    setPincodesList([]);

    if (newState !== "All States") {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/filters/districts?state_name=${newState}`);
        setDistrictsList(res.data);
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    }
  };

  // 3. Handle District Change -> Fetch Pincodes
  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    
    // Reset subordinate filter
    setSelectedPincode("All Pincodes");
    setPincodesList([]);

    if (newDistrict !== "All Districts") {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/filters/pincodes?district_name=${newDistrict}`);
        setPincodesList(res.data);
      } catch (err) {
        console.error("Error fetching pincodes:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Aadhaar Enrolment Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  AI-Powered Analytics for Proactive Service Planning
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
          </div>

          {/* --- Filters Bar --- */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Year */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>

            {/* State Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All States</option>
                {statesList.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={selectedState === "All States"}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option>All Districts</option>
              {districtsList.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>

            {/* Pincode Filter */}
            <select
              value={selectedPincode}
              onChange={(e) => setSelectedPincode(e.target.value)}
              disabled={selectedDistrict === "All Districts"}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option>All Pincodes</option>
              {pincodesList.map((pin) => (
                <option key={pin} value={pin}>{pin}</option>
              ))}
            </select>

            <button className="ml-auto px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              Apply Filters
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setSelectedState("All States");
                setSelectedDistrict("All Districts");
                setSelectedPincode("All Pincodes");
                setStatesList([]);
                setDistrictsList([]);
                setPincodesList([]);
              }}
            >
              Reset
            </button>
          </div>

          {/* Active Filters Display */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 font-medium">Active Filters:</span>
            {selectedState !== "All States" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {selectedState}
              </span>
            )}
            {selectedDistrict !== "All Districts" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {selectedDistrict}
              </span>
            )}
            {selectedPincode !== "All Pincodes" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {selectedPincode}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Enrolments"
            value={stats.total.toLocaleString()}
            subtitle={`Selected Period (${selectedYear})`}
            icon={Users}
            trend="up"
            trendValue="+12.4% from last year"
          />
          <MetricCard
            title="Growth Rate"
            value={stats.growth}
            subtitle="Year-over-Year"
            icon={TrendingUp}
            trend="up"
            trendValue="Consistent"
          />
          <MetricCard
            title="Active Centers/Regions"
            value={stats.priority.toString()}
            subtitle="Filtered Locations"
            icon={MapPin}
            trend="neutral"
            trendValue="Stable"
          />
          <MetricCard
            title="Predicted Demand"
            value={stats.predicted.toLocaleString()}
            subtitle="Next Quarter Forecast"
            icon={Target}
            trend="up"
            trendValue="+15% expected"
          />
        </div>

        {/* Map & AI Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <IndiaMap 
              selectedState={selectedState} 
              selectedDistrict={selectedDistrict} 
              selectedPincode={selectedPincode} 
            />
          </div>
          <div className="lg:col-span-1">
            <AIInsightBox selectedPincode={selectedPincode} />
          </div>
        </div>

        {/* Charts & Recommendations */}
        <div className="mb-8">
          <TrendChart />
        </div>

        <div className="mb-8">
          <RecommendationPanel selectedPincode={selectedPincode} />
        </div>

        <DataTransparency />
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2026 Aadhaar Enrolment Analytics System | Government of India</p>
            <p>Last updated: January 6, 2026 | Data refresh: Daily at 00:00 IST</p>
          </div>
        </div>
      </footer>
    </div>
  );
}