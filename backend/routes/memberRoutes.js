const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const memberController = require("../controller/memberController");

router.post(
  "/add",
  upload.fields([
    { name: "memberImage", maxCount: 1 },
    { name: "upiScreenshot", maxCount: 1 }
  ]),
  memberController.addMember
);

router.get("/all", memberController.getMembers);
router.get("/:id", memberController.getMemberById);
router.put("/update/:id", memberController.updateMember);
router.put("/diet/:id", memberController.updateDietPlan);
router.put("/workout/:id", memberController.updateWorkoutPlan);
router.delete("/delete/:id", memberController.deleteMember);
router.get("/expiring/list", memberController.expiringMembers);

module.exports = router;