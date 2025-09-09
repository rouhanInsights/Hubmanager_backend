const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const { startNotificationListener } = require("./utils/notificationsService");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3001",
];

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/customers", require("./routes/custRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/da", require("./routes/daRoutes"));
app.use("/api/da-orders", require("./routes/daOrderRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/hubmanagers", require("./routes/hubmanagerRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/misreport", require("./routes/misRoutes"));

app.get("/", (req, res) => res.send("🚀 API is running"));

// Socket.IO logging
io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`🔴 Client disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // ← Start LISTEN after io is definitely ready
  startNotificationListener(io)
    .then(() => console.log("📡 Notification listener started ✅"))
    .catch((err) => console.error("❌ Notification listener failed", err));
});