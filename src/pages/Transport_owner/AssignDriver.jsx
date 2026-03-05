import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import { Eye } from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AssignDriver = () => {
  const queryClient = useQueryClient();

  // Form states
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [modalDriver, setModalDriver] = useState(null);

  // Fetch Drivers
  const { data: drivers, isLoading: loadingDrivers } = useQuery({
    queryKey: ["driversList"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/drivers`, {
        headers: { Authorization: `Bearer ${empData?.token}` },
      });
      const result = await res.json();
      return result?.data?.drivers || [];
    },
  });

  // Fetch Vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ["vehiclesList"],
    queryFn: async () => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/vehicles`, {
        headers: { Authorization: `Bearer ${empData?.token}` },
      });
      const result = await res.json();
      return result?.data?.vehicles || [];
    },
  });

  // Assign Driver Mutation
  const assignMutation = useMutation({
    mutationFn: async (payload) => {
      const empData = JSON.parse(localStorage.getItem("empData"));
      const res = await fetch(`https://alhamarahomesbd.com/cashless-fuel-api/public/api/v1/owner/assign-driver`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${empData?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Assignment failed");
      return result;
    },
    onSuccess: () => {
      toast.success("Driver assigned successfully!");
      setSelectedDriver("");
      setSelectedVehicle("");
      queryClient.invalidateQueries(["driversList"]);
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text: error.message,
        confirmButtonColor: "#1e293b",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedDriver || !selectedVehicle) {
      return toast.warn("Please select both driver and vehicle.");
    }
    assignMutation.mutate({ driver_id: selectedDriver, vehicle_id: selectedVehicle });
  };

  if (loadingDrivers || loadingVehicles) {
    return (
      <div className="flex h-screen justify-center items-center text-slate-500 font-medium">
        Loading data...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Assign Driver to Vehicle</h2>

            {/* Form */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Driver</option>
                {drivers?.map((d) => (
                  <option key={d.id} value={d.driver_user_id}>
                    {d.driver?.name} ({d.driver?.phone})
                  </option>
                ))}
              </select>

              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Vehicle</option>
                {vehicles?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} - {v.model}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAssign}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition w-full mb-8"
            >
              Assign Driver
            </button>

            {/* Drivers Table */}
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="p-3">Driver Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers?.map((d) => {
                    const vehicle = vehicles?.find((v) => v.id === d.vehicle_id);
                    return (
                      <tr key={d.id} className="border-t hover:bg-slate-50">
                        <td className="p-3">{d.driver?.name}</td>
                        <td className="p-3">{d.driver?.phone}</td>
                        <td className="p-3">{vehicle ? vehicle.plate_number : "Not Assigned"}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setModalDriver(d)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {drivers?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No drivers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <ToastContainer />

        {/* Driver Details Modal */}
        {modalDriver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 shadow-xl relative">
              <button
                onClick={() => setModalDriver(null)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 font-bold"
              >
                X
              </button>
              <h3 className="text-lg font-bold mb-4">Driver Details</h3>
              <p><strong>Name:</strong> {modalDriver.driver?.name}</p>
              <p><strong>Email:</strong> {modalDriver.driver?.email}</p>
              <p><strong>Phone:</strong> {modalDriver.driver?.phone}</p>
              <p>
                <strong>Vehicle:</strong>{" "}
                {vehicles?.find((v) => v.id === modalDriver.vehicle_id)
                  ? vehicles.find((v) => v.id === modalDriver.vehicle_id)?.plate_number
                  : "Not Assigned"}
              </p>
              <p><strong>Status:</strong> {modalDriver.status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignDriver;