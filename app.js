require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Explicit CORS Configuration ---
app.use(cors({
  origin: '*', // Explicitly allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers from the client
  // If you send cookies/credentials from your frontend, uncomment this:
  // credentials: true,
  optionsSuccessStatus: 204 // For preflight OPTIONS requests, return 204 No Content
}));
console.log("CORS APLICADO com configuração explícita");
// --- End CORS Configuration ---

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