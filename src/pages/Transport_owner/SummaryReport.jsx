import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DatePicker from "react-multi-date-picker";

// React Icons
import { 
    BsFuelPump, BsCalendar3, BsArrowUpRight, BsArrowDownRight, BsWallet2 
} from "react-icons/bs";
import { HiOutlineArrowPath } from "react-icons/hi2";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- Skeleton for Stats Cards ---
const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        ))}
    </div>
);

const SummaryReport = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Date Range State: Default to last 7 days
    const [dateRange, setDateRange] = useState([
        new Date(new Date().setDate(new Date().getDate() - 7)),
        new Date()
    ]);

    const empData = JSON.parse(localStorage.getItem('empData'));
    const token = empData?.token;

    // Format dates for API
    const fromDate = dateRange[0]?.format?.("YYYY-MM-DD") || 
                    (dateRange[0] instanceof Date ? dateRange[0].toISOString().split('T')[0] : "");
    const toDate = dateRange[1]?.format?.("YYYY-MM-DD") || 
                  (dateRange[1] instanceof Date ? dateRange[1].toISOString().split('T')[0] : fromDate);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["ownerSummaryReport", fromDate, toDate],
        queryFn: async () => {
            const res = await axios.get("https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/reports/summary", {
                headers: { Authorization: `Bearer ${token}` },
                params: { from: fromDate, to: toDate }
            });
            return res.data.data;
        },
        enabled: !!token && !!fromDate
    });

    return (
        <div className="flex h-screen overflow-hidden font-inter">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Header & Date Selector */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase flex items-center gap-2">
                                    <BsFuelPump className="text-indigo-600"/> Executive Summary
                                </h1>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Financial overview of fuel consumption across all drivers.</p>
                            </div>

                            <div className="flex flex-col md:flex-row items-end md:items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="relative min-w-[240px]">
                                    <BsCalendar3 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10" size={14} />
                                    <DatePicker
                                        value={dateRange}
                                        onChange={(val) => setDateRange(val)}
                                        range
                                        format="YYYY-MM-DD"
                                        inputClass="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        containerClassName="w-full"
                                    />
                                </div>
                                <button 
                                    onClick={() => refetch()}
                                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <HiOutlineArrowPath className={isFetching ? 'animate-spin' : ''} size={18}/>
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        {isLoading ? <StatsSkeleton /> : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                
                                {/* Card 1: Total Transferred */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 bg-indigo-50 dark:bg-indigo-500/10 p-8 rounded-full transition-transform group-hover:scale-110">
                                        <BsArrowUpRight className="text-indigo-500" size={24} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Transferred</h3>
                                    <div className="text-3xl font-black text-slate-800 dark:text-white">
                                        ৳{data?.total_transferred_to_drivers?.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-4 font-bold italic">Total credits issued to driver wallets</p>
                                </div>

                                {/* Card 2: Total Fuel Spend */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 bg-rose-50 dark:bg-rose-500/10 p-8 rounded-full transition-transform group-hover:scale-110">
                                        <BsArrowDownRight className="text-rose-500" size={24} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fuel Spend</h3>
                                    <div className="text-3xl font-black text-rose-500">
                                        ৳{data?.total_fuel_spend?.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-4 font-bold italic">Actual consumption at fuel stations</p>
                                </div>

                                {/* Card 3: Net Balance */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 bg-emerald-50 dark:bg-emerald-500/10 p-8 rounded-full transition-transform group-hover:scale-110">
                                        <BsWallet2 className="text-emerald-500" size={24} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding Balance</h3>
                                    <div className="text-3xl font-black text-emerald-500">
                                        ৳{data?.net_outstanding_driver_balance?.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-4 font-bold italic">Total funds currently held by drivers</p>
                                </div>

                            </div>
                        )}

                        {/* Date Range Footer Info */}
                        <div className="bg-indigo-600/5 dark:bg-indigo-500/5 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    Active Range: {fromDate} — {toDate}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 italic">Data refreshes automatically on date change</span>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default SummaryReport;