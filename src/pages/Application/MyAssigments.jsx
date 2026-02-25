import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2'; 

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header"; 

// ==========================================================
// CONFIG & HELPER COMPONENTS
// ==========================================================
const PRIMARY_COLOR_HEX = "#1976D2"; 

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" style={{ borderColor: PRIMARY_COLOR_HEX }}></div>
        <p className="ml-4 text-lg text-gray-600">Updating assignment data...</p>
    </div>
);

const StatusBadge = ({ status }) => {
    let classes = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ";
    switch (status) {
        case "Completed": classes += "bg-gradient-to-r from-teal-500 to-emerald-600 shadow-md"; break;
        case "Closed": classes += "bg-gray-800 shadow-md"; break;
        case "Accepted": classes += "bg-gradient-to-r from-purple-500 to-pink-500 shadow-md"; break;
        case "In Progress": classes += "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md"; break;
        case "Assigned": classes += "bg-indigo-700 shadow-lg"; break;
        case "Pending": classes += "bg-[#2196F3]"; break;
        default: classes += "bg-gray-500";
    }
    return <span className={classes}>{status}</span>;
};

// --- Table Row Component ---
const AssignmentRow = ({ assignment, index, toggleDetails, isDetailsOpen, handleUpdateStatus }) => {
    
    // Determine if any action button should be shown at all
    const currentStatus = assignment?.request_status;
    const isActionable = ["Assigned", "Accepted", "In Progress", "Completed"].includes(currentStatus);

    return (
        <>
            <tr 
                className={`cursor-pointer transition duration-150 ease-in-out ${
                    isDetailsOpen ? 'bg-blue-100/70' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
                onClick={() => toggleDetails(assignment.assignment_id)}
            >
                <td className="px-4 py-4 font-medium text-gray-900">
                    <p className="font-semibold text-sm">A-{assignment.assignment_id}</p>
                    <p className="text-xs text-blue-600">R-{assignment.request_id}</p>
                </td>
                <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{assignment.hardware_name}</p>
                    <span className="text-xs text-gray-500 italic">{assignment.branch_name}</span>
                </td>
                <td className="px-6 py-4">
                    <p className="font-medium text-gray-700">{assignment.assigned_by_name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(assignment.assign_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                    <StatusBadge status={currentStatus} />
                </td>
                <td className="px-4 py-4 text-center">
                    <svg className={`w-4 h-4 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </td>
            </tr>

            {isDetailsOpen && (
                <tr className="bg-blue-50/70 border-b border-blue-200">
                    <td colSpan="6" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                            <div className="md:col-span-2">
                                <h5 className="font-bold text-blue-700 mb-1">Problem Description:</h5>
                                <p className="text-gray-700 p-3 bg-white rounded-lg border">{assignment.problem_details}</p>
                                {assignment?.eng_comments && (
                                    <div className="mt-3">
                                        <h5 className="font-bold text-blue-700 mb-1">Engineer Comments:</h5>
                                        <p className="text-gray-700 p-3 bg-white rounded-lg border">{assignment.eng_comments}</p>
                                    </div>
                                )}
                            </div>
                              <div className="md:col-span-2">
                                <h5 className="font-bold text-blue-700 mb-1">Admin Comments:</h5>
                                <p className="text-gray-700 p-3 bg-white rounded-lg border">{assignment.remarks}</p>
                               
                            </div>
                            <div>
                                <h5 className="font-bold text-blue-700 mb-1">Actions:</h5>
                                <div className="space-y-3">
                                    {/* STEP 1: ASSIGNED -> ACCEPTED */}
                                    {currentStatus === "Assigned" && (
                                        <button
                                            className="w-full text-white bg-green-600 hover:bg-green-700 font-bold py-2 rounded-lg shadow"
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(assignment.request_id, "Accepted"); }}
                                        >
                                            ✅ Accept Assignment
                                        </button>
                                    )}
                                    
                                    {/* STEP 2: ACCEPTED -> IN PROGRESS */}
                                    {currentStatus === "Accepted" && (
                                        <button
                                            className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-2 rounded-lg shadow"
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(assignment.request_id, "In Progress"); }}
                                        >
                                            🚀 Start Work
                                        </button>
                                    )}

                                    {/* STEP 3: IN PROGRESS -> COMPLETED */}
                                    {currentStatus === "In Progress" && (
                                        <button
                                            className="w-full text-white bg-teal-600 hover:bg-teal-700 font-bold py-2 rounded-lg shadow"
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(assignment.request_id, "Completed"); }}
                                        >
                                            ✔️ Mark as Completed
                                        </button>
                                    )}

                                    {/* STEP 4: COMPLETED -> CLOSED */}
                                    {currentStatus === "Completed" && (
                                        <button
                                            className="w-full text-white bg-gray-800 hover:bg-black font-bold py-2 rounded-lg shadow"
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(assignment.request_id, "Closed"); }}
                                        >
                                            🔒 Close Request
                                        </button>
                                    )}
                                    
                                    {!isActionable && <p className="text-gray-500 italic">No actions remaining.</p>}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================
