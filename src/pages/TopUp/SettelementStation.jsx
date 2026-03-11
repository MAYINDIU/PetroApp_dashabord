import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, Search, CheckCircle, Clock, XCircle, Plus } from "lucide-react";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const SettelementStation = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const empData = JSON.parse(localStorage.getItem("empData"));

  const fetchSettlements = async () => {
    const res = await axios.get(
      `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/settlements`,
      { headers: { Authorization: `Bearer ${empData?.token}` } }
    );
    return res.data.data.settlements;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["stationSettlements"], // Use a unique query key
    queryFn: fetchSettlements,
  });

  // Mutation to create a new settlement request
  const createSettlementMutation = useMutation({
    mutationFn: async ({ period_start, period_end }) => {
      const res = await axios.post(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/settlements`,
        { period_start, period_end },
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Settlement request created successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries(["stationSettlements"]);
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create request.",
      });
    },
  });

  // Handler to open modal for creating a request
  const handleRequestSettlement = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Request New Settlement",
      html: `
        <div class="text-left space-y-4">
          <div>
            <label for="swal-start-date" class="block text-sm font-medium text-gray-700 mb-1">Period Start Date</label>
            <input id="swal-start-date" class="swal2-input w-full m-0" type="date">
          </div>
          <div>
            <label for="swal-end-date" class="block text-sm font-medium text-gray-700 mb-1">Period End Date</label>
            <input id="swal-end-date" class="swal2-input w-full m-0" type="date">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Submit Request",
      confirmButtonColor: "#3b82f6",
      preConfirm: () => {
        const period_start = document.getElementById("swal-start-date").value;
        const period_end = document.getElementById("swal-end-date").value;
        if (!period_start || !period_end) {
          Swal.showValidationMessage(`Please select both start and end dates`);
        }
        return { period_start, period_end };
      },
    });

    if (formValues) {
      createSettlementMutation.mutate(formValues);
    }
  };

  const handleViewDetails = (item) => {
    Swal.fire({
      title: `<h3 class="text-xl font-bold text-slate-800">Settlement Details</h3>`,
      html: `
        <div class="text-left space-y-4 font-sans">
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 class="text-xs font-bold text-blue-500 uppercase mb-1">Requested Amount</h4>
              <p class="text-lg font-bold text-blue-700">${Number(item.requested_amount).toLocaleString()} BDT</p>
            </div>
            <div class="p-3 ${item.approved_amount ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'} rounded-lg">
              <h4 class="text-xs font-bold ${item.approved_amount ? 'text-emerald-500' : 'text-slate-500'} uppercase mb-1">Approved Amount</h4>
              <p class="text-lg font-bold ${item.approved_amount ? 'text-emerald-700' : 'text-slate-700'}">
                ${item.approved_amount ? Number(item.approved_amount).toLocaleString() + ' BDT' : 'N/A'}
              </p>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Details</h4>
            <div class="flex justify-between mb-1">
              <span class="text-slate-600 text-sm">Status:</span>
              <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${
                item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }">
                ${item.status}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600 text-sm">Note:</span>
              <span class="font-medium text-slate-800 text-sm">${item.note || "N/A"}</span>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Period</h4>
            <div class="flex justify-between mb-1">
              <span class="text-slate-600 text-sm">Start Date:</span>
              <span class="font-medium text-slate-800 text-sm">${new Date(item.period_start).toLocaleDateString('en-CA')}</span>
            </div>
            ${item.period_end ? `
            <div class="flex justify-between">
              <span class="text-slate-600 text-sm">End Date:</span>
              <span class="font-medium text-slate-800 text-sm">${new Date(item.period_end).toLocaleDateString('en-CA')}</span>
            </div>` : ''}
          </div>
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Close",
      cancelButtonColor: "#64748b",
    });
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = statusFilter === "all" ? data : data.filter((item) => item.status === statusFilter);
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      // Station users don't search by station name/phone, just amount or maybe date
      result = result.filter(item => 
        String(item.requested_amount).includes(lowerTerm) ||
        new Date(item.period_start).toLocaleDateString('en-CA').includes(lowerTerm)
      );
    }
    return result;
  }, [data, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      approved: "bg-blue-100 text-blue-700 border-blue-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    
    const icons = {
      paid: <CheckCircle size={12} className="mr-1" />,
      approved: <CheckCircle size={12} className="mr-1" />,
      pending: <Clock size={12} className="mr-1" />,
      rejected: <XCircle size={12} className="mr-1" />,
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {icons[status]} {status}
      </span>
    );
  };

  return (
    <div className={`${darkMode ? "dark" : ""} flex h-screen overflow-hidden`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Settlements</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Request and track your settlement history
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 6. Add "Request Settlement" button */}
              <button
                onClick={handleRequestSettlement}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition duration-300"
              >
                <Plus size={18} className="mr-2" />
                Request Settlement
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "paid", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                    statusFilter === status
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none ring-2 ring-blue-600 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by amount, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Request Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Requested Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Approved Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {isLoading ? (
                    <tr><td colSpan="6" className="p-10 text-center text-slate-500">Loading settlements...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="6" className="p-10 text-center text-slate-500">No settlements found.</td></tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-800 dark:text-white">
                            {new Date(item.created_at).toLocaleDateString('en-CA')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <Clock size={14} className="mr-2 text-slate-400" />
                            {`${new Date(item.period_start).toLocaleDateString('en-CA')} - ${new Date(item.period_end).toLocaleDateString('en-CA')}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-mono font-bold text-slate-800 dark:text-white">
                            {Number(item.requested_amount).toLocaleString()} <span className="text-xs text-slate-400 font-sans">BDT</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.approved_amount ? `${Number(item.approved_amount).toLocaleString()} BDT` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleViewDetails(item)}
                            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200"
                            title="View Details"
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
        </main>
      </div>
    </div>
  );
};

export default SettelementStation;
