import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    goal: "",
    startDate: "",
    endDate: "",
    paymentType: "Cash",
    amount: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/members/${id}`).then((res) => {
      const member = res.data || {};
      setForm({
        name: member.name || "",
        phone: member.phone || "",
        age: member.age || "",
        gender: member.gender || "",
        goal: member.goal || "",
        startDate: member.membership?.startDate
          ? new Date(member.membership.startDate).toISOString().slice(0, 10)
          : "",
        endDate: member.membership?.endDate
          ? new Date(member.membership.endDate).toISOString().slice(0, 10)
          : "",
        paymentType: member.payment?.type || "Cash",
        amount: member.payment?.amount || "",
      });
    });
  }, [id]);

  const handleChange = (e) => {
    if (e.target.name === "age" && Number(e.target.value) < 0) {
      setError("Age cannot be negative");
      return;
    }
    if (e.target.name === "age") setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.age) < 0) {
      setError("Age cannot be negative");
      return;
    }
    try {
      await API.put(`/members/update/${id}`, form);
      setError("");
      alert("Member Updated");
      navigate("/members");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
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
          <motion.form variants={popAnimation} onSubmit={handleSubmit} className="max-w-3xl rounded-2xl border border-orange-200/60 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-1 text-2xl font-semibold text-slate-900">Edit Member</h2>
            <p className="mb-4 text-sm text-slate-500">Update profile and membership details.</p>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Name"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Phone"
              />

              <input
                type="number"
                name="age"
                min="0"
                value={form.age}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Age"
              />

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <select
                name="goal"
                value={form.goal}
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

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              />

              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              />

              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>

              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Amount"
              />
            </div>

            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

            <button type="submit" className="mt-4 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-500">
              Update Member
            </button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}

export default EditMember;