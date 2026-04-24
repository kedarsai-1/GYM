import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { pageAnimation, popAnimation } from "../animations/pageAnimations";
import { QRCodeSVG } from "qrcode.react";
import {
  FaUser,
  FaCamera,
  FaHeartbeat,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaPen,
} from "react-icons/fa";
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

function Field({ label, hint, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-800">{label}</label>
      {hint ? <p className="mb-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-600/25">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function AddMember() {
  const navigate = useNavigate();
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
      alert("Member saved successfully.");
      navigate("/members");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 409 ? "Member already exists" : null) ||
        "Could not save. Please try again.";
      setError(msg);
    }
  };

  const digitalPayment = paymentType === "UPI" || paymentType === "PhonePe";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-orange-50/40 to-slate-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <motion.div
          variants={pageAnimation}
          initial="hidden"
          animate="show"
          className="min-h-screen p-4 pb-16 sm:p-6 lg:p-8"
        >
          <motion.div variants={popAnimation} className="mx-auto max-w-4xl">
            <header className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Add a new member
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Fill in the details below step by step. Only name and phone are essential to get
                started — everything else helps us serve them better.
              </p>
            </header>

            <div className="space-y-8">
              <SectionCard
                icon={FaUser}
                title="Who is joining?"
                subtitle="Basic contact details we use to reach them."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" hint="As they want it on records.">
                    <input name="name" placeholder="e.g. Ramesh Kumar" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Mobile number" hint="WhatsApp or call — we’ll use this for updates.">
                    <input name="phone" type="tel" inputMode="numeric" placeholder="10-digit number" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Age">
                    <input name="age" type="number" min="0" placeholder="Years" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Gender">
                    <select name="gender" onChange={handleChange} className={inputClass}>
                      <option value="">Choose one</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Address" hint="Area or landmark — helps for local members." className="sm:col-span-2">
                    <input name="address" placeholder="House / street / area" onChange={handleChange} className={inputClass} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaCamera}
                title="Photo (optional)"
                subtitle="Profile photo and progress photos (before / after)."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Profile photo">
                    <input
                      type="file"
                      name="memberImage"
                      accept="image/*"
                      onChange={handleFile}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-900 hover:file:bg-orange-200"
                    />
                  </Field>
                  <Field label="Before photo" hint="At joining time.">
                    <input
                      type="file"
                      name="beforeImage"
                      accept="image/*"
                      onChange={handleFile}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-900 hover:file:bg-orange-200"
                    />
                  </Field>
                  <Field label="After photo" hint="Latest progress photo.">
                    <input
                      type="file"
                      name="afterImage"
                      accept="image/*"
                      onChange={handleFile}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-900 hover:file:bg-orange-200"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaHeartbeat}
                title="Weight & fitness (optional)"
                subtitle="Helps track progress over time. You can add or update later."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Weight when they joined" hint="In kilograms (kg).">
                    <input name="joiningWeight" type="number" min="0" step="0.1" placeholder="e.g. 75" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Date of that weigh-in">
                    <input type="date" name="joiningWeightDate" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Latest weight (if different)" hint="Leave blank if same as joining.">
                    <input name="updatedWeight" type="number" min="0" step="0.1" placeholder="kg" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Date of latest weight">
                    <input type="date" name="weightUpdateDate" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Height (optional)" hint="Centimetres (cm).">
                    <input name="height" type="number" min="0" step="0.1" placeholder="cm" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Fitness goal (optional)" hint="What they want to achieve.">
                    <select name="goal" onChange={handleChange} className={inputClass}>
                      <option value="">Select a goal</option>
                      {goalOptions.map((goal) => (
                        <option key={goal} value={goal}>{goal}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaIdCard}
                title="Membership type"
                subtitle="Pick how we classify them and what kind of training they do."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Member type" hint="General, student, senior, gold — your gym’s categories.">
                    <select name="memberCategory" onChange={handleChange} className={inputClass}>
                      <option value="">Select type</option>
                      {MEMBER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Training focus" hint="Strength, cardio, personal training, etc.">
                    <select name="workoutType" onChange={handleChange} className={inputClass}>
                      <option value="">Select focus</option>
                      {WORKOUT_TYPES.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Plan name (optional)" hint="e.g. 3 months, Annual, Summer offer — for your own reference." className="sm:col-span-2">
                    <input name="plan" placeholder="Short label for this package" onChange={handleChange} className={inputClass} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaCalendarAlt}
                title="Membership dates"
                subtitle="When their membership starts, how long it runs, and when it ends."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Start date" hint="First day of this membership.">
                    <input type="date" name="startDate" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="How many months?" hint="1 = one month, 12 = one year, etc.">
                    <input name="tenureMonths" type="number" min="1" placeholder="e.g. 3" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="End date" hint="Last valid day. We can fill this from start + months if you use the option below.">
                    <input type="date" name="endDate" onChange={handleChange} className={inputClass} />
                  </Field>
                  <div className="flex items-end sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/80 p-4 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        checked={autoEndFromTenure}
                        onChange={(e) => setAutoEndFromTenure(e.target.checked)}
                      />
                      <span>
                        <span className="font-medium text-slate-900">Calculate end date automatically</span>
                        <span className="mt-1 block text-xs text-slate-600">
                          Uses start date + number of months. Turn off if you need a custom end date.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaClock}
                title="Preferred gym time"
                subtitle="Roughly when they usually train — helps scheduling and reporting."
              >
                <Field label="Usual time slot" hint="Pick a typical clock time; we save it for the member record.">
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </SectionCard>

              <SectionCard
                icon={FaMoneyBillWave}
                title="Payment & fees"
                subtitle="How they paid today and any amount still due."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="How did they pay?" className="sm:col-span-2">
                    <select
                      name="paymentType"
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Cash">Cash</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="UPI">Other UPI app</option>
                    </select>
                  </Field>
                  <Field label="Amount received now" hint="Total paid today (₹).">
                    <input name="amount" type="number" min="0" step="1" placeholder="₹" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Payment date" hint="Defaults to today if you leave patterns as usual.">
                    <input type="date" name="paymentDate" onChange={handleChange} className={inputClass} />
                  </Field>
                  {digitalPayment ? (
                    <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-medium text-slate-800">UPI payment</p>
                      <button
                        type="button"
                        onClick={() => {
                          setUseGeneratedQr(false);
                          setShowQrModal(true);
                        }}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800"
                      >
                        Show QR code to pay
                      </button>
                      <p className="mt-3 text-xs text-slate-500">After they pay, attach a screenshot for your records.</p>
                      <input
                        type="file"
                        name="upiScreenshot"
                        accept="image/*"
                        onChange={handleFile}
                        className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700"
                      />
                    </div>
                  ) : null}
                  <Field label="Any pending fee? (optional)" hint='e.g. "No" or "Yes — ₹500 due"'>
                    <input name="pendingStatus" placeholder="Status text" onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Pending amount (₹)" hint="0 if nothing pending.">
                    <input name="pendingBalance" type="number" min="0" step="0.01" placeholder="0" onChange={handleChange} className={inputClass} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaPen}
                title="Notes (optional)"
                subtitle="Anything else staff should remember — medical notes, referrals, etc."
              >
                <textarea
                  name="remarks"
                  placeholder="Type any extra notes here…"
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-y min-h-[88px]`}
                />
              </SectionCard>
            </div>

            {error ? (
              <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-10 flex flex-col items-stretch gap-3 border-t border-slate-200/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-xs text-slate-500 sm:text-left">
                You can edit all of this later from the member list.
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:from-orange-500 hover:to-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-300/50"
              >
                Save member
              </button>
            </div>
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
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowQrModal(false)} aria-hidden />
            <div className="relative flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="w-full max-w-sm rounded-2xl border border-orange-200 bg-white p-6 shadow-2xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Scan to pay</h3>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(false)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
                {!useGeneratedQr ? (
                  <img
                    src={externalQrUrl}
                    alt="UPI QR code"
                    onError={() => setUseGeneratedQr(true)}
                    className="h-auto w-full rounded-xl border border-slate-200 object-contain"
                  />
                ) : (
                  <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-3">
                    <QRCodeSVG value={upiPayLink} size={280} />
                  </div>
                )}
                <p className="mt-4 text-center text-xs text-slate-500">
                  Ask the member to scan and pay, then upload the payment screenshot above.
                </p>
                <p className="mt-2 text-center text-xs font-medium text-slate-600">UPI ID: {upiId}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddMember;