const MyAssigments = () => {
    const empData = JSON.parse(localStorage.getItem('empData'));
    const userDetails = empData?.user;
    const engineer_id = userDetails?.engineer_id || 4; // Fallback for dev

    const API_ASSIGNMENTS = `http://192.168.11.138:5005/api/eng-assign/assignments/${engineer_id}`; 
    const API_ASSIGNMENT_UPDATE = (id) => `http://192.168.11.138:5005/api/hardware-req/hardware-requests-update/${id}`; 
    const API_ENGINEER_COMMENT_UPDATE = (id) => `http://192.168.11.138:5005/api/hardware-req/engineer-comments-update/${id}`;

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openAssignmentId, setOpenAssignmentId] = useState(null); 

    const toggleDetails = (id) => setOpenAssignmentId(openAssignmentId === id ? null : id);

    const fetchAssignmentHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ASSIGNMENTS);
            const result = await response.json();
            setAssignments(result.data || []); 
        } catch (err) {
            toast.error("Failed to fetch assignments.");
        } finally {
            setLoading(false);
        }
    }, [API_ASSIGNMENTS]);

    useEffect(() => {
        fetchAssignmentHistory();
    }, [fetchAssignmentHistory]);

    const handleUpdateAssignmentStatus = useCallback(async (requestId, newStatus) => { 
        setOpenAssignmentId(null); 
        
        // Dynamic Alert Config
        const alertConfig = {
            "Accepted": { title: "Accept Request?", color: "#059669" },
            "In Progress": { title: "Start Working?", color: "#4f46e5" },
            "Completed": { title: "Mark as Completed?", color: "#0d9488" },
            "Closed": { title: "Finalize and Close?", color: "#1f2937" }
        };

        if (newStatus === "Completed") {
            const { value: comments, isConfirmed } = await Swal.fire({
                title: "Mark as Completed",
                text: "Please provide comments on the work done.",
                input: "textarea",
                inputLabel: "Engineer Comments",
                inputPlaceholder: "Type your comments here...",
                inputAttributes: {
                    "aria-label": "Type your comments here"
                },
                showCancelButton: true,
                confirmButtonColor: alertConfig[newStatus]?.color || PRIMARY_COLOR_HEX,
                confirmButtonText: "Submit & Complete",
                inputValidator: (value) => {
                    if (!value) {
                        return "You need to write something!";
                    }
                }
            });

            if (isConfirmed && comments) {
                try {
                    setLoading(true);
                    
                    // 1. Update Comments
                    await fetch(API_ENGINEER_COMMENT_UPDATE(requestId), {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ eng_comments: comments }),
                    });

                    // 2. Update Status
                    const response = await fetch(API_ASSIGNMENT_UPDATE(requestId), {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus }),
                    });

                    if (!response.ok) throw new Error("Update failed");

                    toast.success(`Request R-${requestId} marked as Completed with comments.`);
                    fetchAssignmentHistory(); 
                } catch (error) {
                    toast.error("Failed to complete request.");
                    setLoading(false);
                }
            }
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: alertConfig[newStatus]?.title || "Update Status?",
            text: `Confirm change for Request R-${requestId} to ${newStatus}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: alertConfig[newStatus]?.color || PRIMARY_COLOR_HEX,
            confirmButtonText: "Yes, Update"
        });

        if (isConfirmed) {
            try {
                setLoading(true);
                const response = await fetch(API_ASSIGNMENT_UPDATE(requestId), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }), // Updates DB with the specific status
                });

                if (!response.ok) throw new Error("Update failed");

                toast.success(`Request R-${requestId} is now ${newStatus}`);
                fetchAssignmentHistory(); 
            } catch (error) {
                toast.error("Failed to update status.");
                setLoading(false);
            }
        }
    }, [API_ASSIGNMENT_UPDATE, fetchAssignmentHistory]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="p-6">
                    <div className="max-w-full mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">My Assignment Pipeline</h1>
                            <div className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-600">
                                <p className="text-xs text-gray-500">Engineer Profile</p>
                                <p className="font-bold text-gray-800">{userDetails?.full_name || "Active Engineer"}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            {loading ? <LoadingSpinner /> : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-800 text-white text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3 text-left">IDs</th>
                                            <th className="px-6 py-3 text-left">Hardware</th>
                                            <th className="px-6 py-3 text-left">Assigned By</th>
                                            <th className="px-6 py-3 text-left">Date</th>
                                            <th className="px-6 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-center">Info</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {assignments?.map((item, idx) => (
                                            <AssignmentRow
                                                key={item.assignment_id}
                                                assignment={item}
                                                index={idx}
                                                toggleDetails={toggleDetails}
                                                isDetailsOpen={openAssignmentId === item.assignment_id}
                                                handleUpdateStatus={handleUpdateAssignmentStatus}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
                <ToastContainer position="bottom-right" />
            </div>
        </div>
    );
};

export default MyAssigments;