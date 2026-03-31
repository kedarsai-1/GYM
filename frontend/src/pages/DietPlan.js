import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation } from "../animations/pageAnimations";

function DietPlan() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    morning: "",
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  useEffect(() => {
    API.get("/members/all").then((res) => setMembers(res.data || []));
  }, []);

  const onMemberChange = async (id) => {
    setSelectedMember(id);
    if (!id) return;
    const res = await API.get(`/members/${id}`);
    const diet = res.data?.dietPlan || {};
    setForm({
      morning: diet.morning || "",
      breakfast: diet.breakfast || "",
      lunch: diet.lunch || "",
      snacks: diet.snacks || "",
      dinner: diet.dinner || "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveDietPlan = async () => {
    if (!selectedMember) return;
    await API.put(`/members/diet/${selectedMember}`, form);
    alert("Diet plan updated");
  };
  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (m.name || "").toLowerCase().includes(q) || (m.phone || "").toLowerCase().includes(q);
  });

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <motion.div variants={pageAnimation} initial="hidden" animate="show" className="min-h-screen p-6">
          <div className="space-y-4 rounded-2xl border border-orange-200/60 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">Diet Plan</h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member by name or phone"
              className="w-full max-w-md rounded-lg border border-slate-300 p-2"
            />
            <select
              value={selectedMember}
              onChange={(e) => onMemberChange(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-300 p-2"
            >
              <option value="">Select member</option>
              {filteredMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.phone})
                </option>
              ))}
            </select>

            <div className="grid gap-3 md:grid-cols-2">
              <input name="morning" placeholder="Morning" value={form.morning} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="breakfast" placeholder="Breakfast" value={form.breakfast} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="lunch" placeholder="Lunch" value={form.lunch} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="snacks" placeholder="Snacks" value={form.snacks} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="dinner" placeholder="Dinner" value={form.dinner} onChange={handleChange} className="rounded-lg border border-slate-300 p-2 md:col-span-2" />
            </div>

            <button
              onClick={saveDietPlan}
              disabled={!selectedMember}
              className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-500 disabled:opacity-50"
            >
              Save Diet Plan
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DietPlan;
