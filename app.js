require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- EXPLICIT CORS Configuration in app.js ---
app.use(cors({
// Use the exact URL of your Vercel frontend
origin: 'https://test-front-0asu98fu0asd8fun0a9sd8f-1tpzblcjx-oanis-projects.vercel.app',
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Always include OPTIONS for preflight requests
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], // Add any custom headers your frontend might send
credentials: true // Set this to 'true' if your frontend uses 'withCredentials: true' or sends cookies/auth headers. If not, set to 'false' or omit.
}));
console.log("CORS middleware initialized with explicit Vercel frontend origin.");

app.use(express.json());
app.use(require('./routes/userRoutes'));
app.use(require('./routes/testRoutes'));
app.use(require('./routes/pictureRoutes'));
app.use(require('./routes/excursionRoutes'));
app.use(require('./routes/logRoutes'));

// MongoDB connection
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.6hdbix1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
)
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log('Conectado ao MongoDB!');
  })
  .catch((err) => {
    console.log(err);
    logError('Erro ao conectar ao MongoDB', err);
  });