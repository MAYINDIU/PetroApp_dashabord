import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
  Eye, Search, Loader2, X, Activity, Plus,
  Clock, Calendar, User, MessageCircle, Hash, Edit3, Trash2, Save
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- 1. DETAILS MODAL COMPONENT ---
const LogDetailsModal = ({ isOpen, closeModal, log }) => {
  if (!log) return null;
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
                    <Activity className="text-violet-500" size={20} /> Log Specification
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Employee</p>
                      <p className="font-bold text-slate-700 dark:text-white">{log.worker?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1"><Hash size={10}/> Log ID</p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">#{log.id}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1"><Activity size={10}/> Type</p>
                      <p className={`text-xs font-bold uppercase ${log.log_type === 'check_in' ? 'text-emerald-500' : 'text-amber-500'}`}>{log.log_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Timestamp</p>
                    <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-2"><Calendar size={14} className="text-violet-400"/> {new Date(log.logged_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center gap-2"><Clock size={14} className="text-violet-400"/> {new Date(log.logged_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-violet-50/50 dark:bg-violet-500/5 rounded-2xl border border-violet-100/50 dark:border-violet-500/10">
                    <p className="text-[10px] font-bold uppercase text-violet-400 tracking-widest mb-1 flex items-center gap-1"><MessageCircle size={10}/> Notes</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{log.message || 'No notes available'}"</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md">Close</button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- 2. EDIT MODAL COMPONENT ---
const EditLogModal = ({ isOpen, closeModal, log, onSubmit, isLoading }) => {
  if (!log) return null;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white">Edit Activity Log</Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Log Type</label>
                    <select name="log_type" defaultValue={log.log_type} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white">
                      <option value="check_in">Check In</option>
                      <option value="check_out">Check Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Message</label>
                    <textarea name="message" defaultValue={log.message} rows="3" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" />
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

// --- 3. CREATE LOG MODAL COMPONENT ---
const CreateLogModal = ({ isOpen, closeModal, onSubmit, isLoading, workers }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 text-left shadow-2xl transition-all border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Plus className="text-violet-500" /> Create New Log
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Select Worker</label>
                    <select name="station_worker_id" required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500">
                      <option value="">Choose a worker...</option>
                      {workers?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Log Type</label>
                      <select name="log_type" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white">
                        <option value="check_in">Check In</option>
                        <option value="check_out">Check Out</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Logged At</label>
                      <input type="datetime-local" name="logged_at" required className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Message</label>
                    <textarea name="message" rows="2" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white" placeholder="Add some notes..." />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Log</>}
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
const WorkersLogList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const queryClient = useQueryClient();
  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/worker-logs";
  const WORKERS_API = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/station/workers";

  // Fetch Logs
  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ["worker-logs"],
    queryFn: async () => {
      const res = await axios.get(BASE_URL, config);
      return res.data.data;
    },
  });

  // Fetch Workers for Dropdown
  const { data: workersList } = useQuery({
    queryKey: ["station-workers"],
    queryFn: async () => {
      const res = await axios.get(WORKERS_API, config);
      return res.data.data.data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newLog) => axios.post(BASE_URL, newLog, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-logs"]);
      toast.success("Log created successfully!");
      setIsCreateOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Creation failed"),
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: (data) => axios.patch(`${BASE_URL}/${selectedLog.id}`, data, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-logs"]);
      toast.success("Log updated!");
      setIsEditOpen(false);
    },
    onError: () => toast.error("Update failed")
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${BASE_URL}/${id}`, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-logs"]);
      Swal.fire("Deleted!", "Record removed.", "success");
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.logged_at = data.logged_at.replace("T", " ") + ":00";
    createMutation.mutate(data);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editMutation.mutate(Object.fromEntries(new FormData(e.target)));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
  };

  const filteredLogs = logsResponse?.data?.filter(log => 
    log.worker?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-inter">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
          <div className="sm:flex sm:justify-between sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Activity Logs</h1>
              <p className="text-xs text-slate-500 font-medium">Monitoring station worker activities</p>
            </div>
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 sm:mt-0 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-violet-200 dark:shadow-none"
            >
              <Plus size={18} /> New Entry
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
              <div className="relative max-w-sm">
                <input type="text" placeholder="Filter logs..." className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-violet-500 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-auto w-full dark:text-slate-300">
                <thead className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left">Worker</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {isLoading ? (
                    <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={30} /></td></tr>
                  ) : filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-sm">{log.worker?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${log.log_type === 'check_in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {log.log_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(log.logged_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setSelectedLog(log); setIsModalOpen(true); }} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"><Eye size={16} /></button>
                        <button onClick={() => { setSelectedLog(log); setIsEditOpen(true); }} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(log.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <CreateLogModal isOpen={isCreateOpen} closeModal={() => setIsCreateOpen(false)} onSubmit={handleCreateSubmit} isLoading={createMutation.isPending} workers={workersList} />
      <LogDetailsModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} log={selectedLog} />
      <EditLogModal isOpen={isEditOpen} closeModal={() => setIsEditOpen(false)} log={selectedLog} onSubmit={handleEditSubmit} isLoading={editMutation.isPending} />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default WorkersLogList;