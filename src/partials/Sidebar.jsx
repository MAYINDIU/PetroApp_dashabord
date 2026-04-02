import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { AiOutlineContainer } from "react-icons/ai";
import { 
  Users , ClipboardList , Search, Loader2, X, Save, 
  ShieldCheck, Building2, // <--- Add this
  User2
} from "lucide-react";

// import { BiSolidUserDetail } from "react-icons/bi";
import logo from '../images/icon.png';
function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");
    const empData = JSON.parse(localStorage.getItem('empData'));
        const userDetails=empData?.user;
// Example usage
      

    const role=(userDetails?.role);
    // console.log(role);


  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:!flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : ' shadow-sm'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-5 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/dashboard" className="block">
          <div className="flex">
         
            
                        <img
                        className="rounded-full h-12 w-12"
                        src={logo}
                        alt=""
                        />
                   
            <h2 className="ml-2 mt-3 text-gray-800 dark:text-gray-100 font-bold">  <span className="text-sm lg:text-md  dark:text-white text-[#0D47A1]">PETROPAY</span></h2>
          
          </div>
           
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
           {/* Head office Employee link */}

              {role === "super_admin" && (
             <div>
             <ul className="mt-0">
              {/* Dashboard */}
              <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                       <Link
                        to="/dashboard"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          pathname === "/"  || pathname.includes("/dashboard") ? "" : "hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => {
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                          <svg 
                          className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z"/>
                        </svg>                        
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Dashboard
                            </span>
                          </div>
                       
                        </div>
                        </Link>
                    
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
     
            </ul>
        
  


            <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/user-list" || pathname.includes("/user-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/user-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/user-list" || pathname.includes("dashboard") || pathname.includes("/user-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/user-list" || pathname.includes("dashboard") || pathname.includes("/user-list") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          All User List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

         
                   
                    <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/station-ledger" || pathname.includes("/station-ledger")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/station-ledger"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/station-ledger" || pathname.includes("dashboard") || pathname.includes("/station-ledger") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/station-ledger" || pathname.includes("dashboard") || pathname.includes("/station-ledger") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Station Ledger
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                   
    <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/settlement-list" || pathname.includes("/settlement-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/settlement-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/settlement-list" || pathname.includes("dashboard") || pathname.includes("/settlement-list") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/settlement-list" || pathname.includes("dashboard") || pathname.includes("/settlement-list") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Settlement List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                    <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/topup-for-bus-owner" || pathname.includes("/topup-for-bus-owner")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/topup-for-bus-owner"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/topup-for-bus-owner" || pathname.includes("dashboard") || pathname.includes("/topup-for-bus-owner") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/topup-for-bus-owner" || pathname.includes("dashboard") || pathname.includes("/topup-for-bus-owner") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Topup For Bus Owner
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

  <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/account-summary" || pathname.includes("/account-summary")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/account-summary"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/account-summary" || pathname.includes("dashboard") || pathname.includes("/account-summary") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/account-summary" || pathname.includes("dashboard") || pathname.includes("/topup-for-bus-owner") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                       Account Summary
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   
                   
                    <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/ledger-statement" || pathname.includes("/ledger-statement")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/ledger-statement"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/ledger-statement" || pathname.includes("dashboard") || pathname.includes("/ledger-statement") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/ledger-statement" || pathname.includes("dashboard") || pathname.includes("/topup-for-bus-owner") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Station Ledger Statement
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                     <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/leadger-Transport-owner" || pathname.includes("/leadger-Transport-owner")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/leadger-Transport-owner"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/leadger-Transport-owner" || pathname.includes("dashboard") || pathname.includes("/leadger-Transport-owner") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/leadger-Transport-owner" || pathname.includes("dashboard") || pathname.includes("/topup-for-bus-owner") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                   Leadger Transport owner
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
            
             </div>
             )}

            {role === "bus_owner" && (
             <div>
             <ul className="mt-0">
              {/* Dashboard */}
              <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                       <Link
                        to="/dashboard"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          pathname === "/"  || pathname.includes("/dashboard") ? "" : "hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => {
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                          <svg 
                          className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z"/>
                        </svg>                        
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Dashboard
                            </span>
                          </div>
                       
                        </div>
                        </Link>
                    
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
     
            </ul>
        
       
           <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/wallet-and-transaction-list" || pathname.includes("/wallet-and-transaction-list")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/wallet-and-transaction-list"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/assignment-list" || pathname.includes("dashboard") || pathname.includes("/") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/wallet-and-transaction-list" || pathname.includes("dashboard") || pathname.includes("/wallet-and-transaction-list") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          Transactions List
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

            <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/transport-entry" || pathname.includes("/transport-entry")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/transport-entry"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/assignment-list" || pathname.includes("dashboard") || pathname.includes("/") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/transport-entry" || pathname.includes("dashboard") || pathname.includes("/assignment-list") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          Transport Entry
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   
            <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/create-driver" || pathname.includes("/create-driver")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/create-driver"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/create-driver" || pathname.includes("dashboard") || pathname.includes("/") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/create-driver" || pathname.includes("dashboard") || pathname.includes("/create-driver") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         Create Driver
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   
                   <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/assign-driver" || pathname.includes("/assign-driver")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/assign-driver"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/assign-driver" || pathname.includes("dashboard") || pathname.includes("/") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/assign-driver" || pathname.includes("dashboard") || pathname.includes("/assign-driver") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         Assign Driver
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                      <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/single-driver-topup" || pathname.includes("/single-driver-topup")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/single-driver-topup"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/single-driver-topup" || pathname.includes("dashboard") || pathname.includes("/single-driver-topup") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/single-driver-topup" || pathname.includes("dashboard") || pathname.includes("/single-driver-topup") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         Single Driver Topup
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>
                   
                      <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/multiple-driver-topup" || pathname.includes("/multiple-driver-topup")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/multiple-driver-topup"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/multiple-driver-topup" || pathname.includes("dashboard") || pathname.includes("/multiple-driver-topup") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/multiple-driver-topup" || pathname.includes("dashboard") || pathname.includes("/multiple-driver-topup") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         Multiple Driver Topup
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

             <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/report-by-driver" || pathname.includes("/report-by-driver")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/report-by-driver"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/report-by-driver" || pathname.includes("dashboard") || pathname.includes("/report-by-driver") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/report-by-driver" || pathname.includes("dashboard") || pathname.includes("/multiple-driver-topup") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Report By Driver
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   
                   
    <ul className="mt-1">
                <SidebarLinkGroup activecondition={pathname === "/summary-report" || pathname.includes("/summary-report")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <Link
                          to="/summary-report"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname === "/summary-report" || pathname.includes("dashboard") || pathname.includes("/summary-report") 
                              ? "" 
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AiOutlineContainer 
                                className={`shrink-0 fill-current ${pathname === "/summary-report" || pathname.includes("dashboard") || pathname.includes("/summary-report") 
                                  ? 'text-violet-500' 
                                  : 'text-gray-400 dark:text-gray-500'}`}
                              />
                              <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Summary Report
                              </span>
                            </div>
                          </div>

                        </Link>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                   </ul>

                   

            
             </div>
             )}


              {role === "station" && (
              <div className="px-0"> {/* Added slight horizontal padding to the container */}
                <ul className="mt-0 space-y-0"> {/* Reduced vertical gap between items */}
                  
                  {/* Dashboard */}
                  <SidebarLinkGroup activecondition={pathname === "/" || pathname.includes("dashboard")}>
                    {(handleClick, open) => (
                      <Link
                        to="/dashboard"
                        className={`flex items-center text-gray-700 dark:text-gray-200 truncate transition duration-150 py-1.5 rounded-md ${
                          pathname === "/" || pathname.includes("/dashboard") 
                            ? "bg-violet-50 dark:bg-violet-500/10 border-l-4 border-violet-500" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-center">
                          <svg
                            className={`shrink-0 fill-current ${pathname === "/" || pathname.includes("dashboard") ? 'text-violet-500' : 'text-gray-400'}`}
                            width="18" height="18" viewBox="0 0 24 24"
                          >
                            <path d="M12 3.09L2 12h3v7h4v-4h6v4h4v-7h3z" />
                          </svg>
                          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            Dashboard
                          </span>
                        </div>
                      </Link>
                    )}
                  </SidebarLinkGroup>

                  {/* ========== USERS & GROUPS DROPDOWN ========== */}
                  <SidebarLinkGroup activecondition={pathname.includes("/station-userlist") || pathname.includes("/station-group-list")}>
                    {(handleClick, open) => (
                      <React.Fragment>
                        <a
                          href="#"
                          className={`block text-gray-700 dark:text-gray-200 truncate transition duration-150 p-1.5 rounded-md ${
                            open ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User2 size={18} className={`shrink-0 ${open || pathname.includes("station") ? "text-violet-500" : "text-gray-400"}`} />
                              <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                Users & Groups
                              </span>
                            </div>
                            <svg className={`w-3 h-3 shrink-0 fill-current text-gray-400 transition-transform duration-200 ${open && "rotate-180"}`} viewBox="0 0 12 12">
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </svg>
                          </div>
                        </a>
                        <div className={`${!open && "hidden"}`}>
                          <ul className="pl-8 mt-0.5 space-y-0.5 border-l border-gray-200 dark:border-gray-700 ml-4">
                            <li>
                              <Link to="/station-userlist" className={`block py-1 px-2 text-xs transition duration-150 ${pathname.includes("/station-userlist") ? "text-violet-600 font-bold" : "text-gray-500 hover:text-gray-800"}`}>
                                Station Users
                              </Link>
                            </li>
                            <li>
                              <Link to="/station-group-list" className={`block py-1 px-2 text-xs transition duration-150 ${pathname.includes("/station-group-list") ? "text-violet-600 font-bold" : "text-gray-500 hover:text-gray-800"}`}>
                                Groups
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </React.Fragment>
                    )}
                  </SidebarLinkGroup>

                  {/* ========== COMPACT LINKS HELPERS ========== */}
                  {[
                    { to: "/station-branchlist", label: "Branches", icon: Building2 },
                    { to: "/workerslist", label: "Workers", icon: Users },
                    { to: "/workerslist-logs", label: "Workers Logs", icon: ClipboardList },
                    { to: "/changefuel-price-request", label: "Fuel Price Request", icon: ClipboardList },
                    { to: "/ledger-report", label: "Sales List", icon: ClipboardList },
                    { to: "/purchase-order-list", label: "P.O Ledger", icon: ClipboardList },
                    { to: "/electronic-bill", label: "Electronic Bills", icon: ClipboardList },
                    { to: "/bill-vat-report", label: "VAT Reports", icon: ClipboardList },
                  ].map((item) => (
                    <SidebarLinkGroup key={item.to} activecondition={pathname === item.to}>
                      {() => (
                        <Link
                          to={item.to}
                          className={`flex items-center text-gray-700 dark:text-gray-200 truncate transition duration-150 p-1.5 rounded-md ${
                            pathname === item.to 
                              ? "bg-violet-50 dark:bg-violet-500/10 border-l-4 border-violet-500" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent"
                          }`}
                        >
                          <item.icon size={18} className={`shrink-0 ${pathname === item.to ? 'text-violet-500' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </SidebarLinkGroup>
                  ))}

                </ul>
              </div>
            )}
                        
          





         
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
