// server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// ✅ Load environment variables
dotenv.config();

// ✅ Notification Listener
const { startNotificationListener } = require("./utils/notificationsService");

// ✅ Initialize Express app
const app = express();

// ✅ Allowed Origins
const allowedOrigins = "http://localhost:3000";

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ JSON parsing
app.use(express.json());

// ✅ Route registration
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/customers", require("./routes/custRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/da", require("./routes/daRoutes"));
app.use("/api/da-orders", require("./routes/daOrderRoutes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/hubmanagers", require("./routes/hubmanagerRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes")); // ✅ new route
app.use("/api/feedback", require("./routes/feedbackRoutes")); // ✅ feedback route

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 API is running");
});

// ✅ Start server + PostgreSQL notification listener
const PORT = process.env.PORT || 5001;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// ✅ Start the PostgreSQL listener after server starts
startNotificationListener()
  .then(() => console.log("📡 Notification listener started ✅"))
  .catch((err) => console.error("❌ Notification listener failed", err));
