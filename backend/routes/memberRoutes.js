const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const memberController = require("../controller/memberController");

router.post(
  "/add",
  upload.fields([
    { name: "memberImage", maxCount: 1 },
    { name: "upiScreenshot", maxCount: 1 },
  ]),
  memberController.addMember
);

router.post(
  "/import/bulk",
  upload.uploadImport.single("file"),
  memberController.bulkImportMembers
);

router.get("/all", memberController.getMembers);
router.get("/expiring/list", memberController.expiringMembers);

router.put("/update/:id", (req, res, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return upload.fields([{ name: "memberImage", maxCount: 1 }])(req, res, next);
  }
  next();
}, memberController.updateMember);

router.put("/diet/:id", memberController.updateDietPlan);
router.put("/workout/:id", memberController.updateWorkoutPlan);
router.delete("/delete/:id", memberController.deleteMember);

router.get("/:id", memberController.getMemberById);

module.exports = router;
