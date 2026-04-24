const Member = require("../models/Member");
const XLSX = require("xlsx");
const { addMonths } = require("../utils/memberDates");
const { buildMemberFromImportRow } = require("../utils/importMember");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const fs = require("fs");

function parseNum(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseDate(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function normalizePaymentType(t) {
  if (!t) return "Cash";
  const s = String(t).trim();
  if (/phonepe/i.test(s)) return "PhonePe";
  if (/^upi$/i.test(s)) return "UPI";
  if (/^cash$/i.test(s)) return "Cash";
  return s;
}

function resolveEndDate(body) {
  const explicit = parseDate(body.endDate);
  if (explicit) return explicit;
  const start = parseDate(body.startDate);
  const tenure = parseNum(body.tenureMonths);
  if (start && tenure !== undefined && tenure > 0) {
    return addMonths(start, tenure);
  }
  return undefined;
}

async function uploadImageToCloudinary(file, folder = "gym/members") {
  if (!file) return null;
  if (!isCloudinaryConfigured) {
    console.warn(
      `[Cloudinary] Skipping cloud upload for "${file.originalname}" because Cloudinary env vars are missing. Using local filename fallback.`
    );
    return file.filename || null;
  }
  try {
    const uploadRes = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
    });
    try {
      await fs.promises.unlink(file.path);
    } catch (_) {
      // best effort cleanup
    }
    return uploadRes.secure_url;
  } catch (error) {
    console.error(
      `[Cloudinary] Upload failed for "${file.originalname}" in folder "${folder}":`,
      error?.message || error
    );
    throw new Error("Cloudinary upload failed");
  }
}

function normalizePhone(v) {
  if (v === undefined || v === null) return "";
  return String(v).replace(/\D/g, "");
}

function normalizeName(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim().toLowerCase();
}

