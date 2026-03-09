import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
  Eye, Search, Loader2, X, Activity, Plus,
  Calendar, MessageCircle, Save, Fuel, Edit3, Trash2
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- 1. DETAILS MODAL ---
const RequestDetailsModal = ({ isOpen, closeModal, request }) => {
  if (!request) return null;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Fuel className="text-violet-500" size={20} /> Request Details
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Current</p>
                      <p className="text-lg font-bold text-slate-700 dark:text-white">৳{request.current_price}</p>
                    </div>
                    <div className="p-4 bg-violet-50 dark:bg-violet-500/10 rounded-2xl border border-violet-100 dark:border-violet-500/20">
                      <p className="text-[10px] font-bold uppercase text-violet-500 tracking-widest mb-1">Requested</p>
                      <p className="text-lg font-bold text-violet-700 dark:text-violet-300">৳{request.requested_price}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1"><Calendar size={12}/> Effective From</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(request.effective_from).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Current Status</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      request.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="p-4 bg-violet-50/50 dark:bg-violet-500/5 rounded-2xl border border-violet-100/50 dark:border-violet-500/10">
                    <p className="text-[10px] font-bold uppercase text-violet-400 tracking-widest mb-1 flex items-center gap-1"><MessageCircle size={10}/> Reason</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{request.reason || 'No reason provided'}"</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Close</button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- 2. EDIT MODAL (PATCH) ---
const EditRequestModal = ({ isOpen, closeModal, request, onSubmit, isLoading }) => {
  if (!request) return null;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-slate-900/60" /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white">Edit Price Request</Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Current Price</label>
                      <input type="number" name="current_price" step="0.01" defaultValue={request.current_price} required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Requested Price</label>
                      <input type="number" name="requested_price" step="0.01" defaultValue={request.requested_price} required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Effective Date</label>
                    <input type="date" name="effective_from" defaultValue={request.effective_from?.split('T')[0]} required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Reason</label>
                    <textarea name="reason" rows="3" defaultValue={request.reason} required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update</>}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- 3. CREATE MODAL ---
const CreateRequestModal = ({ isOpen, closeModal, onSubmit, isLoading }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-slate-900/60 " /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Plus className="text-violet-500" /> New Price Request</Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Current Price</label>
                      <input type="number" name="current_price" step="0.01" required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Requested Price</label>
                      <input type="number" name="requested_price" step="0.01" required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Effective Date</label>
                    <input type="date" name="effective_from" required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Reason</label>
                    <textarea name="reason" rows="3" required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" placeholder="Reason for price update..." />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Submit Request</>}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- MAIN PAGE COMPONENT ---
const ChangefuelPriceRequest = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const queryClient = useQueryClient();
  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/fuel-price-requests";

  // 1. FETCH
  const { data: requests, isLoading } = useQuery({
    queryKey: ["fuel-price-requests"],
    queryFn: async () => {
      const res = await axios.get(BASE_URL, config);
      return res.data.data.data;
    },
  });

  // 2. CREATE (POST)
  const createMutation = useMutation({
    mutationFn: (newRequest) => axios.post(BASE_URL, newRequest, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["fuel-price-requests"]);
      toast.success("Request submitted successfully!");
      setIsCreateOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Submission failed"),
  });

  // 3. UPDATE (PATCH)
  const updateMutation = useMutation({
    mutationFn: (data) => axios.patch(`${BASE_URL}/${selectedRequest.id}`, data, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["fuel-price-requests"]);
      toast.success("Request updated successfully!");
      setIsEditOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  // 4. DELETE (Optional)
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${BASE_URL}/${id}`, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["fuel-price-requests"]);
      Swal.fire("Deleted!", "Request has been removed.", "success");
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(Object.fromEntries(new FormData(e.target)));
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(Object.fromEntries(new FormData(e.target)));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-inter">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
          <div className="sm:flex sm:justify-between sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Price Requests</h1>
              <p className="text-xs text-slate-500 font-medium">Monitoring fuel price adjustments</p>
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="mt-4 sm:mt-0 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-violet-200"><Plus size={18} /> New Request</button>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-auto w-full dark:text-slate-300">
                <thead className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left">Current Price</th>
                    <th className="px-6 py-4 text-left">Requested Price</th>
                    <th className="px-6 py-4 text-left">Effective Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {isLoading ? (
                    <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={30} /></td></tr>
                  ) : requests?.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-sm">৳{req.current_price}</td>
                      <td className="px-6 py-4 font-bold text-violet-600 dark:text-violet-400 text-sm">৳{req.requested_price}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(req.effective_from).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>{req.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"><Eye size={16} /></button>
                        {req.status === 'pending' && (
                          <>
                            <button onClick={() => { setSelectedRequest(req); setIsEditOpen(true); }} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(req.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <CreateRequestModal isOpen={isCreateOpen} closeModal={() => setIsCreateOpen(false)} onSubmit={handleCreateSubmit} isLoading={createMutation.isPending} />
      <EditRequestModal isOpen={isEditOpen} closeModal={() => setIsEditOpen(false)} request={selectedRequest} onSubmit={handleUpdateSubmit} isLoading={updateMutation.isPending} />
      <RequestDetailsModal isOpen={isDetailsOpen} closeModal={() => setIsDetailsOpen(false)} request={selectedRequest} />
      
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default ChangefuelPriceRequest;