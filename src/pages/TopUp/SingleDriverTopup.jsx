import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Eye } from "lucide-react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const SingleDriverTopup = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState("form");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    driver_id: "",
    amount: "",
    cash_reference: "",
    note: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch drivers
  const { data } = useQuery({
    queryKey: ["driversList"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers`,
        {
          headers: {
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await res.json();
      return result?.data;
    },
    select: (data) => ({
      ...data,
      users: data?.drivers?.map((d) => d.driver) || [],
    }),
  });

  // Fetch topup history
  const { data: historyData } = useQuery({
    queryKey: ["topupHistory"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/topups`,
        {
          headers: {
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await res.json();
      return result?.data;
    },
  });

  // Mutation
  const topupMutation = useMutation({
    mutationFn: async (payload) => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers/${payload.driver_id}/topup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: payload.amount,
            note: payload.note,
            cash_reference: payload.cash_reference,
          }),
        }
      );
      const result = await res.json();
      if (!result.success) throw result;
      return result;
    },
    onSuccess: (res, variables) => {
      Swal.fire({
        icon: "success",
        title: "Top-up Successful",
        text: `BDT ${variables.amount} has been credited to driver.`,
        confirmButtonColor: "#2563eb",
      });

      // Reset form
      setFormData({
        driver_id: "",
        amount: "",
        cash_reference: "",
        note: "",
      });

      // Refetch history
      queryClient.invalidateQueries(["topupHistory"]);

      // Filter datatable automatically by mobile
      const driver = data?.users?.find((d) => d.id === variables.driver_id);
      if (driver) setSearchTerm(driver.phone);
    },
    onError: (error) => {
      const errorMessage = error?.errors
        ? Object.values(error.errors).flat().join(" ")
        : error?.message || "Something went wrong!";
      Swal.fire({
        icon: "error",
        title: "Top-up Failed",
        text: errorMessage,
        confirmButtonColor: "#2563eb",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    topupMutation.mutate(formData);
  };

  // Modal
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
            ${tx.driver_name}
            <div style="font-size:12px; opacity:.7">${tx.driver_phone}</div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px">
            <span><strong>Amount</strong></span>
            <span style="font-weight:bold; color:#2563eb">
              ${tx.amount} BDT
            </span>
          </div>
          <div style="margin-bottom:8px">
            <strong>Reference:</strong><br/>
            <span style="font-family:monospace; font-size:12px">
              ${tx.cash_reference}
            </span>
          </div>
          <div style="margin-bottom:8px">
            <strong>Date:</strong><br/>
            ${tx.date_time}
          </div>
          <div style="margin-top:12px; padding:10px; border-radius:8px; background:${
            isDark ? "#334155" : "#f1f5f9"
          }">
            <strong>Note:</strong><br/>
            ${tx.note || "-"}
          </div>
        </div>
      `,
      confirmButtonColor: "#2563eb",
      width: 520,
    });
  };

  // Filter transactions
  const transactions =
    historyData?.transactions?.filter(
      (tx) =>
        tx.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.driver_phone?.includes(searchTerm) ||
        tx.cash_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setView("form")}
              className={`px-4 py-2 rounded-lg ${
                view === "form"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border"
              }`}
            >
              Process Top-up
            </button>
            <button
              onClick={() => setView("history")}
              className={`px-4 py-2 rounded-lg ${
                view === "history"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border"
              }`}
            >
              Top-up Summary
            </button>
          </div>

          {/* FORM */}
          {view === "form" ? (
            <div className="flex justify-center">
              <div className="w-full lg:w-1/2 bg-white dark:bg-slate-800 p-8 rounded-xl shadow border dark:border-slate-700">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-6">
                  Process Driver Top-up
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      name="driver_id"
                      value={formData.driver_id}
                      onChange={handleInputChange}
                      className="p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                      required
                    >
                      <option value="">Choose Driver...</option>
                      {data?.users?.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone})
                        </option>
                      ))}
                    </select>
                    <input
                      name="amount"
                      type="number"
                      placeholder="Amount (BDT)"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                      required
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="cash_reference"
                      type="text"
                      placeholder="Reference ID"
                      value={formData.cash_reference}
                      onChange={handleInputChange}
                      className="p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                      required
                    />
                    <textarea
                      name="note"
                      rows="3"
                      placeholder="Enter transaction note..."
                      value={formData.note}
                      onChange={handleInputChange}
                      className="p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
                  >
                    {topupMutation.isLoading ? "Processing..." : "Authorize Top-up"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* HISTORY */
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow border dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Search by driver, mobile, reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 w-full"
                />
              </div>
              <div className="overflow-auto">
                <table className="min-w-[800px] w-full text-sm">
                  <thead className="bg-blue-700 text-white text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Driver</th>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.tx_id}
                        className="border-t dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700"
                      >
                        <td className="px-6 py-4">{tx.date_time}</td>
                        <td className="px-6 py-4">
                          {tx.driver_name}
                          <div className="text-xs opacity-60">{tx.driver_phone}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{tx.cash_reference}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600">{tx.amount} BDT</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewDetails(tx)}
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SingleDriverTopup;