async function findDuplicateMember({ name, phone, excludeId }) {
  const nPhone = normalizePhone(phone);
  const nName = normalizeName(name);
  const query = [];

  if (nPhone) {
    query.push({ phone: new RegExp(`^\\D*${nPhone}\\D*$`) });
  }
  if (nName && nPhone) {
    query.push({ name: new RegExp(`^${nName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), phone: new RegExp(`^\\D*${nPhone}\\D*$`) });
  }
  if (!query.length) return null;

  const finalQuery = { $or: query };
  if (excludeId) finalQuery._id = { $ne: excludeId };
  return Member.findOne(finalQuery).lean();
}

exports.addMember = async (req, res) => {
  try {
    const files = req.files || {};
    const age = Number(req.body.age);
    if (!Number.isNaN(age) && age < 0) {
      return res.status(400).json({ message: "Age cannot be negative" });
    }
    const dup = await findDuplicateMember({ name: req.body.name, phone: req.body.phone });
    if (dup) {
      return res.status(409).json({
        message: "Member already exists with this mobile number",
      });
    }

    const startDate = parseDate(req.body.startDate);
    const endDate = resolveEndDate(req.body);
    const paymentDate = parseDate(req.body.paymentDate) || new Date();

    const joiningWeight = parseNum(req.body.joiningWeight);
    const updatedWeight = parseNum(req.body.updatedWeight);
    const pendingBalance = parseNum(req.body.pendingBalance) ?? 0;
    const preferredTimeFraction = parseNum(req.body.preferredTimeFraction);

    const memberImage = await uploadImageToCloudinary(files.memberImage?.[0], "gym/members/profile");
    const beforeImage = await uploadImageToCloudinary(files.beforeImage?.[0], "gym/members/before");
    const afterImage = await uploadImageToCloudinary(files.afterImage?.[0], "gym/members/after");

    const member = new Member({
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
      address: req.body.address || "",
      height: parseNum(req.body.height),
      weight: updatedWeight !== undefined ? updatedWeight : parseNum(req.body.weight),
      joiningWeight,
      joiningWeightDate: parseDate(req.body.joiningWeightDate),
      updatedWeight,
      weightUpdateDate: parseDate(req.body.weightUpdateDate),
      goal: req.body.goal,
      workoutType: req.body.workoutType || "",
      tenureMonths: parseNum(req.body.tenureMonths),
      preferredTimeFraction:
        preferredTimeFraction !== undefined ? preferredTimeFraction : undefined,
      memberCategory: req.body.memberCategory || "General Member",
      pendingBalance,
      pendingStatus: req.body.pendingStatus || "No",
      remarks: req.body.remarks || "",

      membership: {
        startDate,
        endDate,
        plan: req.body.plan,
      },

      memberImage,
      beforeImage,
      afterImage,

      payment: {
        type: normalizePaymentType(req.body.paymentType),
        amount: parseNum(req.body.amount),
        upiScreenshot: files.upiScreenshot ? files.upiScreenshot[0].filename : null,
        paymentDate,
      },
    });

    await member.save();
    res.json("Member Added");
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
      error: error.message,
    });
  }
};

exports.bulkImportMembers = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Upload a .csv, .xls, or .xlsx file" });
    }

    const wb = XLSX.read(req.file.buffer, { type: "buffer", cellDates: true });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });

    const results = { imported: 0, skipped: 0, failed: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const empty = Object.values(row).every((v) => v === "" || v == null);
      if (empty) {
        results.skipped += 1;
        continue;
      }

      try {
        const doc = buildMemberFromImportRow(row);
        if (!doc) {
          results.skipped += 1;
          continue;
        }
        const dup = await findDuplicateMember({ name: doc.name, phone: doc.phone });
        if (dup) {
          results.skipped += 1;
          results.errors.push({ row: i + 2, message: "Duplicate member (mobile already exists)" });
          continue;
        }
        const m = new Member(doc);
        await m.save();
        results.imported += 1;
      } catch (e) {
        results.failed += 1;
        results.errors.push({ row: i + 2, message: e.message });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Import failed", error: error.message });
  }
};

exports.getMembers = async (req, res) => {
  const members = await Member.find();
  res.json(members);
};

exports.getMemberById = async (req, res) => {
  const member = await Member.findById(req.params.id);
  res.json(member);
};

exports.updateMember = async (req, res) => {
  const age = Number(req.body.age);
  if (!Number.isNaN(age) && age < 0) {
    return res.status(400).json({ message: "Age cannot be negative" });
  }

  try {
    const existing = await Member.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Member not found" });
    }
    const dup = await findDuplicateMember({
      name: req.body.name ?? existing.name,
      phone: req.body.phone ?? existing.phone,
      excludeId: req.params.id,
    });
    if (dup) {
      return res.status(409).json({
        message: "Another member already uses this mobile number",
      });
    }

    const startDate =
      parseDate(req.body.startDate) ?? existing.membership?.startDate;
    let endDate = parseDate(req.body.endDate);
    if (!endDate) {
      const tenure = parseNum(req.body.tenureMonths);
      if (startDate && tenure !== undefined && tenure > 0) {
        endDate = addMonths(startDate, tenure);
      } else {
        endDate = existing.membership?.endDate;
      }
    }

    const joiningWeight = parseNum(req.body.joiningWeight);
    const updatedWeight = parseNum(req.body.updatedWeight);
    const pendingBalance = parseNum(req.body.pendingBalance);

    let unsetPreferredTime = false;
    let preferredTimeFraction;
    if (req.body.preferredTimeFraction === "" || req.body.preferredTimeFraction === null) {
      unsetPreferredTime = true;
    } else {
      const p = parseNum(req.body.preferredTimeFraction);
      preferredTimeFraction =
        p !== undefined ? p : existing.preferredTimeFraction;
    }

    const uw = updatedWeight !== undefined ? updatedWeight : existing.updatedWeight;
    const legacyWeight = uw !== undefined && uw !== null ? uw : parseNum(req.body.weight);

    const updateData = {
      name: req.body.name,
      phone: req.body.phone,
      age: req.body.age,
      gender: req.body.gender,
      address: req.body.address ?? existing.address,
      height: parseNum(req.body.height) ?? existing.height,
      weight: legacyWeight ?? existing.weight,
      joiningWeight: joiningWeight !== undefined ? joiningWeight : existing.joiningWeight,
      joiningWeightDate:
        parseDate(req.body.joiningWeightDate) ?? existing.joiningWeightDate,
      updatedWeight: uw !== undefined ? uw : existing.updatedWeight,
      weightUpdateDate:
        parseDate(req.body.weightUpdateDate) ?? existing.weightUpdateDate,
      goal: req.body.goal,
      workoutType: req.body.workoutType ?? existing.workoutType,
      tenureMonths: parseNum(req.body.tenureMonths) ?? existing.tenureMonths,
      memberCategory: req.body.memberCategory ?? existing.memberCategory,
      pendingBalance:
        pendingBalance !== undefined ? pendingBalance : existing.pendingBalance,
      pendingStatus: req.body.pendingStatus ?? existing.pendingStatus,
      remarks: req.body.remarks ?? existing.remarks,
      membership: {
        startDate,
        endDate,
        plan: req.body.plan ?? existing.membership?.plan,
      },
      payment: {
        type:
          req.body.paymentType != null && String(req.body.paymentType).trim() !== ""
            ? normalizePaymentType(req.body.paymentType)
            : existing.payment?.type || "Cash",
        amount:
          parseNum(req.body.amount) !== undefined
            ? parseNum(req.body.amount)
            : existing.payment?.amount,
        upiScreenshot: existing.payment?.upiScreenshot,
        paymentDate:
          parseDate(req.body.paymentDate) ??
          existing.payment?.paymentDate ??
          new Date(),
      },
    };

    if (!unsetPreferredTime) {
      updateData.preferredTimeFraction = preferredTimeFraction;
    }

    const files = req.files || {};
    if (files.memberImage && files.memberImage[0]) {
      updateData.memberImage = await uploadImageToCloudinary(
        files.memberImage[0],
        "gym/members/profile"
      );
    }
    if (files.beforeImage && files.beforeImage[0]) {
      updateData.beforeImage = await uploadImageToCloudinary(
        files.beforeImage[0],
        "gym/members/before"
      );
    }
    if (files.afterImage && files.afterImage[0]) {
      updateData.afterImage = await uploadImageToCloudinary(
        files.afterImage[0],
        "gym/members/after"
      );
    }

    const updateQuery = { $set: updateData };
    if (unsetPreferredTime) {
      updateQuery.$unset = { preferredTimeFraction: 1 };
    }

    await Member.findByIdAndUpdate(req.params.id, updateQuery, { returnDocument: "after" });
    res.json("Member Updated");
  } catch (error) {
    res.status(500).json({ message: "Failed to update member", error: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json("Member Deleted");
};

exports.bulkDeleteMembers = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) {
      return res.status(400).json({ message: "No member ids provided" });
    }
    const uniqueIds = [...new Set(ids.map(String))];
    const result = await Member.deleteMany({ _id: { $in: uniqueIds } });
    return res.json({
      message: "Bulk delete completed",
      requested: uniqueIds.length,
      deleted: result.deletedCount || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to bulk delete members", error: error.message });
  }
};

exports.updateDietPlan = async (req, res) => {
  try {
    await Member.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dietPlan: {
            morning: req.body.morning || "",
            breakfast: req.body.breakfast || "",
            lunch: req.body.lunch || "",
            snacks: req.body.snacks || "",
            dinner: req.body.dinner || "",
          },
        },
      },
      { returnDocument: "after" }
    );
    res.json({ message: "Diet plan updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update diet plan", error: error.message });
  }
};

exports.updateWorkoutPlan = async (req, res) => {
  try {
    await Member.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          workoutPlan: {
            monday: req.body.monday || "",
            tuesday: req.body.tuesday || "",
            wednesday: req.body.wednesday || "",
            thursday: req.body.thursday || "",
            friday: req.body.friday || "",
            saturday: req.body.saturday || "",
          },
        },
      },
      { returnDocument: "after" }
    );
    res.json({ message: "Workout plan updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update workout plan", error: error.message });
  }
};

exports.expiringMembers = async (req, res) => {
  const today = new Date();
  const next3Days = new Date();
  next3Days.setDate(today.getDate() + 3);

  const members = await Member.find({
    "membership.endDate": { $lte: next3Days },
  });

  res.json(members);
};
