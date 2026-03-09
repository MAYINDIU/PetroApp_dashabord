import React, { useEffect, useState } from 'react';
import logo from '../images/nli.jpg';
import { NavLink, useNavigate } from 'react-router-dom';
import { publicIp } from 'public-ip';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Register = () => {

  const navigate = useNavigate();
  const [ORG_CODE, setEmpCode] = useState(null);
  const [incharge_code, setInchargeCode] = useState(null);
  const [ORG_CODEs, setEmpCodes] = useState(null);
  const [empData, setEmpData] = useState(null);
  const [empDatas, setEmpDatas] = useState(null);
  const [incharge_data, setInchargedata] = useState(null);
// console.log(incharge_data)

 const inch_success=incharge_data && incharge_data[0]?.success;
//  console.log(inch_success)

  const [orgCode, setOrganzierCode] = useState("");
  const [iname, setName] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [PASSWORD, setPassword] = useState("");
  const [EMP_PASSWORD, setEmpPassword] = useState("");
  const [refetch, setRefetch] = useState(false);
// console.log(EMP_PASSWORD)



//Out of head office corporate zone

const [cinchargedatedata, setCInchargedataout] = useState([]);
const [cincharge_out_ofc, setCInchargeoutCode] = useState("");



// console.log(cinchargedatedata)

const cinformationOutIncharge= (event) => {
  event.preventDefault();
  const cincharge_out = event.target.cout_office_inch_Code.value;
  setCInchargeoutCode(cincharge_out); // Update empCode state
};


useEffect(() => {
  if (cincharge_out_ofc) {
      fetch(`https://app2.primeislamilifeinsurance.com/Attendance/corporate_inch_info.php?EMP_CODE=${cincharge_out_ofc}`)
          .then(response => response.json())
          .then(data => setCInchargedataout(data?.corporate_information		))
          .catch(error => console.error('Error fetching data:', error));
          setRefetch(false)
  }
}, [cincharge_out_ofc,refetch]); 





const Successs_out_cinch = cinchargedatedata && cinchargedatedata[0]?.success;
const OFC_CODE_OUT_cINCH_ID= cinchargedatedata && cinchargedatedata[0]?.ACODE;
const OFC_CODE_OUT_cINCH = cinchargedatedata && cinchargedatedata[0]?.OFCODE;
const OFC_NAME_OUT_cINCH = cinchargedatedata && cinchargedatedata[0]?.OFNAME;
const NAME_OUT_cINCH = cinchargedatedata && cinchargedatedata[0]?.ANAME	;
const MOBILE_OUT_cINCH = cinchargedatedata && cinchargedatedata[0]?.MOBILE;
const OUT_cDESIG= cinchargedatedata && cinchargedatedata[0]?.DESIG;




const handleRegistrationCInchargeout = () => {
  if (OFC_NAME_OUT_INCH !== "") {
      const STATUS = 'Y';
      if (EMP_PASSWORD?.length < 8) {
          Swal.fire({
              icon: "error",
              title: "Password too short",
              text: "Password must be at least 8 characters long",
              showConfirmButton: true,
          });
          return;
      }

      const formData = new FormData();
      formData.append("ORG_CODE", OFC_CODE_OUT_cINCH_ID);
      formData.append("NAME", NAME_OUT_cINCH);
      formData.append("OFC_NAME", OFC_NAME_OUT_cINCH);
      formData.append("OFC_CODE", OFC_CODE_OUT_cINCH);
      formData.append("MOBILE", MOBILE_OUT_cINCH);
      formData.append("DEVICE_ID", DEVICE_ID);
      formData.append("PASSWORD", EMP_PASSWORD);
      formData.append("STATUS", STATUS);
      formData.append("DIVDEPT_CD", "dd");
      formData.append("EMP_TYPE", 'D');
      

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://app2.primeislamilifeinsurance.com/Attendance/emp_reg.php", true);

      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
              if (xhr.status === 201) {
                  const response = JSON.parse(xhr.responseText);
                  console.log(response?.message);

                  if (response?.message === "Registration successful") {
                      Swal.fire({
                          icon: "success",
                          title: "Registration Successfully",
                          showConfirmButton: true,
                      });
                      setRefetch(true);
                      navigate(`/`); // Trigger refetch if needed
                  }
              } else {
                toast.error('Already Registered');
                  // console.error("Error Registration:", xhr.statusText);
              }
          }
      };

      xhr.send(formData);
  }
 };












///Out of Head office incharge----------------------------------

const [inchargedatedata, setInchargedataout] = useState([]);
const [incharge_out_ofc, setInchargeoutCode] = useState("");


// console.log(inchargedatedata)

const informationOutIncharge= (event) => {
  event.preventDefault();
  const incharge_out = event.target.out_office_inch_Code.value;
  setInchargeoutCode(incharge_out); // Update empCode state
};


useEffect(() => {
  if (incharge_out_ofc) {
      fetch(`https://app2.primeislamilifeinsurance.com/Attendance/incharge_details_out_ofc.php?EMP_CODE=${incharge_out_ofc}`)
          .then(response => response.json())
          .then(data => setInchargedataout(data?.incharge_information	))
          .catch(error => console.error('Error fetching data:', error));
          setRefetch(false)
  }
}, [incharge_out_ofc,refetch]); 


