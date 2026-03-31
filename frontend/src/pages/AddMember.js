import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation, popAnimation } from "../animations/pageAnimations";

const goalOptions = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Fat Loss",
  "General Fitness",
  "Endurance",
];

function AddMember() {
  const [form, setForm] = useState({});
  const [paymentType, setPaymentType] = useState("Cash");
  const [error, setError] = useState("");
  const uploadsBaseUrl = (process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/api").replace("/api", "");

  const handleChange = (e) => {
    if (e.target.name === "age" && Number(e.target.value) < 0) {
      setError("Age cannot be negative");
      return;
    }
    if (e.target.name === "age") setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async () => {
    if (Number(form.age) < 0) {
      setError("Age cannot be negative");
      return;
    }
    const data = new FormData();
    data.append("paymentType", paymentType || "Cash");
    for (let key in form) data.append(key, form[key]);

    try {
      await API.post("/members/add", data);
      setError("");
      alert("Member Added");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <motion.div
          variants={pageAnimation}
          initial="hidden"
          animate="show"
          className="min-h-screen p-6"
        >
          <motion.div variants={popAnimation} className="max-w-3xl rounded-2xl border border-orange-200/60 bg-white/95 p-6 shadow-xl backdrop-blur">
          <h2 className="mb-1 text-2xl font-semibold text-slate-900">Add Member</h2>
          <p className="mb-4 text-sm text-slate-500">Create a new fitness profile with payment setup.</p>

          <div className="grid gap-3 md:grid-cols-2">
            <input name="name" placeholder="Name" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="phone" placeholder="Phone" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="age" type="number" min="0" placeholder="Age" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <select name="gender" onChange={handleChange} className="rounded-lg border border-slate-300 p-2">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              name="goal"
              onChange={handleChange}
              className="rounded-lg border border-slate-300 p-2 md:col-span-2"
            >
              <option value="">Select fitness goal</option>
              {goalOptions.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
            <input type="date" name="startDate" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input type="date" name="endDate" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
          </div>

          <input type="file" name="memberImage" onChange={handleFile} className="mt-4 block text-sm"/>

          <select
            name="paymentType"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="mt-4 rounded-lg border border-slate-300 p-2"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>

          {paymentType === "UPI" && (
            <>
              <img src={`${uploadsBaseUrl}/uploads/qr/gym_qr.png`} width="200" alt="QR" className="mt-3 rounded-lg border border-slate-200"/>
              <input type="file" name="upiScreenshot" onChange={handleFile} className="mt-2 block text-sm"/>
            </>
          )}

          <input name="amount" placeholder="Amount" onChange={handleChange} className="mt-4 rounded-lg border border-slate-300 p-2"/>

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

          <button onClick={handleSubmit} className="mt-4 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-500">
            Add Member
          </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default AddMember;