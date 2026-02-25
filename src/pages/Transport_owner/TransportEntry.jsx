import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const MySwal = withReactContent(Swal);

const TransportEntry = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const empData = JSON.parse(localStorage.getItem('empData'));
    const token = empData?.token;
    const API_BASE = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1";
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch Data
    const { data: vehicles, isLoading } = useQuery({
        queryKey: ["vehicles"],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/owner/vehicles`, { headers });
            return res.data.data.vehicles;
        },
        enabled: !!token,
    });

    // 2. Search Logic
    const filteredVehicles = useMemo(() => {
        return vehicles?.filter(v => 
            v.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vehicles, searchTerm]);

    // 3. Create Mutation
    const createMutation = useMutation({
        mutationFn: (newVehicle) => axios.post(`${API_BASE}/owner/vehicles`, newVehicle, { headers }),
        onSuccess: () => {
            queryClient.invalidateQueries(["vehicles"]);
            MySwal.fire("Success!", "Vehicle has been added to your fleet.", "success");
        },
        onError: (err) => toast.error("Error saving vehicle data.")
    });

    // 4. Entry Modal Design
    const handleCreateModal = () => {
        MySwal.fire({
            title: '<div class="text-2xl font-bold text-slate-800">Add New Transport</div>',
            html: `
                <div class="text-left mt-4">
                    <div class="mb-4">
                        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Plate Number</label>
                        <input id="swal-plate" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. DHAKA-METRO-1234">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Model</label>
                        <input id="swal-model" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Toyota Hiace 2024">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Confirm Registration',
            confirmButtonColor: '#4f46e5', // Indigo 600
            cancelButtonColor: '#94a3b8',
            buttonsStyling: true,
            customClass: {
                confirmButton: 'px-6 py-2.5 rounded-lg font-semibold',
                cancelButton: 'px-6 py-2.5 rounded-lg font-semibold'
            },
            preConfirm: () => {
                const plate_number = document.getElementById('swal-plate').value;
                const model = document.getElementById('swal-model').value;
                if (!plate_number || !model) return Swal.showValidationMessage(`Both fields are required`);
                return { plate_number, model };
            }
        }).then((result) => {
            if (result.isConfirmed) createMutation.mutate(result.value);
        });
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <main className="p-6 lg:p-10">
                    {/* Upper Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transport Fleet</h1>
                            <p className="text-slate-500 mt-1">Manage your vehicle assets and registration status.</p>
                        </div>
                        <button 
                            onClick={handleCreateModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            Create Transport
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="mb-6 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" /></svg>
                            </span>
                            <input 
                                type="text"
                                placeholder="Search by plate or model..."
                                className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Datatable */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                {/* Professional Colored Header */}
                                <thead>
                                    <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
                                        <th className="px-6 py-5">Vehicle Identification</th>
                                        <th className="px-6 py-5">Model / Type</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Registration Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="p-20 text-center text-slate-400 animate-pulse font-medium">Fetching transport records...</td></tr>
                                    ) : filteredVehicles?.length > 0 ? (
                                        filteredVehicles.map((v) => (
                                            <tr key={v.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                            TR
                                                        </div>
                                                        <div>
                                                            <div className="font-mono text-sm font-bold text-slate-700">{v.plate_number}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {v.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-slate-600 uppercase italic">{v.model}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] uppercase ${
                                                        v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                        {v.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm text-slate-500 font-medium">
                                                        {new Date(v.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="p-10 text-center text-slate-400">No vehicles found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <ToastContainer />
            </div>
        </div>
    );
};

export default TransportEntry;