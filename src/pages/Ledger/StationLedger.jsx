import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, X } from "lucide-react";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const StationLedger = () => {
// Get current year dynamically
const currentYear = new Date().getFullYear();
const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
const [toDate, setToDate] = useState(`${currentYear}-12-31`);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState(null); // For modal

  // Fetch station ledger summary
  const { data: ledgerData, isLoading } = useQuery({
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
    keepPreviousData: true,
  });

  // Filter stations by search
  const filteredStations = useMemo(() => {
    if (!ledgerData) return [];
    return ledgerData.filter((station) =>
      station.station_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ledgerData, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-full mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Station-wise Ledger
                </h2>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="p-2.5 rounded-xl border dark:bg-slate-700 dark:border-slate-600"
                  />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="p-2.5 rounded-xl border dark:bg-slate-700 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    placeholder="Search by station..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2.5 rounded-xl border dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 p-8">
                    Loading ledger...
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-700 text-white">
                        <tr>
                          <th className="p-3 text-left">Station Name</th>
                          <th className="p-3 text-right">Sales Total</th>
                          <th className="p-3 text-right">Transactions</th>
                          <th className="p-3 text-right">Approved Total</th>
                          <th className="p-3 text-right">Paid Total</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStations.length > 0 ? (
                          filteredStations.map((station) => (
                            <tr
                              key={station.station_id}
                              className="border-t dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700"
                            >
                              <td className="p-3 font-medium text-slate-700 dark:text-slate-200">
                                {station.station_name}
                              </td>
                              <td className="p-3 text-right tabular-nums text-blue-600 dark:text-blue-400">
                                {station.sales_total}
                              </td>
                              <td className="p-3 text-right">{station.tx_count}</td>
                              <td className="p-3 text-right">{station.approved_total}</td>
                              <td className="p-3 text-right">{station.paid_total}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setSelectedStation(station.station_id)}
                                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="p-4 text-center text-slate-500 dark:text-slate-400"
                            >
                              No stations found.
                            </td>
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

      {/* Modal */}
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

// Modal Component
const StationDetailsModal = ({ stationId, fromDate, toDate, onClose }) => {
  const { data: details, isLoading } = useQuery({
    queryKey: ["stationDetails", stationId, fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/ledgers/stations/${stationId}?from=${fromDate}&to=${toDate}`,
        {
          headers: { Authorization: `Bearer ${empData?.token}` },
        }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to fetch details");
      return result.data;
    },
    enabled: !!stationId,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 transition"
        >
          <X size={20} />
        </button>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Loading details...
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
              {details.station_name || "Station Details"}
            </h3>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-slate-700 dark:text-slate-200 text-sm">
              <div>Opening Balance: {details.opening_balance}</div>
              <div>Period Movement: {details.period_movement}</div>
              <div>Closing Balance: {details.closing_balance}</div>
            </div>

            {/* Transaction Table */}
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="p-2 text-left">Date & Time</th>
                    <th className="p-2 text-left">Driver</th>
                    <th className="p-2 text-right">Liters</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-left">Settlement Status</th>
                  </tr>
                </thead>
                <tbody>
                  {details.rows && details.rows.length > 0 ? (
                    details.rows.map((row) => (
                      <tr
                        key={row.tx_id}
                        className="border-t dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700"
                      >
                        <td className="p-2 text-slate-700 dark:text-slate-200">
                          {new Date(row.date_time).toLocaleString()}
                        </td>
                        <td className="p-2 font-medium text-slate-700 dark:text-slate-200">
                          {row.driver_name}
                        </td>
                        <td className="p-2 text-right">{row.liters}</td>
                        <td className="p-2 text-right">{row.amount}</td>
                        <td className="p-2 text-slate-700 dark:text-slate-200">
                          {row.settlement_status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-500 dark:text-slate-400">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StationLedger;