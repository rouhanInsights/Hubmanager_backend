const express = require("express");
const router = express.Router();
const {
  getAllHubManagers,
  createHubManager,
  updateHubManager,
  resetHubManagerPassword,
  getHubManagerCount,
  loginHubManager
} = require("../controllers/hubManagerController");

// ✅ Specific routes should come before dynamic or base routes
router.post("/login", loginHubManager); // Moved to top
router.get("/count", getHubManagerCount);
router.get("/", getAllHubManagers);
router.post("/", createHubManager); // Now safely below /login
router.put("/:user_id", updateHubManager);
router.put("/:user_id/password", resetHubManagerPassword);

module.exports = router;
