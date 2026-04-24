import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation, popAnimation } from "../animations/pageAnimations";
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
  const [beforeImageFile, setBeforeImageFile] = useState(null);
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [beforePreviewUrl, setBeforePreviewUrl] = useState(null);
  const [afterPreviewUrl, setAfterPreviewUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingBeforeImageUrl, setExistingBeforeImageUrl] = useState("");
  const [existingAfterImageUrl, setExistingAfterImageUrl] = useState("");

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
      setExistingBeforeImageUrl(
        member.beforeImage ? `${uploadsBase}/uploads/members/${member.beforeImage}` : ""
      );
      setExistingAfterImageUrl(
        member.afterImage ? `${uploadsBase}/uploads/members/${member.afterImage}` : ""
      );
      setMemberImageFile(null);
      setBeforeImageFile(null);
      setAfterImageFile(null);
      setPreviewUrl(null);
      setBeforePreviewUrl(null);
      setAfterPreviewUrl(null);
    });
  }, [id, uploadsBase]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (beforePreviewUrl) URL.revokeObjectURL(beforePreviewUrl);
      if (afterPreviewUrl) URL.revokeObjectURL(afterPreviewUrl);
    };
  }, [previewUrl, beforePreviewUrl, afterPreviewUrl]);

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

  const handleBeforeImageChange = (e) => {
    const file = e.target.files?.[0];
    if (beforePreviewUrl) URL.revokeObjectURL(beforePreviewUrl);
    setBeforeImageFile(file || null);
    setBeforePreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleAfterImageChange = (e) => {
    const file = e.target.files?.[0];
    if (afterPreviewUrl) URL.revokeObjectURL(afterPreviewUrl);
    setAfterImageFile(file || null);
    setAfterPreviewUrl(file ? URL.createObjectURL(file) : null);
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
    if (beforeImageFile) fd.append("beforeImage", beforeImageFile);
    if (afterImageFile) fd.append("afterImage", afterImageFile);

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
  const displayBeforePhoto = beforePreviewUrl || existingBeforeImageUrl;
  const displayAfterPhoto = afterPreviewUrl || existingAfterImageUrl;

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
          <motion.form variants={popAnimation} onSubmit={handleSubmit} className="mx-auto max-w-4xl">
            <header className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Edit member details
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Update any information in simple steps. You can save partial changes and come
                back later.
              </p>
            </header>

            <div className="space-y-8">
              <SectionCard
                icon={FaUser}
                title="Basic details"
                subtitle="Name, contact and personal information."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name">
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </Field>
                  <Field label="Mobile number">
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="10-digit number"
                    />
                  </Field>
                  <Field label="Age">
                    <input
                      type="number"
                      name="age"
                      min="0"
                      value={form.age}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Years"
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Choose one</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="House / street / area"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaCamera}
                title="Photos"
                subtitle="Profile and progress photos (before / after)."
              >
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-800">Profile photo</p>
                    <div className="mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {displayPhoto ? (
                        <img
                          src={displayPhoto}
                          alt="Profile"
                          onError={() => setExistingImageUrl("")}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="px-2 text-center text-xs text-slate-400">No photo</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-orange-900 hover:file:bg-orange-200"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-800">Before photo</p>
                    <div className="mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {displayBeforePhoto ? (
                        <img
                          src={displayBeforePhoto}
                          alt="Before"
                          onError={() => setExistingBeforeImageUrl("")}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="px-2 text-center text-xs text-slate-400">No before image</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBeforeImageChange}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-orange-900 hover:file:bg-orange-200"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-800">After photo</p>
                    <div className="mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {displayAfterPhoto ? (
                        <img
                          src={displayAfterPhoto}
                          alt="After"
                          onError={() => setExistingAfterImageUrl("")}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="px-2 text-center text-xs text-slate-400">No after image</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAfterImageChange}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-orange-900 hover:file:bg-orange-200"
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Leave any field unchanged to keep existing images.
                </p>
              </SectionCard>

              <SectionCard
                icon={FaHeartbeat}
                title="Weight & fitness"
                subtitle="Track progress and goals over time."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Weight when joined (kg)">
                    <input
                      type="number"
                      name="joiningWeight"
                      min="0"
                      step="0.1"
                      value={form.joiningWeight}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Joining weight date">
                    <input
                      type="date"
                      name="joiningWeightDate"
                      value={form.joiningWeightDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Latest weight (kg)">
                    <input
                      type="number"
                      name="updatedWeight"
                      min="0"
                      step="0.1"
                      value={form.updatedWeight}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Latest weight date">
                    <input
                      type="date"
                      name="weightUpdateDate"
                      value={form.weightUpdateDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Height (cm)">
                    <input
                      type="number"
                      name="height"
                      min="0"
                      step="0.1"
                      value={form.height}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Fitness goal">
                    <select
                      name="goal"
                      value={form.goal}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select a goal</option>
                      {goalOptions.map((goal) => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaIdCard}
                title="Membership type"
                subtitle="How this member is categorized in your gym."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Member type">
                    <select
                      name="memberCategory"
                      value={form.memberCategory}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select type</option>
                      {MEMBER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Training focus">
                    <select
                      name="workoutType"
                      value={form.workoutType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select focus</option>
                      {WORKOUT_TYPES.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Plan name (optional)"
                    hint="e.g. 3 months, Annual, Student package"
                    className="sm:col-span-2"
                  >
                    <input
                      name="plan"
                      value={form.plan}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Short package label"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaCalendarAlt}
                title="Membership dates"
                subtitle="Start date, months, and end date."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Start date">
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="How many months?">
                    <input
                      type="number"
                      name="tenureMonths"
                      min="1"
                      value={form.tenureMonths}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. 3"
                    />
                  </Field>
                  <Field label="End date">
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
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
                          Uses start date + number of months.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaClock}
                title="Preferred gym time"
                subtitle="Usual training time for scheduling."
              >
                <Field label="Time slot">
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
                title="Payment & dues"
                subtitle="Current payment mode and any pending amount."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Payment type">
                    <select
                      name="paymentType"
                      value={form.paymentType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="Cash">Cash</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </Field>
                  <Field label="Amount received">
                    <input
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="₹"
                    />
                  </Field>
                  <Field label="Payment date">
                    <input
                      type="date"
                      name="paymentDate"
                      value={form.paymentDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <div />
                  <Field label="Pending status" hint='e.g. "No" or "Yes - ₹500 pending"'>
                    <input
                      name="pendingStatus"
                      value={form.pendingStatus}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Status text"
                    />
                  </Field>
                  <Field label="Pending amount (₹)">
                    <input
                      type="number"
                      name="pendingBalance"
                      min="0"
                      step="0.01"
                      value={form.pendingBalance}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="0"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={FaPen}
                title="Notes"
                subtitle="Any important reminders for staff."
              >
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-y min-h-[88px]`}
                  placeholder="Type any extra notes here..."
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
                You can continue updating this member at any time.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:from-orange-500 hover:to-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-300/50"
              >
                Save changes
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}

export default EditMember;
