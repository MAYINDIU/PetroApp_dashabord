import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Eye } from "lucide-react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AdminTopup = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    owner_id: "",
    amount: "",
    cash_reference: "",
    note: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Fetch Bus Owners - targeting the correct nested path
  const { data: owners = [] } = useQuery({
    queryKey: ["ownersList"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users?role=bus_owner`,
        {
          headers: { 
            Authorization: `Bearer ${empData?.token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return res.json();
    },
    // Fix: Access res.data.users to get the array
    select: (res) => res?.data?.users || [],
  });

  // 2. Mutation for Owner Wallet
  const topupMutation = useMutation({
    mutationFn: async (payload) => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(
        `https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/owners/${payload.owner_id}/wallet/topup`,
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
      if (!result.success) throw new Error(result.message || "Top-up failed");
      return result;
    },
    onSuccess: () => {
      Swal.fire({ icon: "success", title: "Success", text: "Owner wallet updated." });
      setFormData({ owner_id: "", amount: "", cash_reference: "", note: "" });
      queryClient.invalidateQueries(["ownersList"]);
    },
    onError: (error) => {
      Swal.fire({ icon: "error", title: "Failed", text: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    topupMutation.mutate(formData);
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-center">
            <div className="w-full lg:w-1/2 bg-white dark:bg-slate-800 p-8 rounded-xl shadow border">
              <h2 className="text-xl font-semibold mb-6 text-blue-700">Process Owner Top-up</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <select
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700"
                  required
                >
                  <option value="">Select Bus Owner...</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.phone})
                    </option>
                  ))}
                </select>
                <input
                  name="amount" type="number" placeholder="Amount (BDT)"
                  value={formData.amount} onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700" required
                />
                <input
                  name="cash_reference" type="text" placeholder="Reference ID"
                  value={formData.cash_reference} onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700" required
                />
                <textarea
                  name="note" placeholder="Transaction note..."
                  value={formData.note} onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700"
                />
                <button
                  type="submit" disabled={topupMutation.isPending}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700"
                >
                  {topupMutation.isPending ? "Processing..." : "Authorize Top-up"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTopup;