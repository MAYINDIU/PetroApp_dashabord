import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, Download, Calendar, Search, 
  ArrowUpCircle, ArrowDownCircle, Scale, RefreshCw, 
  AlertCircle, Printer, Info
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Components (Assuming these exist in your project)
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const TrialBalance = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- API: Fetch Trial Balance ---
  const { data: trialData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["trialBalance", asOfDate],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/accounting/trial-balance?as_of=${asOfDate}`,
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      const result = await res.json();
      return result.data;
    },
  });

  const filteredAccounts = trialData?.accounts?.filter(acc => 
    acc.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_code.includes(searchTerm)
  ) || [];

  const generatePDF = () => {
    if (!trialData) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("TRIAL BALANCE", 14, 20);
    doc.setFontSize(10);
    doc.text(`As of Date: ${trialData.as_of}`, 14, 30);

    // Table
    const rows = filteredAccounts.map(acc => [
      acc.account_code,
      acc.account_name.replace(/_/g, ' '),
      acc.account_type.toUpperCase(),
      acc.debit_total > 0 ? `TK ${acc.debit_total.toLocaleString()}` : '-',
      acc.credit_total > 0 ? `TK ${acc.credit_total.toLocaleString()}` : '-'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Code', 'Account Name', 'Type', 'Debit (TK)', 'Credit (TK)']],
      body: rows,
      foot: [[
        '', 'TOTALS', '', 
        `TK ${trialData.totals.debit_total.toLocaleString()}`, 
        `TK ${trialData.totals.credit_total.toLocaleString()}`
      ]],
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });

    doc.save(`Trial_Balance_${trialData.as_of}.pdf`);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                    <Scale className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">Trial Balance</h1>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">General Ledger Summary</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border dark:border-slate-700">
                  <Calendar size={16} className="text-slate-400" />
                  <input 
                    type="date" 
                    value={asOfDate} 
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-bold text-indigo-600"
                  />
                </div>
                <button 
                  onClick={() => refetch()}
                  className="p-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw size={18} className={`${isRefetching ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={generatePDF}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-md"
                >
                  <Printer size={18} /> Export
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-l-4 border-l-emerald-500 border dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Debits</span>
                  <ArrowUpCircle className="text-emerald-500" size={20} />
                </div>
                <h2 className="text-3xl font-black">৳{trialData?.totals.debit_total.toLocaleString() ?? "0"}</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-l-4 border-l-blue-500 border dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Credits</span>
                  <ArrowDownCircle className="text-blue-500" size={20} />
                </div>
                <h2 className="text-3xl font-black">৳{trialData?.totals.credit_total.toLocaleString() ?? "0"}</h2>
              </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                  <AlertCircle size={14} /> Balance Check: 
                  {trialData?.totals.debit_total === trialData?.totals.credit_total ? (
                    <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md underline decoration-double">MATCHED</span>
                  ) : (
                    <span className="text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">UNBALANCED</span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Account Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Debit</th>
                      <th className="px-6 py-4 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="px-6 py-6 h-12 bg-slate-50/50 dark:bg-slate-800/20"></td>
                        </tr>
                      ))
                    ) : (
                      filteredAccounts.map((acc) => (
                        <tr key={acc.account_code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">{acc.account_code}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-tight">
                              {acc.account_name.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${
                              acc.account_type === 'asset' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                              {acc.account_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold font-mono">
                            {acc.debit_total > 0 ? `৳${acc.debit_total.toLocaleString()}` : <span className="text-slate-300 dark:text-slate-700">-</span>}
                          </td>
                          <td className="px-6 py-4 text-right font-bold font-mono">
                            {acc.credit_total > 0 ? `৳${acc.credit_total.toLocaleString()}` : <span className="text-slate-300 dark:text-slate-700">-</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {/* Table Footer */}
                  {!isLoading && (
                    <tfoot className="bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700">
                      <tr className="font-black text-slate-900 dark:text-white">
                        <td colSpan="3" className="px-6 py-5 text-right uppercase tracking-widest text-xs">Total Balance</td>
                        <td className="px-6 py-5 text-right text-lg decoration-double underline">৳{trialData?.totals.debit_total.toLocaleString()}</td>
                        <td className="px-6 py-5 text-right text-lg decoration-double underline">৳{trialData?.totals.credit_total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Balance Disclaimer */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
              <Info className="text-amber-600" size={20} />
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                <strong>Accounting Note:</strong> This Trial Balance is a report of all general ledger accounts. If the Total Debits do not equal Total Credits, please investigate unposted journal entries or system discrepancies.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TrialBalance;