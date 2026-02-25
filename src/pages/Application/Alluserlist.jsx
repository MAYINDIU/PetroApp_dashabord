import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Layout Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// Icons
import { FaTrash, FaUserEdit, FaSearch, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaUsersSlash, FaCheck, FaTimes } from "react-icons/fa";

// --- Debounce Hook ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// --- UI Sub-components ---

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-4 space-y-2">
                    <div className="h-3 w-28 rounded bg-gray-200"></div>
                    <div className="h-2 w-36 rounded bg-gray-200"></div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-3 w-24 rounded bg-gray-200"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-5 w-20 rounded-full bg-gray-200"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-5 w-20 rounded-full bg-gray-200"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
            <div className="flex justify-center items-center space-x-3">
                <div className="h-5 w-5 rounded bg-gray-200"></div>
                <div className="h-5 w-5 rounded bg-gray-200"></div>
            </div>
        </td>
    </tr>
);

const NoUsersFound = ({ searchTerm }) => (
    <tr>
        <td colSpan="5" className="px-6 py-20 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
                <FaUsersSlash className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No Users Found</h3>
                <p className="text-sm mt-1">
                    {searchTerm ? `Your search for "${searchTerm}" did not return any results.` : "There are currently no users in the system."}
                </p>
            </div>
        </td>
    </tr>
);

