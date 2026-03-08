import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import { 
  Eye, Plus, UserPlus, Search, 
  Loader2, X, Save, ShieldCheck, Mail, Phone, BadgeCheck, Users
} from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- VIEW USER DETAILS MODAL ---
const ViewUserModal = ({ isOpen, closeModal, user }) => {
  if (!user) return null;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BadgeCheck size={20} className="text-violet-500" /> User Profile
                  </h3>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{user.name}</p>
                      <p className="text-xs font-bold text-violet-500 uppercase tracking-widest">{user.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Mail size={16} /> {user.email}
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Phone size={16} /> {user.phone}
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Users size={16} /> Group: <span className="font-bold text-slate-800 dark:text-slate-200">{user.group?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} className="w-full mt-8 bg-slate-100 dark:bg-slate-700 font-bold py-3 rounded-2xl">Close</button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- ADD USER MODAL ---
const AddUserModal = ({ isOpen, closeModal, onSubmit, isLoading, groups }) => {
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
                <div className="mb-6 text-center">
                  <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mx-auto mb-3">
                    <UserPlus size={24} />
                  </div>
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white">Create Station User</Dialog.Title>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input name="name" required placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                    <input name="phone" required placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                  </div>
                  <input name="email" type="email" required placeholder="Email Address" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select name="role" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white">
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="attendant">Attendant</option>
                    </select>
                    <select name="station_group_id" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white">
                      <option value="">Select Group</option>
                      {groups?.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-200 flex items-center justify-center gap-2 transition-all">
                      {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save User</>}
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
const StationUserlists = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1";

  // Fetch Users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["stationUsers"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/station/station-users`, config);
      return res.data.data;
    },
  });

  // Fetch Groups for the dropdown
  const { data: groupsData } = useQuery({
    queryKey: ["stationGroups"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/station/groups`, config);
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: (data) => axios.post(`${BASE_URL}/station/station-users`, data, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["stationUsers"]);
      toast.success("Station User Added!");
      setIsAddOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error creating user"),
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    addMutation.mutate({ ...data, status: "active" });
  };

  const filtered = usersData?.data?.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-inter">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-extrabold tracking-tight">Station Users</h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                   <ShieldCheck size={14} className="text-emerald-500" /> Crew Management
                </div>
              </div>
              <button onClick={() => setIsAddOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-100 font-semibold">
                <Plus size={20} /> <span>Add User</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 flex justify-between items-center">
              <div className="relative max-w-md w-full">
                <input type="text" placeholder="Search by name or email..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-auto w-full dark:text-slate-300">
                  <thead className="text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left">User Info</th>
                      <th className="px-6 py-4 text-left">Role / Group</th>
                      <th className="px-6 py-4 text-left">Phone</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                    {isLoading ? (
                      <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={32} /></td></tr>
                    ) : filtered?.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-violet-600 border border-slate-200 dark:border-slate-700">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{user.role}</p>
                           <p className="text-[10px] text-slate-400 italic">Group: {user.group?.name || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{user.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setSelectedUser(user); setIsViewOpen(true); }} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-slate-400 hover:text-violet-600 border border-transparent hover:border-violet-100 transition-all">
                            <Eye size={18} />
                          </button>
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
      <AddUserModal isOpen={isAddOpen} closeModal={() => setIsAddOpen(false)} onSubmit={handleAddSubmit} isLoading={addMutation.isPending} groups={groupsData?.data} />
      <ViewUserModal isOpen={isViewOpen} closeModal={() => setIsViewOpen(false)} user={selectedUser} />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default StationUserlists;