require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require('pg'); // Importar Pool para PostgreSQL
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
const jwt = require('jsonwebtoken'); // Para manejar tokens de sesión
const cookieParser = require('cookie-parser'); // Importar cookie-parser

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.dbname,
  password: process.env.password,
  port: process.env.db_port,
});

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    cardData: {
      title: 'Oferta del Día',
      image: 'img/slider1.jpg',
      description: '¡Aprovecha los descuentos en nuestros productos!',
    },
  });
});

// Ruta para la página de productos
app.get('/productos', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
      FROM productos p
      INNER JOIN categoria c ON p.categoria_id = c.id
    `;
    const result = await pool.query(query);
    const productos = result.rows;

    // Pasar la información del usuario autenticado a la vista
    res.render('productos', { productos, user: req.user || null });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para obtener productos con búsqueda
app.get('/api/productos', async (req, res) => {
    const { q } = req.query;

    try {
        const query = `
            SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
            FROM productos p
            INNER JOIN categoria c ON p.categoria_id = c.id
            ${q ? `WHERE LOWER(p.nombre) LIKE LOWER($1) OR LOWER(c.nombre) LIKE LOWER($1)` : ''}
        `;
        const values = q ? [`%${q}%`] : [];
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({ error: 'Error al buscar productos' });
    }
});

// Ruta para la página de "Nosotros"
app.get('/nosotros', (req, res) => {
  res.render('nosotros'); // Asegúrate de tener un archivo `nosotros.ejs` en la carpeta `views`
});

// Ruta para la página de "Contacto"
app.get('/contacto', (req, res) => {
  res.render('contacto'); // Asegúrate de tener un archivo `contacto.ejs` en la carpeta `views`
});

// Ruta para la página de inicio de sesión y registro
app.get('/inicio-registro-sesion', (req, res) => {
  res.render('inicio-registro-sesion');
});

// Ruta para la página de pago
app.get('/pago', (req, res) => {
  res.render('pago'); // Asegúrate de tener un archivo `pago.ejs` en la carpeta `views`
});

// Ruta para registrar un usuario
app.post('/api/register', async (req, res) => {
  const { nombre, correo, contrasena, direccion, telefono, rol_id } = req.body;

  if (!nombre || !correo || !contrasena || !direccion || !telefono || !rol_id) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10); // Encriptar contraseña
    const query = `
      INSERT INTO usuarios (nombre, correo, contrasena, direccion, telefono, rol_id, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    await pool.query(query, [nombre, correo, hashedPassword, direccion, telefono, rol_id]);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para iniciar sesión
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const query = `SELECT * FROM usuarios WHERE correo = $1`;
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];
    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT con el nombre del usuario
    const token = jwt.sign(
      { id: usuario.id, rol_id: usuario.rol_id, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para verificar el token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies.token;
  if (!token) {
    req.user = null; // Usuario no autenticado
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null; // Token inválido
      return next();
    }
    req.user = user; // Usuario autenticado
    next();
  });
}
 
// Ruta para la página de productos
app.get('/productos', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.nombre, p.precio, p.descuento, p.stock, p.imagen, c.nombre AS categoria
      FROM productos p
      INNER JOIN categoria c ON p.categoria_id = c.id
    `;
    const result = await pool.query(query);
    const productos = result.rows;

    res.render('productos', { productos, user: req.user || null });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta protegida para agregar productos
app.post('/api/productos', authenticateToken, async (req, res) => {
    const { nombre, precio, descuento, stock, categoria_id, imagen, metodo_calculo } = req.body;

    if (!nombre || !precio || !categoria_id || !imagen || !stock || !metodo_calculo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const query = `
            INSERT INTO productos (nombre, precio, descuento, stock, categoria_id, imagen, metodo_calculo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [nombre, precio, descuento, stock, categoria_id, imagen, metodo_calculo];
        await pool.query(query, values);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

// Ruta protegida para editar productos
app.put('/api/productos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, descuento, stock, categoria_id, imagen, metodo_calculo } = req.body;

    if (!nombre || !precio || !categoria_id || !imagen || !stock || !metodo_calculo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const query = `
            UPDATE productos
            SET nombre = $1, precio = $2, descuento = $3, stock = $4, categoria_id = $5, imagen = $6, metodo_calculo = $7
            WHERE id = $8
        `;
        const values = [nombre, precio, descuento, stock, categoria_id, imagen, metodo_calculo, id];
        await pool.query(query, values);
        res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Ruta protegida para eliminar productos
app.delete('/api/productos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM productos WHERE id = $1`;
        await pool.query(query, [id]);
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Ruta para obtener todos los pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const query = `
            SELECT * FROM pedidos
            ORDER BY 
                CASE 
                    WHEN estado = 'Pendiente' THEN 1
                    WHEN estado = 'En progreso' THEN 2
                    WHEN estado = 'Completado' THEN 3
                END,
                fecha ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// Ruta para agregar un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    const { cliente_nombre, cliente_direccion, productos } = req.body;

    if (!cliente_nombre || !cliente_direccion || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios y el carrito no puede estar vacío.' });
    }

    try {
        const query = `
            INSERT INTO pedidos (cliente_nombre, cliente_direccion, productos, estado)
            VALUES ($1, $2, $3, 'En progreso') RETURNING *
        `;
        const result = await pool.query(query, [cliente_nombre, cliente_direccion, JSON.stringify(productos)]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al agregar pedido:', error);
        res.status(500).json({ error: 'Error al agregar pedido' });
    }
});

// Ruta para actualizar el estado de un pedido
app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: 'El estado es obligatorio' });
    }

    try {
        let query = `
            UPDATE pedidos
            SET estado = $1
            WHERE id = $2 RETURNING *
        `;
        const values = [estado, id];

        if (estado === 'Completado') {
            query = `
                UPDATE pedidos
                SET estado = $1, fecha_completado = NOW()
                WHERE id = $2 RETURNING *
            `;
        }

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
});

// Ruta para eliminar un pedido
app.delete('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
        res.status(200).json({ message: 'Pedido eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        res.status(500).json({ error: 'Error al eliminar pedido' });
    }
});

// Ruta para la página de pedidos
app.get('/pedidos', (req, res) => {
    res.render('pedidos');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});