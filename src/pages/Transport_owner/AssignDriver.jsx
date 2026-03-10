import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import { Eye, Link as LinkIcon, Search } from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const MySwal = withReactContent(Swal);

const AssignDriver = () => {
  const queryClient = useQueryClient();

  // Form states
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Drivers
  const { data: drivers, isLoading: loadingDrivers } = useQuery({
    queryKey: ["driversList"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers`, {
        headers: { Authorization: `Bearer ${empData?.token}` },
      });
      const result = await res.json();
      return result?.data?.drivers || [];
    },
  });

  // Fetch Vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ["vehiclesList"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/vehicles`, {
        headers: { Authorization: `Bearer ${empData?.token}` },
      });
      const result = await res.json();
      return result?.data?.vehicles || [];
    },
  });

  // Assign Driver Mutation
  const assignMutation = useMutation({
    mutationFn: async (payload) => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/assign-driver`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${empData?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Assignment failed");
      return result;
    },
    onSuccess: () => {
      toast.success("Driver assigned successfully!");
      setSelectedDriver("");
      setSelectedVehicle("");
      queryClient.invalidateQueries(["driversList"]);
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text: error.message,
        confirmButtonColor: "#1e293b",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedDriver || !selectedVehicle) {
      return toast.warn("Please select both driver and vehicle.");
    }
    assignMutation.mutate({ driver_id: selectedDriver, vehicle_id: selectedVehicle });
  };

  const handleViewDetails = (driver) => {
    const vehicle = vehicles?.find((v) => v.id === driver.vehicle_id);
    MySwal.fire({
      title: `<div class="text-xl font-bold text-slate-800 dark:text-slate-100">Assignment Details</div>`,
      width: "600px",
      html: `
        <div class="text-left mt-4 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div class="grid grid-cols-2 gap-6">
                <div class="col-span-2 md:col-span-1 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
                    <p class="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 mb-2 tracking-widest">Driver Information</p>
                    <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">${driver.driver.name}</h3>
                    <div class="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <p><strong>Phone:</strong> ${driver.driver.phone}</p>
                        <p><strong>Email:</strong> ${driver.driver.email}</p>
                        <p><strong>Status:</strong> <span class="capitalize font-bold ${driver.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}">${driver.status}</span></p>
                    </div>
                </div>

                <div class="col-span-2 md:col-span-1 bg-indigo-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                    <p class="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 mb-2 tracking-widest">Assigned Vehicle</p>
                    ${vehicle ? `
                    <h3 class="text-lg font-mono font-bold text-indigo-700 dark:text-indigo-400">${vehicle.plate_number}</h3>
                    <div class="mt-2 space-y-1 text-sm text-indigo-900/70 dark:text-indigo-200/70">
                        <p><strong>Model:</strong> ${vehicle.model}</p>
                        <p><strong>Status:</strong> <span class="capitalize">${vehicle.status}</span></p>
                    </div>
                    ` : '<p class="text-slate-500 dark:text-slate-400 italic mt-2">Not Assigned</p>'}
                </div>
            </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: "Dismiss",
      confirmButtonColor: "#1e293b",
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      customClass: {
        popup: "rounded-3xl shadow-2xl",
        confirmButton: "px-8 py-2 rounded-xl font-bold",
        title: "dark:text-white",
      },
    });
  };

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    return drivers.filter(d => {
        const vehicle = vehicles?.find(v => v.id === d.vehicle_id);
        return (
            d.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.driver?.phone?.includes(searchTerm) ||
            vehicle?.plate_number?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
  }, [drivers, vehicles, searchTerm]);

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm p-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl mb-6"></div>
        <div className="border-t dark:border-slate-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3"></div>
          </div>
          <div className="border dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="h-12 bg-slate-200 dark:bg-slate-700/50"></div>
            <div className="p-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loadingDrivers || loadingVehicles) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
              <SkeletonLoader />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Driver Assignment</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage driver and vehicle pairings.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Assign a Driver</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Driver</option>
                    {drivers?.map((d) => (
                      <option key={d.id} value={d.driver_user_id}>
                        {d.driver?.name} ({d.driver?.phone})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate_number} - {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAssign}
                  disabled={assignMutation.isLoading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignMutation.isLoading ? "Assigning..." : <><LinkIcon size={18} /> Assign Driver</>}
                </button>
              </div>

              <div className="px-6 pb-6">
                <div className="border-t dark:border-slate-700 pt-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Current Assignments</h3>
                    <div className="relative max-w-xs w-full">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search size={18} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search drivers..."
                        className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto border dark:border-slate-700 rounded-xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
                        <tr>
                          <th className="px-6 py-4">Driver Name</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4">Assigned Vehicle</th>
                          <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredDrivers.map((d) => {
                          const vehicle = vehicles?.find((v) => v.id === d.vehicle_id);
                          return (
                            <tr key={d.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-700/50 transition-colors group">
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">{d.driver?.name}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{d.driver?.phone}</td>
                              <td className="px-6 py-4">
                                {vehicle ? (
                                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                                    {vehicle.plate_number}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 italic">Not Assigned</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleViewDetails(d)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredDrivers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                              No drivers found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </div>
  );
};

export default AssignDriver;