import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import Notification from "../components/Notification";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation, titleAnimation } from "../animations/pageAnimations";

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [expiring, setExpiring] = useState([]);

  useEffect(() => {
    API.get("/members/all").then(res => setMembers(res.data));
    API.get("/members/expiring/list").then(res => setExpiring(res.data));
  }, []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const monthlyMembers = members.filter((m) => {
    const createdAt = m.createdAt ? new Date(m.createdAt) : null;
    return createdAt && createdAt >= monthStart && createdAt < nextMonthStart;
  });

  const monthlyPayments = members.filter((m) => {
    const paymentDate = m.payment?.paymentDate ? new Date(m.payment.paymentDate) : null;
    return paymentDate && paymentDate >= monthStart && paymentDate < nextMonthStart;
  });

  const digitalCount = monthlyPayments.filter((m) => {
    const t = m.payment?.type;
    return t === "UPI" || t === "PhonePe";
  }).length;
  const cashCount = monthlyPayments.filter((m) => m.payment?.type === "Cash").length;
  const revenue = monthlyPayments.reduce(
    (sum, m) => sum + (Number(m.payment?.amount) || 0),
    0
  );
  const totalPendingBalance = members.reduce(
    (sum, m) => sum + (Number(m.pendingBalance) || 0),
    0
  );

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
          <motion.div variants={titleAnimation} className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Performance Dashboard</h1>
            <p className="text-sm text-slate-500">
              Track members, revenue and payment insights for {monthLabel}.
            </p>
          </motion.div>
          <Notification members={expiring} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard title="Total Members" value={members.length} />
            <StatCard title=" This Month " value={monthlyMembers.length} />
            <StatCard title="Monthly Revenue" value={`₹${revenue}`} />
            <StatCard title="Digital (UPI / PhonePe) — Monthly" value={digitalCount} />
            <StatCard title="Cash Payments (Monthly)" value={cashCount} />
            <StatCard title="Total Pending Balance" value={`₹${totalPendingBalance}`} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;