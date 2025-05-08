require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require('pg'); // Importar Pool para PostgreSQL
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
const jwt = require('jsonwebtoken'); // Para manejar tokens de sesión
const cookieParser = require('cookie-parser'); // Importar cookie-parser
const multer = require('multer'); // Importar multer para manejo de archivos
const fs = require('fs'); // Importar fs para manejo de archivos
const nodemailer = require('nodemailer'); // Importar nodemailer para envío de correos

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

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      // Guardar con nombre único pero manteniendo la extensión
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
      // Configurar headers para visualización en el navegador
      if (path.endsWith('.pdf')) {
          res.set('Content-Type', 'application/pdf');
          res.set('Content-Disposition', 'inline; filename="comprobante.pdf"');
      } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
          res.set('Content-Type', 'image/jpeg');
          res.set('Content-Disposition', 'inline; filename="comprobante.jpg"');
      } else if (path.endsWith('.png')) {
          res.set('Content-Type', 'image/png');
          res.set('Content-Disposition', 'inline; filename="comprobante.png"');
      }
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const { createProxyMiddleware } = require('http-proxy-middleware');

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

  // Quita rol_id de la validación obligatoria
  if (!nombre || !correo || !contrasena || !direccion || !telefono) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10); // Encriptar contraseña
    let query, values;
    if (rol_id) {
      query = `
        INSERT INTO usuarios (nombre, correo, contrasena, direccion, telefono, rol_id, fecha_registro)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;
      values = [nombre, correo, hashedPassword, direccion, telefono, rol_id];
    } else {
      query = `
        INSERT INTO usuarios (nombre, correo, contrasena, direccion, telefono, fecha_registro)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `;
      values = [nombre, correo, hashedPassword, direccion, telefono];
    }
    await pool.query(query, values);
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
    console.log('Faltan datos');
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const query = `SELECT * FROM usuarios WHERE correo = $1`;
    const result = await pool.query(query, [correo]);
    console.log('Resultado de la consulta:', result.rows);

    if (result.rows.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = result.rows[0];
    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!isPasswordValid) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

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

// Ruta protegida para agregar productos
app.post('/api/productos', authenticateToken, async (req, res) => {
  const { nombre, precio, descuento, stock, categoria_id, imagen } = req.body;

  if (!nombre || !precio || !categoria_id || !imagen || !stock) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
      const query = `
          INSERT INTO productos (nombre, precio, descuento, stock, categoria_id, imagen)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
      `;
      const values = [nombre, parseFloat(precio), parseInt(descuento) || 0, parseInt(stock), categoria_id, imagen];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Error al agregar producto:', error);
      res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// Ruta protegida para editar productos
app.put('/api/productos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descuento, stock, categoria_id, imagen } = req.body;

  if (!nombre || !precio || !categoria_id || !imagen || !stock) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
      const query = `
          UPDATE productos
          SET nombre = $1, precio = $2, descuento = $3, stock = $4, categoria_id = $5, imagen = $6
          WHERE id = $7
          RETURNING *
      `;
      const values = [nombre, parseFloat(precio), parseInt(descuento) || 0, parseInt(stock), categoria_id, imagen, id];
      const result = await pool.query(query, values);
      
      if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.status(200).json(result.rows[0]);
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

app.get('/api/pedidos', async (req, res) => {
    try {
        const query = `
            WITH pedido_productos AS (
                SELECT 
                    p.id,
                    jsonb_agg(
                        jsonb_build_object(
                            'id', prod.id,
                            'nombre', prod.nombre,
                            'precio', prod.precio,
                            'descuento', prod.descuento,
                            'imagen', prod.imagen,
                            'quantity', (pd->>'quantity')::int,
                            'title', pd->>'title'
                        )
                    ) as productos_detallados
                FROM pedidos p
                CROSS JOIN jsonb_array_elements(p.productos::jsonb) pd
                LEFT JOIN productos prod ON (pd->>'id')::int = prod.id
                GROUP BY p.id
            )
            SELECT 
                p.*,
                u.correo AS cliente_correo,
                COALESCE(pp.productos_detallados, '[]'::jsonb) as productos_detallados
            FROM pedidos p
            LEFT JOIN usuarios u ON p.cliente_nombre = u.nombre AND p.cliente_direccion = u.direccion
            LEFT JOIN pedido_productos pp ON p.id = pp.id
            ORDER BY 
                CASE 
                    WHEN p.estado = 'Pendiente' THEN 1
                    WHEN p.estado = 'En progreso' THEN 2
                    WHEN p.estado = 'Completado' THEN 3
                END,
                p.fecha DESC
        `;
        
        const result = await pool.query(query);
        const pedidos = result.rows.map(pedido => ({
            ...pedido,
            productos: pedido.productos_detallados
        }));
        
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// Ruta para agregar un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    const { 
        cliente_nombre, 
        cliente_direccion, 
        correo_usuario, 
        tel_usuario, 
        metodo_pago, 
        productos, 
        comprobante_path 
    } = req.body;

    if (!cliente_nombre || !cliente_direccion || !correo_usuario || !tel_usuario || !metodo_pago || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO pedidos (
                cliente_nombre, 
                cliente_direccion, 
                correo_usuario, 
                tel_usuario, 
                metodo_pago, 
                productos, 
                comprobante_path, 
                estado, 
                fecha
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING id`,
            [
                cliente_nombre, 
                cliente_direccion, 
                correo_usuario, 
                tel_usuario, 
                metodo_pago, 
                JSON.stringify(productos), 
                comprobante_path, 
                'Pendiente'
            ]
        );

        res.status(201).json({ 
            message: 'Pedido creado exitosamente', 
            id: result.rows[0].id 
        });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
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

