// Importar Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Definir carpeta pública para archivos estáticos
app.use(express.static('public'));

// Ruta principal para servir el index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
