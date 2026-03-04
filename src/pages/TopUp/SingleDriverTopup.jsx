import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const SingleDriverTopup = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        driver_id: "",
        amount: "",
        cash_reference: "",
        note: "cash topup by admin"
    });

    // Helper to update state dynamically
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 1. Fetching drivers
const { data, isLoading } = useQuery({
    queryKey: ['driversList'],
    queryFn: async () => {
        const empData = JSON.parse(localStorage.getItem('empData'));
        const response = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users`, {
            headers: { 
                'Authorization': `Bearer ${empData?.token}`, 
                'Content-Type': 'application/json' 
            }
        });
        const result = await response.json();
        return result?.data;
    },
    // The 'select' property transforms the data into only drivers
    select: (data) => {
        return {
            ...data,
            users: data?.users?.filter(user => user.role === 'driver') || []
        };
    }
});

    // 2. Mutation
    const topupMutation = useMutation({
        mutationFn: async (payload) => {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const response = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/drivers/${payload.driver_id}/topup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${empData?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: payload.amount,
                    note: payload.note,
                    cash_reference: payload.cash_reference
                })
            });
            const result = await response.json();
            if (!result.success) {
                throw result;
            }
            return result;
        },
        onSuccess: () => {
            toast.success("Transaction recorded successfully.");
            setFormData({ driver_id: "", amount: "", cash_reference: "", note: "cash topup by admin" });
            queryClient.invalidateQueries(['driversList']);
        },
        onError: (error) => {
            const errorMessage = error?.errors ? Object.values(error.errors).flat().join(' ') : error.message || "Transaction failed";
            Swal.fire({
                icon: 'error',
                title: 'Top-up Failed',
                text: errorMessage,
                confirmButtonColor: '#1e293b',
            });
        }
    });

    const handleConfirm = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Authorize Transaction',
            text: `Confirm top-up of ${formData.amount} BDT for selected driver?`,
            icon: 'info',
            confirmButtonColor: '#1e293b',
            showCancelButton: true
        }).then((res) => {
            if (res.isConfirmed) topupMutation.mutate(formData);
        });
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="p-8 max-w-3xl mx-auto w-full">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">Process Driver Top-up</h2>
                        <form onSubmit={handleConfirm} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Select Driver</label>
                                <select name="driver_id" className="w-full p-2.5 border rounded-lg" value={formData.driver_id} onChange={handleInputChange}>
                                    <option value="">Choose a driver...</option>
                                    {data?.users?.map(d => <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="amount" type="number" placeholder="Amount (BDT)" value={formData.amount} className="p-2.5 border rounded-lg" onChange={handleInputChange} />
                                <input name="cash_reference" type="text" placeholder="Reference ID" value={formData.cash_reference} className="p-2.5 border rounded-lg" onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Note</label>
                                <input name="note" type="text" value={formData.note} className="w-full p-2.5 border rounded-lg" onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 transition">
                                {topupMutation.isLoading ? "Processing..." : "Authorize Top-up"}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SingleDriverTopup;