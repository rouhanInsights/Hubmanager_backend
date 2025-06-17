//server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express(); // ✅ Initialize app first!

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')); 
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/customers', require('./routes/custRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/da', require('./routes/daRoutes'));
app.use('/api/da-orders', require('./routes/daOrderRoutes'));
app.use("/api",require("./routes/uploadRoutes")); 
app.use('/api/hubmanagers', require('./routes/hubmanagerRoutes'));
// Default route
app.get('/', (req, res) => {
  res.send('🚀 API is running');
});

// Server start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));