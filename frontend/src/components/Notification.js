import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Notification({ members }) {
  if (!members.length) return null;
  const sortedMembers = [...members].sort(
    (a, b) => new Date(a.membership?.endDate) - new Date(b.membership?.endDate)
  );
  const visibleMembers = sortedMembers.slice(0, 6);
  const remainingCount = sortedMembers.length - visibleMembers.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-amber-700">Membership Expiring Soon</h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {members.length} members
          </span>
          <Link
            to="/members?filter=expiring"
            className="rounded-full bg-amber-700 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
        {visibleMembers.map((m) => (
          <div
            key={m._id}
            className="flex items-center justify-between rounded-lg border border-amber-200/70 bg-white/70 px-3 py-2 text-sm"
          >
            <span className="font-medium text-amber-900">{m.name}</span>
            <span className="text-amber-700">{new Date(m.membership?.endDate).toDateString()}</span>
          </div>
        ))}
      </div>

      {remainingCount > 0 ? (
        <p className="mt-2 text-xs font-medium text-amber-800">
          +{remainingCount} more members expiring. View Members page for full list.
        </p>
      ) : null}
    </motion.div>
  );
}

export default Notification;