const Alluserlist = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const PRIMARY_COLOR = "#1976D2";
    const queryClient = useQueryClient();

    // 1. Fetch Users from API
    const fetchUsers = async (page, perPage, search) => {
        try {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const token = empData?.token;
            const url = new URL("https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users");
            url.searchParams.set('page', page);
            url.searchParams.set('per_page', perPage);
            if (search) url.searchParams.set('search', search);

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.message || "Failed to fetch users");
            return result.data;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    };

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ['users', pagination.page, pagination.perPage, debouncedSearchTerm],
        queryFn: () => fetchUsers(pagination.page, pagination.perPage, debouncedSearchTerm),
        keepPreviousData: true,
        onError: (err) => toast.error(err.message),
    });

    const users = data?.users || [];
    const paginationInfo = data?.pagination || {};

    useEffect(() => {
        // Reset to page 1 when search term changes
        setPagination(p => ({ ...p, page: 1 }));
    }, [debouncedSearchTerm]);

    // 3. Delete Mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const token = empData?.token;
            const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users/${userId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete user');
        },
        onSuccess: () => {
            Swal.fire("Deleted!", "User has been removed.", "success");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    // Approve User Mutation
    const approveUserMutation = useMutation({
        mutationFn: async (userId) => {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const token = empData?.token;
            const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users/${userId}/approve`, {
                method: "PATCH",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to approve user');
            }
            return res.json();
        },
        onSuccess: (data) => {
            Swal.fire("Approved!", data.message || "User has been approved.", "success");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    // Reject User Mutation
    const rejectUserMutation = useMutation({
        mutationFn: async (userId) => {
            const empData = JSON.parse(localStorage.getItem('empData'));
            const token = empData?.token;
            const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/admin/users/${userId}/reject`, {
                method: "PATCH",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to reject user');
            }
            return res.json();
        },
        onSuccess: (data) => {
            Swal.fire("Rejected!", data.message || "User has been rejected.", "success");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const handleDelete = (userId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this user!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) deleteUserMutation.mutate(userId);
        });
    };

    const handleApprove = (userId) => {
        Swal.fire({
            title: 'Approve User?',
            text: "This user will be granted access to the system.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve it!'
        }).then((result) => {
            if (result.isConfirmed) {
                approveUserMutation.mutate(userId);
            }
        })
    };

    const handleReject = (userId) => {
        Swal.fire({
            title: 'Are you sure you want to reject this user?',
            text: "This action will mark the user as rejected.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, reject user!'
        }).then((result) => {
            if (result.isConfirmed) {
                rejectUserMutation.mutate(userId);
            }
        });
    };

    // Helper for Role Badges
    const getRoleBadge = (role) => {
        const styles = {
            super_admin: "bg-purple-100 text-purple-700 border-purple-200",
            station: "bg-blue-100 text-blue-700 border-blue-200",
            driver: "bg-green-100 text-green-700 border-green-200",
            bus_owner: "bg-orange-100 text-orange-700 border-orange-200"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[role.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                {role.replace('_', ' ')}
            </span>
        );
    };

    // Helper for Status Badges
    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-emerald-100 text-emerald-700 border-emerald-200",
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            rejected: "bg-red-100 text-red-700 border-red-200",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-6 md:p-8">
                    <div className="max-w-full mx-auto">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-800">User Management</h1>
                                <p className="text-gray-500 text-sm mt-1">Total {paginationInfo.total || 0} registered users found</p>
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-full md:w-80">
                                <span className={`absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 ${isFetching ? 'animate-pulse' : ''}`}>
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search name, email, phone..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition shadow-sm outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* DataTable Container */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead style={{ backgroundColor: PRIMARY_COLOR }}>
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-widest">User Profile</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-widest">Phone Number</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-widest">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {isLoading && !users.length ? (
                                            <>
                                                <SkeletonRow />
                                                <SkeletonRow />
                                                <SkeletonRow />
                                            </>
                                        ) : users.length > 0 ? (
                                            users.map((user) => (
                                                <tr key={user.id} className="hover:bg-blue-50/30 transition duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                                                {user.name?.charAt(0)}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                                <div className="text-xs text-gray-500">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-700 font-mono">{user.phone || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getRoleBadge(user.role)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(user.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-3">
                                                        {user.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(user.id)}
                                                                    disabled={approveUserMutation.isLoading || rejectUserMutation.isLoading}
                                                                    className="text-green-500 hover:text-green-700 transition disabled:opacity-50"
                                                                    title="Approve User"
                                                                >
                                                                    <FaCheck size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(user.id)}
                                                                    disabled={approveUserMutation.isLoading || rejectUserMutation.isLoading}
                                                                    className="text-orange-500 hover:text-orange-700 transition disabled:opacity-50"
                                                                    title="Reject User"
                                                                >
                                                                    <FaTimes size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {user.status === 'active' && (
                                                            <>
                                                                <button className="text-blue-500 hover:text-blue-700 transition" title="Edit User" >
                                                                    <FaUserEdit size={16} />
                                                                </button>
                                                                <button onClick={() => handleDelete(user.id)} disabled={deleteUserMutation.isLoading} className="text-red-400 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Delete User" >
                                                                    <FaTrash size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) 
                                        ) : ( 
                                            <NoUsersFound searchTerm={debouncedSearchTerm} />
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-2 text-sm">
                                    <span>Rows per page:</span>
                                    <select
                                        value={pagination.perPage}
                                        onChange={e => setPagination({ page: 1, perPage: Number(e.target.value) })}
                                        className="p-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        {[10, 25, 50, 100].map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Page <span className="font-bold text-gray-800">{paginationInfo.current_page || 0}</span> of <span className="font-bold text-gray-800">{paginationInfo.last_page || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: 1 }))}
                                        disabled={pagination.page === 1 || isLoading || isFetching}
                                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                    ><FaAngleDoubleLeft /></button>
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                        disabled={pagination.page === 1 || isLoading || isFetching}
                                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                    ><FaChevronLeft /></button>
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                        disabled={pagination.page === paginationInfo.last_page || isLoading || isFetching}
                                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                    ><FaChevronRight /></button>
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: paginationInfo.last_page }))}
                                        disabled={pagination.page === paginationInfo.last_page || isLoading || isFetching}
                                        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                    ><FaAngleDoubleRight /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer position="bottom-right" theme="colored" />
        </div>
    );
};

export default Alluserlist;