import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { 
  Eye, Search, Calendar, Landmark, 
  History, PlusCircle, ArrowUpRight, 
  Wallet, FilterX, User, Info
} from "lucide-react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AdminTopup = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState("form");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ 
    from: new Date().toISOString().split('T')[0], 
    to: new Date().toISOString().split('T')[0] 
  });
  
  const [formData, setFormData] = useState({
    owner_id: "",
    amount: "",
    cash_reference: "",
    note: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  // 1. Fetch Bus Owners
  const { data: owners = [] } = useQuery({
    queryKey: ["ownersList"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users?role=bus_owner`,
        {
          headers: { 
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json"
          },
        }
      );
      const result = await res.json();
      return result?.data?.users || [];
    },
  });

  // 2. Fetch History
  const { data: historyResponse, isLoading: historyLoading } = useQuery({
    queryKey: ["adminTopupHistory", dateRange.from, dateRange.to],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const params = new URLSearchParams();
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      console.log(params)

      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/topups?${params.toString()}`,
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      const result = await res.json();
      return result?.data || { transactions: [], total_amount: 0 };
    },
    enabled: view === "history",
  });

  // 3. Mutation
  const topupMutation = useMutation({
    mutationFn: async (payload) => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/owners/${payload.owner_id}/wallet/topup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Top-up failed");
      return result;
    },
    onSuccess: () => {
      Swal.fire({ 
        icon: "success", 
        title: "Transaction Successful", 
        text: "The owner's wallet has been credited.",
        confirmButtonColor: "#2563eb"
      });
      setFormData({ owner_id: "", amount: "", cash_reference: "", note: "" });
      queryClient.invalidateQueries(["adminTopupHistory"]);
    },
    onError: (error) => {
      Swal.fire({ icon: "error", title: "Authorization Failed", text: error.message });
    },
  });

  const filteredHistory = useMemo(() => {
    const list = historyResponse?.transactions || [];
    return list.filter(
      (tx) =>
        tx.target_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.target_user_phone?.includes(searchTerm) ||
        tx.cash_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyResponse, searchTerm]);

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Wallet Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Authorize and monitor funds for bus owner digital wallets.
              </p>
            </div>
            
            <div className="flex p-1.5 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm w-fit">
              <button
                onClick={() => setView("form")}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  view === "form" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <PlusCircle size={18} /> New Top-up
              </button>
              <button
                onClick={() => setView("history")}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  view === "history" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <History size={18} /> Summary
              </button>
            </div>
          </div>

          {view === "form" ? (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/40">
                      <Landmark size={24}/>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Process Transaction</h2>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Step 1: Authorization</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); topupMutation.mutate(formData); }} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Select Bus Owner</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        name="owner_id" value={formData.owner_id} onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer"
                        required
                      >
                        <option value="">Choose owner...</option>
                        {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>{owner.name} ({owner.phone})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Amount (BDT)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                        <input
                          name="amount" type="number" placeholder="0.00"
                          value={formData.amount} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-mono" required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Reference ID</label>
                      <input
                        name="cash_reference" type="text" placeholder="TXN-XXXX"
                        value={formData.cash_reference} onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all" required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Note (Optional)</label>
                    <textarea
                      name="note" rows="3" placeholder="Explain the purpose of this top-up..."
                      value={formData.note} onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit" disabled={topupMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3"
                  >
                    {topupMutation.isPending ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Confirm & Authorize <ArrowUpRight size={20}/></>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <Wallet className="absolute right-[-10px] bottom-[-10px] text-white/10 group-hover:scale-125 transition-transform duration-500" size={100} />
                    <p className="text-blue-100 text-sm font-medium">Total Volume</p>
                    <p className="text-3xl font-black text-white mt-1">৳ {historyResponse?.total_amount?.toLocaleString() || 0}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                      <Info size={14}/> Selected Range
                    </div>
                 </div>
              </div>

              {/* Table Section */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800 flex flex-wrap gap-4 items-center justify-between">
                  <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="text" placeholder="Search by name or phone..."
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                    <div className="flex items-center gap-2 px-3 border-r dark:border-slate-700">
                      <Calendar size={16} className="text-slate-400" />
                      <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} className="bg-transparent border-none text-xs font-semibold focus:ring-0 p-0" />
                    </div>
                    <div className="flex items-center gap-2 px-3">
                      <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} className="bg-transparent border-none text-xs font-semibold focus:ring-0 p-0" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.1em] bg-slate-50/50 dark:bg-slate-800/50">
                        <th className="px-8 py-5 text-left">Date</th>
                        <th className="px-8 py-5 text-left">Recipient</th>
                        <th className="px-8 py-5 text-left">Ref ID</th>
                        <th className="px-8 py-5 text-left">Source</th>
                        <th className="px-8 py-5 text-right">Amount</th>
                        <th className="px-8 py-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {historyLoading ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="6" className="px-8 py-6 bg-slate-50/20 dark:bg-slate-800/20"></td>
                          </tr>
                        ))
                      ) : filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center opacity-30">
                              <FilterX size={48} className="mb-4" />
                              <p className="text-lg font-semibold">No transactions found</p>
                              <p className="text-sm italic">Try adjusting your date range or search query</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((tx) => (
                          <tr key={tx.tx_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all duration-150">
                            <td className="px-8 py-6 font-medium text-slate-500">{new Date(tx.date_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                  {tx.target_user_name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold">{tx.target_user_name}</div>
                                  <div className="text-[11px] text-slate-400 font-medium">{tx.target_user_phone}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                                {tx.cash_reference}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                 tx.mode.includes('admin') 
                                 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                 : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                               }`}>
                                 <span className={`h-1.5 w-1.5 rounded-full ${tx.mode.includes('admin') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                 {tx.mode.replace(/_/g, ' ')}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="font-black text-blue-600 dark:text-blue-400">৳{tx.amount.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">BDT</div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <button 
                                onClick={() => {
                                  Swal.fire({
                                    title: `<span class="text-xl font-bold">Transaction Review</span>`,
                                    html: `
                                      <div class="text-left p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 mt-4">
                                        <div class="flex justify-between mb-4 pb-4 border-b dark:border-slate-800">
                                          <span class="opacity-50 text-sm">Amount</span>
                                          <span class="font-bold text-blue-600 text-lg">৳${tx.amount}</span>
                                        </div>
                                        <div class="space-y-3 text-sm">
                                          <p><span class="opacity-50">Recipient:</span> <strong>${tx.target_user_name}</strong></p>
                                          <p><span class="opacity-50">Reference:</span> <code class="bg-white dark:bg-slate-800 px-1 rounded">${tx.cash_reference}</code></p>
                                          <p><span class="opacity-50">Authorized:</span> <strong>${tx.funded_by_admin_name}</strong></p>
                                          <div class="p-3 bg-white dark:bg-slate-800 rounded-xl mt-4 border border-slate-100 dark:border-slate-800">
                                            <p class="opacity-50 text-[10px] uppercase font-bold mb-1">Internal Note</p>
                                            <p class="italic text-xs">${tx.note || 'No notes added for this transaction.'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    `,
                                    confirmButtonText: 'Dismiss',
                                    confirmButtonColor: '#2563eb',
                                    width: '450px',
                                    background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#fff",
                                    color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#1e293b",
                                  });
                                }} 
                                className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all duration-300"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminTopup;