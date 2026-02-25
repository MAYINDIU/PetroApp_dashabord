import React, { useState } from 'react';
// Note: Imports for local files (like '../images/nli.jpg') are removed
// and replaced with constants using placeholder URLs to ensure the single-file
// component renders correctly in the environment.

// --- CONFIGURATION AND ASSET PLACEHOLDERS ---
// Replicating the user's variable name 'logo' for the image source
import logo from '../images/icon.png';
const BACKGROUND_IMAGE_URL = "https://images.unsplash.com/photo-1567789884554-0b844b5986c1?q=80&w=2070&auto=format&fit=crop"; 
const API_URL = "https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/auth/login"; // New API Endpoint
import { Link, useNavigate } from 'react-router-dom';
// --- Custom Spinner Component ---
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Custom Inline SVG Icons (Feather Icons Style) ---
const UserIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.52 19c.64-2.2 1.84-3.5 4.54-4.5 1-.4 2-.5 3-.5s2 .1 3 .5c2.7 1 3.9 2.3 4.54 4.5" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LockIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

// NEW: Eye Icon for visible password
const EyeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

// NEW: Eye Off Icon for hidden password
const EyeOffIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.46m5.88-1.78A13.25 13.25 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path>
    </svg>
);

// --- Custom Notification Component (Replaces Swal/Toast) ---
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl transition-all duration-300 z-50 transform translate-y-0";
    // Kept standard red/green for utility, but updated border color to match theme
    const typeClasses = type === 'error' 
        ? "bg-red-700 text-white border-l-4 border-amber-400" 
        : "bg-green-600 text-white border-l-4 border-amber-400";

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <div className="flex items-center space-x-3">
                <span className="font-semibold">{type === 'error' ? 'Error' : 'Success'}:</span>
                <span>{message}</span>
            </div>
            {/* Simple close button for better UI experience */}
            <button onClick={onClose} className="absolute top-1 right-2 text-sm opacity-70 hover:opacity-100">
                &times;
            </button>
        </div>
    );
};


const Login = () => {
    const [emailInput, setEmailInput] = useState('admin@cashlessfuel.test');
    const [passwordInput, setPasswordInput] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    // NEW: State to control password visibility
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    // Mock navigation function
 

    // Notification handler
    const showNotification = (type, message) => {
        setNotification({ message, type });
        // Auto-close notification after 5 seconds
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };
    
    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const login = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const email = emailInput.trim();
        const password = passwordInput.trim();

        if (password.length < 6) {
            showNotification('error', 'Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            // 1. --- Perform the POST request to the local API endpoint ---
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email, // Using user's input for email
                    password: password, // Using user's input for password
                }),
            });

            const data = await response.json();

            if (data.success) {
                // 2. Success: Store the entire response body in localStorage
                localStorage.setItem('empData', JSON.stringify(data?.data)); 
                
                showNotification('success', 'Login successful! Stored data in localStorage and redirecting...');
                navigate('/dashboard'); 

            } else {
                // 3. Handle HTTP errors (4xx, 5xx)
                // Use data.message if available in the response body, or a generic message
                showNotification('error', data.message || 'Authentication Failed: Invalid User ID or Password.');
            }
        } catch (error) {
            // 4. Handle network errors (e.g., server not reachable)
            console.error("Login Network Error:", error);
            showNotification('error', `Network Error: Could not connect to the server at ${API_URL}. Check your backend service.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1565C0] p-4 font-inter antialiased">
            {/* Background Image & Overlay for Industrial Theme */}
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900/90 via-[#0D47A1]/80 to-slate-900/90 backdrop-blur-sm"></div>

            {/* Main Card Container */}
            <div className="relative z-10 bg-slate-900/60 backdrop-blur-md shadow-2xl shadow-black/50 rounded-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row border border-white/10 transition-all duration-300">
                
                {/* Left Side: Branded Visual Section (Deep Blue) */}
                <div className="hidden md:flex w-full md:w-1/2 items-center justify-center relative text-white overflow-hidden">
                    {/* Background Image/Visual */}
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0D47A1]/80 to-slate-900/90"></div>
                    
                    {/* Content Overlay */}
                    <div className="relative z-10 text-center space-y-6">
                        <img
                            className="w-64 h-48 mx-auto rounded-md"
                            src={logo} // Uses the 'logo' constant
                            alt="Logo"
                        />
                        <h1 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 drop-shadow-sm">
                          PETROPAY
                        </h1>
                        <p className="text-lg font-light opacity-90 text-blue-100 max-w-xs mx-auto leading-relaxed">
                            Advanced Fuel Logistics & Asset Intelligence System
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form Section (Dark Glassy) */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/80">
                    <h2 className="text-3xl font-bold text-white text-center mb-2 tracking-wide">
                        Welcome Back
                    </h2>
                    <p className="text-center text-gray-400 mb-10 text-sm">Enter your credentials to access the fuel dashboard</p>

                    <form onSubmit={login} className="w-full max-w-sm mx-auto">
                        
                        {/* User ID */}
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-xs font-bold uppercase text-amber-500 mb-2 tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    className="pl-10 pr-4 py-3 block w-full bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 transition duration-150 focus:outline-none focus:bg-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
                                    placeholder="Enter Email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-8">
                            <label htmlFor="password" className="block text-xs font-bold uppercase text-amber-500 mb-2 tracking-wider">
                                Password (min. 8 characters)
                            </label>
                            <div className="relative">
                                {/* Lock Icon on the left */}
                                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                
                                {/* Password Input - Type changes based on state */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="pl-10 pr-12 py-3 block w-full bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 transition duration-150 focus:outline-none focus:bg-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
                                    placeholder="******** (min. 8 characters)"
                                    required
                                />

                                {/* NEW: Password Visibility Toggle Button on the right */}
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-150 p-1"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link (Simulated NavLink) */}
                        <div className="flex justify-end mb-8">
                            <a
                                href="#" // Use anchor tag as NavLink placeholder
                                className="text-sm font-medium text-amber-500 hover:text-amber-300 transition duration-150"
                                onClick={(e) => { e.preventDefault(); console.log('Forgot Password clicked'); }}
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* Login Button - Updated to Blue/Gold Theme */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white text-lg font-bold py-3 rounded-lg shadow-lg tracking-widest transition-all duration-300 flex items-center justify-center transform active:scale-[0.99]
                                ${isLoading 
                                    ? 'bg-[#0D47A1]/60 cursor-not-allowed text-gray-300' 
                                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/30'
                                }`
                            }
                        >
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    AUTHENTICATING...
                                </>
                            ) : (
                                ' LOGIN'
                            )}
                        </button>

                    <div className="mt-8 flex flex-col items-center">
                        <div className="w-full flex items-center mb-6">
                            <div className="flex-grow border-t border-slate-700"></div>
                            <span className="px-3 text-gray-400 text-xs uppercase tracking-widest">Or</span>
                            <div className="flex-grow border-t border-slate-700"></div>
                        </div>

                        <Link
                            to="/registration"
                            className="w-full bg-transparent hover:bg-slate-800 text-amber-500 text-center py-3 rounded-lg border border-slate-600 hover:border-amber-500 transition-all duration-300 font-bold tracking-widest text-sm uppercase"
                        >
                            Create New Account
                        </Link>
                    </div>
                        
                    </form>
                </div>
            </div>
            
            {/* Custom Notification Container (Replaces ToastContainer) */}
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: '' })}
            />
        </div>
    );
};

export default Login;
