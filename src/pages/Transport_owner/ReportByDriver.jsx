import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DatePicker from "react-multi-date-picker";

// React Icons
import { 
    BsEye, BsSearch, BsChevronLeft, BsChevronRight, 
    BsFuelPump, BsCalendar3, BsPersonBadge 
} from "react-icons/bs";
import { HiOutlineArrowPath } from "react-icons/hi2";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const MySwal = withReactContent(Swal);

// --- Skeleton for Loading State ---
const TableSkeleton = () => (
    <>
        {[...Array(6)].map((_, i) => (
            <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-slate-700/50">
                <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                <td className="px-6 py-4 text-center"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto"></div></td>
            </tr>
        ))}
    </>
);

const ReportByDriver = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Date Range State: Default to last 7 days
    const [dateRange, setDateRange] = useState([
        new Date(new Date().setDate(new Date().getDate() - 7)),
        new Date()
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const empData = JSON.parse(localStorage.getItem('empData'));
    const token = empData?.token;

    // Format dates for API: YYYY-MM-DD
    const fromDate = dateRange[0]?.format?.("YYYY-MM-DD") || 
                    (dateRange[0] instanceof Date ? dateRange[0].toISOString().split('T')[0] : "");
    const toDate = dateRange[1]?.format?.("YYYY-MM-DD") || 
                  (dateRange[1] instanceof Date ? dateRange[1].toISOString().split('T')[0] : fromDate);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["reportByDriver", fromDate, toDate],
        queryFn: async () => {
            const res = await axios.get("https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/reports/by-driver", {
                headers: { Authorization: `Bearer ${token}` },
                params: { from: fromDate, to: toDate }
            });
            return res.data.data;
        },
        enabled: !!token && !!fromDate
    });

    // Details Modal Action
    const handleDriverDetails = (driver) => {
        MySwal.fire({
            title: <span className="text-xl font-bold dark:text-white italic">Driver Financial Summary</span>,
            html: (
                <div className="text-left p-2 space-y-4 dark:text-slate-300">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><BsPersonBadge size={24}/></div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white leading-none">{driver.name}</p>
                            <p className="text-xs text-slate-500">{driver.phone}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border dark:border-slate-700 rounded-xl">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Fuel Spend</p>
                            <p className="text-lg font-black text-rose-500">৳{driver.fuel_spend.toLocaleString()}</p>
                        </div>
                        <div className="p-3 border dark:border-slate-700 rounded-xl">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Current Balance</p>
                            <p className="text-lg font-black text-emerald-500">৳{driver.current_balance.toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 italic">Report generated for {fromDate} to {toDate}</p>
                </div>
            ),
            confirmButtonColor: "#4f46e5",
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
            customClass: { popup: 'rounded-2xl border-none' }
        });
    };

    // Filtering & Pagination Logic
    const filteredDrivers = useMemo(() => {
        if (!data?.drivers) return [];
        return data.drivers.filter(d => 
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            d.phone.includes(searchTerm)
        );
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
    const paginatedData = filteredDrivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Header Section */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase flex items-center gap-2">
                                <BsFuelPump className="text-indigo-600"/> Driver Consumption Report
                            </h1>
                        </div>

                        {/* Professional Filter Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            
                            {/* Multi Date Picker Range */}
                            <div className="md:col-span-5 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Date Range (From - To)</label>
                                <div className="relative">
                                    <BsCalendar3 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10" size={14} />
                                    <DatePicker
                                        value={dateRange}
                                        onChange={(val) => { setDateRange(val); setCurrentPage(1); }}
                                        range
                                        numberOfMonths={1}
                                        format="YYYY-MM-DD"
                                        inputClass="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        containerClassName="w-full"
                                    />
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="md:col-span-4 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Search Driver</label>
                                <div className="relative">
                                    <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        type="text" 
                                        placeholder="Enter name or phone..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>

                            {/* Fetch Button */}
                            <div className="md:col-span-3 flex items-end">
                                <button 
                                    onClick={() => refetch()} 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                >
                                    <HiOutlineArrowPath className={isFetching ? 'animate-spin' : ''} size={16}/> 
                                    Refresh Report
                                </button>
                            </div>
                        </div>

                        {/* Datatable */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 dark:text-slate-500 text-[11px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                                            <th className="px-6 py-5">Driver Name</th>
                                            <th className="px-6 py-5">Phone Number</th>
                                            <th className="px-6 py-5">Total Transferred</th>
                                            <th className="px-6 py-5">Fuel Spend</th>
                                            <th className="px-6 py-5">Remaining Balance</th>
                                            <th className="px-6 py-5 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {isLoading ? (
                                            <TableSkeleton />
                                        ) : paginatedData.length > 0 ? (
                                            paginatedData.map((driver) => (
                                                <tr key={driver.driver_id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all">
                                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{driver.name}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{driver.phone}</td>
                                                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">৳{driver.transferred_amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-black text-rose-500">৳{driver.fuel_spend.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-black text-emerald-500 italic">৳{driver.current_balance.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button 
                                                            onClick={() => handleDriverDetails(driver)}
                                                            className="p-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                        >
                                                            <BsEye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">No driver records found for this period.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Custom Pagination */}
                            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/20">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {isLoading ? "Fetching..." : `Showing ${paginatedData.length} of ${filteredDrivers.length} Drivers`}
                                </p>
                                <div className="flex gap-2">
                                    <button 
                                        disabled={currentPage === 1 || isLoading} 
                                        onClick={() => setCurrentPage(prev => prev - 1)} 
                                        className="p-2 border dark:border-slate-700 rounded-xl disabled:opacity-20 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                                    >
                                        <BsChevronLeft size={16}/>
                                    </button>
                                    <div className="flex items-center px-4 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                        Page {currentPage} / {totalPages || 1}
                                    </div>
                                    <button 
                                        disabled={currentPage === totalPages || totalPages === 0 || isLoading} 
                                        onClick={() => setCurrentPage(prev => prev + 1)} 
                                        className="p-2 border dark:border-slate-700 rounded-xl disabled:opacity-20 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
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

export default ReportByDriver;