// Ruta para validar o desvalidar un pedido
app.put('/api/pedidos/:id/validar', async (req, res) => {
    const { id } = req.params;
    let { validacion, motivo } = req.body;

    try {
        // Primero obtener el correo del usuario del pedido
        const pedidoResult = await pool.query(
            'SELECT correo_usuario FROM pedidos WHERE id = $1',
            [id]
        );

        if (!pedidoResult.rows[0]) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const correoUsuario = pedidoResult.rows[0].correo_usuario;

        // Actualizar el pedido
        await pool.query(
            'UPDATE pedidos SET validacion = $1, motivo_rechazo = $2 WHERE id = $3',
            [validacion, motivo, id]
        );

        // Si el pedido no es válido, enviar correo
        if (validacion === false && correoUsuario) {
            // Configurar el transporter de nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Opciones del correo
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: correoUsuario,
                subject: 'Pedido no validado - Supermercado Simón',
                html: `
                    <h2>Tu pedido no ha sido validado</h2>
                    <p>Estimado cliente,</p>
                    <p>Lamentamos informarte que tu pedido no ha sido validado por el siguiente motivo:</p>
                    <p><strong>${motivo}</strong></p>
                    <p>Por favor, contacta con nosotros para más información.</p>
                    <br>
                    <p>Atentamente,</p>
                    <p>Supermercado Simón</p>
                `
            };

            // Enviar el correo
            await transporter.sendMail(mailOptions);
        }

        res.json({ 
            message: validacion 
                ? 'Pedido validado exitosamente' 
                : 'Pedido marcado como no válido y se ha enviado una notificación al cliente'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar el pedido' });
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

// Ruta para subir comprobante
app.post('/api/subir-comprobante', upload.single('archivo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    // Validar si el archivo es válido (opcional)
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(path.extname(req.file.originalname).toLowerCase())) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar archivo:', err);
        });
        return res.status(400).json({ error: 'Formato de archivo no permitido.' });
    }

    // Programar eliminación automática después de 5 días
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error al eliminar el archivo ${filePath}:`, err);
            } else {
                console.log(`Archivo eliminado: ${filePath}`);
            }
        });
    }, 5 * 24 * 60 * 60 * 1000); // 5 días en milisegundos

    res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Ruta para enviar mensaje de contacto
app.post('/api/contacto', async (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // <-- Agrega esta línea
            }
        });

        const mailOptions = {
            from: `"${nombre}" <${email}>`,
            to: 'reynosochris70@gmail.com',
            subject: `[Contacto Web] ${asunto}`,
            text: `Nombre: ${nombre}\nCorreo: ${email}\n\nMensaje:\n${mensaje}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar el correo de contacto:', error);
        res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});