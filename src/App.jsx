import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';



import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AddApplication from './pages/Application/AddApplication';
import ApplicationListadmin from './pages/Application/ApplicationListadmin';
import MyAssigments from './pages/Application/MyAssigments';
import Registration from './pages/Application/Registration';
import Alluserlist from './pages/Application/Alluserlist';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import TransportEntry from './pages/Transport_owner/TransportEntry';
import CreateDriver from './pages/Transport_owner/CreateDriver';
import SingleDriverTopup from './pages/TopUp/SingleDriverTopup';
import MultipleDriverTopup from './pages/TopUp/MultipleDriverTopup';
import StationLedger from './pages/Ledger/StationLedger';
import AssignDriver from './pages/Transport_owner/AssignDriver';

function App() {

  const location = useLocation();
const queryClient = new QueryClient();
  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
<QueryClientProvider client={queryClient}>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/registration" element={<Registration />} />
        <Route exact path="/user-list" element={<Alluserlist />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/dashboard" element={<Dashboard />} />
    <Route exact path="/single-driver-topup" element={<SingleDriverTopup />} />
    <Route exact path="/multiple-driver-topup" element={<MultipleDriverTopup />} />

  <Route exact path="/station-ledger" element={<StationLedger />} />
    



      <Route exact path="/transport-entry" element={<TransportEntry />} />
      <Route exact path="/create-driver" element={<CreateDriver />} />
      <Route exact path="/assign-driver" element={<AssignDriver />} />


      </Routes>
      
      {/* The Devtools will appear in the bottom right of your screen */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
