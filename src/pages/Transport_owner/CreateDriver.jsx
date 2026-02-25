import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const MySwal = withReactContent(Swal);

const CreateDriver = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const empData = JSON.parse(localStorage.getItem('empData'));
    const token = empData?.token;
    const API_BASE = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1";
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch Drivers List
    const { data: drivers, isLoading: driversLoading } = useQuery({
        queryKey: ["drivers"],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/owner/drivers`, { headers });
            return res.data.data.drivers;
        },
        enabled: !!token,
    });

    // 2. Fetch Vehicles List
    const { data: vehicles } = useQuery({
        queryKey: ["vehicles"],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/owner/vehicles`, { headers });
            return res.data.data.vehicles;
        },
        enabled: !!token,
    });

    // 3. View Details Modal Logic
    const handleViewDetails = (item) => {
        MySwal.fire({
            title: `<div class="text-xl font-bold text-slate-800">Driver & Vehicle Details</div>`,
            width: '600px',
            html: `
                <div class="text-left mt-4 border-t border-slate-100 pt-6">
                    <div class="grid grid-cols-2 gap-6">
                        <div class="col-span-2 md:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <p class="text-[10px] font-black uppercase text-indigo-500 mb-2 tracking-widest">Driver Information</p>
                            <h3 class="text-lg font-bold text-slate-800">${item.driver.name}</h3>
                            <div class="mt-2 space-y-1 text-sm text-slate-600">
                                <p><strong>Phone:</strong> ${item.driver.phone}</p>
                                <p><strong>Email:</strong> ${item.driver.email}</p>
                                <p><strong>Role:</strong> <span class="capitalize">${item.driver.role}</span></p>
                            </div>
                        </div>

                        <div class="col-span-2 md:col-span-1 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <p class="text-[10px] font-black uppercase text-indigo-500 mb-2 tracking-widest">Assigned Vehicle</p>
                            <h3 class="text-lg font-mono font-bold text-indigo-700">${item.vehicle?.plate_number || 'N/A'}</h3>
                            <div class="mt-2 space-y-1 text-sm text-indigo-900/70">
                                <p><strong>Model:</strong> ${item.vehicle?.model || 'Unknown'}</p>
                                <p><strong>Status:</strong> ${item.vehicle?.status || 'N/A'}</p>
                                <p><strong>Vehicle ID:</strong> #${item.vehicle?.id || 'N/A'}</p>
                            </div>
                        </div>

                        <div class="col-span-2 flex justify-between items-center px-2 text-[11px] text-slate-400 font-medium italic">
                            <span>System ID: ${item.id} | User ID: ${item.driver_user_id}</span>
                            <span>Registered: ${new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Dismiss',
            confirmButtonColor: '#1e293b', // Slate 800
            customClass: {
                popup: 'rounded-3xl shadow-2xl',
                confirmButton: 'px-8 py-2 rounded-xl font-bold'
            }
        });
    };

    // 4. Search Logic
    const filteredDrivers = useMemo(() => {
        return drivers?.filter(d => 
            d.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.driver.phone.includes(searchTerm) ||
            d.vehicle?.plate_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [drivers, searchTerm]);

    // 5. Create Driver Mutation
    const createMutation = useMutation({
        mutationFn: (newDriver) => axios.post(`${API_BASE}/owner/drivers`, newDriver, { headers }),
        onSuccess: () => {
            queryClient.invalidateQueries(["drivers"]);
            MySwal.fire("Registered!", "Driver account created successfully.", "success");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Registration failed")
    });

    // 6. Entry Modal Logic
    const handleCreateModal = () => {
        const vehicleOptions = vehicles?.map(v => 
            `<option value="${v.id}">${v.plate_number} (${v.model})</option>`
        ).join("");

        MySwal.fire({
            title: '<div class="text-2xl font-bold text-slate-800">Register Driver</div>',
            html: `
                <div class="text-left mt-4 grid grid-cols-1 gap-4 text-sm">
                    <div>
                        <label class="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Full Name</label>
                        <input id="swal-name" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Enter driver name">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Phone Number</label>
                        <input id="swal-phone" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="017XXXXXXXX">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Assign Vehicle</label>
                        <select id="swal-vehicle" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                            <option value="">Select a vehicle</option>
                            ${vehicleOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Login Password</label>
                        <input id="swal-pass" type="password" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Register Driver',
            confirmButtonColor: '#4f46e5',
            preConfirm: () => {
                const name = document.getElementById('swal-name').value;
                const phone = document.getElementById('swal-phone').value;
                const vehicle_id = document.getElementById('swal-vehicle').value;
                const password = document.getElementById('swal-pass').value;
                if (!name || !phone || !vehicle_id || !password) return Swal.showValidationMessage(`Complete all fields`);
                return { name, phone, vehicle_id, password };
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Driver Directory</h1>
                            <p className="text-slate-500 mt-1">Manage driver assignments and authentication.</p>
                        </div>
                        <button onClick={handleCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            Create Driver
                        </button>
                    </div>

                    <div className="mb-6 relative max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" /></svg>
                        </span>
                        <input type="text" placeholder="Search drivers..." className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
                                        <th className="px-6 py-5">Driver Info</th>
                                        <th className="px-6 py-5">Assigned Vehicle</th>
                                         <th className="px-6 py-5">Phone</th>
                                           <th className="px-6 py-5">Email</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {driversLoading ? (
                                        <tr><td colSpan="4" className="p-20 text-center animate-pulse">Fetching records...</td></tr>
                                    ) : filteredDrivers?.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {item.driver.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700">{item.driver.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">UID: ${item.driver_user_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.vehicle ? (
                                                    <div>
                                                        <div className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                                                            {item.vehicle.plate_number}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-1">{item.vehicle.model}</div>
                                                    </div>
                                                ) : <span className="text-slate-300 italic">No Vehicle Assigned</span>}
                                            </td>
                                               <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1  font-bold text-[12px] uppercase ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {item?.driver?.phone}
                                                </span>
                                            </td>
                                              <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[12px]  font-bold '}`}>
                                                    {item?.driver?.email}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleViewDetails(item)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-indigo-100 transition-all shadow-sm"
                                                    title="View Full Profile"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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

export default CreateDriver;