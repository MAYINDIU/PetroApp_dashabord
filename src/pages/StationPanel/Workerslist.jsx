import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
  Eye, Plus, Search, Loader2, X, Save, 
  ShieldCheck, UserCircle, Phone, Mail, Edit3, Trash2, Building2, Briefcase
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- WORKER MODAL ---
const WorkerModal = ({ isOpen, closeModal, worker, branches, onSubmit, isLoading, mode }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {mode === 'add' ? <Plus className="text-violet-500" /> : mode === 'view' ? <Eye className="text-violet-500" /> : <Edit3 className="text-amber-500" />}
                    {mode === 'add' ? 'Register Worker' : mode === 'view' ? 'Worker Profile' : 'Edit Worker'}
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
                      <input name="name" defaultValue={worker?.name} disabled={mode === 'view'} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Phone Number</label>
                      <input name="phone" defaultValue={worker?.phone} disabled={mode === 'view'} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Email Address</label>
                    <input name="email" type="email" defaultValue={worker?.email} disabled={mode === 'view'} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Assign Branch</label>
                      <select name="station_branch_id" defaultValue={worker?.station_branch_id} disabled={mode === 'view'} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white appearance-none">
                        <option value="">Select Branch</option>
                        {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">System Role</label>
                      <select name="role" defaultValue={worker?.role || 'operator'} disabled={mode === 'view'} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white appearance-none">
                        <option value="operator">Operator</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Status</label>
                    <select name="status" defaultValue={worker?.status || 'active'} disabled={mode === 'view'} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white appearance-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {mode !== 'view' && (
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                      <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {mode === 'add' ? 'Confirm' : 'Update'}</>}
                      </button>
                    </div>
                  )}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- MAIN PAGE ---
const Workerslist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/workers";
  const BRANCH_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/branches";

  // Fetch Workers
  const { data: workersData, isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await axios.get(BASE_URL, config);
      return res.data.data;
    },
  });

  // Fetch Branches for the Dropdown
  const { data: branchesData } = useQuery({
    queryKey: ["branches-minimal"],
    queryFn: async () => {
      const res = await axios.get(BRANCH_URL, config);
      return res.data.data.data; // Matches your branches API structure
    },
  });

  // Create/Update Mutation
  const workerMutation = useMutation({
    mutationFn: (data) => {
      if (modalMode === 'add') return axios.post(BASE_URL, data, config);
      return axios.patch(`${BASE_URL}/${selectedWorker.id}`, data, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workers"]);
      toast.success(`Worker ${modalMode === 'add' ? 'Registered' : 'Updated'}!`);
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Operation failed"),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${BASE_URL}/${id}`, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["workers"]);
      Swal.fire("Deleted!", "Worker record removed.", "success");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    workerMutation.mutate(data);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Worker?",
      text: "This worker will no longer have system access.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete"
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const openModal = (mode, worker = null) => {
    setModalMode(mode);
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const filtered = workersData?.data?.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.phone.includes(searchTerm)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-inter">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-extrabold tracking-tight">All Workers</h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                   <Briefcase size={14} className="text-violet-500" /> Operational Staff
                </div>
              </div>
              <button onClick={() => openModal('add')} className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all font-semibold">
                <Plus size={20} /> <span>Add Worker</span>
              </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 flex justify-between items-center">
              <div className="relative max-w-md w-full">
                <input type="text" placeholder="Search by name or phone..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
              </div>
              <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total Crew: {filtered?.length || 0}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-auto w-full dark:text-slate-300">
                  <thead className="text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left">Worker Name</th>
                      <th className="px-6 py-4 text-left">Contact Info</th>
                      <th className="px-6 py-4 text-left">Branch</th>
                      <th className="px-6 py-4 text-left">Role</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {isLoading ? (
                      <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={32} /></td></tr>
                    ) : filtered?.map(worker => (
                      <tr key={worker.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 border border-violet-100 dark:border-violet-500/20"><UserCircle size={18} /></div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{worker.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><Phone size={12} /> {worker.phone}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400"><Mail size={12} /> {worker.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Building2 size={14} className="text-violet-400" /> {worker.branch?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{worker.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${worker.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openModal('view', worker)} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"><Eye size={16} /></button>
                          <button onClick={() => openModal('edit', worker)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(worker.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
      <WorkerModal 
        isOpen={isModalOpen} 
        closeModal={() => setIsModalOpen(false)} 
        worker={selectedWorker} 
        branches={branchesData}
        onSubmit={handleSubmit} 
        isLoading={workerMutation.isPending} 
        mode={modalMode} 
      />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default Workerslist;