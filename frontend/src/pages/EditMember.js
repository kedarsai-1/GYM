import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation, popAnimation } from "../animations/pageAnimations";
import {
  WORKOUT_TYPES,
  MEMBER_CATEGORIES,
  fractionToTimeString,
  timeStringToFraction,
  computeEndDateIso,
} from "../constants/memberOptions";

const goalOptions = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Fat Loss",
  "General Fitness",
  "Endurance",
];

const emptyForm = {
  name: "",
  phone: "",
  age: "",
  gender: "",
  address: "",
  joiningWeight: "",
  joiningWeightDate: "",
  updatedWeight: "",
  weightUpdateDate: "",
  memberCategory: "",
  workoutType: "",
  goal: "",
  height: "",
  plan: "",
  startDate: "",
  endDate: "",
  tenureMonths: "",
  paymentType: "Cash",
  paymentDate: "",
  amount: "",
  pendingStatus: "",
  pendingBalance: "",
  remarks: "",
};

function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [preferredTime, setPreferredTime] = useState("");
  const [autoEndFromTenure, setAutoEndFromTenure] = useState(true);
  const [error, setError] = useState("");
  const [memberImageFile, setMemberImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const apiBase = process.env.REACT_APP_API_BASE_URL || "https://gym-cf62.onrender.com/api";
  const uploadsBase = apiBase.replace("/api", "");

  useEffect(() => {
    API.get(`/members/${id}`).then((res) => {
      const member = res.data || {};
      setForm({
        ...emptyForm,
        name: member.name || "",
        phone: member.phone || "",
        age: member.age ?? "",
        gender: member.gender || "",
        address: member.address || "",
        joiningWeight: member.joiningWeight ?? "",
        joiningWeightDate: member.joiningWeightDate
          ? new Date(member.joiningWeightDate).toISOString().slice(0, 10)
          : "",
        updatedWeight: member.updatedWeight ?? member.weight ?? "",
        weightUpdateDate: member.weightUpdateDate
          ? new Date(member.weightUpdateDate).toISOString().slice(0, 10)
          : "",
        memberCategory: member.memberCategory || "",
        workoutType: member.workoutType || "",
        goal: member.goal || "",
        height: member.height ?? "",
        plan: member.membership?.plan || "",
        startDate: member.membership?.startDate
          ? new Date(member.membership.startDate).toISOString().slice(0, 10)
          : "",
        endDate: member.membership?.endDate
          ? new Date(member.membership.endDate).toISOString().slice(0, 10)
          : "",
        tenureMonths: member.tenureMonths ?? "",
        paymentType: member.payment?.type || "Cash",
        paymentDate: member.payment?.paymentDate
          ? new Date(member.payment.paymentDate).toISOString().slice(0, 10)
          : "",
        amount: member.payment?.amount ?? "",
        pendingStatus: member.pendingStatus || "",
        pendingBalance: member.pendingBalance ?? "",
        remarks: member.remarks || "",
      });
      setPreferredTime(fractionToTimeString(member.preferredTimeFraction));
      setExistingImageUrl(
        member.memberImage ? `${uploadsBase}/uploads/members/${member.memberImage}` : ""
      );
      setMemberImageFile(null);
      setPreviewUrl(null);
    });
  }, [id, uploadsBase]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!autoEndFromTenure) return;
    const next = computeEndDateIso(form.startDate, form.tenureMonths);
    if (next) {
      setForm((f) => (f.endDate === next ? f : { ...f, endDate: next }));
    }
  }, [form.startDate, form.tenureMonths, autoEndFromTenure]);

  const handleChange = (e) => {
    if (e.target.name === "age" && Number(e.target.value) < 0) {
      setError("Age cannot be negative");
      return;
    }
    if (e.target.name === "age") setError("");
    if (e.target.name === "endDate") setAutoEndFromTenure(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMemberImageFile(file || null);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.age) < 0) {
      setError("Age cannot be negative");
      return;
    }

    const fd = new FormData();
    for (const key of Object.keys(form)) {
      const v = form[key];
      if (v !== undefined && v !== null) fd.append(key, v);
    }
    const frac = timeStringToFraction(preferredTime);
    if (frac !== undefined) fd.append("preferredTimeFraction", String(frac));
    else fd.append("preferredTimeFraction", "");

    if (memberImageFile) fd.append("memberImage", memberImageFile);

    try {
      await API.put(`/members/update/${id}`, fd);
      setError("");
      alert("Member Updated");
      navigate("/members");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
    }
  };

  const displayPhoto = previewUrl || existingImageUrl;

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
            <p className="mb-4 text-sm text-slate-500">Update profile, membership, payment, and photo.</p>

            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="mb-2 text-sm font-medium text-slate-800">Member photo</p>
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt="Member"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-slate-400">No photo</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-orange-900 hover:file:bg-orange-200"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Choose a new image to replace the current one. Leave unchanged to keep the existing photo.
                  </p>
                </div>
              </div>
            </div>

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
                placeholder="Mobile"
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

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2 md:col-span-2"
                placeholder="Address"
              />

              <input
                type="number"
                name="joiningWeight"
                min="0"
                step="0.1"
                value={form.joiningWeight}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Joining weight (kg)"
              />
              <input
                type="date"
                name="joiningWeightDate"
                value={form.joiningWeightDate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              />
              <input
                type="number"
                name="updatedWeight"
                min="0"
                step="0.1"
                value={form.updatedWeight}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Updated weight (kg)"
              />
              <input
                type="date"
                name="weightUpdateDate"
                value={form.weightUpdateDate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              />

              <select
                name="memberCategory"
                value={form.memberCategory}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2 md:col-span-2"
              >
                <option value="">Member category</option>
                {MEMBER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                name="workoutType"
                value={form.workoutType}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2 md:col-span-2"
              >
                <option value="">Workout type</option>
                {WORKOUT_TYPES.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>

              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2 md:col-span-2"
              >
                <option value="">Fitness goal (optional)</option>
                {goalOptions.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="height"
                min="0"
                step="0.1"
                value={form.height}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Height (cm)"
              />
              <input
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Membership plan label"
              />

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              />
              <input
                type="number"
                name="tenureMonths"
                min="1"
                value={form.tenureMonths}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Tenure (months)"
              />
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600 md:col-span-2">
                <input
                  type="checkbox"
                  checked={autoEndFromTenure}
                  onChange={(e) => setAutoEndFromTenure(e.target.checked)}
                />
                Auto-calculate end date from start + tenure
              </label>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-slate-500">Preferred gym time</label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              />
              <div />

              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
              >
                <option value="Cash">Cash</option>
                <option value="PhonePe">PhonePe</option>
                <option value="UPI">UPI</option>
              </select>

              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Amount"
              />

              <input
                name="pendingStatus"
                value={form.pendingStatus}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Pending status"
              />
              <input
                type="number"
                name="pendingBalance"
                min="0"
                step="0.01"
                value={form.pendingBalance}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 p-2"
                placeholder="Pending balance (₹)"
              />
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={2}
                className="rounded-lg border border-slate-300 p-2 md:col-span-2"
                placeholder="Remarks"
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
