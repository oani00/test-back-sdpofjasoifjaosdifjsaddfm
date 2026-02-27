require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({ 
  origin: [
    'http://localhost:4200',
    'https://10815ce5162d.ngrok-free.app'
  ]
}));
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