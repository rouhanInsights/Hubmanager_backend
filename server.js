
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const orderRoutes = require("./routes/orderRoutes");
dotenv.config();
const productRoutes = require('./routes/productRoutes');
const app = express();
app.use(cors({
  origin: "http://localhost:3000", // or your frontend deployment
  credentials: true,
}));

app.use(cors());
app.use(express.json());
// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', orderRoutes); // ✅ Add this line
app.get('/', (req, res) => {
  res.send('🚀 API is running');
});
app.use('/api/products', productRoutes); // ✅ Add this line
// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});