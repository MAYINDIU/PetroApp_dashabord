import React, { useState } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import DashboardCard04 from '../partials/dashboard/DashboardCard04';
import logo from '../images/icon.png';
function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);



  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
        <div className=" w-full max-w-full mx-auto">

            {/* Dashboard actions */}
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="mt-5 flex justify-center rounded-xl mt-0 h-32 lg:h-[150px]">
                  <img className="shadow-lg rounded-lg" src={logo} alt="" />
                </div>
                <h1 className="text-shadow-xl text-xl md:text-xl mt-5 text-gray-800 dark:text-gray-100 font-bold">
                  PETRO <span className="text-[#00ACC1]">FUEL & ASSET</span> MANAGER
                </h1>

              </div>
            </div>


            {/* Cards */}
            <div className="">
              {/* <DashboardCard01 />
              <AttendanceInfo /> */}
              {/* Line chart (Acme Advanced) */}
              {/* <DashboardCard02 /> */}
              {/* Line chart (Acme Professional) */}
           
              {/* Bar chart (Direct vs Indirect) */}
              <DashboardCard04 />
              {/* Line chart (Real Time Value) */}
              {/* <DashboardCard05 /> */}
              {/* Doughnut chart (Top Countries) */}
              {/* <DashboardCard06 />
              <DashboardCard07 /> */}
              
            </div>

          </div>
        </main>

   

      </div>
    </div>
  );
}

export default Dashboard;