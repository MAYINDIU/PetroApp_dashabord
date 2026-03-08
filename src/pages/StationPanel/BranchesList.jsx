import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
  Eye, Plus, Search, Loader2, X, Save, 
  ShieldCheck, MapPin, Hash, Edit3, Trash2, Building2
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- VIEW/EDIT MODAL ---
const BranchModal = ({ isOpen, closeModal, branch, onSubmit, isLoading, mode }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translateY-4" enterTo="opacity-100 scale-100 translateY-0" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100 translateY-0" leaveTo="opacity-0 scale-95 translateY-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {mode === 'add' ? <Plus className="text-violet-500" /> : mode === 'view' ? <Eye className="text-violet-500" /> : <Edit3 className="text-amber-500" />}
                    {mode === 'add' ? 'Create Branch' : mode === 'view' ? 'Branch Details' : 'Edit Branch'}
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Branch Name</label>
                      <input name="name" defaultValue={branch?.name} disabled={mode === 'view'} required placeholder="e.g. Dhaka Main" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Branch Code</label>
                      <input name="code" defaultValue={branch?.code} disabled={mode === 'view'} required placeholder="DHK-01" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white font-mono" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Full Address</label>
                    <textarea name="address" defaultValue={branch?.address} disabled={mode === 'view'} required rows="2" placeholder="Street, Area, City" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white resize-none" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Status</label>
                    <select name="status" defaultValue={branch?.status || 'active'} disabled={mode === 'view'} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white appearance-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {mode !== 'view' && (
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                      <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {mode === 'add' ? 'Save' : 'Update'}</>}
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
const BranchesList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'view', 'edit'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/branches";

  // Fetch Branches
  const { data: branchesData, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await axios.get(BASE_URL, config);
      return res.data.data;
    },
  });

  // Create/Update Mutation
  const branchMutation = useMutation({
    mutationFn: (data) => {
      if (modalMode === 'add') return axios.post(BASE_URL, data, config);
      return axios.patch(`${BASE_URL}/${selectedBranch.id}`, data, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"]);
      toast.success(`Branch ${modalMode === 'add' ? 'Created' : 'Updated'}!`);
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Operation failed"),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${BASE_URL}/${id}`, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"]);
      Swal.fire("Deleted!", "Branch has been removed.", "success");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    branchMutation.mutate(data);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const openModal = (mode, branch = null) => {
    setModalMode(mode);
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const filtered = branchesData?.data?.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-inter">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Header Section */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-extrabold tracking-tight">Station Branches</h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                   <ShieldCheck size={14} className="text-emerald-500" /> Infrastructure Overview
                </div>
              </div>
              <button onClick={() => openModal('add')} className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all font-semibold">
                <Plus size={20} /> <span>New Branch</span>
              </button>
            </div>

            {/* Filter */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
              <div className="relative max-w-md w-full">
                <input type="text" placeholder="Search branch name or code..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-auto w-full dark:text-slate-300">
                  <thead className="text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left">Branch Name</th>
                      <th className="px-6 py-4 text-left">Location</th>
                      <th className="px-6 py-4 text-left">Code</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {isLoading ? (
                      <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={32} /></td></tr>
                    ) : filtered?.map(branch => (
                      <tr key={branch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 border border-violet-100 dark:border-violet-500/20"><Building2 size={18} /></div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{branch.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin size={14} className="text-slate-400" /> {branch.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{branch.code}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${branch.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {branch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openModal('view', branch)} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"><Eye size={16} /></button>
                          <button onClick={() => openModal('edit', branch)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(branch.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
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
      <BranchModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} branch={selectedBranch} onSubmit={handleSubmit} isLoading={branchMutation.isPending} mode={modalMode} />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default BranchesList;