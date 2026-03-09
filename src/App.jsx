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
import SettelementListAdmin from './pages/TopUp/SettelementListAdmin';
import SettelementStation from './pages/TopUp/SettelementStation';
import StationUserlist from './pages/StationPanel/StationUserlist';
import StationGroup from './pages/StationPanel/StationGroup';
import StationUserlists from './pages/StationPanel/StationUserlist';
import BranchesList from './pages/StationPanel/BranchesList';
import Workerslist from './pages/StationPanel/Workerslist';
import WorkersLogList from './pages/StationPanel/WorkersLogList';
import ChangefuelPriceRequest from './pages/StationPanel/ChangefuelPriceRequest';
import PurchaseOrderLedger from './pages/StationPanel/PurchaseOrderLedger';
import ElectronicBill from './pages/StationPanel/ElectronicBill';
import BillvatReport from './pages/StationPanel/BillvatReport';
import LedgerReport from './pages/StationPanel/LedgerReport';

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
    <Route exact path="/settlement-list" element={<SettelementListAdmin />} />
    <Route exact path="/settlement-list-station" element={<SettelementStation />} />
  
    
    {/* //Station Panel */}
      <Route exact path="/station-userlist" element={<StationUserlists />} />
      <Route exact path="/station-group-list" element={<StationGroup />} />
      <Route exact path="/station-branchlist" element={<BranchesList />} />
      <Route exact path="/workerslist" element={<Workerslist />} />
      <Route exact path="/workerslist-logs" element={<WorkersLogList />} />
      <Route exact path="/changefuel-price-request" element={<ChangefuelPriceRequest />} />
      <Route exact path="/purchase-order-list" element={<PurchaseOrderLedger />} />
      <Route exact path="/electronic-bill" element={<ElectronicBill />} />
      <Route exact path="/bill-vat-report" element={<BillvatReport />} />
      
      <Route exact path="/ledger-report" element={<LedgerReport />} />
      
      
      
      

    {/* //Station Panel */}

    



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
