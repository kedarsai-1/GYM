import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { pageAnimation, popAnimation } from "../animations/pageAnimations";
import { QRCodeSVG } from "qrcode.react";
import {
  WORKOUT_TYPES,
  MEMBER_CATEGORIES,
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

function AddMember() {
  const [form, setForm] = useState({});
  const [paymentType, setPaymentType] = useState("Cash");
  const [preferredTime, setPreferredTime] = useState("");
  const [autoEndFromTenure, setAutoEndFromTenure] = useState(true);
  const [error, setError] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [useGeneratedQr, setUseGeneratedQr] = useState(false);
  const uploadsBaseUrl = (
    process.env.REACT_APP_API_BASE_URL || "https://gym-cf62.onrender.com/api"
  ).replace("/api", "");
  const upiId = process.env.REACT_APP_UPI_ID || "9676000706@ibl";
  const upiPayLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("United Gym")}&cu=INR`;
  const externalQrUrl =
    process.env.REACT_APP_UPI_QR_URL ||
    `${uploadsBaseUrl}/uploads/members/${encodeURIComponent("WhatsApp Image 2026-03-31 at 18.17.30.jpeg")}`;

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
    const frac = timeStringToFraction(preferredTime);
    if (frac !== undefined) data.append("preferredTimeFraction", String(frac));

    for (let key in form) {
      const val = form[key];
      if (val === undefined || val === null) continue;
      if (val instanceof File) {
        data.append(key, val);
      } else if (typeof val !== "object") {
        data.append(key, val);
      }
    }

    try {
      await API.post("/members/add", data);
      setError("");
      alert("Member Added");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    }
  };

  const digitalPayment = paymentType === "UPI" || paymentType === "PhonePe";

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
          <p className="mb-4 text-sm text-slate-500">Create a new fitness profile with payment setup (fields align with Gym Client Details).</p>

          <div className="grid gap-3 md:grid-cols-2">
            <input name="name" placeholder="Name" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="phone" placeholder="Mobile" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="age" type="number" min="0" placeholder="Age" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <select name="gender" onChange={handleChange} className="rounded-lg border border-slate-300 p-2">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input name="address" placeholder="Address" onChange={handleChange} className="rounded-lg border border-slate-300 p-2 md:col-span-2"/>

            <input name="joiningWeight" type="number" min="0" step="0.1" placeholder="Joining weight (kg)" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input type="date" name="joiningWeightDate" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="updatedWeight" type="number" min="0" step="0.1" placeholder="Updated weight (kg)" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input type="date" name="weightUpdateDate" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>

            <select name="memberCategory" onChange={handleChange} className="rounded-lg border border-slate-300 p-2 md:col-span-2">
              <option value="">Member category (status)</option>
              {MEMBER_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select name="workoutType" onChange={handleChange} className="rounded-lg border border-slate-300 p-2 md:col-span-2">
              <option value="">Workout type</option>
              {WORKOUT_TYPES.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <select
              name="goal"
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

            <input name="height" type="number" min="0" step="0.1" placeholder="Height (cm)" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="plan" placeholder="Membership plan label" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>

            <input type="date" name="startDate" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="tenureMonths" type="number" min="1" placeholder="Tenure (months)" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input type="date" name="endDate" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <label className="flex items-center gap-2 text-sm text-slate-600 md:col-span-2">
              <input
                type="checkbox"
                checked={autoEndFromTenure}
                onChange={(e) => setAutoEndFromTenure(e.target.checked)}
              />
              Auto-calculate end date from start + tenure
            </label>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-500">Preferred gym time (maps to sheet-style day fraction)</label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>

            <input type="date" name="paymentDate" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <div />

            <input name="pendingStatus" placeholder='Pending status (e.g. No, Yes(₹1,000))' onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <input name="pendingBalance" type="number" min="0" step="0.01" placeholder="Pending balance (₹)" onChange={handleChange} className="rounded-lg border border-slate-300 p-2"/>
            <textarea name="remarks" placeholder="Remarks" onChange={handleChange} rows={2} className="rounded-lg border border-slate-300 p-2 md:col-span-2"/>
          </div>

          <input type="file" name="memberImage" onChange={handleFile} className="mt-4 block text-sm"/>

          <select
            name="paymentType"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="mt-4 rounded-lg border border-slate-300 p-2"
          >
            <option value="Cash">Cash</option>
            <option value="PhonePe">PhonePe</option>
            <option value="UPI">UPI</option>
          </select>

          {digitalPayment && (
            <>
              <button
                type="button"
                onClick={() => {
                  setUseGeneratedQr(false);
                  setShowQrModal(true);
                }}
                className="mt-3 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                View UPI QR
              </button>
              <input type="file" name="upiScreenshot" onChange={handleFile} className="mt-2 block text-sm"/>
            </>
          )}

          <input name="amount" placeholder="Amount paid" onChange={handleChange} className="mt-4 rounded-lg border border-slate-300 p-2"/>

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

          <button type="button" onClick={handleSubmit} className="mt-4 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-500">
            Add Member
          </button>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showQrModal && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowQrModal(false)} />
            <div className="relative flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="w-full max-w-sm rounded-2xl border border-orange-200 bg-white p-5 shadow-2xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Scan to Pay</h3>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(false)}
                    className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
                {!useGeneratedQr ? (
                  <img
                    src={externalQrUrl}
                    alt="UPI QR"
                    onError={() => setUseGeneratedQr(true)}
                    className="h-auto w-full rounded-xl border border-slate-200 object-contain"
                  />
                ) : (
                  <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-3">
                    <QRCodeSVG value={upiPayLink} size={280} />
                  </div>
                )}
                <p className="mt-3 text-center text-xs text-slate-500">
                  After payment, upload the UPI screenshot and continue.
                </p>
                <p className="mt-1 text-center text-xs font-medium text-slate-600">
                  UPI ID: {upiId}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddMember;
