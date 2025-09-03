const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const { startNotificationListener } = require("./utils/notificationsService");

const app = express();

const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

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
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));


// **MIS report route** — note the dashed path matching the frontend
app.use("/api/misreport", require("./routes/misRoutes"));

app.get("/", (req, res) => res.send("🚀 API is running"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

startNotificationListener()
  .then(() => console.log("📡 Notification listener started"))
  .catch((err) => console.error("❌ Notification listener failed", err));
