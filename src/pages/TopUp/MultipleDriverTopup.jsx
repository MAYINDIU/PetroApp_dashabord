import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { Trash2, Plus, Wallet, History } from "lucide-react";
import Swal from "sweetalert2";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const MultipleDriverTopup = () => {
    const queryClient = useQueryClient();
    const [ownerId, setOwnerId] = useState("");
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [amount, setAmount] = useState("");
    const [isHistoryView, setIsHistoryView] = useState(false);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [meta] = useState({ note: "owner cash distribution", cash_reference: "RCPT-BULK-001" });

    // 1. Fetch Users
    const { data: users } = useQuery({
        queryKey: ['usersList'],
        queryFn: async () => {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users`, {
                headers: { 'Authorization': `Bearer ${empData?.token}` }
            });
            return (await res.json()).data.users || [];
        }
    });

    const owners = useMemo(() => users?.filter(u => u.role === 'bus_owner') || [], [users]);
    const drivers = useMemo(() => users?.filter(u => u.role === 'driver') || [], [users]);

    // 2. Fetch Owner's Driver Topups
    const { data: topupData, isLoading: isLoadingTopups } = useQuery({
        queryKey: ['ownerTopups', ownerId],
        queryFn: async () => {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/owners/${ownerId}/drivers/topups`, {
                headers: { 'Authorization': `Bearer ${empData?.token}` }
            });
            const result = await res.json();
            if (!result.success) {
                throw new Error(result.message || "Failed to fetch topups");
            }
            return result.data;
        },
        enabled: !!ownerId, // Only run when an owner is selected
    });
    // Helpers
    const totalAmount = selectedDrivers.reduce((sum, d) => sum + Number(d.amount), 0);

    const addDriverToList = () => {
        if (!selectedDriverId || !amount) return toast.warn("Please select a driver and enter an amount.");
        const driver = drivers.find(d => String(d.id) === String(selectedDriverId));
        if (selectedDrivers.find(d => d.driver_id === selectedDriverId)) return toast.error("Driver already in list.");
        
        setSelectedDrivers([...selectedDrivers, { driver_id: selectedDriverId, amount, name: driver.name }]);
        setSelectedDriverId(""); setAmount("");
    };

    const removeDriver = (id) => setSelectedDrivers(selectedDrivers.filter(d => d.driver_id !== id));

    const bulkMutation = useMutation({
        mutationFn: async (payload) => {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const response = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/owners/${ownerId}/drivers/bulk-topup`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${empData?.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!result.success) {
                throw result;
            }
            return result;
        },
        onSuccess: () => {
            toast.success("Bulk transaction successful!");
            setSelectedDrivers([]);
            queryClient.invalidateQueries(['usersList']);
            queryClient.invalidateQueries(['ownerTopups', ownerId]);
        },
        onError: (error) => {
            const errorMessage = error?.errors ? Object.values(error.errors).flat().join(' ') : error.message || "Transaction failed";
            Swal.fire({
                icon: 'error',
                title: 'Bulk Top-up Failed',
                text: errorMessage,
                confirmButtonColor: '#1e293b',
            });
        }
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Header Section */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Bulk Driver Top-up</h2>
                                    <p className="text-sm text-slate-500">Distribute funds to multiple drivers at once.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setIsHistoryView(!isHistoryView)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${isHistoryView ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <History size={16} />
                                        {isHistoryView ? "Top-up Form" : "Topup History"}
                                    </button>
                                    <Wallet className="text-indigo-600" size={24} />
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Selectors */}
                                <div className={`grid ${isHistoryView ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                    <select onChange={(e) => setOwnerId(e.target.value)} className="w-full p-2.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Select Bus Owner</option>
                                        {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                    {!isHistoryView && (
                                        <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full p-2.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Select Driver</option>
                                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    )}
                                </div>

                                {!isHistoryView ? (
                                    <>
                                        {/* Input Field */}
                                        <div className="flex gap-2">
                                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount (BDT)" className="flex-1 p-2.5 rounded-xl border-slate-200" />
                                            <button onClick={addDriverToList} className="bg-indigo-600 text-white px-6 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2">
                                                <Plus size={18}/> Add
                                            </button>
                                        </div>

                                        {/* Table */}
                                        <div className="border rounded-xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr className="text-left text-slate-500">
                                                        <th className="p-3">Driver Name</th>
                                                        <th className="p-3 text-right">Amount (BDT)</th>
                                                        <th className="p-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedDrivers.map((d) => (
                                                        <tr key={d.driver_id} className="border-t">
                                                            <td className="p-3 font-medium text-slate-700">{d.name}</td>
                                                            <td className="p-3 text-right tabular-nums">{d.amount}</td>
                                                            <td className="p-3 text-center">
                                                                <button onClick={() => removeDriver(d.driver_id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {selectedDrivers.length === 0 && (
                                                        <tr><td colSpan="3" className="p-4 text-center text-slate-500">No drivers added yet.</td></tr>
                                                    )}
                                                </tbody>
                                                <tfoot className="bg-slate-50 font-bold border-t">
                                                    <tr>
                                                        <td className="p-3">Total</td>
                                                        <td className="p-3 text-right tabular-nums">{totalAmount}</td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <button 
                                            onClick={() => bulkMutation.mutate({ items: selectedDrivers.map(({driver_id, amount}) => ({driver_id, amount})), ...meta })} 
                                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                                            disabled={selectedDrivers.length === 0 || !ownerId}
                                        >
                                            Process Bulk Distribution
                                        </button>
                                    </>
                                ) : (
                                    <div className="border rounded-xl overflow-hidden">
                                        {!ownerId ? (
                                            <div className="p-8 text-center text-slate-500">Please select a bus owner to view history.</div>
                                        ) : isLoadingTopups ? (
                                            <div className="p-8 text-center text-slate-500">Loading transactions...</div>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr className="text-left text-slate-500">
                                                        <th className="p-3">Date & Time</th>
                                                        <th className="p-3">Driver</th>
                                                        <th className="p-3">Mode</th>
                                                        <th className="p-3 text-right">Amount (BDT)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topupData?.transactions?.map((tx) => (
                                                        <tr key={tx.tx_id} className="border-t">
                                                            <td className="p-3 text-slate-700">{new Date(tx.date_time).toLocaleString()}</td>
                                                            <td className="p-3 font-medium text-slate-700">{tx.driver_name}</td>
                                                            <td className="p-3 text-slate-600">{tx.mode}</td>
                                                            <td className="p-3 text-right tabular-nums">{tx.amount}</td>
                                                        </tr>
                                                    ))}
                                                    {topupData?.transactions?.length === 0 && (
                                                        <tr><td colSpan="4" className="p-4 text-center text-slate-500">No transactions found.</td></tr>
                                                    )}
                                                </tbody>
                                                <tfoot className="bg-slate-50 font-bold border-t">
                                                    <tr>
                                                        <td className="p-3" colSpan="3">Total</td>
                                                        <td className="p-3 text-right tabular-nums">{topupData?.total_amount}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
};

export default MultipleDriverTopup;