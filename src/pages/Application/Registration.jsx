import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../images/icon.png';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.46m5.88-1.78A13.25 13.25 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path>
  </svg>
);

const Registration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState(''); // default role
  const [station, setStation] = useState('');
  const [stations, setStations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const navigate = useNavigate();



  const showNotification = (type, message) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !passwordConfirmation) {
      showNotification('error', 'Please fill all fields');
      return;
    }
   
    if (password !== passwordConfirmation) {
      showNotification('error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const payload = { name, email, phone, password, password_confirmation: passwordConfirmation, role };


    try {
      const response = await fetch('https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        showNotification('success', 'Account registered successfully! Pending approval.');
        setTimeout(() => navigate('/'), 2000);
      } else {
        const errorMessage = result.errors ? Object.values(result.errors).flat().join(' ') : (result.message || 'Registration failed');
        showNotification('error', errorMessage);
      }
    } catch (error) {
      showNotification('error', 'API request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 antialiased font-inter">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#020617] via-[#0D47A1] to-black opacity-90"></div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] w-full max-w-4xl overflow-hidden flex flex-col md:flex-row border border-white/10 transition-all duration-500">
        {/* LEFT SIDE: LOGO */}
        <div className="hidden md:flex w-full md:w-1/4 items-center justify-center bg-black/40 p-8 border-r border-white/5">
          <div className="text-center space-y-6">
            <img src={logo} alt="Logo" className="w-28 h-28 mx-auto rounded-full shadow-2xl border-4 border-amber-500/50 p-1 object-cover" />
            <div>
              <h1 className="text-xl font-black tracking-widest text-white uppercase">PETROPAY</h1>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="w-full md:w-3/4 p-6 sm:p-10 lg:p-12 space-y-6 bg-gradient-to-b from-transparent to-black/30">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Create an Account</h2>
              <p className="text-slate-400 text-sm">Register a new user for the Petropay system.</p>
            </div>
            <Link to="/" className="text-amber-500 text-xs font-bold hover:underline tracking-widest uppercase mb-1">
              Back to Login
            </Link>
          </div>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-400" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-400" />
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-400" />

            {/* Role Dropdown */}
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-400">
              <option value="">Select Role</option>
              <option value="bus_owner">Transport Owner</option>
              <option value="station">Station</option>
            </select>

          

            {/* Password Fields */}
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-400 pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-amber-500">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3.5 text-white placeholder:text-slate-400 pr-12" />
          </form>

          <button onClick={handleRegister} disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black py-4 rounded-xl shadow-xl transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] flex justify-center items-center group">
            {isSubmitting ? <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : "Create Account"}
          </button>
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

export default Registration;