const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
  // Ejemplo de datos para la tarjeta
  const cardData = {
    title: 'Oferta del Día',
    image: 'img/slider1.jpg',
    description: '¡Aprovecha los descuentos en nuestros productos!'
  };

  res.render('index', { cardData });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
