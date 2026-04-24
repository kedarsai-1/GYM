import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { pageAnimation } from "../animations/pageAnimations";
import { fractionToTimeString } from "../constants/memberOptions";

function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [brokenImageIds, setBrokenImageIds] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const formatDate = (value) => (value ? new Date(value).toDateString() : "-");
  const apiBase = process.env.REACT_APP_API_BASE_URL || "https://gym-cf62.onrender.com/api";
  const uploadsBase = apiBase.replace("/api", "");
  const pageSize = 8;
  const filter = new URLSearchParams(location.search).get("filter");
  const isExpiringFilter = filter === "expiring";

  const membersListEndpoint = isExpiringFilter ? "/members/expiring/list" : "/members/all";

  useEffect(() => {
    const endpoint = isExpiringFilter ? "/members/expiring/list" : "/members/all";
    API.get(endpoint).then((res) => setMembers(res.data));
    setSelectedIds([]);
    setPage(1);
  }, [isExpiringFilter]);

  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await API.post("/members/import/bulk", fd);
      setImportResult(data);
      API.get(membersListEndpoint).then((res) => setMembers(res.data));
    } catch (err) {
      setImportResult({
        error: err.response?.data?.message || err.message || "Import failed",
      });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this member?")) {
      await API.delete(`/members/delete/${id}`);
      API.get(membersListEndpoint).then((res) => setMembers(res.data));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const downloadMemberDietExport = (id, type) => {
    const path = type === "csv" ? `/export/diet/csv/${id}` : `/export/diet/excel/${id}`;
    window.open(`${apiBase}${path}`, "_blank");
  };

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q) ||
      (m.goal || "").toLowerCase().includes(q) ||
      (m.address || "").toLowerCase().includes(q) ||
      (m.memberCategory || "").toLowerCase().includes(q) ||
      (m.workoutType || "").toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const currentPageIds = paginatedMembers.map((m) => m._id);
  const allCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllCurrentPage = () => {
    if (!currentPageIds.length) return;
    setSelectedIds((prev) => {
      if (allCurrentPageSelected) {
        return prev.filter((id) => !currentPageIds.includes(id));
      }
      const next = new Set([...prev, ...currentPageIds]);
      return Array.from(next);
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected member(s)?`)) return;
    await API.post("/members/delete/bulk", { ids: selectedIds });
    setSelectedIds([]);
    API.get(membersListEndpoint).then((res) => setMembers(res.data));
  };

  const getMemberImage = (member) => {
    if (!member?.memberImage) return "";
    if (brokenImageIds.has(member._id)) return "";
    return `${uploadsBase}/uploads/members/${member.memberImage}`;
  };
  const getBeforeImage = (member) =>
    member?.beforeImage ? `${uploadsBase}/uploads/members/${member.beforeImage}` : "";
  const getAfterImage = (member) =>
    member?.afterImage ? `${uploadsBase}/uploads/members/${member.afterImage}` : "";

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <motion.div variants={pageAnimation} initial="hidden" animate="show" className="min-h-screen p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {isExpiringFilter ? "Expiring Members" : "Members"}
              </h2>
              {isExpiringFilter ? (
                <button
                  onClick={() => navigate("/members")}
                  className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Clear Filter
                </button>
              ) : null}
            </div>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, goal, address, category…"
              className="w-full max-w-sm rounded-lg border border-slate-300 bg-white p-2 text-sm"
            />
          </div>
          {selectedIds.length > 0 ? (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm">
              <span className="text-rose-800">{selectedIds.length} member(s) selected</span>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="rounded bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-500"
              >
                Delete Selected
              </button>
            </div>
          ) : null}

          {!isExpiringFilter ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-3 text-sm">
              <a
                href={`${apiBase}/export/import-template`}
                download
                className="font-medium text-orange-800 underline decoration-orange-300 hover:text-orange-900"
              >
                Gym Client Details template (.xlsx)
              </a>
              <span className="text-xs text-slate-500">
                Use Export page for full Gym Client Details CSV/Excel.
              </span>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  disabled={importing}
                  onChange={handleBulkImport}
                />
                {importing ? "Importing…" : "Bulk import"}
              </label>
              {importResult && !importResult.error ? (
                <span className="text-slate-700">
                  Imported {importResult.imported}, skipped {importResult.skipped}, failed{" "}
                  {importResult.failed}.
                  {importResult.errors?.length
                    ? ` Errors: ${importResult.errors
                        .slice(0, 5)
                        .map((x) => `row ${x.row}: ${x.message}`)
                        .join("; ")}`
                    : ""}
                </span>
              ) : null}
              {importResult?.error ? (
                <span className="text-rose-600">{importResult.error}</span>
              ) : null}
            </div>
          ) : null}

          <table className="w-full overflow-hidden rounded-2xl border border-orange-200/60 bg-white/95 shadow-xl backdrop-blur">
            <thead className="bg-slate-100 text-left text-sm text-slate-700">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleSelectAllCurrentPage}
                    aria-label="Select all on current page"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Membership End</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedMembers.map((m) => (
                <tr key={m._id} className="border-b text-sm text-slate-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m._id)}
                      onChange={() => toggleSelected(m._id)}
                      aria-label={`Select ${m.name}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                  <td className="px-4 py-3">{m.phone}</td>
                  <td className="px-4 py-3">{m.memberCategory || "—"}</td>
                  <td className="px-4 py-3">
                    {m.pendingBalance != null && Number(m.pendingBalance) > 0
                      ? `₹${m.pendingBalance}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{formatDate(m.membership?.endDate)}</td>

                  <td className="flex flex-wrap gap-4 px-4 py-3">
                    <button
                      onClick={() => setSelectedMember(m)}
                      className="text-slate-700 hover:text-slate-900"
                      title="View details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/edit-member/${m._id}`)}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => downloadMemberDietExport(m._id, "csv")}
                      className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-200"
                    >
                      Diet CSV
                    </button>
                    <button
                      onClick={() => downloadMemberDietExport(m._id, "excel")}
                      className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-200"
                    >
                      Diet Excel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredMembers.length && (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              No members found for this search.
            </div>
          )}
          {filteredMembers.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
      {selectedMember && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSelectedMember(null)}
          />
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", damping: 24, stiffness: 240 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Member Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              {getMemberImage(selectedMember) ? (
                <div className="flex h-64 w-full items-center justify-center rounded-xl bg-slate-100 p-2">
                  <img
                    src={getMemberImage(selectedMember)}
                    alt={selectedMember.name}
                    onError={() => {
                      setBrokenImageIds((prev) => new Set(prev).add(selectedMember._id));
                    }}
                    className="h-full w-full rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                  No image uploaded
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-100 p-2">
                <p className="mb-1 text-xs font-semibold text-slate-600">Before</p>
                {getBeforeImage(selectedMember) ? (
                  <img
                    src={getBeforeImage(selectedMember)}
                    alt="Before progress"
                    className="h-36 w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-lg bg-white text-xs text-slate-500">
                    No before image
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-slate-100 p-2">
                <p className="mb-1 text-xs font-semibold text-slate-600">After</p>
                {getAfterImage(selectedMember) ? (
                  <img
                    src={getAfterImage(selectedMember)}
                    alt="After progress"
                    className="h-36 w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-lg bg-white text-xs text-slate-500">
                    No after image
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <p><span className="font-semibold text-slate-800">Name:</span> {selectedMember.name || "-"}</p>
              <p><span className="font-semibold text-slate-800">Phone:</span> {selectedMember.phone || "-"}</p>
              <p><span className="font-semibold text-slate-800">Address:</span> {selectedMember.address || "-"}</p>
              <p><span className="font-semibold text-slate-800">Age:</span> {selectedMember.age ?? "-"}</p>
              <p><span className="font-semibold text-slate-800">Gender:</span> {selectedMember.gender || "-"}</p>
              <p><span className="font-semibold text-slate-800">Category:</span> {selectedMember.memberCategory || "-"}</p>
              <p><span className="font-semibold text-slate-800">Workout type:</span> {selectedMember.workoutType || "-"}</p>
              <p><span className="font-semibold text-slate-800">Goal:</span> {selectedMember.goal || "-"}</p>
              <p><span className="font-semibold text-slate-800">Joining weight:</span> {selectedMember.joiningWeight != null ? `${selectedMember.joiningWeight} kg` : "-"}</p>
              <p><span className="font-semibold text-slate-800">Joining weight date:</span> {formatDate(selectedMember.joiningWeightDate)}</p>
              <p><span className="font-semibold text-slate-800">Updated weight:</span> {selectedMember.updatedWeight != null ? `${selectedMember.updatedWeight} kg` : (selectedMember.weight != null ? `${selectedMember.weight} kg` : "-")}</p>
              <p><span className="font-semibold text-slate-800">Weight update date:</span> {formatDate(selectedMember.weightUpdateDate)}</p>
              <p><span className="font-semibold text-slate-800">Tenure (months):</span> {selectedMember.tenureMonths ?? "-"}</p>
              <p><span className="font-semibold text-slate-800">Preferred time:</span> {fractionToTimeString(selectedMember.preferredTimeFraction) || "-"}</p>
              <p><span className="font-semibold text-slate-800">Membership Start:</span> {formatDate(selectedMember.membership?.startDate)}</p>
              <p><span className="font-semibold text-slate-800">Membership End:</span> {formatDate(selectedMember.membership?.endDate)}</p>
              <p><span className="font-semibold text-slate-800">Payment Type:</span> {selectedMember.payment?.type || "-"}</p>
              <p><span className="font-semibold text-slate-800">Payment date:</span> {formatDate(selectedMember.payment?.paymentDate)}</p>
              <p><span className="font-semibold text-slate-800">Amount:</span> {selectedMember.payment?.amount ?? "-"}</p>
              <p><span className="font-semibold text-slate-800">Pending status:</span> {selectedMember.pendingStatus || "-"}</p>
              <p><span className="font-semibold text-slate-800">Pending balance:</span> {selectedMember.pendingBalance != null ? `₹${selectedMember.pendingBalance}` : "-"}</p>
              <p><span className="font-semibold text-slate-800">Remarks:</span> {selectedMember.remarks || "-"}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

export default Members;