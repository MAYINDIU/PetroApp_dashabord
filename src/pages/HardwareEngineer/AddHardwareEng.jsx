import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these paths are correct for your project structure
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ---------------------------
// CONFIGURATION & COLORS
// ---------------------------
// Primary Color: Custom Deep Blue (#1565C0)
const PRIMARY_COLOR_HEX = "#1565C0"; 
const PRIMARY_HOVER_HEX = "#0D47A1"; // Darker shade for hover/table head (e.g., blue-900)

// Accent Color: Emerald (vibrant, fresh green for highlights and interaction)
const ACCENT_COLOR = "emerald"; 
const ACCENT_COLOR_SHADE = 500; 
const TEXT_COLOR = "gray-800"; // Very dark text for superb readability

// ---------------------------
// ICONS
// ---------------------------
const PlusIcon = ({ className = "h-5 w-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const EditIcon = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);
const DeleteIcon = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const EyeIcon = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const SearchIcon = ({ className = "h-5 w-5 text-gray-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// ---------------------------
// MAIN COMPONENT
// ---------------------------
const AddHardwareEng = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [engineers, setEngineers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const API_BASE = "http://192.168.11.138:5005/api/hardware-eng";

    // FETCH ENGINEERS
    const fetchEngineers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/engineers`);
            const data = await res.json();

            if (res.ok && Array.isArray(data)) {
                // Map the API keys to the component's expected keys for compatibility with modal logic
                const normalizedData = data.map(eng => ({
                    ...eng,
                    name: eng.engineer_name, 
                    email: eng.engineer_email, 
                    contact: eng.contact_number, 
                }));
                setEngineers(normalizedData);
            } else {
                toast.error("Failed to fetch engineers list.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error. Could not fetch engineers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEngineers();
    }, []);

    // ---------------------------
    // ADD / EDIT ENGINEER MODAL (ENHANCED FORM DESIGN)
    // ---------------------------
    const openEngineerModal = async (engineer = null) => {
        const isEdit = !!engineer;

        // Set default values for hidden fields
        const defaultAvailability = engineer?.availability || "Available";
        // Convert null to empty string for HTML value if engineer exists, otherwise keep null for payload
        const defaultBranchId = engineer?.branch_id !== undefined ? (engineer.branch_id || "") : "";

        const { value: formValues } = await Swal.fire({
            // Title remains bold and professional
            title: `<div class="text-xl font-bold text-gray-800">${isEdit ? "Edit Hardware Engineer Details" : "Add New Hardware Engineer"}</div>`,
            
            // ENHANCED FORM HTML/CSS for better alignment and darker text
            html: `
                <style>
                    /* Custom styles for professional alignment within Swal */
                    .swal2-content {
                        padding: 0 1rem; 
                    }
                    /* Grid for two-column layout */
                    .form-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr; 
                        gap: 1.5rem 1rem; /* Increased vertical spacing */
                        margin-top: 1rem;
                        text-align: left; /* Align labels/inputs to the left */
                    }
                    /* Single field container */
                    .input-group {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                    }
                    /* Label styling */
                    .input-label {
                        font-weight: 600; /* Semi-bold */
                        color: #1f2937; /* Dark Gray (TEXT_COLOR) */
                        font-size: 0.9rem;
                        margin-bottom: 0.4rem;
                    }
                    /* Input styling (dark text, clean border, material focus) */
                    .swal2-input {
                        width: 100% !important; 
                        margin: 0 !important;
                        padding: 0.75rem 1rem !important;
                        border-radius: 0.5rem !important; 
                        border: 1px solid #d1d5db !important; /* Lighter border for clean look */
                        font-size: 0.95rem !important;
                        color: #1f2937 !important; /* Dark text color */
                        transition: all 0.2s;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    }
                    /* Focus/Active state (Accent Color - Emerald) */
                    .swal2-input:focus {
                        border-color: #10b981 !important; /* Emerald focus color */
                        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
                        outline: none !important;
                    }
                    /* Full-width fields spanning both columns */
                    .input-group.full-width {
                        grid-column: span 2;
                    }
                </style>
                <div class="form-grid">
                    <div class="input-group">
                        <label for="name" class="input-label">Full Name</label>
                        <input id="name" class="swal2-input" placeholder="e.g., Jane Doe" value="${engineer?.name || ""}">
                    </div>
                    <div class="input-group">
                        <label for="email" class="input-label">Email Address</label>
                        <input id="email" class="swal2-input" placeholder="e.g., jane@company.com" value="${engineer?.email || ""}">
                    </div>
                    <div class="input-group">
                        <label for="contact" class="input-label">Contact Number</label>
                        <input id="contact" class="swal2-input" placeholder="e.g., +1 555-1234" value="${engineer?.contact || ""}">
                    </div>
                    <div class="input-group">
                        <label for="designation" class="input-label">Designation</label>
                        <input id="designation" class="swal2-input" placeholder="e.g., Senior Tech" value="${engineer?.designation || ""}">
                    </div>
                    <div class="input-group full-width">
                        <label for="username" class="input-label">Username</label>
                        <input id="username" class="swal2-input" placeholder="Unique username" value="${engineer?.username || ""}">
                    </div>
                    <div class="input-group full-width">
                        <label for="password" class="input-label">${isEdit ? "New Password (Optional)" : "Password"}</label>
                        <input id="password" type="password" class="swal2-input" placeholder="${isEdit ? "Leave blank to keep current password" : "Required for new account"}" value="">
                    </div>
                    
                    <input type="hidden" id="availability" value="${defaultAvailability}">
                    <input type="hidden" id="branch_id" value="${defaultBranchId}"> 
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: isEdit ? "Update Details" : "Save Engineer",
            cancelButtonText: "Cancel",
            
            customClass: {
                popup: 'rounded-xl shadow-2xl backdrop-blur-sm',
                container: 'bg-gray-800 bg-opacity-30', 
                confirmButton: `text-white font-semibold px-6 py-2 rounded-lg transition duration-200`,
                cancelButton: 'bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold px-6 py-2 rounded-lg transition duration-200 ml-4',
                actions: 'flex !justify-center pt-4 border-t border-gray-100 mt-4',
            },
            buttonsStyling: false, 
            
            didOpen: () => {
                const confirmButton = Swal.getConfirmButton();
                if (confirmButton) {
                    confirmButton.style.backgroundColor = PRIMARY_COLOR_HEX;
                    confirmButton.onmouseover = () => {
                        confirmButton.style.backgroundColor = PRIMARY_HOVER_HEX;
                    };
                    confirmButton.onmouseout = () => {
                        confirmButton.style.backgroundColor = PRIMARY_COLOR_HEX;
                    };
                }
            },

            preConfirm: () => {
                // Collect visible fields
                const name = document.getElementById("name").value.trim();
                const email = document.getElementById("email").value.trim();
                const contact_number = document.getElementById("contact").value.trim();
                const designation = document.getElementById("designation").value.trim();
                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();
                
                // Collect hidden fields (to match the required payload structure)
                const availability = document.getElementById("availability").value;
                const branch_id_val = document.getElementById("branch_id").value;
                
                // Validation
                if (!name || !email || !contact_number || !designation || !username || (!isEdit && !password)) {
                    Swal.showValidationMessage("⚠️ Please fill in all required fields (password required for new users)");
                    return false;
                }

                // Construct payload using requested keys
                const payload = { 
                    name: name, 
                    email: email, 
                    contact_number, 
                    designation, 
                    username,
                    // Use a default for branch_id if empty string (from hidden field) or 'null' if API expects null
                    branch_id: branch_id_val === "" ? null : branch_id_val, 
                    availability: availability,
                };

                // Add password only if provided (required for new, optional for edit)
                if (password || (!isEdit && password)) { 
                    payload.password = password;
                }
                
                return payload;
            },
        });

        if (formValues) {
            try {
                const method = isEdit ? "PUT" : "POST";
                // The API URL uses 'engineers-add' for POST and 'engineers/{id}' for PUT
                const url = isEdit
                    ? `${API_BASE}/engineers/${engineer?.engineer_id}`
                    : `${API_BASE}/engineers-add`;

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formValues), 
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success(`Engineer ${isEdit ? "updated" : "added"} successfully! 🚀`);
                    fetchEngineers();
                } else {
                    toast.error(data.message || `Failed to ${isEdit ? "update" : "add"} engineer.`);
                }
            } catch (err) {
                console.error(err);
                toast.error("An error occurred while saving the engineer.");
            }
        }
    };

    // ---------------------------
    // VIEW DETAILS MODAL (SECURE & ENHANCED LG DESIGN)
    // ---------------------------
    const openDetailsModal = (engineer) => {
        // Determine the engineer's initials for the avatar
        const initials = engineer.engineer_name 
            ? engineer.engineer_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : 'EG'; // Default to 'EG' for Engineer

        Swal.fire({
            // Title is slightly larger and more centered
            title: `<div class="text-2xl font-extrabold text-gray-900 flex items-center justify-center pt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 mr-3 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Engineer Profile Details
                    </div>`,
            
            // SECURE & ENHANCED HTML/CSS for Left Accent Bar, Avatar, and Polished Look
            html: `
                <style>
                    /* Remove default padding to allow accent bar to reach edges */
                    .swal2-content {
                        padding: 0; 
                        overflow: hidden; 
                        margin-bottom: 1.5rem; /* Space before the actions section */
                    }
                    /* MAIN CONTAINER for the accent bar layout */
                    .info-container {
                        display: flex;
                        width: 100%;
                    }
                    /* LEFT ACCENT BAR */
                    .accent-bar {
                        width: 10px; /* Slightly wider accent bar */
                        background-color: ${PRIMARY_COLOR_HEX || '#1565C0'}; /* Using defined primary color */
                        border-radius: 0.75rem 0 0 0.75rem; 
                        flex-shrink: 0;
                        opacity: 0.9; /* Subtle transparency */
                    }
                    /* WRAPPER for content padding */
                    .content-wrapper {
                        flex-grow: 1;
                        padding: 2rem 2rem 1.5rem 2rem; /* Increased padding for an 'lg' feel */
                    }
                    /* Engineer Avatar Section */
                    .avatar-section {
                        display: flex;
                        align-items: center;
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid #e5e7eb; /* Subtle separator line */
                    }
                    .engineer-avatar {
                        width: 60px;
                        height: 60px;
                        background-color: #1f2937; /* Dark background for initials */
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.5rem;
                        font-weight: 700;
                        flex-shrink: 0;
                        margin-right: 1.5rem;
                    }
                    .engineer-name-title {
                        font-size: 1.5rem; /* Large name title */
                        font-weight: 700;
                        color: #111827;
                        line-height: 1.2;
                    }
                    .engineer-designation {
                        font-size: 1rem;
                        color: #4b5563;
                        font-weight: 500;
                    }
                    /* Two-column layout for field presentation */
                    .detail-grid {
                        display: grid;
                        grid-template-columns: 100px 1fr;
                        gap: 1.5rem 1.5rem; /* Increased vertical gap */
                        text-align: left;
                    }
                    /* Label style */
                    .detail-label {
                        font-weight: 600; 
                        color: #6b7280; /* Slightly darker gray for label contrast */
                        text-transform: uppercase;
                        font-size: 0.8rem;
                        letter-spacing: 0.1em; /* Increased letter-spacing */
                        align-self: center; 
                    }
                    /* Value style */
                    .detail-value {
                        font-weight: 700;
                        color: #111827; 
                        padding-bottom: 0.25rem;
                        border-bottom: 1px solid #f3f4f6; 
                        word-break: break-all;
                        font-size: 1rem; /* Slightly larger value text */
                    }
                    /* Status badge remains the same (perfectly styled) */
                    .status-badge {
                        display: inline-flex;
                        padding: 0.2rem 0.6rem;
                        border-radius: 9999px; 
                        font-size: 0.8rem;
                        font-weight: 700;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    }
                    .status-available {
                        background-color: #ecfdf5;
                        color: #065f46;
                    }
                    .status-not-available {
                        background-color: #fef2f2;
                        color: #991b1b;
                    }
                </style>
                
                <div class="info-container">
                    <div class="accent-bar"></div>
                    <div class="content-wrapper">
                        <div class="avatar-section">
                            <div class="engineer-avatar">${initials}</div>
                            <div>
                                <div class="engineer-name-title">${engineer.engineer_name || 'Engineer Profile'}</div>
                                <div class="engineer-designation">${engineer.designation || 'Hardware Engineer'}</div>
                            </div>
                        </div>
                        
                        <div class="detail-grid">
                            <div class="detail-label">ID</div>
                            <div class="detail-value">${engineer.engineer_id || 'N/A'}</div>
                            
                            <div class="detail-label">Username</div>
                            <div class="detail-value">${engineer.username || 'N/A'}</div>
                              <div class="detail-label">Password</div>
                            <div class="detail-value">${engineer.password || 'N/A'}</div>
                            
                            <div class="detail-label">Email</div>
                            <div class="detail-value">${engineer.engineer_email || engineer.user_email || 'N/A'}</div>
                            
                            <div class="detail-label">Contact</div>
                            <div class="detail-value">${engineer.contact_number || 'N/A'}</div>

                            <div class="detail-label">Branch ID</div>
                            <div class="detail-value">${engineer.branch_id || 'N/A'}</div>
                            
                            <div class="detail-label">Status</div>
                            <div class="detail-value">
                                <span class="status-badge ${engineer.availability === 'Available' ? 'status-available' : 'status-not-available'}">
                                    ${engineer.availability || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Close Profile',
            
            customClass: {
                // Added max-w-xl to simulate a larger modal size
                popup: 'rounded-xl shadow-2xl backdrop-blur-sm max-w-xl', 
                container: 'bg-gray-800 bg-opacity-30', 
                actions: 'flex !justify-center pt-4 border-t border-gray-100 mt-4',
                confirmButton: `text-white font-semibold px-6 py-2 rounded-lg transition duration-200`,
            },
            buttonsStyling: false,
            
            didOpen: () => {
                const confirmButton = Swal.getConfirmButton();
                if (confirmButton) {
                    confirmButton.style.backgroundColor = PRIMARY_COLOR_HEX || '#1565C0'; // Use the component's primary color
                    confirmButton.onmouseover = () => { confirmButton.style.backgroundColor = PRIMARY_HOVER_HEX || '#0D47A1'; };
                    confirmButton.onmouseout = () => { confirmButton.style.backgroundColor = PRIMARY_COLOR_HEX || '#1565C0'; };
                }
            },
        });
    };

    // ---------------------------
    // DELETE ENGINEER
    // ---------------------------
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the engineer!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: 'bg-red-600 hover:bg-red-700',
                title: `text-${TEXT_COLOR}`,
            },
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE}/engineers/${id}`, { method: "DELETE" });
                if (res.ok) {
                    toast.success("Engineer deleted successfully! 🗑️");
                    fetchEngineers();
                } else {
                    const error = await res.json();
                    toast.error(error.message || "Failed to delete engineer.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error deleting engineer");
            }
        }
    };

    // SEARCH / FILTER LOGIC
    const filteredEngineers = engineers.filter(
        (eng) =>
            eng.engineer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eng.engineer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eng.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eng.contact_number?.includes(searchTerm)
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50"> 
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow p-4 md:p-8">
                    <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                    <div className="max-w-full mx-auto">
                        {/* Header and Add Button */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                            <h1 className={`text-3xl font-extrabold text-${TEXT_COLOR} tracking-tight`}>Hardware Engineers Directory</h1>
                            <button
                                onClick={() => openEngineerModal(null)}
                                style={{ backgroundColor: PRIMARY_COLOR_HEX }}
                                className={`flex items-center text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-[${PRIMARY_HOVER_HEX}] transition duration-300 transform hover:scale-[1.02] font-semibold`}
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add New Engineer
                            </button>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="mb-8 relative max-w-lg">
                            <input
                                type="text"
                                placeholder="Search by name, email, contact, or designation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-${TEXT_COLOR} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-${ACCENT_COLOR}-${ACCENT_COLOR_SHADE} focus:border-transparent transition duration-150 shadow-sm`}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>

                        {/* Engineers Table */}
                        <div className="overflow-x-auto bg-white shadow-xl rounded-lg border border-gray-100"> 
                            {loading ? (
                                <div className="flex justify-center items-center p-10">
                                    <div className={`animate-spin rounded-full h-10 w-10 border-b-4 border-${ACCENT_COLOR}-${ACCENT_COLOR_SHADE}`}></div>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    {/* TABLE HEAD - Using the custom hex color */}
                                    <thead style={{ backgroundColor: PRIMARY_COLOR_HEX }} className={`text-white`}>
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider rounded-tl-lg">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider hidden md:table-cell">Contact</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Designation</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider rounded-tr-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    {/* TABLE BODY - High Contrast Dark Text with Striping */}
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredEngineers.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className={`text-center p-6 text-${TEXT_COLOR} font-medium`}>
                                                    {searchTerm ? `No engineers found matching "${searchTerm}".` : "No hardware engineers available to display."}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredEngineers.map((eng, index) => (
                                                <tr 
                                                    key={eng.engineer_id} 
                                                    className={`transition duration-150 ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                >
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-${TEXT_COLOR}`}>{eng.engineer_id}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-${TEXT_COLOR} font-medium`}>{eng.engineer_name}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell`}>{eng.engineer_email}</td> 
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell`}>{eng.contact_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {/* Designation Badge - Accent Color */}
                                                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white shadow-md bg-gradient-to-r from-emerald-500 to-teal-500">
                                                        {eng.designation}
                                                    </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            {/* View Details Button (Eye Icon) */}
                                                            <button 
                                                                onClick={() => openDetailsModal(eng)} 
                                                                className={`text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                                title="View Details"
                                                            >
                                                                <EyeIcon />
                                                            </button>
                                                            
                                                            {/* Edit Button - Accent Color */}
                                                            <button 
                                                                onClick={() => openEngineerModal(eng)} 
                                                                className={`text-${ACCENT_COLOR}-${ACCENT_COLOR_SHADE} hover:text-${ACCENT_COLOR}-700 p-2 rounded-full hover:bg-${ACCENT_COLOR}-50 transition duration-150 focus:outline-none focus:ring-2 focus:ring-${ACCENT_COLOR}-${ACCENT_COLOR_SHADE}`}
                                                                title="Edit Engineer"
                                                            >
                                                                <EditIcon />
                                                            </button>
                                                            
                                                            {/* Delete Button - Standard Red for Danger */}
                                                            <button 
                                                                onClick={() => handleDelete(eng.engineer_id)} 
                                                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                                title="Delete Engineer"
                                                            >
                                                                <DeleteIcon />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddHardwareEng;