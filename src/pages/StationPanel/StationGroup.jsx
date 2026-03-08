import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import { 
  Eye, Plus, LayoutGrid, Search, 
  Loader2, X, Save, ShieldCheck, Calendar, Hash
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- VIEW DETAILS MODAL (READ-ONLY) ---
const ViewGroupModal = ({ isOpen, closeModal, group }) => {
  if (!group) return null;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl transition-all border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Eye size={20} className="text-violet-500" /> Group Information
                  </h3>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-5">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Group Name</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-white">{group.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Code</p>
                      <p className="font-mono font-bold text-violet-600">{group.code}</p>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${group.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {group.status}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Hash size={12}/> Station User ID</span>
                      <span className="font-semibold">{group.station_user_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={12}/> Created On</span>
                      <span className="font-semibold">{new Date(group.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} className="w-full mt-8 bg-slate-800 dark:bg-slate-700 text-white font-bold py-3 rounded-2xl hover:bg-slate-900 transition-all">Close</button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- ADD GROUP MODAL (FORM) ---
const AddGroupModal = ({ isOpen, closeModal, onSubmit, isLoading }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translateY-4" enterTo="opacity-100 scale-100 translateY-0" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100 translateY-0" leaveTo="opacity-0 scale-95 translateY-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl transition-all border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white">Create Group</Dialog.Title>
                    <p className="text-sm text-slate-500 mt-1">Add a new operational shift.</p>
                  </div>
                  <button onClick={closeModal} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Group Name</label>
                    <input name="name" required placeholder="e.g. Shift A" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Group Code</label>
                    <input name="code" required placeholder="e.g. SHIFT-A" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Status</label>
                    <select name="status" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white appearance-none cursor-pointer">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save</>}
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

// --- MAIN PAGE ---
const StationGroup = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1";

  const { data: groupsData, isLoading } = useQuery({
    queryKey: ["stationGroups"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/station/groups`, config);
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newGroup) => axios.post(`${BASE_URL}/station/groups`, newGroup, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["stationGroups"]);
      toast.success("Group Created Successfully!");
      setIsAddOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error creating group"),
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    addMutation.mutate(data);
  };

  const handleOpenView = (group) => {
    setSelectedGroup(group);
    setIsViewOpen(true);
  };

  const filtered = groupsData?.data?.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-extrabold tracking-tight">Station Groups</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
                   <ShieldCheck size={14} className="text-emerald-500" /> Authorized Station Access
                </div>
              </div>
              <button onClick={() => setIsAddOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-100 font-semibold">
                <Plus size={20} /> <span>Create Group</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
              <div className="relative max-w-md">
                <input type="text" placeholder="Filter groups..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-auto w-full dark:text-slate-300">
                  <thead className="text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left">Group Identity</th>
                      <th className="px-6 py-4 text-left">Code</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                    {isLoading ? (
                      <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={32} /></td></tr>
                    ) : filtered?.map(group => (
                      <tr key={group.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 border border-violet-100 dark:border-violet-500/20"><LayoutGrid size={18} /></div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{group.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-[11px] font-bold font-mono">{group.code}</span></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${group.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            <span className={`w-1 h-1 rounded-full ${group.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} /> {group.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleOpenView(group)} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-100 transition-all border border-transparent hover:border-violet-100"><Eye size={18} /></button>
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

      <AddGroupModal isOpen={isAddOpen} closeModal={() => setIsAddOpen(false)} onSubmit={handleAddSubmit} isLoading={addMutation.isPending} />
      <ViewGroupModal isOpen={isViewOpen} closeModal={() => setIsViewOpen(false)} group={selectedGroup} />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default StationGroup;