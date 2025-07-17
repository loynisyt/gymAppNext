const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./authMiddleware');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');
const dietRoutes = require('./routes/dietRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users',userRoutes); 
app.use('/uploads', express.static('uploads'));




const PORT = process.env.PORT || 5000;

// Connect to the database, then start the server
db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit if DB connection fails
  } else {
    console.log('Connected to the database');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
});