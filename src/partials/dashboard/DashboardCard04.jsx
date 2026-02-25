import React, { useState, useEffect } from 'react';

// --- 0. Inline SVG Icons ---
const baseSvgProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

const MailIcon = (props) => (
    <svg {...baseSvgProps} {...props} className={props.className}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const CalendarIcon = (props) => (
    <svg {...baseSvgProps} {...props} className={props.className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IdCardIcon = (props) => (
    <svg {...baseSvgProps} {...props} className={props.className}>
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <line x1="6" y1="10" x2="6" y2="10" />
        <path d="M10 10h10" />
        <line x1="6" y1="14" x2="6" y2="14" />
        <path d="M10 14h10" />
    </svg>
);

const GitBranchIcon = (props) => (
    <svg {...baseSvgProps} {...props} className={props.className}>
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
);

const PhoneIcon = (props) => (
    <svg {...baseSvgProps} {...props} className={props.className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const UserCircleIcon = (props) => (
    <svg {...baseSvgProps} {...props} className={props.className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
);

// --- 2. Helper Components ---
const InfoBlock = ({ Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-lg bg-slate-800/50 p-3 transition-colors hover:bg-slate-800">
        <Icon className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-slate-200 break-all">{value || 'N/A'}</p>
        </div>
    </div>
);

// --- 3. Main Application Component ---
const DashboardCard04 = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const empData = JSON.parse(localStorage.getItem('empData'));
    const userDetails = empData?.user;

    // Updated destructuring based on new JSON structure
    const { name, email, role, id, phone, status, created_at } = userDetails || {};

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const time = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
    const registrationDate = new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white shadow-2xl rounded-2xl p-6 sm:p-8 border border-slate-700">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-1 shadow-lg flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                                <UserCircleIcon className="w-12 h-12 text-indigo-300" />
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="flex-grow w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                            {/* User name and role */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{name || 'User'}</h1>
                                <p className="text-base font-medium text-indigo-300 capitalize">{role || 'Role'}</p>
                            </div>
                            {/* Clock */}
                            <div className="flex-shrink-0">
                                <div className="bg-slate-800/50 rounded-lg p-3 shadow-inner border border-slate-700/50 text-center">
                                    <span className="text-2xl font-mono font-bold text-teal-300 block leading-none">{time}</span>
                                    <span className="text-xs font-medium text-indigo-300 block mt-1 uppercase tracking-tight">{formattedDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-4 flex justify-center md:justify-start">
                            <div className="inline-flex items-center gap-x-2 rounded-full bg-teal-500/20 px-3 py-1 text-sm font-medium text-teal-300">
                                <div className="h-2.5 w-2.5 flex-none rounded-full bg-teal-400" />
                                <span className="capitalize">{status || 'Active'}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="my-6 border-slate-700" />

                        {/* Info Blocks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoBlock Icon={IdCardIcon} label="User ID" value={id} />
                            <InfoBlock Icon={MailIcon} label="Email Address" value={email} />
                            <InfoBlock Icon={PhoneIcon} label="Phone Number" value={phone} />
                            <InfoBlock Icon={CalendarIcon} label="Member Since" value={registrationDate} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default DashboardCard04;