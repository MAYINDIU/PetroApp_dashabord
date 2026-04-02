import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Eye, X, ClipboardList, Download, Calendar, 
  User, Search, FileText, Briefcase, Info, 
  Fuel, Wallet, Car, ArrowRightLeft, AlertCircle, CheckCircle
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const LeadgerTransportowner = () => {
  const currentYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-03-27`);
  const [toDate, setToDate] = useState(`${currentYear}-04-02`);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwner, setSelectedOwner] = useState(null);

  // --- API: Fetch Owner Summary List ---
  const { data: ownersData, isLoading: isListLoading } = useQuery({
    queryKey: ["ownerLedger", fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/ledgers/owners?from=${fromDate}&to=${toDate}`,
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      const result = await res.json();
      return result.data;
    },
  });

  const filteredOwners = useMemo(() => {
    if (!ownersData?.owners) return [];
    return ownersData.owners.filter((o) => 
      o.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ownersData, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Briefcase className="text-blue-600" size={28} /> Transport Owner Ledger
                </h1>
                <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Owner-wise financial summary</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border dark:border-slate-700 font-mono text-xs">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-transparent border-none p-1 outline-none text-blue-600 font-bold" />
                <span className="text-slate-400 font-bold">to</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-transparent border-none p-1 outline-none text-blue-600 font-bold" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b dark:border-slate-700">
                <div className="relative w-full sm:w-80">
                  <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by owner name..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-5">Owner Name</th>
                      <th className="p-5 text-right">Transferred</th>
                      <th className="p-5 text-right">Fuel Spend</th>
                      <th className="p-5 text-right">Drivers Balance</th>
                      <th className="p-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {isListLoading ? (
                      <tr><td colSpan="5" className="p-20 text-center animate-pulse text-slate-400">Fetching Data...</td></tr>
                    ) : filteredOwners.map((owner) => (
                      <tr key={owner.owner_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black">
                              {owner.owner_name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{owner.owner_name}</span>
                          </div>
                        </td>
                        <td className="p-5 text-right font-medium">৳{owner.transferred_total.toLocaleString()}</td>
                        <td className="p-5 text-right font-bold text-orange-600">৳{owner.fleet_fuel_spend.toLocaleString()}</td>
                        <td className="p-5 text-right font-bold text-emerald-600">৳{owner.drivers_balance_total.toLocaleString()}</td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => setSelectedOwner(owner)}
                            className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Eye size={18} />
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

      {selectedOwner && (
        <OwnerDetailsModal 
          owner={selectedOwner}
          fromDate={fromDate}
          toDate={toDate}
          onClose={() => setSelectedOwner(null)}
        />
      )}
    </div>
  );
};

// --- Sub-component: Owner Details Modal ---
const OwnerDetailsModal = ({ owner, fromDate, toDate, onClose }) => {
  const { data: details, isLoading } = useQuery({
    queryKey: ["ownerDetails", owner.owner_id, fromDate, toDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/ledgers/owners/${owner.owner_id}?from=${fromDate}&to=${toDate}`,
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      const result = await res.json();
      return result.data;
    },
    enabled: !!owner.owner_id, // নিশ্চিত করা যে আইডি আছে
  });

  const generatePDF = () => {
    if (!details) return;
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("TRANSPORT OWNER STATEMENT", 14, 20);
    doc.setFontSize(10);
    doc.text(`Owner: ${owner.owner_name} | Period: ${fromDate} to ${toDate}`, 14, 30);

    autoTable(doc, {
      startY: 55,
      head: [['Opening Balance', 'Period Movement', 'Closing Balance']],
      body: [[
        `TK ${details?.opening_balance ?? 0}`, 
        `TK ${details?.period_movement ?? 0}`, 
        `TK ${details?.closing_balance ?? 0}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { halign: 'center' }
    });

    const fuelRows = details?.fuel_purchases?.rows?.map(r => [
      r.date_time, r.driver_name, r.station_name, `${r.liters}L`, `TK ${r.amount}`, r.settlement_status.toUpperCase()
    ]) || [];

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text("Transaction History", 14, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Driver', 'Station', 'Liters', 'Amount', 'Status']],
      body: fuelRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });

    doc.save(`${owner.owner_name}_Ledger.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80  flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in duration-200">
        
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {owner.owner_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{owner.owner_name}</h3>
              <p className="text-xs text-slate-500 font-mono tracking-tighter">Owner Statement</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isLoading && details && (
              <button onClick={generatePDF} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg">
                <Download size={16} /> Download PDF
              </button>
            )}
            <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-red-500 hover:text-white transition-all text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Details...</p>
          </div>
        ) : details ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Opening Balance</p>
                <p className={`text-xl font-black ${details?.opening_balance < 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                  ৳{details?.opening_balance?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-blue-100 bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-[10px] font-bold text-blue-500 uppercase mb-1 tracking-widest">Movement</p>
                <p className="text-xl font-black text-blue-600">
                  {details?.period_movement > 0 ? '+' : ''}৳{details?.period_movement?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-5 rounded-3xl bg-slate-800 text-white text-center shadow-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest text-white/50">Closing Balance</p>
                <p className="text-xl font-black">৳{details?.closing_balance?.toLocaleString() ?? 0}</p>
              </div>
            </div>

            <section>
              <h4 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <Car size={18} className="text-blue-600" /> Vehicle-wise Spend Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {details?.vehicle_wise?.map((v, i) => (
                  <div key={i} className="p-5 rounded-2xl border dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{v.plate_number}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{v.model} • {v.tx_count} TX</p>
                    </div>
                    <p className="font-black text-blue-600">৳{v.fuel_spend?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-blue-600" /> Transaction History
              </h4>
              <div className="border dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Driver & Station</th>
                      <th className="p-4 text-center">Amount</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {details?.fuel_purchases?.rows?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-4 text-xs font-mono text-slate-500">{row.date_time}</td>
                        <td className="p-4">
                          <p className="font-bold">{row.driver_name}</p>
                          <p className="text-[10px] text-slate-400">{row.station_name}</p>
                        </td>
                        <td className="p-4 text-center font-black text-blue-600">৳{row.amount?.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${row.settlement_status === 'unsettled' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {row.settlement_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <div className="p-20 text-center text-red-500 font-bold">No Data Available</div>
        )}
      </div>
    </div>
  );
};

export default LeadgerTransportowner;