const { Client } = require("pg");

let latestNotifications = [];

const client = new Client({
  connectionString: process.env.DATABASE_URL, // Make sure this exists in .env
});

async function startNotificationListener() {
  try {
    await client.connect();
    await client.query("LISTEN new_order");

    client.on("notification", (msg) => {
      try {
        const payload = JSON.parse(msg.payload || "{}");

        // Expecting:
        // {
        //   order_id: number,
        //   user_id: number,
        //   order_date: string,
        //   total_price: number
        // }

        latestNotifications.unshift(payload);
        latestNotifications = latestNotifications.slice(0, 10); // keep latest 10
        console.log("🔔 New order notification received:", payload);
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
  console.log("📡 Sending latest notifications to frontend:", latestNotifications);
  return latestNotifications;
}

module.exports = {
  startNotificationListener,
  getLatestNotifications,
};
