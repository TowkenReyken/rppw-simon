require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

const rutas = require('./routes/routes');
app.use("/api", rutas);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});