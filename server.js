require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Importación compatible con node-fetch 3.x

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ruta principal
app.get('/', (req, res) => {
  const cardData = {
    title: 'Oferta del Día',
    image: 'img/slider1.jpg',
    description: '¡Aprovecha los descuentos en nuestros productos!'
  };
  res.render('index', { cardData });
});

// Ruta para obtener productos desde PHP
app.get('/productos', async (req, res) => {
  try {
    // Hacer una solicitud GET al servidor PHP local
    const response = await fetch('http://localhost:3001/src/productos.php');
    
    if (!response.ok) {
      throw new Error(`Error en la solicitud a PHP: ${response.statusText}`);
    }

    const productos = await response.json();

    // Renderizar la vista de productos con los datos obtenidos
    res.render('productos', { productos });
  } catch (error) {
    console.error("Error al obtener productos desde PHP:", error.message);
    res.status(500).send("Error al obtener productos.");
  }
});

// Rutas adicionales
app.get('/nosotros', (req, res) => {
  res.render('nosotros');
});

app.get('/contacto', (req, res) => {
  res.render('contacto');
});

app.get("/inicio-registro-sesion", (req, res) => {
  res.render("inicio-registro-sesion");
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render('404', { message: 'Página no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});