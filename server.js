const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // Ejemplo de datos para la tarjeta
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

// Temporal
app.get('/carrusel', (req, res) => {
  res.render('carrusel');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});