import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, Search, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const SettelementListAdmin = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const empData = JSON.parse(localStorage.getItem("empData"));

  const fetchSettlements = async () => {
    const res = await axios.get(
      `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/settlements`,
      { headers: { Authorization: `Bearer ${empData?.token}` } }
    );
    return res.data.data.settlements;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["settlements"],
    queryFn: fetchSettlements,
  });

  // Mutation to mark settlement as paid
  const markPaidMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.patch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/settlements/${id}/mark-paid`,
        { note: "paid" },
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Settlement marked as paid successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries(["settlements"]);
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update status.",
      });
    },
  });

  // Mutation to approve settlement
  const approveMutation = useMutation({
    mutationFn: async ({ id, amount, note }) => {
      const res = await axios.patch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/settlements/${id}/approve`,
        { approved_amount: amount, note: note },
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      Swal.fire("Success", "Settlement approved successfully.", "success");
      queryClient.invalidateQueries(["settlements"]);
    },
    onError: (error) => {
      Swal.fire("Error", error.response?.data?.message || "Failed to approve.", "error");
    },
  });

  // Mutation to reject settlement
  const rejectMutation = useMutation({
    mutationFn: async ({ id, note }) => {
      const res = await axios.patch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/settlements/${id}/reject`,
        { note: note },
        { headers: { Authorization: `Bearer ${empData?.token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      Swal.fire("Success", "Settlement rejected.", "success");
      queryClient.invalidateQueries(["settlements"]);
    },
    onError: (error) => {
      Swal.fire("Error", error.response?.data?.message || "Failed to reject.", "error");
    },
  });

  const handleApprove = async (item) => {
    const { value: formValues } = await Swal.fire({
      title: "Approve Settlement",
      html: `
        <div class="text-left">
          <label class="block text-sm font-medium text-gray-700 mb-1">Approved Amount</label>
          <input id="swal-input-amount" class="swal2-input w-full m-0 mb-4" placeholder="Amount" type="number" value="${item.requested_amount}">
          <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea id="swal-input-note" class="swal2-textarea w-full m-0" placeholder="Approval note">approved</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Confirm Approve",
      confirmButtonColor: "#10B981",
      preConfirm: () => {
        return {
          amount: document.getElementById("swal-input-amount").value,
          note: document.getElementById("swal-input-note").value,
        };
      },
    });

    if (formValues) {
      approveMutation.mutate({ id: item.id, amount: formValues.amount, note: formValues.note });
    }
  };

  const handleReject = async (item) => {
    const { value: note } = await Swal.fire({
      title: "Reject Settlement",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputValue: "rejected",
      showCancelButton: true,
      confirmButtonText: "Confirm Reject",
      confirmButtonColor: "#EF4444",
    });

    if (note) {
      rejectMutation.mutate({ id: item.id, note });
    }
  };

  const handleViewDetails = (item) => {
    const isApproved = item.status === "approved";
    const isPending = item.status === "pending";
    
    Swal.fire({
      title: `<h3 class="text-xl font-bold text-slate-800">Settlement Details</h3>`,
      html: `
        <div class="text-left space-y-4 font-sans">
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Station Information</h4>
            <div class="flex justify-between mb-1">
              <span class="text-slate-600 text-sm">Name:</span>
              <span class="font-semibold text-slate-800 text-sm">${item.station?.name || "N/A"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600 text-sm">Phone:</span>
              <span class="font-medium text-slate-800 text-sm">${item.station?.phone || "N/A"}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 class="text-xs font-bold text-blue-500 uppercase mb-1">Amount</h4>
              <p class="text-lg font-bold text-blue-700">${Number(item.requested_amount).toLocaleString()} BDT</p>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <h4 class="text-xs font-bold text-slate-500 uppercase mb-1">Status</h4>
              <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${
                item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                item.status === 'reject' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }">
                ${item.status}
              </span>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Period & Date</h4>
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
      showConfirmButton: isApproved || isPending,
      showDenyButton: isPending,
      confirmButtonText: isApproved ? "Mark as Paid" : "Approve",
      denyButtonText: "Reject",
      confirmButtonColor: "#10B981", // Emerald for positive actions
      denyButtonColor: "#EF4444",    // Red for reject
      cancelButtonText: "Close",
      cancelButtonColor: "#64748b",
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (isApproved) markPaidMutation.mutate(item.id);
        else if (isPending) handleApprove(item);
      } else if (result.isDenied && isPending) {
        handleReject(item);
      }
    });
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = statusFilter === "all" ? data : data.filter((item) => item.status === statusFilter);
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.station?.name?.toLowerCase().includes(lowerTerm) ||
        item.station?.phone?.includes(lowerTerm) ||
        String(item.requested_amount).includes(lowerTerm)
      );
    }
    return result;
  }, [data, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      approved: "bg-blue-100 text-blue-700 border-blue-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      reject: "bg-red-100 text-red-700 border-red-200",
    };
    
    const icons = {
      paid: <CheckCircle size={12} className="mr-1" />,
      approved: <CheckCircle size={12} className="mr-1" />,
      pending: <Clock size={12} className="mr-1" />,
      reject: <XCircle size={12} className="mr-1" />,
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
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settlements</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage and track station settlement requests
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search station, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
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

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Station Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {isLoading ? (
                    <tr><td colSpan="5" className="p-10 text-center text-slate-500">Loading settlements...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="5" className="p-10 text-center text-slate-500">No settlements found.</td></tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">
                              {item.station?.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-white text-sm">{item.station?.name}</div>
                              <div className="text-xs text-slate-500">{item.station?.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <Clock size={14} className="mr-2 text-slate-400" />
                            {new Date(item.period_start).toLocaleDateString('en-CA')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-mono font-bold text-slate-800 dark:text-white">
                            {Number(item.requested_amount).toLocaleString()} <span className="text-xs text-slate-400 font-sans">BDT</span>
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

export default SettelementListAdmin;
