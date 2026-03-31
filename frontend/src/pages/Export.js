import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation } from "../animations/pageAnimations";

function Export() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [search, setSearch] = useState("");
  const apiBase = process.env.REACT_APP_API_BASE_URL || "https://gym-cf62.onrender.com/api";

  useEffect(() => {
    API.get("/members/all").then((res) => setMembers(res.data || []));
  }, []);

  const exportBulk = (type) => {
    const path = type === "csv" ? "/export/csv" : "/export/excel";
    window.open(`${apiBase}${path}`, "_blank");
  };
  const exportDietBulk = (type) => {
    const path = type === "csv" ? "/export/diet/csv" : "/export/diet/excel";
    window.open(`${apiBase}${path}`, "_blank");
  };

  const exportMember = (type) => {
    if (!selectedMember) return;
    const path = type === "csv" ? `/export/csv/${selectedMember}` : `/export/excel/${selectedMember}`;
    window.open(`${apiBase}${path}`, "_blank");
  };
  const exportDietMember = (type) => {
    if (!selectedMember) return;
    const path =
      type === "csv"
        ? `/export/diet/csv/${selectedMember}`
        : `/export/diet/excel/${selectedMember}`;
    window.open(`${apiBase}${path}`, "_blank");
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
          <div className="space-y-6 rounded-2xl border border-orange-200/60 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">Export</h2>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Bulk Export (All Members)</h3>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => exportBulk("csv")}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => exportBulk("excel")}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-500"
                >
                  Download Excel
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Export Single Member</h3>
              <div className="mt-3 space-y-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search member by name or phone"
                  className="w-full max-w-md rounded-lg border border-slate-300 p-2"
                />
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full max-w-md rounded-lg border border-slate-300 p-2"
                >
                  <option value="">Select member</option>
                  {filteredMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => exportMember("csv")}
                  disabled={!selectedMember}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  Member CSV
                </button>
                <button
                  onClick={() => exportMember("excel")}
                  disabled={!selectedMember}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-500 disabled:opacity-50"
                >
                  Member Excel
                </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Diet Plan Export</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  onClick={() => exportDietBulk("csv")}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                >
                  Bulk Diet CSV
                </button>
                <button
                  onClick={() => exportDietBulk("excel")}
                  className="rounded-lg bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-600"
                >
                  Bulk Diet Excel
                </button>
                <button
                  onClick={() => exportDietMember("csv")}
                  disabled={!selectedMember}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  Member Diet CSV
                </button>
                <button
                  onClick={() => exportDietMember("excel")}
                  disabled={!selectedMember}
                  className="rounded-lg bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-600 disabled:opacity-50"
                >
                  Member Diet Excel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Export;
