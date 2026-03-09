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
  Fuel, Gauge, Loader2, Download
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const LedgerReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState([new Date("2026-03-01"), new Date("2026-03-30")]);
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
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-inter">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="grow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Ledger Report</h1>
            <div className="flex gap-2">
              <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-all shadow-sm">
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-80">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">* Select Date Range</label>
                <div className="relative">
                  <DatePicker
                    selectsRange startDate={startDate} endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    monthsShown={2} dateFormat="d MMM yyyy"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#1E88E5] text-slate-700 cursor-pointer text-sm"
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statement</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-emerald-600 uppercase tracking-wider text-right">Credit</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-rose-500 uppercase tracking-wider text-right">Debit</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></td></tr>
                  ) : ledgerData?.transactions?.map((txn, idx) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{idx + 1}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{new Date(txn.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 capitalize">{txn.type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-slate-400">{txn.meta?.note || 'Fuel Transaction'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 text-sm">{txn.type !== 'fuel_purchase' ? txn.amount : '-'}</td>
                      <td className="px-6 py-4 text-right font-bold text-rose-500 text-sm">{txn.type === 'fuel_purchase' ? txn.amount : '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* থাম্বনেইল ইমেজ */}
                          <div 
                            onClick={() => openDetails(txn)}
                            className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all shadow-sm"
                          >
                           <img 
                                    src={`https://alhamarahomesbd.com/cashless-fuel-api/public/storage/${txn?.meta?.meter_photo_path}`} 
                                    alt="Meter" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x225?text=Photo+Not+Found"; }}
                                    />
                          </div>
                          <button onClick={() => openDetails(txn)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-lg font-bold text-slate-800">Fuel Receipt Details</Dialog.Title>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                  </div>

                  {selectedTxn && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Liters</p>
                          <p className="flex items-center justify-center gap-1 font-bold text-slate-700"><Fuel size={14} className="text-emerald-500"/> {selectedTxn.meta.liters} L</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Meter Reading</p>
                          <p className="flex items-center justify-center gap-1 font-bold text-slate-700"><Gauge size={14} className="text-blue-500"/> {selectedTxn.meta.meter_reading}</p>
                        </div>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 p-2">
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
                        <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px]">{selectedTxn.status}</span>
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