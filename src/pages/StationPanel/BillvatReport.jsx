import React, { useState, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { 
  Download, FileText, Printer, ShieldCheck, 
  Fuel, CalendarDays, FileSpreadsheet, Loader2, 
  ExternalLink, Landmark, ReceiptText
} from "lucide-react";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const BillvatReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [reportRange, setReportRange] = useState({ from: fromDate, to: toDate });

  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1";

  const { data: summary, isLoading, isSuccess } = useQuery({
    queryKey: ["vatSummary", reportRange],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/station/vat-reports/summary?from=${reportRange.from}&to=${reportRange.to}`, config);
      return res.data.data;
    }
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    setReportRange({ from: fromDate, to: toDate });
    toast.success("Petropay Ledger Updated");
  };

  // --- PETROPAY BRANDED EXCEL ---
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["PETROPAY DIGITAL FUEL MANAGEMENT"],
      ["STATION VAT COMPLIANCE AUDIT"],
      ["Period:", `${summary.from} to ${summary.to}`],
      ["Exported By:", empData?.name || "Station Manager"],
      [],
      ["ID", "TRANSACTION CATEGORY", "DEBIT (OUTPUT)", "CREDIT (INPUT)", "BALANCE"],
      ["01", "Sales VAT (Output)", summary.sales_vat, "-", "-"],
      ["02", "Purchase Invoice VAT", "-", summary.purchase_invoice_vat, "-"],
      ["03", "Electronic Bill VAT", "-", summary.electronic_bill_vat, "-"],
      [],
      ["GRAND TOTALS", "", summary.output_vat_total, summary.input_vat_total, summary.net_vat_payable]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Petropay_VAT_Report");
    XLSX.writeFile(wb, `Petropay_VAT_${summary.from}.xlsx`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="grow p-6">
          <div className="max-w-5xl mx-auto">
            
            {/* Filter Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-end gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Analysis Period</label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="flex-1 bg-slate-50 border-slate-200 rounded-xl text-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                  <span className="text-slate-300 font-bold">→</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="flex-1 bg-slate-50 border-slate-200 rounded-xl text-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
              </div>
              <button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-100 uppercase">
                <Fuel size={18} /> Generate Petropay Report
              </button>
            </div>

            {/* --- PETROPAY REPORT VIEW --- */}
            {isSuccess && summary ? (
              <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* BRAND HEADER */}
                <div className="p-10 bg-gradient-to-r from-blue-700 to-blue-900 text-white flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white p-2 rounded-lg">
                        <Fuel className="text-blue-700" size={32} />
                      </div>
                      <h1 className="text-3xl font-black tracking-tighter">PETROPAY</h1>
                    </div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.3em]">Fuel & Fleet Management Solutions</p>
                  </div>
                  <div className="text-right border-l border-white/20 pl-10">
                    <h2 className="text-xl font-black uppercase opacity-90">VAT Settlement</h2>
                    <p className="text-xs font-medium text-blue-200 mt-1">System Version: v2.4.0-Audit</p>
                  </div>
                </div>

                {/* METADATA BAR */}
                <div className="grid grid-cols-4 gap-8 bg-slate-50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-700">
                  <InfoBlock label="Report ID" value={`PP-VAT-${summary.from.replace(/-/g, '')}`} />
                  <InfoBlock label="Station Account" value="Al Hamara Main" />
                  <InfoBlock label="Currency" value="SAR" />
                  <InfoBlock label="Filing Period" value={`${summary.from} - ${summary.to}`} />
                </div>

                {/* MAIN AUDIT TABLE */}
                <div className="p-10">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[11px] font-black uppercase text-slate-400 border-b border-slate-200">
                        <th className="pb-4 text-left">Transactional Category</th>
                        <th className="pb-4 text-right">Debit (Tax Output)</th>
                        <th className="pb-4 text-right">Credit (Tax Input)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px]">
                      <ReportRow label="Fuel Sales VAT" value={summary.sales_vat} type="debit" />
                      <ReportRow label="Vehicle Maintenance (Input)" value={summary.purchase_invoice_vat} type="credit" />
                      <ReportRow label="Electronic Fuel Cards / Digital Bills" value={summary.electronic_bill_vat} type="credit" />
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        <td className="p-5 font-black text-blue-700 uppercase text-xs">Accumulated Totals</td>
                        <td className="p-5 text-right font-black text-slate-800 dark:text-white">{summary.output_vat_total.toLocaleString()}</td>
                        <td className="p-5 text-right font-black text-slate-800 dark:text-white">{summary.input_vat_total.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="pt-10 pb-2 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Calculated Net Tax Payable:</td>
                        <td className={`pt-10 pb-2 text-right text-2xl font-black ${summary.net_vat_payable < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {summary.net_vat_payable.toLocaleString()} <span className="text-xs font-bold">SAR</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* SIGNATURE & LEGAL FOOTER */}
                <div className="px-10 py-10 border-t border-slate-100 dark:border-slate-700">
                   <div className="grid grid-cols-2 gap-20 opacity-60">
                      <div className="border-t border-slate-300 pt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase">System Generated By</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">Petropay Automated Auditor</p>
                      </div>
                      <div className="border-t border-slate-300 pt-4 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Station Authority Signature</p>
                        <div className="h-10 italic font-serif text-slate-400 mt-2">Verified Digital Signature</div>
                      </div>
                   </div>
                </div>

                {/* ACTION TOOLS */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex justify-center gap-4">
                  <ActionButton onClick={exportToExcel} icon={<FileSpreadsheet size={16} />} label="Excel Ledger" color="emerald" />
                  <ActionButton onClick={() => window.print()} icon={<Printer size={16} />} label="Print Audit" color="blue" />
                </div>

              </div>
            ) : (
              <EmptyState isLoading={isLoading} />
            )}
          </div>
        </main>
      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

// Helper Components for Cleaner Code
const InfoBlock = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className="text-sm font-black text-slate-700 dark:text-slate-200 mt-1 break-words">{value}</p>
  </div>
);

const ReportRow = ({ label, value, type }) => (
  <tr className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 transition-colors">
    <td className="py-6 font-bold text-slate-600 dark:text-slate-400">{label}</td>
    <td className="py-6 text-right font-black text-slate-800 dark:text-white">{type === 'debit' ? value.toLocaleString() : '—'}</td>
    <td className="py-6 text-right font-black text-slate-800 dark:text-white">{type === 'credit' ? value.toLocaleString() : '—'}</td>
  </tr>
);

const ActionButton = ({ onClick, icon, label, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100"
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${colors[color]}`}>
      {icon} {label}
    </button>
  );
};

const EmptyState = ({ isLoading }) => (
  <div className="bg-white dark:bg-slate-800 p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
    {isLoading ? (
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Authenticating Records...</p>
      </div>
    ) : (
      <div className="opacity-30">
        <Landmark className="mx-auto mb-4" size={64} />
        <p className="font-black text-slate-500 uppercase tracking-widest text-sm">Waiting for Date Range Input</p>
      </div>
    )}
  </div>
);

export default BillvatReport;