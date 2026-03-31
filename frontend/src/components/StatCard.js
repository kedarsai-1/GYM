import React from "react";
import { motion } from "framer-motion";

function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-orange-200/50 bg-gradient-to-br from-white to-orange-50 p-6 shadow-sm transition hover:shadow-xl"
    >
      <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </motion.div>
  );
}

export default StatCard;