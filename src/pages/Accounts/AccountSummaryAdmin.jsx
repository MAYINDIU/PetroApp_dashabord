import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, X, Fuel, ArrowUpCircle, Wallet, CreditCard, ClipboardList, Calendar } from "lucide-react";

// Components (Assuming these exist in your project)
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AccountSummaryAdmin = () => {
  // Get current year dynamically
  const currentYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(`${currentYear}-12-31`);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);

  // 1. Fetch Global Summary Cards Data
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["adminAccountSummary", fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/accounts/summary?from=${fromDate}&to=${toDate}`,
        {
          headers: { Authorization: `Bearer ${empData?.token}` },
        }
      );
      const result = await res.json();
      return result.data;
    },
  });

  // 2. Fetch Station-wise Ledger Table Data
  const { data: ledgerData, isLoading: isLedgerLoading } = useQuery({
    queryKey: ["stationLedger", fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/ledgers/stations?from=${fromDate}&to=${toDate}`,
        {
          headers: { Authorization: `Bearer ${empData?.token}` },
        }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to fetch ledger");
      return result.data.stations;
    },
  });

  // Filter logic for search bar
  const filteredStations = useMemo(() => {
    if (!ledgerData) return [];
    return ledgerData.filter((station) =>
      station.station_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ledgerData, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Header & Date Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm">
              <div>
                <h1 className="text-xl font-bold">Admin Accounts Summary</h1>
                <p className="text-sm text-slate-500">Overview of fuel transactions and balances</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border dark:border-slate-700">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent border-none text-sm p-1.5 focus:ring-0"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-transparent border-none text-sm p-1.5 focus:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard 
                title="Total Fuel Sales" 
                value={summaryData?.total_fuel_sales} 
                icon={<Fuel className="text-blue-600" />} 
                subtitle={`${summaryData?.tx_counts?.fuel_purchase || 0} Transactions`}
                loading={isSummaryLoading}
              />
              <SummaryCard 
                title="Total Topups" 
                value={summaryData?.total_topups} 
                icon={<ArrowUpCircle className="text-emerald-600" />} 
                subtitle={`${summaryData?.tx_counts?.topup || 0} Successful`}
                loading={isSummaryLoading}
                isCurrency
              />
              <SummaryCard 
                title="Driver Balance" 
                value={summaryData?.driver_total_balance} 
                icon={<Wallet className="text-purple-600" />} 
                subtitle="Available in Wallets"
                loading={isSummaryLoading}
                isCurrency
              />
              <SummaryCard 
                title="Station Payable" 
                value={summaryData?.station_total_balance} 
                icon={<CreditCard className="text-orange-600" />} 
                subtitle="Owed to Stations"
                loading={isSummaryLoading}
                isCurrency
              />
            </div>

            {/* Ledger Table Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-bold flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-600" />
                  Station-wise Ledger
                </h2>
                <input
                  type="text"
                  placeholder="Search station..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 dark:border-slate-700 text-sm w-full sm:w-64"
                />
              </div>

              <div className="p-6">
                {isLedgerLoading ? (
                  <div className="text-center py-12 text-slate-400 animate-pulse">Loading ledger records...</div>
                ) : (
                  <div className="border dark:border-slate-700 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-4">Station Name</th>
                          <th className="p-4 text-right">Sales Total</th>
                          <th className="p-4 text-right">Transactions</th>
                          <th className="p-4 text-right">Approved</th>
                          <th className="p-4 text-right">Paid Total</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-slate-700">
                        {filteredStations.length > 0 ? (
                          filteredStations.map((station) => (
                            <tr key={station.station_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                              <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">{station.station_name}</td>
                              <td className="p-4 text-right font-medium text-blue-600">৳{Number(station.sales_total).toLocaleString()}</td>
                              <td className="p-4 text-right">{station.tx_count}</td>
                              <td className="p-4 text-right">৳{Number(station.approved_total).toLocaleString()}</td>
                              <td className="p-4 text-right">৳{Number(station.paid_total).toLocaleString()}</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setSelectedStation(station.station_id)}
                                  className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-10 text-center text-slate-400 italic">No data found matching your search.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for Details */}
      {selectedStation && (
        <StationDetailsModal
          stationId={selectedStation}
          fromDate={fromDate}
          toDate={toDate}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
};

// --- Sub-component: Summary Card ---
const SummaryCard = ({ title, value, icon, subtitle, loading, isCurrency }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-center mb-4">
      <span className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">Report</span>
    </div>
    {loading ? (
      <div className="h-7 w-2/3 bg-slate-100 dark:bg-slate-700 animate-pulse rounded mb-2"></div>
    ) : (
      <div className="text-2xl font-bold text-slate-800 dark:text-white">
        {isCurrency ? `৳${Number(value || 0).toLocaleString()}` : Number(value || 0).toLocaleString()}
      </div>
    )}
    <div className="text-sm font-medium text-slate-500 mt-1">{title}</div>
    <div className="mt-3 pt-3 border-t dark:border-slate-700 text-[11px] text-slate-400 italic">
      {subtitle}
    </div>
  </div>
);

// --- Sub-component: Modal ---
const StationDetailsModal = ({ stationId, fromDate, toDate, onClose }) => {
  const { data: details, isLoading } = useQuery({
    queryKey: ["stationDetails", stationId, fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/ledgers/stations/${stationId}?from=${fromDate}&to=${toDate}`,
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      const result = await res.json();
      return result.data;
    },
    enabled: !!stationId,
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full hover:bg-red-500 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        {isLoading ? (
          <div className="p-20 text-center text-slate-400">Loading station details...</div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {details?.station_name || "Station Ledger Details"}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <Calendar size={14} /> {fromDate} to {toDate}
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Mini Summary in Modal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Opening Balance</p>
                  <p className="text-lg font-bold">৳{Number(details?.opening_balance || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1">Period Movement</p>
                  <p className="text-lg font-bold">৳{Number(details?.period_movement || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Closing Balance</p>
                  <p className="text-lg font-bold">৳{Number(details?.closing_balance || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border dark:border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="p-3 text-left">Date & Time</th>
                      <th className="p-3 text-left">Driver</th>
                      <th className="p-3 text-right">Liters</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {details?.rows?.map((row) => (
                      <tr key={row.tx_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(row.date_time).toLocaleString()}</td>
                        <td className="p-3 font-medium">{row.driver_name}</td>
                        <td className="p-3 text-right">{row.liters}L</td>
                        <td className="p-3 text-right font-bold text-blue-600">৳{row.amount}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${row.settlement_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {row.settlement_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 dark:bg-blue-600 text-white rounded-2xl hover:opacity-90 transition-all font-bold shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSummaryAdmin;