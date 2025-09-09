// utils/notificationsService.js
const { Client } = require("pg");

let latestNotifications = [];
let ioRef = null;        // ← holds the active Socket.IO instance
let isListening = false; // ← prevents duplicate LISTEN setup

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

async function startNotificationListener(io) {
  // Always refresh ioRef (supports hot-reload / re-init)
  ioRef = io;

  if (isListening) {
    console.log("ℹ️ PostgreSQL listener already active. Updated Socket.IO ref.");
    return;
  }

  try {
    await client.connect();
    await client.query("LISTEN new_order");
    isListening = true;

    client.on("notification", (msg) => {
      // 1) Parse payload in its own try/catch
      let payload = {};
      try {
        payload = msg?.payload ? JSON.parse(msg.payload) : {};
      } catch (e) {
        console.error("⚠️ Failed to parse NOTIFY payload as JSON:", e);
      }

      // 2) Maintain in-memory ring buffer
      if (payload && Object.keys(payload).length) {
        latestNotifications.unshift(payload);
        latestNotifications = latestNotifications.slice(0, 10);
        console.log("🔔 New order notification received:", payload);
      } else {
        console.log("🔔 Notification received with empty/invalid JSON:", msg?.payload);
      }

      // 3) Emit only if ioRef is ready — NEVER inside the parse try/catch
      if (ioRef && typeof ioRef.emit === "function") {
        ioRef.emit("new_notification", payload);
      } else {
        console.warn("⚠️ Socket.IO not initialized yet — skipping emit.");
      }
    });

    client.on("error", (err) => {
      console.error("PostgreSQL LISTEN error:", err);
      isListening = false; // allow retry on next start call
    });

    console.log("✅ PostgreSQL LISTEN on 'new_order' channel initialized.");
  } catch (err) {
    console.error("❌ Failed to connect and listen to PostgreSQL:", err);
    isListening = false;
  }
}

function getLatestNotifications() {
  return latestNotifications;
}

module.exports = {
  startNotificationListener,
  getLatestNotifications,
};
