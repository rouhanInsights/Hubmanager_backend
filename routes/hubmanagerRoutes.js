const express = require("express");
const router = express.Router();
const {
  getAllHubManagers,
  createHubManager,
  updateHubManager,
  resetHubManagerPassword,
} = require("../controllers/hubManagerController");

router.get("/", getAllHubManagers);
router.post("/", createHubManager);
router.put("/:user_id", updateHubManager);
router.put("/:user_id/password", resetHubManagerPassword);

module.exports = router;
