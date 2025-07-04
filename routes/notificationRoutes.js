const express = require("express");
const router = express.Router();
const { getLatestNotifications } = require("../utils/notificationsService");

router.get("/", (req, res) => {
  const notifications = getLatestNotifications();
  console.log("📡 Sending latest notifications to frontend:", notifications);
  res.json({ notifications });
});

module.exports = router;