const Successs_out_inch = inchargedatedata && inchargedatedata[0]?.success;

// console.log(Successs_out_inch)


const OFC_CODE_OUT_INCH_ID= inchargedatedata && inchargedatedata[0]?.INCHARGE;
const OFC_CODE_OUT_INCH = inchargedatedata && inchargedatedata[0]?.OFFICE_CODE;
const OFC_NAME_OUT_INCH = inchargedatedata && inchargedatedata[0]?.OFF_NAME;
const NAME_OUT_INCH = inchargedatedata && inchargedatedata[0]?.INNAME	;
const MOBILE_OUT_INCH = inchargedatedata && inchargedatedata[0]?.MOBILE;

const OFC_CODE_OUT_INCH_OFTP= inchargedatedata && inchargedatedata[0]?.OFTP	;


const handleRegistrationInchargeout = () => {
  if (OFC_NAME_OUT_INCH !== "") {
      const STATUS = 'Y';
      if (EMP_PASSWORD?.length < 8) {
          Swal.fire({
              icon: "error",
              title: "Password too short",
              text: "Password must be at least 8 characters long",
              showConfirmButton: true,
          });
          return;
      }

      const formData = new FormData();
      formData.append("ORG_CODE", OFC_CODE_OUT_INCH_ID);
      formData.append("NAME", NAME_OUT_INCH);
      formData.append("OFC_NAME", OFC_NAME_OUT_INCH);
      formData.append("OFC_CODE", OFC_CODE_OUT_INCH);
      formData.append("MOBILE", MOBILE_OUT_INCH);
      formData.append("DEVICE_ID", DEVICE_ID);
      formData.append("PASSWORD", EMP_PASSWORD);
      formData.append("STATUS", STATUS);
      formData.append("DIVDEPT_CD", OFC_CODE_OUT_INCH_OFTP);
      formData.append("EMP_TYPE", 'G');
      

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://app2.primeislamilifeinsurance.com/Attendance/emp_reg.php", true);

      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
              if (xhr.status === 201) {
                  const response = JSON.parse(xhr.responseText);
                  console.log(response?.message);

                  if (response?.message === "Registration successful") {
                      Swal.fire({
                          icon: "success",
                          title: "Registration Successfully",
                          showConfirmButton: true,
                      });
                      setRefetch(true);
                      navigate(`/`); // Trigger refetch if needed
                  }
              } else {
                toast.error('Already Registered');
                  // console.error("Error Registration:", xhr.statusText);
              }
          }
      };

      xhr.send(formData);
  }
 };







///Out of Head office employeee----------------------------------
const [employeeoutdata, setEmployeeoutdata] = useState(null);
const [employeeCode, setEmployeeCode] = useState("");


// console.log(employeeoutdata)

const informationOutEmployee= (event) => {
  event.preventDefault();
  const desk_emp_Code_out = event.target.desk_emp_Code_out.value;
  setEmployeeCode(desk_emp_Code_out); // Update empCode state
};

useEffect(() => {
  if (employeeCode) {
      fetch(`https://app2.primeislamilifeinsurance.com/Attendance/emp_incharge_info.php?EMP_ID=${employeeCode}`)
          .then(response => response.json())
          .then(data => setEmployeeoutdata(data?.emp_info))
          .catch(error => console.error('Error fetching data:', error));
          setRefetch(false)
  }
}, [employeeCode,refetch]); 


const SuccessoutEmp = employeeoutdata && employeeoutdata[0]?.success;
// console.log(SuccessoutEmp)

const EMP_NAMEOUT = employeeoutdata && employeeoutdata[0]?.EMP_NAME;
const EMPID_OUT = employeeoutdata && employeeoutdata[0]?.EMP_ID;
const OFC_NAME_OUT = employeeoutdata && employeeoutdata[0]?.OFF_NAME;
const OFC_CODE_OUT = employeeoutdata && employeeoutdata[0]?.OFFICE_CODE	;
const MOBILE_OUT = employeeoutdata && employeeoutdata[0]?.MOBILE;

////////////////////////////////////////////////////////////////////////


  const information = (event) => {
      event.preventDefault();
      const ORG_CODE = event.target.emp_Code.value;
      setEmpCode(ORG_CODE); // Update empCode state
  };


  useEffect(() => {
      if (ORG_CODE) {
          fetch(`https://app2.primeislamilifeinsurance.com/MobileApp/dev_emp_info.php?EMP_CODE=${ORG_CODE}`)
              .then(response => response.json())
              .then(data => setEmpData(data?.emp_information))
              .catch(error => console.error('Error fetching data:', error));
              setRefetch(false)
      }
  }, [ORG_CODE,refetch]); // Refetch data whenever empCode changes

  const Successs = empDatas && empDatas[0]?.Success;
  // console.log(Successs)
  const Success = empData && empData[0]?.Success;
  const OFC_CODE = empData && empData[0]?.CODE;
  const OFC_NAME = empData && empData[0]?.OFFICE_NAME;
  const NAME = empData && empData[0]?.INCH_NAME;
  const MOBILE = empData && empData[0]?.PHONE;






  const informationEmp = (event) => {
    event.preventDefault();
    const ORG_CODES = event.target.desk_emp_Code.value;
    console.log(ORG_CODES);
    setEmpCodes(ORG_CODES); // Update empCode state
};

