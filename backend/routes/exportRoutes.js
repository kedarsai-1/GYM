const express = require("express");
const router = express.Router();
const exportController = require("../controller/exportController");

router.get("/import-template", exportController.exportImportTemplateExcel);
router.get("/import-compatible/csv", exportController.exportImportCompatibleCSV);
router.get("/import-compatible/excel", exportController.exportImportCompatibleExcel);
router.get("/import-compatible/csv/:id", exportController.exportMemberImportCompatibleCSV);
router.get("/import-compatible/excel/:id", exportController.exportMemberImportCompatibleExcel);
router.get("/csv", exportController.exportCSV);
router.get("/excel", exportController.exportExcel);
router.get("/csv/:id", exportController.exportMemberCSV);
router.get("/excel/:id", exportController.exportMemberExcel);
router.get("/diet/csv", exportController.exportDietCSV);
router.get("/diet/excel", exportController.exportDietExcel);
router.get("/diet/csv/:id", exportController.exportMemberDietCSV);
router.get("/diet/excel/:id", exportController.exportMemberDietExcel);

module.exports = router;