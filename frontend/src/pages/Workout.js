import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation } from "../animations/pageAnimations";

function Workout() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
  });

  useEffect(() => {
    API.get("/members/all").then((res) => setMembers(res.data || []));
  }, []);

  const onMemberChange = async (id) => {
    setSelectedMember(id);
    if (!id) return;
    const res = await API.get(`/members/${id}`);
    const workout = res.data?.workoutPlan || {};
    setForm({
      monday: workout.monday || "",
      tuesday: workout.tuesday || "",
      wednesday: workout.wednesday || "",
      thursday: workout.thursday || "",
      friday: workout.friday || "",
      saturday: workout.saturday || "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveWorkoutPlan = async () => {
    if (!selectedMember) return;
    await API.put(`/members/workout/${selectedMember}`, form);
    alert("Workout plan updated");
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
            <h2 className="text-2xl font-semibold text-slate-900">Workout</h2>

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
              <input name="monday" placeholder="Monday" value={form.monday} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="tuesday" placeholder="Tuesday" value={form.tuesday} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="wednesday" placeholder="Wednesday" value={form.wednesday} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="thursday" placeholder="Thursday" value={form.thursday} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="friday" placeholder="Friday" value={form.friday} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
              <input name="saturday" placeholder="Saturday" value={form.saturday} onChange={handleChange} className="rounded-lg border border-slate-300 p-2" />
            </div>

            <button
              onClick={saveWorkoutPlan}
              disabled={!selectedMember}
              className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-500 disabled:opacity-50"
            >
              Save Workout Plan
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Workout;