useEffect(() => {
    if (ORG_CODEs) {
        fetch(`https://app2.primeislamilifeinsurance.com/MobileApp/emp_info.php?EMP_CODE=${ORG_CODEs}`)
            .then(response => response.json())
            .then(data => setEmpDatas(data?.emp_information))
            .catch(error => console.error('Error fetching data:', error));
            setRefetch(false)
    }
}, [ORG_CODEs,refetch]); 


const EMP_NAME=empDatas && empDatas[0]?.EMP_NAME;
const EMP_ID=empDatas && empDatas[0]?.EMP_ID;
const EMP_OFC_NAME=empDatas && empDatas[0]?.BRANCH;
const EMP_OFC_CODE=empDatas && empDatas[0]?.BRANCH_CD;
const DIVDEPT_CDD=empDatas && empDatas[0]?.DIVDEPT_CD;



// console.log(DIVDEPT_CDD)
const EMP_MOBILE=empDatas && empDatas[0]?.MOBILE;
// console.log(EMP_NAME);


const informationIncharge = (event) => {
  event.preventDefault();
  const desk_inch_Code = event.target.desk_inch_Code.value;
  setInchargeCode(desk_inch_Code); // Update empCode state
};

useEffect(() => {
  if (incharge_code) {
      fetch(`https://app2.primeislamilifeinsurance.com/Attendance/incharge_details.php?EMP_CODE=${incharge_code}`)
          .then(response => response.json())
          .then(data => setInchargedata(data?.incharge_information))
          .catch(error => console.error('Error fetching data:', error));
          setRefetch(false)
  }
}, [incharge_code,refetch]); 



    const [deviceId, setDeviceId] = useState('');
    const DEVICE_ID = deviceId.slice(0, 8);
    // console.log("unique_id ID:"+unique_id);

    useEffect(() => {
      let id = localStorage.getItem('deviceId');
      if (!id) {
        id = uuidv4();
        localStorage.setItem('deviceId', id);
      }
      setDeviceId(id);
    }, []);




   ////Registration out of head office employee
    const handleRegistrationDeskout = () => {
      if (EMP_NAMEOUT !== "") {
          const STATUS = 'Y';
          if (EMP_PASSWORD?.length < 8) {
              Swal.fire({
                  icon: "error",
                  title: "Password too short",
                  text: "Password must be at least 8 characters long",
                  showConfirmButton: true,
              });
              return;
          }

  
          const formData = new FormData();
          formData.append("ORG_CODE", EMPID_OUT);
          formData.append("NAME", EMP_NAMEOUT);
          formData.append("OFC_NAME", OFC_NAME_OUT);
          formData.append("OFC_CODE", OFC_CODE_OUT);
          formData.append("MOBILE", MOBILE_OUT);
          formData.append("DEVICE_ID", DEVICE_ID);
          formData.append("PASSWORD", EMP_PASSWORD);
          formData.append("STATUS", STATUS);
          formData.append("DIVDEPT_CD", "00");
          formData.append("EMP_TYPE", 'F');
          
  
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "https://app2.primeislamilifeinsurance.com/Attendance/emp_reg.php", true);
  
          xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                  if (xhr.status === 201) {
                      const response = JSON.parse(xhr.responseText);
                      console.log(response?.message);
  
                      if (response?.message === "Registration successful") {
                          Swal.fire({
                              icon: "success",
                              title: "Registration Successfully",
                              showConfirmButton: true,
                          });
                          setRefetch(true);
                          navigate(`/`); // Trigger refetch if needed
                      }
                  } else {
                    toast.error('Already Registered');
                      // console.error("Error Registration:", xhr.statusText);
                  }
              }
          };
  
          xhr.send(formData);
      }
     };




    const handleRegistration = () => {
      if (NAME !== "") {
          const STATUS = 'Y';
          if (PASSWORD?.length < 8) {
              Swal.fire({
                  icon: "error",
                  title: "Password too short",
                  text: "Password must be at least 8 characters long",
                  showConfirmButton: true,
              });
              return;
          }
  
          const formData = new FormData();
          formData.append("ORG_CODE", ORG_CODE);
          formData.append("NAME", NAME);
          formData.append("OFC_NAME", OFC_NAME);
          formData.append("OFC_CODE", OFC_CODE);
          formData.append("MOBILE", MOBILE);
          formData.append("DEVICE_ID", DEVICE_ID);
          formData.append("PASSWORD", PASSWORD);
          formData.append("STATUS", STATUS);
       

          console.log(formData);
  
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "https://app2.primeislamilifeinsurance.com/Attendance/emp_reg.php", true);
  
          xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                  if (xhr.status === 201) {
                      const response = JSON.parse(xhr.responseText);
                      console.log(response?.message);
  
                      if (response?.message === "Registration successful") {
                          Swal.fire({
                              icon: "success",
                              title: "Registration Successfully",
                              showConfirmButton: true,
                          });
                          setRefetch(true);
                          navigate(`/`); // Trigger refetch if needed
                      }
                  } else {
                    toast.error('Already Registered');
                      // console.error("Error Registration:", xhr.statusText);
                  }
              }
          };
  
          xhr.send(formData);
      }
     };


     const handleRegistrationDesk = () => {
      if (EMP_NAME !== "") {
          const STATUS = 'Y';
          if (EMP_PASSWORD?.length < 8) {
              Swal.fire({
                  icon: "error",
                  title: "Password too short",
                  text: "Password must be at least 8 characters long",
                  showConfirmButton: true,
              });
              return;
          }
  
          const formData = new FormData();
          formData.append("ORG_CODE", EMP_ID);
          formData.append("NAME", EMP_NAME);
          formData.append("OFC_NAME", EMP_OFC_NAME);
          formData.append("OFC_CODE", EMP_OFC_CODE);
          formData.append("MOBILE", EMP_MOBILE);
          formData.append("DEVICE_ID", DEVICE_ID);
          formData.append("PASSWORD", EMP_PASSWORD);
          formData.append("STATUS", STATUS);
          formData.append("DIVDEPT_CD", DIVDEPT_CDD);
          formData.append("EMP_TYPE", 'E');
          
  
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "https://app2.primeislamilifeinsurance.com/Attendance/emp_reg.php", true);
  
          xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                  if (xhr.status === 201) {
                      const response = JSON.parse(xhr.responseText);
                      console.log(response?.message);
  
                      if (response?.message === "Registration successful") {
                          Swal.fire({
                              icon: "success",
                              title: "Registration Successfully",
                              showConfirmButton: true,
                          });
                          setRefetch(true);
                          navigate(`/`); // Trigger refetch if needed
                      }
                  } else {
                    toast.error('Already Registered');
                      // console.error("Error Registration:", xhr.statusText);
                  }
              }
          };
  
          xhr.send(formData);
      }
     };

      const EMP_NAME_I=incharge_data && incharge_data[0]?.EMP_NAME;
      const EMP_ID_I=incharge_data && incharge_data[0]?.EMP_ID;
      const EMP_OFC_CODE_I=incharge_data && incharge_data[0]?.OFCODE;
      const DIVDEPT_CD_I=incharge_data && incharge_data[0]?.DIVDEPT_CD;
      const OFFICE=incharge_data && incharge_data[0]?.BRANCH_NM;
      const I_MOBILE=incharge_data && incharge_data[0]?.MOBILE;


     const handleRegistrationIncharge = () => {
      if (EMP_NAME_I !== "") {
          const STATUS = 'Y';
          if (EMP_PASSWORD?.length < 8) {
              Swal.fire({
                  icon: "error",
                  title: "Password too short",
                  text: "Password must be at least 8 characters long",
                  showConfirmButton: true,
              });
              return;
          }
  
          const formData = new FormData();
          formData.append("ORG_CODE", EMP_ID_I);
          formData.append("NAME", EMP_NAME_I);
          formData.append("OFC_NAME", OFFICE);
          formData.append("OFC_CODE", EMP_OFC_CODE_I);
          formData.append("MOBILE", I_MOBILE);
          formData.append("DEVICE_ID", DEVICE_ID);
          formData.append("PASSWORD", EMP_PASSWORD);
          formData.append("STATUS", STATUS);
          formData.append("DIVDEPT_CD", DIVDEPT_CD_I);
          formData.append("EMP_TYPE", 'I');
          
  
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "https://app2.primeislamilifeinsurance.com/Attendance/emp_reg.php", true);
  
          xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                  if (xhr.status === 201) {
                      const response = JSON.parse(xhr.responseText);
                      console.log(response?.message);
  
                      if (response?.message === "Registration successful") {
                          Swal.fire({
                              icon: "success",
                              title: "Registration Successfully",
                              showConfirmButton: true,
                          });
                          setRefetch(true);
                          navigate(`/`); // Trigger refetch if needed
                      }
                  } else {
                    toast.error('Already Registered');
                      // console.error("Error Registration:", xhr.statusText);
                  }
              }
          };
  
          xhr.send(formData);
      }
     };

    const [activeTab, setActiveTab] = useState('desk'); // State to track active tab

    const handleTabClick = (tab) => {
        setActiveTab(tab); // Update active tab state when a tab is clicked
    };


    const [activetopTab, setActiveTopTab] = useState("headOffice");

      //  console.log(activetopTab);



    return (
        <div>
      <div className='lg:p-10 p-2'>

      {/* Tab headers */}
          <div className="flex items-center justify-center mt-10 lg:mt-20">
          <button
            className={`px-4 lg:px-24 py-3 mx-2 rounded-md ${
              activetopTab === "headOffice"
                ? "bg-[#0097A7] text-white" // Active color (Head Office)
                : "bg-gray-300 text-gray-800" // Inactive color (Head Office)
            }`}
            onClick={() => setActiveTopTab("headOffice")}
          >
            Head Office
          </button>
          <button
            className={` px-4 lg:px-24 py-3 mx-2 rounded-md text-sm ${
              activetopTab === "outOfHeadOffice"
                ? "bg-[#0097A7] text-white" // Active color (Out of Head Office)
                : "bg-gray-300 text-gray-800" // Inactive color (Out of Head Office)
            }`}
            onClick={() => setActiveTopTab("outOfHeadOffice")}
          >
            Out of Head Office
          </button>
        </div>


   
          {activetopTab==='headOffice' && 


      <div className="flex items-center justify-center mt-5 lg:mt-10">
      <div className="shadow-2xl w-full  w-full lg:w-1/3">
      <div className="container  mt-0">
      
                <ul className=" flex flex-wrap text-sm lg:text-md text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
                <li className="me-2">
                        <a
                            href="#"
                            onClick={() => handleTabClick('desk')}
                            className={`inline-block p-4 ${
                                activeTab === 'desk'
                                    ? 'text-sm lg:text-md text-white bg-[#00BCD4] active dark:bg-[#00BCD4] dark:bg-[#00BCD4]'
                                    : 'rounded hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                            }`}
                        >
                            DESK EMPLOYEE
                        </a>
                    </li>
                    <li className="me-2">
                        <a
                            href="#"
                            onClick={() => handleTabClick('incharge')}
                            className={`inline-block p-4 ${
                                activeTab === 'incharge'
                                    ? 'text-sm lg:text-md text-white bg-[#00BCD4] active dark:bg-[#00BCD4] dark:bg-[#00BCD4]'
                                    : 'rounded hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                            }`}
                        >
                         INCHARGE
                        </a>
                    </li>
                    <li className="me-2">
                        <a
                            href="#"
                            onClick={() => handleTabClick('development')}
                            className={`inline-block p-4 ${
                                activeTab === 'development'
                                    ? 'text-sm lg:text-md text-white bg-[#00BCD4] active dark:bg-[#00BCD4] dark:bg-[#00BCD4]'
                                    : 'rounded hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                            }`}
                        >
                            DEVELOPMENT EMPLOYEE
                        </a>
                    </li>
                
                </ul>
       

            {/* Render content based on active tab */}
            <div className="mt-0">
                {activeTab === 'development' && (
                    <div className="p-4 bg-[#00E5FF] bg-gray-100 dark:bg-gray-800">
                         <h2 className='text-center font-bold mt-4 text-sm lg:text-lg'>
            <span className='text-[#00ACC1] text-shadow'>EMPLOYEE REGISTRATION</span>
          </h2>
          <form onSubmit={information} className="max-w-md mx-auto p-2">
            <div className="mb-0 mt-3 ">
              <label htmlFor="emp_Code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Organizer Code
              </label>
              <input
                type="text"
                id="emp_Code"
                onChange={(e) => {
                  e.preventDefault();
                  setOrganzierCode(e.target.value);
                }}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="PRT0000009"
                required
              />
            </div>
              </form>


            {Success ==="1" && (
                <div>
                 <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  onChange={(e) => {
                    e.preventDefault();
                    setName(e.target.value);
                  }}
                  value={empData[0]?.INCH_NAME}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                  required
                />
              </div>
              
              <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2 ">
                    <label htmlFor="emp_Code" 
                    className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Office Name & Code</label>
                    <input
                     value={empData[0]?.OFFICE_NAME+' ('+empData[0]?.CODE+')'}
                     type="text" id="office_name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
                </div>
            
                <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
                    <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
                    <input  onChange={(e) => {
                    e.preventDefault();
                    setMobile(e.target.value);
                  }}   value={empData[0]?.PHONE} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
                </div>

                <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
                    <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Device ID</label>
                    <input    onChange={(e) => {
                    e.preventDefault();
                    setDeviceID(e.target.value);
                  }}  value={DEVICE_ID} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
                </div>


                <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Password</label>
                    <input    
                    onChange={(e) => {
                    e.preventDefault();
                    setPassword(e.target.value);
                  }}
                   type="password" id="password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
                </div>
                <div className="text-center  mb-0 mt-1 max-w-md mx-auto lg:p-2">
                    <button onClick={handleRegistration} type="submit" className="w-full text-white bg-[#0277BD] hover:bg-[#0288D1] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">REGISTER</button>
                </div>

                <div className="text-center mb-10">
                <p className='text-xs text-center mb-2'>If you are  registerd?</p>


                <NavLink
                          end
                          to="/"
                          className={({ isActive }) =>
                            "block transition duration-150 truncate " + (isActive ? "text-violet-500" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                          }
                        >
                    <button type="submit" className="w-full  mb-0 mt-1 max-w-md mx-auto lg:p-2 text-white bg-[#00ACC1] hover:bg-[#0097A7] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">LOGIN</button>
                </NavLink>
            
                </div>

                <ToastContainer />
                </div>
        
              
              
              
            )}
        
                    </div>
                )}

                {activeTab === 'desk' && (
               
                    <div className="p-2 bg-[#00E5FF] bg-gray-100 dark:bg-gray-800">
                         <h2 className='text-center font-bold mt-4 text-sm lg:text-lg'>
            <span className='text-[#00ACC1] text-shadow'>EMPLOYEE REGISTRATION</span>
          </h2>
          <form onSubmit={informationEmp} className="max-w-md mx-auto lg:pl-2">
            <div className="mb-0 mt-2">
              <label htmlFor="emp_Code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Enter Employee Code
              </label>
              <input
                type="text"
                id="desk_emp_Code"
                onChange={(e) => {
                  e.preventDefault();
                  setOrganzierCode(e.target.value);
                }}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="0000"
                required
              />
            </div>
            </form>



            {Successs ==="1" && (
                <div>
                 <div className="mb-1 mt-1 max-w-md mx-auto lg:p-2">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  id="desk_name"
                  onChange={(e) => {
                    e.preventDefault();
                    setName(e.target.value);
                  }}
                  value={empDatas[0]?.EMP_NAME}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                  required
                />
              </div>
              
              <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
                    <label htmlFor="emp_Code" 
                    className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Office Name & Code</label>
                    <input
                     value={empDatas[0]?.BRANCH+' ('+empDatas[0]?.BRANCH_CD+')'}
                     type="text" id="office_name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
                </div>
            
                <div className="mb-2 mt-1 max-w-md mx-auto lg:p-2">
                    <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
                    <input  onChange={(e) => {
                    e.preventDefault();
                    setMobile(e.target.value);
                  }}   value={empDatas[0]?.MOBILE} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
                </div>

                <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
                    <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Device ID</label>
                    <input    
                    onChange={(e) => {
                    e.preventDefault();
                    setDeviceID(e.target.value);
                  }}  value={DEVICE_ID} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
                </div>


                <div className="mb-2 max-w-md mx-auto lg:p-2">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Password (Minimum 8-digit)</label>
                    <input    
                    onChange={(e) => {
                    e.preventDefault();
                    setEmpPassword(e.target.value);
                  }}
                   type="password" id="password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
                </div>
                <div className="text-center mb-2 max-w-md mx-auto lg:p-2">
                    <button onClick={handleRegistrationDesk}  type="submit" className="w-full text-white bg-[#0277BD] hover:bg-[#0288D1] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">REGISTER</button>
                </div>

                <div className="text-center mb-10">
                <p className='text-xs text-center mb-2'>If you are  registerd?</p>


                <NavLink
                          end
                          to="/"
                          className={({ isActive }) =>
                            "block transition duration-150 truncate " + (isActive ? "text-violet-500" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                          }
                        >
                    <button type="submit" className="w-full max-w-md mx-auto lg:p-2 text-white bg-[#00ACC1] hover:bg-[#0097A7] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">LOGIN</button>
                </NavLink>
            
                </div>

                <ToastContainer />
                </div>
        
              
              
              
            )}
   
                    </div>
                    
                )}
                     {activeTab === 'incharge' && (
               
               <div className="p-2 bg-[#00E5FF] bg-gray-100 dark:bg-gray-800">
                    <h2 className='text-center font-bold mt-4 text-sm lg:text-lg'>
       <span className='text-[#00ACC1] text-shadow'>INCHARGE REGISTRATION</span>
     </h2>
     <form onSubmit={informationIncharge} className="max-w-md mx-auto lg:pl-2">
       <div className="mb-0 mt-2">
         <label htmlFor="emp_Code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
           Enter Employee Code
         </label>
         <input
           type="text"
           id="desk_inch_Code"
           onChange={(e) => {
             e.preventDefault();
             setInchargeCode(e.target.value);
           }}
           className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
           placeholder="00003166"
           required
         />
       </div>
       </form>



       {inch_success ==="1" && (
           <div>
            <div className="mb-1 mt-1 max-w-md mx-auto lg:p-2">
           <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
             Name
           </label>
           <input
             type="text"
             id="desk_name"
             onChange={(e) => {
               e.preventDefault();
               setName(e.target.value);
             }}
             value={incharge_data[0]?.EMP_NAME}
             className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
             required
           />
         </div>
         
         <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
               <label htmlFor="emp_Code" 
               className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Office Name & Code</label>
               <input
                value={incharge_data[0]?.BRANCH_NM+' ('+incharge_data[0]?.OFCODE+')'}
                type="text" id="office_name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
           </div>
       
           <div className="mb-2 mt-1 max-w-md mx-auto lg:p-2">
               <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
               <input  onChange={(e) => {
               e.preventDefault();
               setMobile(e.target.value);
             }}   value={incharge_data[0]?.MOBILE} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
           </div>

           <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
               <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Device ID</label>
               <input    
               onChange={(e) => {
               e.preventDefault();
               setDeviceID(e.target.value);
             }}  value={DEVICE_ID} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
           </div>


           <div className="mb-2 max-w-md mx-auto lg:p-2">
               <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Password (Minimum 8-digit)</label>
               <input    
               onChange={(e) => {
               e.preventDefault();
               setEmpPassword(e.target.value);
             }}
              type="password" id="password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
           </div>
           <div className="text-center mb-2 max-w-md mx-auto lg:p-2">
               <button onClick={handleRegistrationIncharge}  type="submit" className="w-full text-white bg-[#0277BD] hover:bg-[#0288D1] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">REGISTER</button>
           </div>

           <div className="text-center mb-10">
           <p className='text-xs text-center mb-2'>If you are  registerd?</p>


           <NavLink
                     end
                     to="/"
                     className={({ isActive }) =>
                       "block transition duration-150 truncate " + (isActive ? "text-violet-500" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                     }
                   >
               <button type="submit" className="w-full max-w-md mx-auto lg:p-2 text-white bg-[#00ACC1] hover:bg-[#0097A7] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">LOGIN</button>
           </NavLink>
       
           </div>

           <ToastContainer />
           </div>
   
         
         
         
       )}

               </div>
               
                      )}
             
            </div>
        </div>



         
        </div>
      </div>}

      {activetopTab==='outOfHeadOffice' && 


          <div className="flex items-center justify-center mt-5 lg:mt-10">
          <div className="shadow-2xl   w-full lg:w-1/3">
          <div className="container  mt-0">

          <ul className=" flex flex-wrap text-sm lg:text-md text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <li className="me-2">
                  <a
                      href="#"
                      onClick={() => handleTabClick('employee')}
                      className={`inline-block p-4 ${
                        activeTab === 'employee'
                            ? 'text-sm lg:text-md text-white bg-[#00BCD4] active dark:bg-[#00BCD4] dark:bg-[#00BCD4]'
                            : 'rounded hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                      DESK EMPLOYEE
                  </a>
              </li>
              <li className="me-2">
                  <a
                      href="#"
                      onClick={() => handleTabClick('officeincharge')}
                      className={`inline-block p-4 ${
                        activeTab === 'officeincharge'
                            ? 'text-sm lg:text-md text-white bg-[#00BCD4] active dark:bg-[#00BCD4] dark:bg-[#00BCD4]'
                            : 'rounded hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                  OFFICE INCHARGE
                  </a>
              </li>
              <li className="me-2">
                  <a
                      href="#"
                      onClick={() => handleTabClick('corporateincharge')}
                      className={`inline-block p-4 ${
                        activeTab === 'corporateincharge'
                            ? 'text-sm lg:text-md text-white bg-[#00BCD4] active dark:bg-[#00BCD4] dark:bg-[#00BCD4]'
                            : 'rounded hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                  CORPORATE INCHARGE
                  </a>
              </li>
          
          </ul>
 

      {/* Render content based on active tab */}
      <div className="mt-0">
          {activeTab === 'corporateincharge' && (
              <div className="p-4 bg-[#00E5FF] bg-gray-100 dark:bg-gray-800">
                   <h2 className='text-center font-bold mt-4 text-sm lg:text-lg'>
      <span className='text-[#00ACC1] text-shadow'>CORPORATE / DIVISION INCHARGE REGISTRATION</span>
    </h2>
    <form onSubmit={cinformationOutIncharge} className="max-w-md mx-auto p-2">
      <div className="mb-0 mt-3 ">
        <label htmlFor="emp_Code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Corp/ Divisional Inch Code
        </label>
        <input
          type="text"
          id="cout_office_inch_Code"
          onChange={(e) => {
            e.preventDefault();
            setCInchargeoutCode(e.target.value);
          }}
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
          placeholder="0000000"
          required
        />
      </div>
        </form>


      {Successs_out_cinch ==="1" && (
          <div>
           <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Name
          </label>
          <input
            type="text"
            id="name"
            onChange={(e) => {
              e.preventDefault();
              setName(e.target.value);
            }}
            value={cinchargedatedata[0]?.ANAME}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
            required
          />
        </div>
        
        <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2 ">
              <label htmlFor="emp_Code" 
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Office Name & Code</label>
              <input
               value={cinchargedatedata[0]?.OFNAME+' ('+cinchargedatedata[0]?.OFCODE+')'}
               type="text" id="office_name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
          </div>
      
          <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
              <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
              <input  onChange={(e) => {
              e.preventDefault();
              setMobile(e.target.value);
            }}   value={cinchargedatedata[0]?.MOBILE} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
          </div>

          <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
              <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Device ID</label>
              <input    onChange={(e) => {
              e.preventDefault();
              setDeviceID(e.target.value);
            }}  value={DEVICE_ID} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
          </div>


          <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Password</label>
              <input    
                onChange={(e) => {
                  e.preventDefault();
                  setEmpPassword(e.target.value);
                }}
             type="password" id="password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
          </div>
          <div className="text-center  mb-0 mt-1 max-w-md mx-auto lg:p-2">
              <button onClick={handleRegistrationCInchargeout} type="submit" className="w-full text-white bg-[#0277BD] hover:bg-[#0288D1] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">REGISTER</button>
          </div>

          <div className="text-center mb-10">
          <p className='text-xs text-center mb-2'>If you are  registerd?</p>


          <NavLink
                    end
                    to="/"
                    className={({ isActive }) =>
                      "block transition duration-150 truncate " + (isActive ? "text-violet-500" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                    }
                  >
              <button type="submit" className="w-full  mb-0 mt-1 max-w-md mx-auto lg:p-2 text-white bg-[#00ACC1] hover:bg-[#0097A7] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">LOGIN</button>
          </NavLink>
      
          </div>

          <ToastContainer />
          </div>
  
        
        
        
      )}
  
              </div>
          )}

          {activeTab === 'employee' && (
         
            <div className="p-2 bg-[#00E5FF] bg-gray-100 dark:bg-gray-800">
             <h2 className='text-center font-bold mt-4 text-sm lg:text-lg'>
            <span className='text-[#00ACC1] text-shadow'>EMPLOYEE REGISTRATION</span>
          </h2>
          <form onSubmit={informationOutEmployee} className="max-w-md mx-auto lg:pl-2">
            <div className="mb-0 mt-2">
              <label htmlFor="emp_Code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Enter Employee Code
              </label>
              <input
                type="text"
                id="desk_emp_Code_out"
                onChange={(e) => {
                  e.preventDefault();
                  setEmployeeCode(e.target.value);
                }}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="0001"
                required
              />
            </div>
            </form>

      {SuccessoutEmp ==="1" && (
          <div>
           <div className="mb-1 mt-1 max-w-md mx-auto lg:p-2">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Name
          </label>
          <input
            type="text"
            id="desk_name"
            value={employeeoutdata[0]?.EMP_NAME}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
            required
          />
        </div>
        
        <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
              <label htmlFor="emp_Code" 
              className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Office Name & Code</label>
              <input
               value={employeeoutdata[0]?.OFF_NAME+' ('+employeeoutdata[0]?.OFFICE_CODE	+')'}
               type="text" id="office_name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
          </div>
      
          <div className="mb-0 mt-0 max-w-md mx-auto lg:p-2">
              <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
              <input  value={employeeoutdata[0]?.MOBILE} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
          </div>
          <div className="mb-0 mt-0 max-w-md mx-auto lg:p-2">
              <label htmlFor="inch_name" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Incharge Name & Code</label>
              <input  value={employeeoutdata[0]?.INCHARGE_NAME+' ('+employeeoutdata[0]?.INCHARGE_CODE	+')'} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
          </div>

          <div className="mb-0 mt-0 max-w-md mx-auto lg:p-2">
              <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Device ID</label>
              <input    
                value={DEVICE_ID} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
          </div>


          <div className="mb-0 max-w-md mx-auto lg:p-2">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Password (Minimum 8-digit)</label>
              <input    
              onChange={(e) => {
              e.preventDefault();
              setEmpPassword(e.target.value);
            }}
             type="password" id="password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
          </div>
          <div className="text-center mb-2 max-w-md mx-auto lg:p-2">
              <button onClick={handleRegistrationDeskout}  type="submit" className="w-full text-white bg-[#0277BD] hover:bg-[#0288D1] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">REGISTER</button>
          </div>

          <div className="text-center mb-10">
          <p className='text-xs text-center mb-2'>If you are  registerd?</p>


          <NavLink
                    end
                    to="/"
                    className={({ isActive }) =>
                      "block transition duration-150 truncate " + (isActive ? "text-violet-500" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                    }
                  >
              <button type="submit" className="w-full max-w-md mx-auto lg:p-2 text-white bg-[#00ACC1] hover:bg-[#0097A7] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">LOGIN</button>
          </NavLink>
      
          </div>

          <ToastContainer />
          </div>
  
        
        
        
      )}

              </div>
              
          )}




               {activeTab === 'officeincharge' && (
         
         <div className="p-2 bg-[#00E5FF] bg-gray-100 dark:bg-gray-800">
              <h2 className='text-center font-bold mt-4 text-sm lg:text-lg'>
 <span className='text-[#00ACC1] text-shadow'>INCHARGE REGISTRATION</span>
</h2>
<form onSubmit={informationOutIncharge} className="max-w-md mx-auto lg:pl-2">
 <div className="mb-0 mt-2">
   <label htmlFor="emp_Code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
     Enter Employee Code
   </label>
   <input
     type="text"
     id="out_office_inch_Code"
     onChange={(e) => {
       e.preventDefault();
       setInchargeoutCode(e.target.value);
     }}
     className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
     placeholder="0000"
     required
   />
 </div>
 </form>



 {Successs_out_inch ==="1" && (
     <div>
      <div className="mb-1 mt-1 max-w-md mx-auto lg:p-2">
     <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
       Name
     </label>
     <input
       type="text"
       id="desk_name"
       onChange={(e) => {
         e.preventDefault();
         setName(e.target.value);
       }}
       value={inchargedatedata[0]?.INNAME}
       className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
       required
     />
   </div>
   
   <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
         <label htmlFor="emp_Code" 
         className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Office Name & Code</label>
         <input
          value={inchargedatedata[0]?.OFF_NAME+' ('+inchargedatedata[0]?.OFFICE_CODE+')'}
          type="text" id="office_name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
     </div>
 
     <div className="mb-2 mt-1 max-w-md mx-auto lg:p-2">
         <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
         <input  onChange={(e) => {
         e.preventDefault();
         setMobile(e.target.value);
       }}   value={inchargedatedata[0]?.MOBILE} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
     </div>

     <div className="mb-0 mt-1 max-w-md mx-auto lg:p-2">
         <label htmlFor="mobile" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Device ID</label>
         <input    
         onChange={(e) => {
         e.preventDefault();
         setDeviceID(e.target.value);
       }}  value={DEVICE_ID} type="text" id="mobile" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"  required />
     </div>


     <div className="mb-2 max-w-md mx-auto lg:p-2">
         <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Password (Minimum 8-digit)</label>
         <input    
         onChange={(e) => {
         e.preventDefault();
         setEmpPassword(e.target.value);
       }}
        type="password" id="password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
     </div>
     <div className="text-center mb-2 max-w-md mx-auto lg:p-2">
         <button onClick={handleRegistrationInchargeout}  type="submit" className="w-full text-white bg-[#0277BD] hover:bg-[#0288D1] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">REGISTER</button>
     </div>

     <div className="text-center mb-10">
     <p className='text-xs text-center mb-2'>If you are  registerd?</p>


     <NavLink
               end
               to="/"
               className={({ isActive }) =>
                 "block transition duration-150 truncate " + (isActive ? "text-violet-500" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
               }
             >
         <button type="submit" className="w-full max-w-md mx-auto lg:p-2 text-white bg-[#00ACC1] hover:bg-[#0097A7] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">LOGIN</button>
     </NavLink>
 
     </div>

     <ToastContainer />
     </div>

   
   
   
 )}

         </div>
         
                )}
       
      </div>
  </div>



   
  </div>
       </div>}
       </div>
        </div>
    );
};

export default Register;