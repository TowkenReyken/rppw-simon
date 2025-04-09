// server.js
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const rutas = require('./routes/routes');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API para productos
app.use("/api", rutas);

// Configurar EJS y vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas de vistas
app.get('/', (req, res) => {
  const cardData = {
    title: 'Oferta del Día',
    image: 'img/slider1.jpg',
    description: '¡Aprovecha los descuentos en nuestros productos!'
  };
  res.render('index', { cardData });
});

app.get('/productos', (req, res) => {
  res.render('productos');
});

app.get('/nosotros', (req, res) => {
  res.render('nosotros');
});

app.get('/contacto', (req, res) => {
  res.render('contacto');
});

app.get("/inicio-registro-sesion", (req, res) => {
  res.render("inicio-registro-sesion");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
