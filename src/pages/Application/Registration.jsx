import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../images/nli.jpg';

// --- CUSTOM ICONS ---
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.46m5.88-1.78A13.25 13.25 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg>
);

const Registration = () => {
    const [empId, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [empData, setEmpData] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const navigate = useNavigate();

    const showNotification = (type, message) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const handleIdChange = async (e) => {
        const value = e.target.value;
        setEmpId(value);

        if (value.length >= 4) {
            setIsLoading(true);
            try {
                // Fetching from your ORDS endpoint
                const response = await fetch(`http://192.168.60.225:8080/ords/nli/EMPLOYEE/${value}`);
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    setEmpData(data.items[0]);
                } else {
                    setEmpData(null);
                }
            } catch (error) {
                console.error("ORDS Error:", error);
                setEmpData(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setEmpData(null);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!password || password.length < 6) {
            showNotification('error', "Please enter a password (min 6 characters)");
            return;
        }

        setIsSubmitting(true);

        const finalPayload = {
            username: String(empData.emp_id),
            password: password,
            full_name: empData.emp_name,
            email: `${empData.emp_id}@nli-bd.com`, 
            department: empData.department,
            zone_code: parseInt(empData.zone_code),
            zone_name: empData.zone_name,
            branch_code: parseInt(empData.branch_code),
            branch_anme: empData.branch_anme,
            role: "office"
        };

        try {
            const response = await fetch('http://192.168.11.138:5005/api/users/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('success', "Account successfully registered!");
                setTimeout(() => navigate('/'), 2000);
            } else {
                showNotification('error', result.message || "Registration failed.");
            }
        } catch (error) {
            showNotification('error', "Connection failed. Check your API server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 antialiased font-inter">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#020617] via-[#0D47A1] to-black opacity-90"></div>

            <div className="relative z-10 bg-slate-900/60 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] w-full max-w-5xl overflow-hidden flex flex-col md:flex-row border border-white/10 transition-all duration-500">
                
                {/* LEFT SIDE: BRANDING */}
                <div className="hidden md:flex w-full md:w-1/4 items-center justify-center bg-black/40 p-8 border-r border-white/5">
                    <div className="text-center space-y-6">
                        <img src={logo} alt="Logo" className="w-28 h-28 mx-auto rounded-full shadow-2xl border-4 border-amber-500/50 p-1 object-cover" />
                        <div>
                            <h1 className="text-xl font-black tracking-widest text-white uppercase">NLI <span className="text-amber-500">Systems</span></h1>
                            <p className="text-blue-200 text-[9px] font-bold uppercase tracking-[0.3em] opacity-50 mt-2">Hardware Tracker</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: FORM & DATA DISPLAY */}
                <div className="w-full md:w-3/4 p-6 sm:p-10 lg:p-12 space-y-6 bg-gradient-to-b from-transparent to-black/30">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Registration</h2>
                            <p className="text-slate-400 text-sm">Verify your employee details to create an account.</p>
                        </div>
                        <Link to="/" className="text-amber-500 text-xs font-bold hover:underline tracking-widest uppercase mb-1">
                            Login instead?
                        </Link>
                    </div>
                    
                    {/* TOP SECTION: ID & PASSWORD */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Employee ID</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={empId}
                                    onChange={handleIdChange}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white focus:border-amber-500 outline-none transition-all shadow-inner placeholder:text-slate-800"
                                    placeholder="Enter Employee ID"
                                />
                                {isLoading && (
                                    <div className="absolute right-4 top-3.5 animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                                )}
                            </div>
                        </div>

                        <div className={`space-y-1.5 transition-all duration-500 ${empData ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Set Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white focus:border-amber-500 outline-none pr-12"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-slate-500 hover:text-amber-500"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DATA CARD SECTION */}
                    <div className="relative min-h-[280px]">
                        {empData ? (
                            <div className="animate-in zoom-in-95 duration-500 bg-slate-950/40 border border-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-2xl border-l-4 border-l-amber-500">
                                {/* Header: Name & Status */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-6 mb-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Employee Name</p>
                                        <h3 className="text-2xl font-black text-white">{empData.emp_name}</h3>
                                        <p className="text-slate-400 text-sm font-medium">{empData.emp_designation}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${empData.emp_close_status === 'NO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {empData.emp_close_status === 'NO' ? 'ACTIVE' : 'CLOSED'}
                                        </span>
                                    </div>
                                </div>

                                {/* Full Info Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                                    <InfoItem label="Employee ID" value={empData.emp_id} />
                                    <InfoItem label="Department" value={empData.department} />
                                    <InfoItem label="Zone Name" value={empData.zone_name} />
                                    <InfoItem label="Branch Name" value={empData.branch_anme} />
                                    <InfoItem label="Zone Code" value={empData.zone_code} />
                                    <InfoItem label="Branch Code" value={empData.branch_code} />
                                </div>

                                {/* Register Button */}
                                <button 
                                    onClick={handleRegister}
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black py-4 rounded-xl shadow-xl transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] mt-10 flex justify-center items-center group"
                                >
                                    {isSubmitting ? (
                                        <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            CONFIRM & CREATE ACCOUNT
                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="h-64 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 transition-colors hover:border-slate-700">
                                <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Awaiting Employee Verification</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NOTIFICATION TOAST */}
            {notification.message && (
                <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl z-50 transition-all border-l-4 animate-bounce-short ${notification.type === 'error' ? 'bg-red-950 text-red-200 border-red-500' : 'bg-emerald-950 text-emerald-200 border-emerald-500'}`}>
                    <div className="flex items-center space-x-3">
                        <span className="font-black uppercase text-[10px]">{notification.type}</span>
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simplified Sub-component for individual info fields
const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">{label}</p>
        <p className="text-white text-sm font-bold truncate bg-white/5 rounded-lg py-2 px-3 border border-white/5">
            {value || 'N/A'}
        </p>
    </div>
);

export default Registration;