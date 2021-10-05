const router = require("express").Router();
const recordController = require("../controllers/recordController");

router.post("/",recordController.createRecord);
router.get("/:recordId",recordController.getRecordDetails);
// router.get("/",recordController.getAllRecords);
// router.put("/:recordId",recordController.updateRecord);
// router.delete("/:recordId",recordController.deteleRecord);

module.exports = router;    