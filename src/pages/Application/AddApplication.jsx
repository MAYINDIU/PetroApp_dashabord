import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ---------------------------
// CONFIGURATION & STYLES
// ---------------------------
const PRIMARY_COLOR_HEX = "#1976D2";

const STATUS_COLORS = {
    "Pending": "bg-red-500 text-white shadow-red-300/50",
    "Accepted": "bg-green-500 text-white shadow-green-300/50",
    "Assigned": "bg-indigo-500 text-white shadow-indigo-300/50",
    "In Progress": "bg-cyan-500 text-white shadow-cyan-300/50",
    "Completed": "bg-green-600 text-white shadow-green-300/50",
    "N/A": "bg-gray-400 text-white shadow-gray-300/50"
};

// Icons
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const EyeIcon = ({ onClick }) => (
    <button
        onClick={onClick}
        className="text-white bg-blue-500 hover:bg-blue-700 p-2 rounded-full shadow transition duration-150 transform hover:scale-110 focus:outline-none"
        title="View Assignment Details"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    </button>
);

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
};

// ---------------------------
// MAIN COMPONENT
// ---------------------------
const AddApplication = () => {
    // Data extraction
    const empData = JSON.parse(localStorage.getItem('empData'));
    const userDetails = empData?.user;
    const userId = userDetails?.user_id;
    const zoneCode = userDetails?.zone_code;
    const zoneName = userDetails?.zone_name;
    const branchCode = userDetails?.branch_code;
    const branchAnme = userDetails?.branch_anme;

    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({
        hardware_name: "",
        problem_details: "",
        priority: "Medium",
        mobile_no: "", // Added mobile number field
    });
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // API ENDPOINTS
    const API_REQUESTS_GET = userId ? `http://192.168.11.138:5005/api/hardware-req/hardware-requests/${userId}` : null;
    const API_REQUESTS_POST = "http://192.168.11.138:5005/api/hardware-req/hardware-requests";

    const fetchRequests = async () => {
        if (!API_REQUESTS_GET) return;
        try {
            const res = await fetch(API_REQUESTS_GET);
            const data = await res.json();
            const uniqueRequests = Array.from(new Map(data.map(item => [item.request_id, item])).values());
            setRequests(uniqueRequests);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        if (userId) fetchRequests();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setDetailsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            toast.error("User ID is missing. Please log in.");
            return;
        }

        // Mobile number validation
        if (formData.mobile_no.length < 11) {
            toast.warning("Please enter a valid mobile number (min 11 digits).");
            return;
        }

        const finalPayload = {
            branch_id: branchCode,
            hardware_name: formData.hardware_name,
            problem_details: formData.problem_details,
            mobile: formData.mobile_no, // Included in payload
            zone_code: zoneCode,
            zone_name: zoneName,
            branch_code: branchCode,
            branch_anme: branchAnme,
            priority: formData.priority,
            created_by: userId
        };

        try {
            setLoading(true);
            const res = await fetch(API_REQUESTS_POST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload),
            });

            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Request Submitted! 🎉",
                    text: `Submitted for branch: ${branchAnme}`,
                    confirmButtonColor: PRIMARY_COLOR_HEX,
                });
                setFormData({ hardware_name: "", problem_details: "", priority: "Medium", mobile_no: "" });
                setModalOpen(false);
                fetchRequests();
            } else {
                toast.error("Failed to submit request.");
            }
        } catch (error) {
            toast.error("Server Error!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-6 md:p-8">
                    <div className="max-w-full mx-auto">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Hardware Requests</h1>
                            <button
                                onClick={() => setModalOpen(true)}
                                style={{ backgroundColor: PRIMARY_COLOR_HEX }}
                                className="flex items-center text-white px-5 py-2.5 rounded-lg shadow-lg hover:scale-105 transition font-semibold"
                            >
                                <PlusIcon /> Create Request
                            </button>
                        </div>

                        {/* TABLE */}
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-gray-700 divide-y divide-gray-200">
                                    <thead style={{ backgroundColor: PRIMARY_COLOR_HEX }} className="text-white uppercase font-bold text-xs sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left">SL</th>
                                            <th className="px-6 py-3 text-left">Branch Name</th>
                                              <th className="px-6 py-3 text-left">Mobile</th>
                                            <th className="px-6 py-3 text-left">Hardware</th>
                                            <th className="px-6 py-3 text-left">Req. Date</th>
                                            <th className="px-6 py-3 text-left">Priority</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                            <th className="px-6 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {requests.length > 0 ? (
                                            requests.map((item, index) => {
                                                const statusClass = STATUS_COLORS[item.status] || STATUS_COLORS["N/A"];
                                                return (
                                                    <tr key={item.request_id || index} className="hover:bg-gray-50 transition duration-150">
                                                        <td className="px-6 py-4">{index + 1}</td>
                                                        <td className="px-6 py-4 font-medium">{item.branch_anme}</td>
                                                                        <td className="px-6 py-4 font-medium">{item.mobile}</td>
                                                        <td className="px-6 py-4 font-semibold">{item.hardware_name}</td>
                                                        <td className="px-6 py-4 text-xs">{formatDate(item.request_date)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-4 py-2 rounded text-[12px] font-bold ${item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {item.priority}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-4 py-2 rounded text-[12px] font-bold tracking-wider ${statusClass}`}>
                                                                {item.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <EyeIcon onClick={() => handleViewDetails(item)} />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr><td colSpan="7" className="text-center py-10 text-gray-400">No requests found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* CREATE MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 ">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative">
                        <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">New Request</h3>
                        <p className="text-xs text-center text-gray-500 mb-6">Posting for: <span className="font-bold">{branchAnme}</span></p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hardware Name</label>
                                <input type="text" name="hardware_name" value={formData.hardware_name} onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Printer / UPS" required />
                            </div>

                            {/* MOBILE FIELD ADDED HERE */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                                <input 
                                    type="text" 
                                    name="mobile_no" 
                                    value={formData.mobile_no} 
                                    onChange={handleChange} 
                                    className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Enter Contact Number" 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Problem Details</label>
                                <textarea name="problem_details" value={formData.problem_details} onChange={handleChange} rows="3" className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe the issue..." required></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={loading} style={{ backgroundColor: PRIMARY_COLOR_HEX }} className="w-full py-3 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg disabled:bg-gray-400">
                                    {loading ? "Submitting..." : "Submit Ticket"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {detailsModalOpen && selectedRequest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative border-l-8 border-blue-600 p-8">
                        <button onClick={() => setDetailsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <h3 className="text-xl font-black text-gray-800 mb-6 border-b pb-4">Request & Assignment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">Hardware Info</h4>
                                <DetailItem label="Hardware" value={selectedRequest.hardware_name} />
                                <DetailItem label="Mobile" value={selectedRequest.mobile} />
                                <DetailItem label="Branch" value={selectedRequest.branch_anme} />
                                <DetailItem label="Problem" value={selectedRequest.problem_details} isMultiline />
                            </div>
                            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                                <h4 className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">Status Tracking</h4>
                                <DetailItem label="Status" value={selectedRequest.status} isStatus />
                                <DetailItem label="Assigned" value={selectedRequest.engineer_name || "Waiting for Admin"} />
                                {selectedRequest.eng_comments && (
                                    <DetailItem label="Engineer Comments" value={selectedRequest.eng_comments} isMultiline />
                                )}
                            </div>
                        </div>
                        <div className="mt-8 text-right">
                            <button onClick={() => setDetailsModalOpen(false)} className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
};

const DetailItem = ({ label, value, isStatus = false, isMultiline = false }) => (
    <div className={`flex justify-between border-b border-gray-100 py-2 ${isMultiline ? 'flex-col' : 'items-center'}`}>
        <span className="text-gray-400 text-xs font-bold uppercase">{label}</span>
        <div className={`text-gray-800 text-sm font-medium ${isMultiline ? 'mt-1 text-left' : 'text-right'}`}>
            {isStatus ? (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[value] || 'bg-gray-200'}`}>
                    {value || 'Pending'}
                </span>
            ) : value || 'N/A'}
        </div>
    </div>
);

export default AddApplication;