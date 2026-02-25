import React, { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ---------------------------
// CONFIG (Keep as is)
// ---------------------------
const PRIMARY_COLOR_HEX = "#3f51b5"; // Indigo 500






const CURRENT_ADMIN_USER_ID = 10; // ⚠️ CHANGE THIS TO YOUR ACTUAL AUTH CONTEXT

// ---------------------------
// ICONS (Keep as is)
// ---------------------------
const EyeIcon = ({ onClick, title }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-indigo-500 hover:text-indigo-700 cursor-pointer transition duration-150"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        onClick={onClick}
        title={title}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

// --- LOADING SPINNER COMPONENT (Keep as is) ---
const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500" style={{ borderColor: PRIMARY_COLOR_HEX }}></div>
        <p className="mt-4 text-xl font-medium text-indigo-600">Loading requests...</p>
    </div>
);

// ---------------------------
// BADGE COMPONENT (Keep as is)
// ---------------------------
const StatusBadge = ({ status }) => {
    let classes = "inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transition duration-150 transform hover:scale-105 ";

    switch (status) {
        case "Completed": classes += "bg-green-600 text-white"; break;
        case "Accepted": classes += "bg-teal-500 text-white"; break;
        case "In Progress": classes += "bg-blue-600 text-white"; break;
        case "Assigned": classes += "bg-purple-600 text-white"; break;
        case "Pending": classes += "bg-yellow-500 text-gray-900"; break;
        case "High": classes = "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md bg-red-600 text-white ring-2 ring-red-400/50"; break;
        case "Medium": classes = "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md bg-orange-400 text-white ring-2 ring-orange-200/50"; break;
        case "Low": classes = "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md bg-green-400 text-white ring-2 ring-green-200/50"; break;
        default: classes += "bg-gray-500 text-white";
    }
    return <span className={classes}>{status}</span>;
};

// ---------------------------
// ACTION BUTTONS COMPONENT (Keep as is)
// ---------------------------
const ActionButtons = ({ request, handleView, handleUpdateStatus, handleAssign }) => {
    const viewButton = (
        <EyeIcon
            onClick={() => handleView(request)}
            title="View Details"
        />
    );

    let statusButton = null;

    if (request.status === "Pending") {
        statusButton = (
            <button
                onClick={() => handleUpdateStatus(request.request_id, "Accepted")}
                className="ml-2 px-4 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition duration-150 shadow-lg hover:shadow-xl whitespace-nowrap"
                title="Accept Request"
            >
                ✅ Accept
            </button>
        );
    } else if (request.status === "Accepted") {
        statusButton = (
            <button
                onClick={() => handleAssign(request)}
                className="ml-2 px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition duration-150 shadow-lg hover:shadow-xl whitespace-nowrap"
                title="Assign Technician"
            >
                👨‍🔧 Assign
            </button>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            {viewButton}
            {statusButton}
        </div>
    );
};

// ---------------------------
// ENGINEER ASSIGNMENT MODAL COMPONENT (Keep as is)
// ---------------------------
const EngineerAssignmentModal = ({ isOpen, onClose, request, engineers, onSubmit }) => {
    const [selectedEngineer, setSelectedEngineer] = useState("");
    const [remarks, setRemarks] = useState(request?.priority || "");

    useEffect(() => {
        if (isOpen && request) {
            setSelectedEngineer("");
            setRemarks(request.priority || "");
        }
    }, [isOpen, request]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedEngineer) {
            toast.error("Please select an engineer.");
            return;
        }
        onSubmit(request.request_id, selectedEngineer, remarks);
    };

    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4 transition-opacity duration-300">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-8 relative transform transition-transform duration-300 scale-100 border-t-8 border-indigo-500">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-600 p-2 rounded-full transition bg-gray-100 hover:bg-red-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-2xl font-extrabold text-indigo-700 mb-6 border-b pb-2">Assign Engineer for Request #{request.request_id}</h3>
                <p className="mb-4 text-sm text-gray-600 border-l-4 border-yellow-400 pl-3 py-1 bg-yellow-50">
                    **Hardware:** <span className="font-semibold text-gray-800">{request.hardware_name}</span> | **Branch:** <span className="font-semibold text-gray-800">{request.branch_anme}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="engineer-select" className="block text-sm font-medium text-gray-700 mb-1">Select Hardware Engineer <span className="text-red-500">*</span></label>
                        <select
                            id="engineer-select"
                            value={selectedEngineer}
                            onChange={(e) => setSelectedEngineer(e.target.value)}
                            className="mt-1 block w-full pl-4 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-inner bg-gray-50"
                            required
                        >
                            <option value="" disabled>-- Select an Engineer --</option>
                            {engineers.map((eng) => (
                                <option key={eng.engineer_id} value={eng.engineer_id}>
                                    {eng.engineer_name} ({eng.designation}) - {eng.availability}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Assignment Remarks</label>
                        <textarea
                            id="remarks"
                            rows="4"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                            placeholder="Add any necessary remarks or instructions for the engineer."
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-3 inline-flex justify-center py-2 px-6 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition duration-150"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-6 border border-transparent rounded-full shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                        >
                            🚀 Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ---------------------------
// SORTABLE TABLE HEAD COMPONENT (NEW)
// ---------------------------
const SortIcon = ({ direction }) => {
    if (direction === 'asc') {
        return <span className="ml-2">▲</span>; // Up arrow for ascending
    }
    if (direction === 'desc') {
        return <span className="ml-2">▼</span>; // Down arrow for descending
    }
    return <span className="ml-2 text-indigo-300">↕</span>; // Neutral icon
};

const TableHead = ({ column, label, sortColumn, sortDirection, handleSort, align = 'left' }) => {
    const isCurrentSort = sortColumn === column;
    const currentDirection = isCurrentSort ? sortDirection : 'none';

    return (
        <th
            className={`px-6 py-4 text-${align} cursor-pointer hover:bg-indigo-600 transition duration-150`}
            onClick={() => handleSort(column)}
        >
            <div className={`flex items-center ${align === 'center' ? 'justify-center' : ''}`}>
                {label}
                <SortIcon direction={currentDirection} />
            </div>
        </th>
    );
};


// ---------------------------
// MAIN COMPONENT
// ---------------------------
const ApplicationListadmin = () => {
    const [requests, setRequests] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [viewRequest, setViewRequest] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [requestToAssign, setRequestToAssign] = useState(null);

    // --- DATATABLE STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10); // Records per page
    const [sortColumn, setSortColumn] = useState('request_id');
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'


    const empData = JSON.parse(localStorage.getItem('empData'));

const USER_ID=empData?.user?.user_id;

console.log(USER_ID);

    const API_REQUESTS_LIST = "http://192.168.11.138:5005/api/hardware-req/hardware-requests-list";
    const API_ENGINEERS_LIST = "http://192.168.11.138:5005/api/hardware-eng/engineers";
    const API_REQUEST_UPDATE = (id) => `http://192.168.11.138:5005/api/hardware-req/hardware-requests-update/${id}`;
    const API_ASSIGN_ENGINEER = "http://192.168.11.138:5005/api/eng-assign/assignments";

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const [resRequests, resEngineers] = await Promise.all([
                fetch(API_REQUESTS_LIST),
                fetch(API_ENGINEERS_LIST)
            ]);

            if (!resRequests.ok || !resEngineers.ok) {
                throw new Error("One or more API calls failed.");
            }

            const dataRequests = await resRequests.json();
            const dataEngineers = await resEngineers.json();

            // Add an ID for sorting if one isn't guaranteed by the API
            const enhancedRequests = dataRequests.map((req, index) => ({
                ...req,
                // Fallback ID if request_id isn't present
                request_id: req.request_id || (index + 1),
                // Normalize dates for proper sorting
                request_date: req?.request_date ? new Date(req.request_date).getTime() : 0,
                assign_date: req.assign_date ? new Date(req.assign_date).getTime() : 0,
            }));


            setRequests(enhancedRequests);
            setEngineers(dataEngineers);

        } catch (err) {
            toast.error("Failed to fetch data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle View Modal
    const handleView = (request) => {
        setViewRequest(request);
        setModalOpen(true);
    };

    // Handle Status Update (Accept)
    const handleUpdateStatus = async (requestId, newStatus) => {
        // ... (SweetAlert logic remains the same)
        const { isConfirmed } = await Swal.fire({
            title: newStatus === "Accepted" ? "Accept Hardware Request?" : "Confirm Status Change",
            text: newStatus === "Accepted" ? `Are you sure you want to accept this request? Once accepted, it will be ready for assignment.` : `Are you sure you want to change the status of request ${requestId} to "${newStatus}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: newStatus === "Accepted" ? "#10B981" : PRIMARY_COLOR_HEX,
            cancelButtonColor: "#EF4444",
            confirmButtonText: `Yes, ${newStatus} it!`,
        });

        if (isConfirmed) {
            try {
                setLoading(true);
                const response = await fetch(API_REQUEST_UPDATE(requestId), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                toast.success(`Request ${requestId} successfully updated to ${newStatus}.`);
                fetchData();
            } catch (error) {
                console.error("Error updating request status:", error);
                toast.error(`Failed to update status for request ${requestId}.`);
                setLoading(false);
            }
        }
    };

    // Handle Assign Button Click
    const handleAssign = (request) => {
        setRequestToAssign(request);
        setAssignModalOpen(true);
    };

    // Handle Engineer Assignment Submission
    const handleSubmitAssignment = async (requestId, engineerId, remarks) => {
        setAssignModalOpen(false);
        setLoading(true);

        const assignmentPayload = {
            request_id: requestId,
            engineer_id: parseInt(engineerId),
            assigned_by: USER_ID,
            remarks: remarks,
            status: "Assigned"
        };

        try {
            // 1. Post Assignment Record
            const response = await fetch(API_ASSIGN_ENGINEER, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(assignmentPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 2. Update the main request's status to 'Assigned'
            await fetch(API_REQUEST_UPDATE(requestId), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Assigned" }),
            });

            toast.success(`Request ${requestId} successfully assigned to Engineer ${engineerId} and status set to Assigned!`);
            fetchData();
        } catch (error) {
            console.error("Error submitting assignment:", error);
            toast.error(`Failed to assign request ${requestId}.`);
            setLoading(false);
        }
    };

    // --- DATATABLE LOGIC ---

    // Handle Sorting
    const handleSort = (column) => {
        if (column === sortColumn) {
            // Toggle direction if the same column is clicked
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to ascending
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Filtered and Sorted Requests
    const filteredAndSortedRequests = useMemo(() => {
        let sorted = [...requests];

        // 1. Filtering
        if (statusFilter) {
            sorted = sorted.filter((req) => req.status === statusFilter);
        }

        if (priorityFilter) {
            sorted = sorted.filter((req) => req.priority === priorityFilter);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            sorted = sorted.filter((req) =>
                req.hardware_name.toLowerCase().includes(lower) ||
                (req.branch_anme && req.branch_anme.toLowerCase().includes(lower)) ||
                req.status.toLowerCase().includes(lower) ||
                req.priority.toLowerCase().includes(lower) ||
                (req.created_by_name && req.created_by_name.toLowerCase().includes(lower))
            );
        }

        // 2. Sorting
        const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
        sorted.sort((a, b) => {
            const aValue = a[sortColumn] || '';
            const bValue = b[sortColumn] || '';

            if (aValue < bValue) return -1 * directionMultiplier;
            if (aValue > bValue) return 1 * directionMultiplier;
            return 0;
        });

        setCurrentPage(1); // Reset to first page on filter/sort change
        return sorted;
    }, [requests, searchTerm, statusFilter, priorityFilter, sortColumn, sortDirection]);

    // Pagination Calculation
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredAndSortedRequests.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(filteredAndSortedRequests.length / recordsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= nPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Pagination Component
    const Pagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= nPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to <span className="font-medium">{Math.min(indexOfLastRecord, filteredAndSortedRequests.length)}</span> of <span className="font-medium">{filteredAndSortedRequests.length}</span> results
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            aria-current={currentPage === number ? 'page' : undefined}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === number
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {number}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === nPages || nPages === 0}
                        className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </nav>
            </div>
        );
    };
    // --- END DATATABLE LOGIC ---

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 md:p-8">
                    <div className="max-w-full mx-auto">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
                            📋 All Hardware Requests
                        </h1>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
                            {/* Status Filter */}
                            <div className="w-full md:w-64">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 bg-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            {/* Priority Filter */}
                            <div className="w-full md:w-64">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 bg-white"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full max-w-lg">
                                <input
                                    type="text"
                                    placeholder="Search by Hardware, Branch, Status, or Requester..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 bg-white"
                                    disabled={loading}
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                            {loading ? (
                                <LoadingSpinner />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-base text-gray-700 divide-y divide-gray-200">
                                        {/* Table Header with Sorting */}
                                        <thead className="bg-indigo-500 text-white uppercase font-bold text-sm tracking-wider sticky top-0">
                                            <tr>
                                                {/* Column: SL */}
                                                <TableHead
                                                    column="request_id"
                                                    label="SL"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                    align="left"
                                                />
                                                {/* Column: Branch */}
                                                <TableHead
                                                    column="branch_name"
                                                    label="Branch"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                />
                                                {/* Column: Hardware */}
                                                <TableHead
                                                    column="hardware_name"
                                                    label="Hardware"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                />
                                                {/* Column: Priority */}
                                                <TableHead
                                                    column="priority"
                                                    label="Priority"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                    align="center"
                                                />
                                                {/* Column: Status */}
                                                <TableHead
                                                    column="status"
                                                    label="Status"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                    align="center"
                                                />
                                                {/* Column: Req Date */}
                                                <TableHead
                                                    column="request_date"
                                                    label="Req Date"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                    align="center"
                                                />
                                                {/* Column: Requested By */}
                                                <TableHead
                                                    column="created_by_name"
                                                    label="Requested By"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                />
                                                {/* Column: Assign Date */}
                                                <TableHead
                                                    column="assign_date"
                                                    label="Assign Date"
                                                    sortColumn={sortColumn}
                                                    sortDirection={sortDirection}
                                                    handleSort={handleSort}
                                                    align="center"
                                                />
                                                {/* Column: Action (Non-sortable) */}
                                                <th className="px-6 py-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {currentRecords?.length > 0 ? (
                                                currentRecords.map((req, index) => (
                                                    <tr key={req.request_id} className="hover:bg-indigo-50 transition duration-150">
                                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                                            {(currentPage - 1) * recordsPerPage + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-700">{req?.branch_anme}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{req?.hardware_name}</td>
                                                        <td className="px-6 py-4 text-center"><StatusBadge status={req.priority} /></td>
                                                        <td className="px-6 py-4 text-center"><StatusBadge status={req.status} /></td>
                                                        <td className="px-6 py-4 text-center">
                                                            {req.request_date ? new Date(req.request_date).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{req?.created_by_name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {req.assign_date && req.assign_date > 0 ? new Date(req.assign_date).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <ActionButtons
                                                                request={req}
                                                                handleView={handleView}
                                                                handleUpdateStatus={handleUpdateStatus}
                                                                handleAssign={handleAssign}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-10 text-xl text-gray-500 font-semibold">
                                                        {searchTerm ? `😞 No requests match "${searchTerm}".` : '🎉 No hardware requests found.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {/* Pagination Footer */}
                            {!loading && filteredAndSortedRequests.length > 0 && <Pagination />}
                        </div>
                    </div>
                </main>

                {/* View Modal (Keep as is) */}
                {modalOpen && viewRequest && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4 transition-opacity duration-300">
                        {/* ... (View Modal Content) ... */}
                        <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-8 relative transform transition-transform duration-300 scale-100 border-t-8 border-indigo-500">
                            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-600 p-2 rounded-full transition bg-gray-100 hover:bg-red-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h3 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b border-indigo-200 pb-3">Request Details #{viewRequest.request_id}</h3>

                            <div className="space-y-6">
                                {/* Hardware & Status Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 border rounded-lg bg-indigo-50/50 border-indigo-200">
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-600">Branch & Hardware</p>
                                        <p className="text-lg font-bold text-gray-900">{viewRequest.branch_anme} / {viewRequest.hardware_name}</p>
                                        <p className="text-sm text-gray-500 mt-1">Requested on: {viewRequest.request_date ? new Date(viewRequest.request_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="mb-1 text-sm font-medium text-gray-600">Current Status</p>
                                        <StatusBadge status={viewRequest.status} />
                                        <p className="mt-2 text-sm font-medium text-gray-600">Priority: <StatusBadge status={viewRequest.priority} /></p>
                                    </div>
                                </div>

                                {/* Assignment Details (Conditional) */}
                                {viewRequest.assignment_id && (
                                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 shadow-inner">
                                        <h4 className="font-bold text-xl mb-3 text-purple-700 border-b border-purple-200 pb-2">👨‍🔧 Assignment Info</h4>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
                                            <p className="col-span-1"><strong>Engineer:</strong> <span className="text-purple-900 font-semibold">{viewRequest.engineer_name || 'N/A'}</span></p>
                                            <p className="col-span-1"><strong>Eng. Contact:</strong> {viewRequest.engineer_contact || 'N/A'}</p>
                                            <p className="col-span-1"><strong>Assigned By (ID):</strong> {viewRequest.assigned_by}</p>
                                            <p className="col-span-1"><strong>Date:</strong> {viewRequest.assign_date && viewRequest.assign_date > 0 ? new Date(viewRequest.assign_date).toLocaleString() : 'N/A'}</p>
                                            {viewRequest.eng_comments && (
                                                <div className="col-span-full mt-2">
                                                    <p className="mb-1 font-semibold text-purple-700">Engineer Comments:</p>
                                                    <div className="p-3 bg-white border border-purple-300 rounded-lg whitespace-pre-wrap text-sm shadow-md">{viewRequest.eng_comments}</div>
                                                </div>
                                            )}
                                            <div className="col-span-full mt-2">
                                                <p className="mb-1 font-semibold text-purple-700">Remarks:</p>
                                                <div className="p-3 bg-white border border-purple-300 rounded-lg whitespace-pre-wrap text-sm shadow-md">
                                                    {viewRequest.assignment_remarks || 'No specific remarks provided by the admin.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Requester Details */}
                                <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
                                    <h4 className="font-bold text-xl mb-3 text-gray-700 border-b border-gray-200 pb-2">👤 Requester Info</h4>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base text-gray-700">
                                        <p className="col-span-1"><strong>Full Name:</strong> {viewRequest.created_by_name || 'N/A'}</p>
                                        <p className="col-span-1"><strong>Role:</strong> {viewRequest.created_by_role || 'N/A'}</p>
                                        <p className="col-span-2"><strong>Email:</strong> {viewRequest.created_by_email || 'N/A'}</p>
                                    </div>
                                </div>


                                {/* Problem Description */}
                                <div className="mt-6">
                                    <h4 className="font-bold text-xl mb-3 text-indigo-700 border-b border-indigo-200 pb-2">📝 Problem Description</h4>
                                    <div className="p-4 bg-white border border-gray-300 rounded-lg whitespace-pre-wrap shadow-lg text-gray-800">
                                        {viewRequest.problem_details}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Engineer Assignment Modal (Keep as is) */}
                <EngineerAssignmentModal
                    isOpen={assignModalOpen}
                    onClose={() => setAssignModalOpen(false)}
                    request={requestToAssign}
                    engineers={engineers}
                    onSubmit={handleSubmitAssignment}
                />

                <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
        </div>
    );
};

export default ApplicationListadmin;