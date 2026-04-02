import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Eye, X, ClipboardList, Download, Calendar, 
  Fuel, User, Clock, Search, CheckCircle, AlertCircle, FileText 
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

import autoTable from "jspdf-autotable"; // autoTable সরাসরি ইম্পোর্ট করুন

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const LeaderStatement = () => {
  const currentYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(`${currentYear}-12-31`);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);

  // --- API: Fetch Station Summary List ---
  const { data: stations, isLoading: isListLoading } = useQuery({
    queryKey: ["stationLedger", fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/ledgers/stations?from=${fromDate}&to=${toDate}`,
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      const result = await res.json();
      return result.data.stations;
    },
  });

  const filteredStations = useMemo(() => {
    if (!stations) return [];
    return stations.filter((s) => s.station_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [stations, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="text-blue-600" /> Station Ledger
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border dark:border-slate-700 font-mono text-xs">
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-transparent border-none p-1 outline-none cursor-pointer" />
                  <span className="text-slate-400">to</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-transparent border-none p-1 outline-none cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b dark:border-slate-700">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" placeholder="Search station..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Station Name</th>
                      <th className="p-4 text-right">Sales</th>
                      <th className="p-4 text-right">TX</th>
                      <th className="p-4 text-right">Unsettled</th>
                      <th className="p-4 text-right">Paid</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {isListLoading ? (
                      <tr><td colSpan="6" className="p-10 text-center animate-pulse">Loading stations...</td></tr>
                    ) : filteredStations.map((s) => (
                      <tr key={s.station_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-semibold">{s.station_name}</td>
                        <td className="p-4 text-right font-bold text-blue-600">৳{s.sales_total.toLocaleString()}</td>
                        <td className="p-4 text-right">{s.tx_count}</td>
                        <td className="p-4 text-right text-orange-600">৳{s.unsettled_total.toLocaleString()}</td>
                        <td className="p-4 text-right font-bold">৳{s.paid_total.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => setSelectedStation(s)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Detail Information Modal --- */}
      {selectedStation && (
        <StationDetailsModal 
          station={selectedStation}
          fromDate={fromDate} 
          toDate={toDate} 
          onClose={() => setSelectedStation(null)} 
        />
      )}
    </div>
  );
};

// --- Sub-component: Station Details Modal with Report Generator ---
const StationDetailsModal = ({ station, fromDate, toDate, onClose }) => {
  const { data: details, isLoading } = useQuery({
    queryKey: ["stationDetails", station.station_id, fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/ledgers/stations/${station.station_id}?from=${fromDate}&to=${toDate}`,
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      const result = await res.json();
      return result.data;
    },
  });

  // --- PDF REPORT GENERATOR ---
  const generateReportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59); // Dark Slate
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("PETROPAY LEDGER REPORT", 14, 25);
    
    // Station Info
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text(`Station Name: ${station.station_name}`, 14, 50);
    doc.text(`Period: ${fromDate} to ${toDate}`, 14, 56);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 62);

    // Balance Table (Summary)
    doc.autoTable({
      startY: 70,
      head: [['Opening Balance', 'Period Movement', 'Closing Balance']],
      body: [[
        `TK ${details?.opening_balance}`, 
        `TK ${details?.period_movement}`, 
        `TK ${details?.closing_balance}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 12, halign: 'center' }
    });

    // Transaction Details Table
    const tableRows = details?.rows?.map(row => [
      row.date_time,
      `#${row.tx_id}`,
      row.driver_name,
      `${row.liters}L`,
      `TK ${row.amount}`,
      row.settlement_status.toUpperCase()
    ]);

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Transaction Details", 14, doc.autoTable.previous.finalY + 15);

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [['Date & Time', 'TX ID', 'Driver', 'Liters', 'Amount', 'Status']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' }
      }
    });

    doc.save(`${station.station_name}_Report_${fromDate}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in duration-200">
        
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
          <div>
            <h3 className="text-xl font-bold">{station.station_name} - Ledger</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Calendar size={12}/> {fromDate} to {toDate}</p>
          </div>
          <div className="flex gap-2">
            {!isLoading && (
              <button 
                onClick={generateReportPDF}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
              >
                <FileText size={16} /> Save as Report (PDF)
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full hover:bg-red-500 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center text-slate-400">Fetching Detailed Statement...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Opening Balance</p>
                <p className="text-xl font-bold">৳{details?.opening_balance.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50 dark:bg-blue-900/10">
                <p className="text-[10px] font-bold text-blue-500 uppercase">Period Movement</p>
                <p className="text-xl font-bold text-blue-600">+ ৳{details?.period_movement.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800 text-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Closing Balance</p>
                <p className="text-xl font-bold">৳{details?.closing_balance.toLocaleString()}</p>
              </div>
            </div>

            <div className="border dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Driver</th>
                    <th className="p-4 text-center">Liters</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {details?.rows?.map((row) => (
                    <tr key={row.tx_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 text-xs font-mono text-slate-500">{row.date_time}</td>
                      <td className="p-4 font-medium flex items-center gap-2"><User size={14} className="text-slate-400"/> {row.driver_name}</td>
                      <td className="p-4 text-center font-bold text-slate-600 dark:text-slate-400">{row.liters}L</td>
                      <td className="p-4 text-right font-bold text-blue-600">৳{row.amount.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${row.settlement_status === 'unsettled' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {row.settlement_status === 'unsettled' ? <AlertCircle size={12}/> : <CheckCircle size={12}/>}
                          {row.settlement_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderStatement;