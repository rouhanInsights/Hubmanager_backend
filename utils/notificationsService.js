const { Client } = require("pg");

let latestNotifications = [];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function startNotificationListener(io) {
  try {
    await client.connect();
    await client.query("LISTEN new_order");

    client.on("notification", (msg) => {
      try {
        const payload = JSON.parse(msg.payload || "{}");

        latestNotifications.unshift(payload);
        latestNotifications = latestNotifications.slice(0, 10); // keep latest 10

        console.log("🔔 New order notification received:", payload);

        // ✅ Send to all connected clients
        io.emit("new_notification", payload);
      } catch (err) {
        console.error("Error parsing notification payload:", err);
      }
    });

    client.on("error", (err) => {
      console.error("PostgreSQL LISTEN error:", err);
    });

    console.log("✅ PostgreSQL LISTEN on 'new_order' channel initialized.");
  } catch (err) {
    console.error("❌ Failed to connect and listen to PostgreSQL:", err);
  }
}

function getLatestNotifications() {
  return latestNotifications;
}

module.exports = {
  startNotificationListener,
  getLatestNotifications,
};
