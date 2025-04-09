// server.js
require('dotenv').config(); // ✅ Cargar variables de entorno desde .env

console.log(process.env.DB_USER); // Muestra el valor de la variable DB_USER
console.log(process.env.DB_PASSWORD); // Muestra el valor de la variable DB_PASSWORD
console.log(process.env.DB_SERVER); // Muestra el valor de la variable DB_SERVER
console.log(process.env.DB_DATABASE); // Muestra el valor de la variable DB_DATABASE


const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS y vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de SQL Server con variables de entorno
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Conexión a la base de datos
sql.connect(dbConfig)
  .then(pool => {
    if (pool.connected) {
      console.log('✅ Conexión exitosa a SQL Server');
    }

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

    // Rutas de API (después de la conexión a DB)
    const rutas = require('./routes/routes');
    app.use("/api", rutas);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });

  })
  .catch(err => {
    console.error('❌ Error al conectar con SQL Server:', err);
  });
