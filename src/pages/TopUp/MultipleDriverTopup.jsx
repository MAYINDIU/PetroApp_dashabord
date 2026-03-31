import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Trash2, Plus, Wallet, History, Eye, Settings, Zap } from "lucide-react";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const MultipleDriverTopup = () => {
  const queryClient = useQueryClient();
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [amount, setAmount] = useState("");
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [meta] = useState({
    note: "owner cash distribution",
    cash_reference: "RCPT-BULK-001",
  });

  // Fetch Drivers
  const { data: driversData } = useQuery({
    queryKey: ["ownerDrivers"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers`,
        {
          headers: { Authorization: `Bearer ${empData?.token}` },
        }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to fetch drivers");
      return result.data;
    },
  });

  const drivers = useMemo(
    () => driversData?.drivers?.map((d) => d.driver) || [],
    [driversData]
  );

  // Fetch Owner's Driver Topups
  const { data: topupData, isLoading: isLoadingTopups } = useQuery({
    queryKey: ["ownerTopups"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/topups`,
        {
          headers: { Authorization: `Bearer ${empData?.token}` },
        }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to fetch topups");
      return result.data;
    },
    enabled: isHistoryView,
  });

  const totalAmount = selectedDrivers.reduce(
    (sum, d) => sum + Number(d.amount),
    0
  );

  const addDriverToList = () => {
    if (!selectedDriverId || !amount)
      return Swal.fire("Warning", "Select a driver and enter amount", "warning");
    const driver = drivers.find((d) => String(d.id) === String(selectedDriverId));
    if (selectedDrivers.find((d) => d.driver_id === selectedDriverId))
      return Swal.fire("Error", "Driver already in list", "error");

    setSelectedDrivers([
      ...selectedDrivers,
      { driver_id: selectedDriverId, amount, name: driver.name, phone: driver.phone },
    ]);
    setSelectedDriverId("");
    setAmount("");
  };

  const removeDriver = (id) =>
    setSelectedDrivers(selectedDrivers.filter((d) => d.driver_id !== id));

  const bulkMutation = useMutation({
    mutationFn: async (payload) => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const response = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers/bulk-topup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!result.success) throw result;
      return result;
    },
    onSuccess: () => {
      Swal.fire("Success", "Bulk transaction successful!", "success");
      setSelectedDrivers([]);
      queryClient.invalidateQueries(["ownerTopups"]);
    },
    onError: (error) => {
      const errorMessage = error?.errors
        ? Object.values(error.errors).flat().join(" ")
        : error.message || "Transaction failed";
      Swal.fire("Error", errorMessage, "error");
    },
  });

  // Mutation for Setting Daily Limit
  const limitMutation = useMutation({
    mutationFn: async (limit) => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const response = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers/limit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            daily_limit: Number(limit),
            apply_to_all: true,
          }),
        }
      );
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Failed to set limit");
      return result;
    },
    onSuccess: () => {
      Swal.fire("Success", "Daily limit applied to all drivers.", "success");
    },
    onError: (error) => {
      Swal.fire("Error", error.message, "error");
    },
  });

  const handleSetGlobalLimit = async () => {
    const { value: limit } = await Swal.fire({
      title: "Set Daily Limit",
      text: "Enter the daily fuel limit to be applied to ALL drivers.",
      input: "number",
      inputPlaceholder: "Enter amount (e.g. 10000)",
      showCancelButton: true,
      confirmButtonText: "Apply to All",
      confirmButtonColor: "#4f46e5",
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return "Please enter a valid amount!";
        }
      },
    });

    if (limit) {
      Swal.fire({
        title: "Are you sure?",
        text: `This will set a daily limit of ${limit} BDT for every driver in your fleet.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Apply",
      }).then((result) => {
        if (result.isConfirmed) {
          limitMutation.mutate(limit);
        }
      });
    }
  };

  // Mutation for Bulk Refill
  const refillMutation = useMutation({
    mutationFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const response = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers/bulk-refill`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note: "Daily auto refill",
            cash_reference: "DAILY-REFILL-001",
          }),
        }
      );
      const result = await response.json();
      if (!result.success) throw result;
      return result;
    },
    onSuccess: () => {
      Swal.fire("Success", "Bulk refill successful!", "success");
      queryClient.invalidateQueries(["ownerTopups"]);
    },
    onError: (error) => {
      const errorMessage = error?.errors
        ? Object.values(error.errors).flat().join(" ")
        : error.message || "Bulk refill failed";
      Swal.fire("Error", errorMessage, "error");
    },
  });

  const handleBulkRefill = () => {
    Swal.fire({
      title: "Run Bulk Refill?",
      text: "This will automatically distribute funds to all eligible drivers based on their set daily limits. Continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Refill All",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4f46e5",
    }).then((result) => {
      if (result.isConfirmed) {
        refillMutation.mutate();
      }
    });
  };

  // Filter topups by searchTerm
  const filteredTopups =
    topupData?.transactions?.filter(
      (tx) =>
        tx.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.driver_phone?.includes(searchTerm) ||
        tx.cash_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleViewDetails = (tx) => {
    const isDark = document.documentElement.classList.contains("dark");
    Swal.fire({
      background: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#f1f5f9" : "#1e293b",
      title: "Transaction Details",
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.8">
          <div style="margin-bottom:10px">
            <strong>Driver:</strong><br/>
            ${tx.driver_name} (${tx.driver_phone})
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px">
            <span><strong>Amount</strong></span>
            <span style="font-weight:bold; color:#2563eb">${tx.amount} BDT</span>
          </div>
          <div style="margin-bottom:8px">
            <strong>Reference:</strong><br/>
            <span style="font-family:monospace; font-size:12px">${tx.cash_reference}</span>
          </div>
          <div style="margin-bottom:8px">
            <strong>Date:</strong><br/>${tx.date_time}
          </div>
          <div style="margin-top:12px; padding:10px; border-radius:8px; background:${
            isDark ? "#334155" : "#f1f5f9"
          }">
            <strong>Note:</strong><br/>${tx.note || "-"}
          </div>
        </div>
      `,
      confirmButtonColor: "#2563eb",
      width: 520,
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Bulk Driver Top-up
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Distribute funds to multiple drivers at once.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkRefill}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    <Zap size={16} />
                    Bulk Refill
                  </button>
                  <button
                    onClick={handleSetGlobalLimit}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Set Global Limit
                  </button>
                  <button
                    onClick={() => setIsHistoryView(!isHistoryView)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                      isHistoryView
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <History size={16} />
                    {isHistoryView ? "Top-up Form" : "Topup History"}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {!isHistoryView && (
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {!isHistoryView ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount (BDT)"
                        className="flex-1 p-2.5 rounded-xl border dark:bg-slate-700 dark:border-slate-600"
                      />
                      <button
                        onClick={addDriverToList}
                        className="bg-indigo-600 text-white px-6 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Plus size={18} /> Add
                      </button>
                    </div>

                    {/* Selected Drivers Table */}
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-700 text-white">
                          <tr>
                            <th className="p-3 text-left">Driver Name</th>
                            <th className="p-3 text-right">Amount (BDT)</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDrivers.map((d) => (
                            <tr key={d.driver_id} className="border-t dark:border-slate-700">
                              <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{d.name}</td>
                              <td className="p-3 text-right tabular-nums">{d.amount}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => removeDriver(d.driver_id)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {selectedDrivers.length === 0 && (
                            <tr>
                              <td colSpan="3" className="p-4 text-center text-slate-500 dark:text-slate-400">
                                No drivers added yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-blue-50 dark:bg-slate-700 font-bold border-t">
                          <tr>
                            <td className="p-3">Total</td>
                            <td className="p-3 text-right tabular-nums">{totalAmount}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <button
                      onClick={() =>
                        bulkMutation.mutate({
                          items: selectedDrivers.map(({ driver_id, amount }) => ({ driver_id, amount })),
                          ...meta,
                        })
                      }
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                      disabled={selectedDrivers.length === 0}
                    >
                      Process Bulk Distribution
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Search by driver, mobile, reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-4 p-2.5 w-full rounded-xl border dark:bg-slate-700 dark:border-slate-600"
                    />
                    <div className="border rounded-xl overflow-hidden">
                      {isLoadingTopups ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                          Loading transactions...
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-blue-700 text-white">
                            <tr>
                              <th className="p-3 text-left">Date & Time</th>
                              <th className="p-3 text-left">Driver</th>
                              <th className="p-3 text-left">Reference</th>
                              <th className="p-3 text-right">Amount (BDT)</th>
                              <th className="p-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTopups.map((tx) => (
                              <tr key={tx.tx_id} className="border-t dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700">
                                <td className="p-3 text-slate-700 dark:text-slate-200">{new Date(tx.date_time).toLocaleDateString('en-CA')}</td>
                                <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{tx.driver_name}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">{tx.cash_reference}</td>
                                <td className="p-3 text-right tabular-nums text-blue-600 dark:text-blue-400">{tx.amount}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleViewDetails(tx)}
                                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                  >
                                    <Eye size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {filteredTopups.length === 0 && (
                              <tr>
                                <td colSpan="5" className="p-4 text-center text-slate-500 dark:text-slate-400">
                                  No transactions found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MultipleDriverTopup;