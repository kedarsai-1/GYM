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

  const openExport = (path) => {
    window.open(`${apiBase}${path}`, "_blank");
  };

  const exportDietBulk = (type) => {
    openExport(type === "csv" ? "/export/diet/csv" : "/export/diet/excel");
  };

  const exportDietMember = (type) => {
    if (!selectedMember) return;
    openExport(
      type === "csv" ? `/export/diet/csv/${selectedMember}` : `/export/diet/excel/${selectedMember}`
    );
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
          <div className="space-y-8 rounded-2xl border border-orange-200/60 bg-white/95 p-6 shadow-xl backdrop-blur">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Export</h2>
              <p className="mt-1 text-sm text-slate-500">
                Member data exports use the same columns as your Gym Client Details spreadsheet.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">Gym Client Details</h3>
              <p className="mt-1 max-w-2xl text-xs text-slate-500">
                Columns: ID, Name, Gender, Age, weights &amp; dates, payment, membership dates, workout
                type, tenure, preferred time (0–1 day fraction), mobile, address, status, pending fields,
                remarks — aligned with bulk import.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={`${apiBase}/export/import-template`}
                  download
                  className="inline-flex rounded-lg border border-orange-200 bg-orange-50/80 px-4 py-2 text-sm font-medium text-orange-950 hover:bg-orange-100"
                >
                  Empty template (.xlsx)
                </a>
                <button
                  type="button"
                  onClick={() => openExport("/export/csv")}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  All members — CSV
                </button>
                <button
                  type="button"
                  onClick={() => openExport("/export/excel")}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-500"
                >
                  All members — Excel
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">Single member (Gym Client Details)</h3>
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
                    type="button"
                    onClick={() => selectedMember && openExport(`/export/csv/${selectedMember}`)}
                    disabled={!selectedMember}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedMember && openExport(`/export/excel/${selectedMember}`)}
                    disabled={!selectedMember}
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-500 disabled:opacity-50"
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">Diet plans</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => exportDietBulk("csv")}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                >
                  Bulk diet CSV
                </button>
                <button
                  type="button"
                  onClick={() => exportDietBulk("excel")}
                  className="rounded-lg bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-600"
                >
                  Bulk diet Excel
                </button>
                <button
                  type="button"
                  onClick={() => exportDietMember("csv")}
                  disabled={!selectedMember}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  Member diet CSV
                </button>
                <button
                  type="button"
                  onClick={() => exportDietMember("excel")}
                  disabled={!selectedMember}
                  className="rounded-lg bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-600 disabled:opacity-50"
                >
                  Member diet Excel
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
