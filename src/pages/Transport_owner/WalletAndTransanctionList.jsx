import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// React Icons
import { 
    BsEye, BsFilter, 
    BsChevronLeft, BsChevronRight, BsSearch 
} from "react-icons/bs";
import { HiOutlineArrowPath } from "react-icons/hi2";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const MySwal = withReactContent(Swal);

const WalletAndTransanctionList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Table States
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const empData = JSON.parse(localStorage.getItem('empData'));
    const token = empData?.token;

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["ownerWallet"],
        queryFn: async () => {
            const res = await axios.get("https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/wallet", {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.data;
        },
        enabled: !!token
    });

    // --- Eye Button Action (Details Modal) ---
    const handleShowDetails = (trx) => {
        MySwal.fire({
            title: <span className="text-xl font-bold dark:text-white">Transaction Details</span>,
            html: (
                <div className="text-left p-2 space-y-3 dark:text-slate-300">
                    <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                        <span className="font-semibold">Transaction ID:</span>
                        <span>#{trx.id}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                        <span className="font-semibold">Reference:</span>
                        <span>{trx.cash_reference || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                        <span className="font-semibold">Mode:</span>
                        <span className="capitalize">{trx.mode.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                        <span className="font-semibold">Counterparty:</span>
                        <span>{trx.counterparty.name} ({trx.counterparty.phone})</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                        <span className="font-semibold">Direction:</span>
                        <span className={trx.direction === 'credit' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                            {trx.direction.toUpperCase()}
                        </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mt-4">
                        <p className="font-semibold mb-1">System Note:</p>
                        <p className="italic text-sm">"{trx.note || 'No specific notes recorded.'}"</p>
                    </div>
                </div>
            ),
            showConfirmButton: true,
            confirmButtonText: "Close",
            confirmButtonColor: "#4f46e5", // Indigo-600
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
            customClass: {
                popup: 'rounded-3xl border-none shadow-2xl'
            }
        });
    };

    // Filtering Logic
    const filteredTransactions = useMemo(() => {
        if (!data?.transactions) return [];
        return data.transactions.filter(trx => {
            const matchesSearch = trx.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 trx.counterparty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 trx.cash_reference?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === "all" || trx.direction === filterType;
            return matchesSearch && matchesType;
        });
    }, [data, searchTerm, filterType]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedData = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) return <div className="h-screen flex items-center justify-center dark:bg-[#0f172a] dark:text-white">Loading...</div>;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Header Section */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight italic">TRANSACTION LEDGER</h1>
                                <p className="text-slate-500 text-sm">Reviewing logs for wallet: ৳{data.wallet.balance.toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => refetch()} 
                                className={`p-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm hover:scale-105 transition-all ${isFetching ? 'animate-spin text-indigo-500' : 'text-slate-400'}`}
                            >
                                <HiOutlineArrowPath size={20}/>
                            </button>
                        </div>

                        {/* Datatable Container */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            
                            {/* Filter Bar */}
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-800">
                                <div className="relative flex-1 max-w-sm">
                                    <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search by note, name, or reference..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset to first page on search
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <BsFilter className="text-indigo-500" size={18} />
                                    <select 
                                        className="bg-transparent border-none text-sm font-bold dark:text-slate-300 focus:ring-0 cursor-pointer"
                                        onChange={(e) => {
                                            setFilterType(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="all">ALL TRANSACTIONS</option>
                                        <option value="credit">CREDIT ONLY</option>
                                        <option value="debit">DEBIT ONLY</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 dark:text-slate-500 text-[11px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                                            <th className="px-6 py-5">Date/Time</th>
                                            <th className="px-6 py-5">Activity</th>
                                            <th className="px-6 py-5">Counterparty</th>
                                            <th className="px-6 py-5">Amount</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-6 py-5 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {paginatedData.map((trx) => (
                                            <tr key={trx.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {new Date(trx.date_time).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(trx.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[180px]">
                                                        {trx.note || "System Transfer"}
                                                    </div>
                                                    <div className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter opacity-70">
                                                        {trx.mode.replace(/_/g, ' ')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{trx.counterparty.name}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{trx.counterparty.role}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-sm font-black ${trx.direction === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {trx.direction === 'credit' ? '+' : '-'} ৳{trx.amount.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest ${
                                                        trx.status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {trx.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => handleShowDetails(trx)}
                                                        className="p-2.5 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-xl transition-all shadow-sm group-hover:shadow-md"
                                                    >
                                                        <BsEye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/20">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Records: {filteredTransactions.length} items total
                                </p>
                                <div className="flex gap-1.5">
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="p-2 border dark:border-slate-700 rounded-xl disabled:opacity-20 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all"
                                    >
                                        <BsChevronLeft size={16}/>
                                    </button>
                                    
                                    <div className="flex items-center px-3 text-xs font-black text-slate-600 dark:text-slate-300">
                                        PAGE {currentPage} OF {totalPages || 1}
                                    </div>

                                    <button 
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="p-2 border dark:border-slate-700 rounded-xl disabled:opacity-20 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all"
                                    >
                                        <BsChevronRight size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default WalletAndTransanctionList;