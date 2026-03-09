import React, { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, Transition, Menu } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import { 
  Eye, Plus, Search, Loader2, X, Save, 
  ShieldCheck, Calendar, Hash, Receipt, DollarSign, Zap,
  Download, FileText, Table as TableIcon, ChevronDown, Clock
} from "lucide-react";

// External Libraries for Export
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- VIEW BILL MODAL ---
const ViewBillModal = ({ isOpen, closeModal, bill }) => {
  if (!bill) return null;
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
                    <Receipt size={20} className="text-violet-500" /> Bill Details
                  </h3>
                  <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Total Amount Due</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white">{bill.total_amount} <span className="text-sm font-normal">SAR</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-violet-50/50 dark:bg-violet-500/5 p-3 rounded-xl border border-violet-100 dark:border-violet-500/10">
                      <p className="text-[10px] font-bold uppercase text-violet-400 mb-1">Bill Type</p>
                      <p className="font-bold text-violet-600 capitalize">{bill.bill_type}</p>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                      <p className="text-[10px] font-bold uppercase text-emerald-400 mb-1">Period</p>
                      <p className="font-bold text-emerald-600">{bill.bill_period}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1"><Hash size={14}/> Bill No</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{bill.bill_no}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1"><DollarSign size={14}/> Base Amount</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{bill.amount} SAR</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1"><ShieldCheck size={14}/> VAT Amount</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{bill.vat_amount} SAR</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                      <span className="text-slate-500 flex items-center gap-1"><Calendar size={14}/> Bill Date</span>
                      <span className="font-semibold text-slate-600">{new Date(bill.bill_date).toLocaleDateString()}</span>
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

// --- ADD BILL MODAL ---
const AddBillModal = ({ isOpen, closeModal, onSubmit, isLoading }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translateY-4" enterTo="opacity-100 scale-100 translateY-0" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100 translateY-0" leaveTo="opacity-0 scale-95 translateY-4">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl transition-all border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-bold text-slate-800 dark:text-white">New Electronic Bill</Dialog.Title>
                    <p className="text-sm text-slate-500 mt-1">Register a new utility or service bill.</p>
                  </div>
                  <button onClick={closeModal} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Bill Number</label>
                      <input name="bill_no" required placeholder="EB-10001" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Bill Type</label>
                      <select name="bill_type" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white cursor-pointer">
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="internet">Internet</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Bill Period</label>
                      <input name="bill_period" type="month" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Bill Date</label>
                      <input name="bill_date" type="date" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Amount (SAR)</label>
                      <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 ml-1">VAT Amount</label>
                      <input name="vat_amount" type="number" step="0.01" required placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-6">
                    <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Bill</>}
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
const ElectronicBill = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const empData = JSON.parse(localStorage.getItem("empData"));
  const config = { headers: { Authorization: `Bearer ${empData?.token}` } };
  const BASE_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1";

  // Fetch Data
  const { data: billsResponse, isLoading } = useQuery({
    queryKey: ["electronicBills"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/station/electronic-bills`, config);
      return res.data.data; 
    },
  });

  // Create Mutation
  const addMutation = useMutation({
    mutationFn: async (newBill) => axios.post(`${BASE_URL}/station/electronic-bills`, newBill, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["electronicBills"]);
      toast.success("Electronic Bill Registered Successfully!");
      setIsAddOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error creating bill"),
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.amount = parseFloat(data.amount);
    data.vat_amount = parseFloat(data.vat_amount);
    addMutation.mutate(data);
  };

  const handleOpenView = (bill) => {
    setSelectedBill(bill);
    setIsViewOpen(true);
  };

  // Filter Logic
  const filtered = billsResponse?.data?.filter(bill => 
    bill.bill_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bill.bill_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export Logic (Excel)
  const exportToExcel = () => {
    if (!filtered?.length) return;
    const worksheet = XLSX.utils.json_to_sheet(filtered.map(b => ({
      "Bill No": b.bill_no,
      "Type": b.bill_type,
      "Period": b.bill_period,
      "Date": b.bill_date,
      "Total": b.total_amount,
      "Status": b.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");
    XLSX.writeFile(workbook, "Electronic_Bills.xlsx");
  };

  // Export Logic (PDF)
  const exportToPDF = () => {
    if (!filtered?.length) return;
    const doc = new jsPDF();
    doc.text("Electronic Bills Ledger", 14, 15);
    doc.autoTable({
      head: [["Bill No", "Type", "Period", "Total Amount", "Status"]],
      body: filtered.map(b => [b.bill_no, b.bill_type, b.bill_period, b.total_amount, b.status]),
      startY: 20,
    });
    doc.save("Electronic_Bills.pdf");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            
            {/* Page Header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-extrabold tracking-tight">Electronic Bills</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" /> Utility Management
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={18} /> Export <ChevronDown size={16} />
                  </Menu.Button>
                  <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right divide-y divide-slate-100 rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-slate-100 dark:border-slate-700">
                      <div className="p-1">
                        <Menu.Item>{({ active }) => (
                          <button onClick={exportToExcel} className={`${active ? 'bg-violet-500 text-white' : 'text-slate-700 dark:text-slate-300'} group flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors`}><TableIcon size={16} className="mr-2" /> Excel (.xlsx)</button>
                        )}</Menu.Item>
                        <Menu.Item>{({ active }) => (
                          <button onClick={exportToPDF} className={`${active ? 'bg-violet-500 text-white' : 'text-slate-700 dark:text-slate-300'} group flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors`}><FileText size={16} className="mr-2" /> PDF (.pdf)</button>
                        )}</Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                <button onClick={() => setIsAddOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-100 font-semibold">
                  <Plus size={20} /> <span>Add Bill</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
              <div className="relative max-w-md">
                <input type="text" placeholder="Search bill number or type..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
              </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-auto w-full dark:text-slate-300">
                  <thead className="text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left">Bill Info</th>
                      <th className="px-6 py-4 text-left">Billing Period</th>
                      <th className="px-6 py-4 text-left">Total Amount</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                    {isLoading ? (
                      <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={32} /></td></tr>
                    ) : filtered?.length === 0 ? (
                      <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-medium">No bills found.</td></tr>
                    ) : filtered?.map(bill => (
                      <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"><Zap size={16} /></div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 dark:text-slate-200">{bill.bill_no}</span>
                              <span className="text-xs text-slate-400 font-medium capitalize">{bill.bill_type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{bill.bill_period}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase"><Clock size={10}/> Date: {new Date(bill.bill_date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-800 dark:text-slate-100">
                          {bill.total_amount} SAR
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${bill.status === 'unpaid' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleOpenView(bill)} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-100 transition-all border border-transparent hover:border-violet-100"><Eye size={18} /></button>
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

      <AddBillModal isOpen={isAddOpen} closeModal={() => setIsAddOpen(false)} onSubmit={handleAddSubmit} isLoading={addMutation.isPending} />
      <ViewBillModal isOpen={isViewOpen} closeModal={() => setIsViewOpen(false)} bill={selectedBill} />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default ElectronicBill;