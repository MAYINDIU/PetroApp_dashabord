import React, { useState, Fragment } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Calendar as CalendarIcon, FileSpreadsheet, FileText,
  ArrowUpRight, ArrowDownLeft, Eye, X, 
  Fuel, Gauge, Loader2, Download, User, Truck, Info, Hash
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const LedgerReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return [startOfMonth, now];
  });
  const [startDate, endDate] = dateRange;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/ledger";

  const { data: ledgerData, isLoading, refetch } = useQuery({
    queryKey: ["stationLedger", startDate, endDate],
    queryFn: async () => {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate ? endDate.toISOString().split('T')[0] : from;
      const res = await axios.get(`${BASE_URL}?from=${from}&to=${to}`, config);
      return res.data.data;
    },
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Station Ledger Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${startDate.toLocaleDateString('en-GB')} - ${endDate?.toLocaleDateString('en-GB')}`, 14, 22);

    const tableColumn = ["#", "Date", "Statement", "Credit", "Debit"];
    const tableRows = (ledgerData?.transactions || []).map((txn, idx) => [
      idx + 1,
      new Date(txn.created_at).toLocaleDateString('en-GB'),
      txn.type.replace('_', ' ').toUpperCase(),
      txn.type !== 'fuel_purchase' ? txn.amount : '-',
      txn.type === 'fuel_purchase' ? txn.amount : '-',
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [86, 186, 115], textColor: [255, 255, 255] },
    });

    doc.save(`Ledger_Report_${new Date().getTime()}.pdf`);
  };

  const openDetails = (txn) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 font-inter transition-colors duration-300">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="grow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Ledger Report</h1>
            <div className="flex gap-2">
              <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-all shadow-sm">
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-80">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">* Select Date Range</label>
                <div className="relative">
                  <DatePicker
                    selectsRange startDate={startDate} endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    monthsShown={2} dateFormat="d MMM yyyy"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#1E88E5] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer text-sm"
                  />
                  <CalendarIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                </div>
              </div>
              <button onClick={() => refetch()} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-100 text-sm">
                Apply Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver / Vehicle</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Qty (L)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-emerald-600 uppercase tracking-wider text-right">Credit</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-rose-500 uppercase tracking-wider text-right">Debit</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {isLoading ? (
                    <tr><td colSpan="7" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></td></tr>
                  ) : ledgerData?.transactions?.map((txn, idx) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{idx + 1}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs text-center font-mono">{new Date(txn.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{txn.driver?.name || 'N/A'}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tighter">{txn.vehicle?.plate_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-300 text-sm">{txn.meta?.liters || '-'}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">{txn.type !== 'fuel_purchase' ? txn.amount : '-'}</td>
                      <td className="px-6 py-4 text-right font-bold text-rose-500 dark:text-rose-400 text-sm">{txn.type === 'fuel_purchase' ? txn.amount : '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* থাম্বনেইল ইমেজ */}
                          <div 
                            onClick={() => openDetails(txn)}
                            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-blue-400 transition-all shadow-sm"
                          >
                           <img 
                                    src={`https://alhamarahomesbd.com/cashless-fuel-api/public/storage/${txn?.meta?.meter_photo_path}`} 
                                    alt="Meter" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x225?text=Photo+Not+Found"; }}
                                    />
                          </div>
                          <button onClick={() => openDetails(txn)} className="p-2 text-slate-300 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Details Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl transition-all border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Info size={20} className="text-blue-500" /> Transaction Audit
                    </Dialog.Title>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                  </div>

                  {selectedTxn && (
                    <div className="space-y-6">
                      {/* Actor Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><User size={12}/> Driver Information</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedTxn.driver?.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedTxn.driver?.phone}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Truck size={12}/> Vehicle & Owner</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedTxn.vehicle?.plate_number}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{selectedTxn.transporter?.name}</p>
                        </div>
                      </div>

                      {/* Stats Section */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Liters</p>
                          <p className="flex items-center justify-center gap-1 font-black text-emerald-600 dark:text-emerald-400 text-lg"><Fuel size={16}/> {selectedTxn.meta.liters} L</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Meter Reading</p>
                          <p className="flex items-center justify-center gap-1 font-black text-blue-600 dark:text-blue-400 text-lg"><Gauge size={16}/> {selectedTxn.meta.meter_reading}</p>
                        </div>
                      </div>

                      {/* Image Preview */}
                      <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase px-2 mb-2">Original Meter Photo</p>
                        <div className="rounded-lg overflow-hidden bg-white aspect-video relative group">
                          <img 
                                    src={`https://alhamarahomesbd.com/cashless-fuel-api/public/storage/${selectedTxn.meta?.meter_photo_path}`} 
                                    alt="Meter" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x225?text=Photo+Not+Found"; }}
                                    />
                          <a 
                            href={  selectedTxn.meter_photo_url} 
                            target="_blank" rel="noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold gap-2 text-xs"
                          >
                            <Download size={16} /> Open Full Image
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 text-xs font-bold text-slate-400 uppercase">
                        <span>Status</span>
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-[10px]">{selectedTxn.status}</span>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default LedgerReport;