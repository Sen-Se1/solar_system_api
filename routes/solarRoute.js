const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
  addSolar,
  getAllSolar,
  getSolarById,
  updateSolar,
  deleteSolar,
} = require("../controllers/solarController");


router.post("/", upload.single('image'), addSolar);
router.get("/", getAllSolar);
router.get("/:id", getSolarById);
router.put("/:id", updateSolar);
router.delete("/:id", deleteSolar);

module.exports = router;